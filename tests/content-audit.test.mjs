import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  checkLocal,
  markdownIds,
  probeLinks,
  editorialDrift,
} from '../scripts/content-audit-core.mjs';
import { apps } from '../src/lib/apps.ts';
import { verifySignedCatalog } from '../src/lib/catalog.ts';

test('missing routes, anchors, media and Markdown article references retain actionable file/line locations', async () => {
  const root = await mkdtemp(join(tmpdir(), 'osf-audit-'));
  try {
    await mkdir(join(root, 'public/assets'), { recursive: true });
    await writeFile(join(root, 'public/assets/real.webp'), 'fixture');
    await writeFile(join(root, 'article.md'), '# Introdução\n## Como ajudar\n## Como ajudar\n');
    const pages = new Map([['/docs', { ids: new Set(['real']) }]]);
    const ref = { file: 'src/pages/Docs.tsx', line: 17, page: '/docs' };
    for (const url of ['/absent', '#missing', '/assets/absent.webp']) {
      const row = checkLocal({ ...ref, url }, { root, pages });
      assert.equal(row.file, ref.file);
      assert.equal(row.line, 17);
      assert.equal(row.severity, 'error');
      assert.ok(row.action.length > 5);
    }
    for (const url of [
      '/docs?query=1#real',
      '/assets/real.webp',
      'https://www.openstruct.com.br/docs#real',
    ])
      assert.equal(checkLocal({ ...ref, url }, { root, pages }), null);
    assert.equal(
      checkLocal({ ...ref, url: 'javascript:alert(1)' }, { root, pages }).code,
      'unsafe-protocol',
    );
    assert.equal(
      checkLocal(
        { ...ref, url: 'article.md#como-ajudar-1', fileLink: 'article.md' },
        { root, pages },
      ),
      null,
    );
    assert.equal(
      checkLocal({ ...ref, url: 'article.md#inexistente', fileLink: 'article.md' }, { root, pages })
        .code,
      'missing-anchor',
    );
    assert.deepEqual(
      [...markdownIds('# Ação pública\n## Ação pública\n')],
      ['ação-pública', 'ação-pública-1'],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('404/410 are candidates for human review, while auth, quota and timeout remain distinct and inconclusive', async () => {
  const now = 1700000000000;
  const urls = ['404', '410', 'auth', 'quota', 'timeout'].map(
    (x) => 'https://' + x + '.example/link',
  );
  const request = async (url) => {
    const host = new URL(url).hostname;
    if (host === 'timeout.example') throw Error('timeout');
    return new Response(null, {
      status: { '404.example': 404, '410.example': 410, 'auth.example': 401, 'quota.example': 429 }[
        host
      ],
      headers: { 'Retry-After': '120' },
    });
  };
  const { results } = await probeLinks(urls, { request, now });
  assert.deepEqual(
    results.map((r) => r.status),
    ['broken', 'broken', 'authentication-or-limit', 'rate-limited', 'inconclusive'],
  );
  assert.equal(results.at(-1).reason, 'network-or-timeout');
  assert.equal(results[3].nextAt, now + 120000);
});
test('serial probing respects host cooldown, global budgets, cache dates, conditional 304 and unsupported HEAD fallback', async () => {
  const now = 1700000000000;
  const a = 'https://a.example/one',
    b = 'https://a.example/two';
  let calls = 0;
  const limited = await probeLinks([a, b], {
    now,
    request: async () => {
      calls++;
      return new Response(null, { status: 429, headers: { 'retry-after': '120' } });
    },
  });
  assert.equal(calls, 1);
  assert.equal(limited.results[1].reason, 'host-cooldown');
  const cached = await probeLinks([a], {
    now: now + 10,
    cache: limited.cache,
    request: () => {
      throw Error('should not request');
    },
  });
  assert.equal(cached.requests, 0);
  assert.equal(cached.results[0].cached, true);
  assert.equal(cached.results[0].checkedAt, limited.results[0].checkedAt);
  const ok = {
    status: 'ok',
    checkedAt: new Date(now - 86400000).toISOString(),
    nextAt: now - 1,
    etag: 'abc',
  };
  const notModified = await probeLinks([a], {
    cache: { [a]: ok },
    now,
    request: async (_url, opts) => {
      assert.equal(opts.headers['If-None-Match'], 'abc');
      return new Response(null, { status: 304 });
    },
  });
  assert.equal(notModified.results[0].status, 'ok');
  assert.equal(notModified.results[0].etag, 'abc');
  const methods = [];
  await probeLinks([a], {
    request: async (_url, opts) => {
      methods.push(opts.method);
      return new Response(null, { status: methods.length === 1 ? 405 : 200 });
    },
  });
  assert.deepEqual(methods, ['HEAD', 'GET']);
  const budget = await probeLinks([a, b], {
    limit: 1,
    request: async () => new Response(null, { status: 200 }),
  });
  assert.equal(budget.requests, 1);
  assert.equal(budget.results[1].reason, 'run-budget');
  const rotated = await probeLinks([a, b], {
    limit: 1,
    cache: { [a]: ok },
    now,
    request: async (url) => {
      assert.equal(url, b);
      return new Response(null, { status: 200 });
    },
  });
  assert.equal(rotated.results[0].url, b);
});
test('redirects are reviewable without downloading a binary or following a possibly authenticated destination', async () => {
  const result = await probeLinks(['https://a.example/package.exe'], {
    request: async (_url, opts) => {
      assert.equal(opts.redirect, 'manual');
      return new Response(null, { status: 302, headers: { location: 'https://cdn.example/file' } });
    },
  });
  assert.equal(result.results[0].status, 'inconclusive');
  assert.equal(result.results[0].reason, 'redirect-review');
  assert.equal(result.requests, 1);
});
test('verified feed drift requests editorial review without mutating data or confusing code/engine versions', async () => {
  const envelope = JSON.parse(
    await readFile(new URL('./fixtures/catalog-2026-11-07.signed.json', import.meta.url), 'utf8'),
  );
  const catalog = await verifySignedCatalog(envelope);
  const before = JSON.stringify(apps);
  const old = structuredClone(apps);
  old.find((a) => a.id === 'armadurastruct').distribution.version = '0.1.0';
  const result = editorialDrift(old, catalog);
  assert.ok(
    result.some((r) => r.code === 'editorial-behind' && r.message.includes('ArmaduraStruct')),
  );
  assert.ok(result.every((r) => r.severity === 'review'));
  assert.equal(JSON.stringify(apps), before);
  const same = structuredClone(apps);
  for (const a of same.filter((a) => a.stage === 'current')) a.code.version = '99.0.0';
  assert.deepEqual(editorialDrift(same, catalog), editorialDrift(apps, catalog));
  await assert.rejects(
    verifySignedCatalog({
      ...envelope,
      signature: envelope.signature.replace(/^./, envelope.signature[0] === 'A' ? 'B' : 'A'),
    }),
  );
});

test('network failures count toward request limits and quota cooldown survives a later cached run', async () => {
  const now = 1700000000000;
  let calls = 0;
  const urls = ['https://a.example/a', 'https://b.example/b', 'https://c.example/c'];
  const failure = await probeLinks(urls, {
    limit: 1,
    now,
    request: async () => {
      calls++;
      throw Error('network');
    },
  });
  assert.equal(calls, 1);
  assert.equal(failure.requests, 1);
  assert.equal(failure.results[1].reason, 'run-budget');
  const rate = await probeLinks(['https://a.example/a'], {
    now,
    request: async () => new Response(null, { status: 429, headers: { 'retry-after': '600' } }),
  });
  const later = await probeLinks(['https://a.example/b'], {
    now: now + 1000,
    cache: rate.cache,
    request: async () => {
      throw Error('must not request');
    },
  });
  assert.equal(later.requests, 0);
  assert.equal(later.results[0].reason, 'host-cooldown');
});
