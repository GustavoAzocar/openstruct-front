import { normalizeReleaseHistory } from '../scripts/github-release-history.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectCodeRelation } from '../scripts/github-code-relation.mjs';
import { collectGithub } from '../scripts/github-collector.mjs';
import { PRODUCT_POLICIES } from '../src/lib/catalog-trust.ts';
import { blankRelation, validateCodeRelation, relationView } from '../src/lib/code-relation.ts';
import {
  emptyGithubSnapshot,
  GITHUB_REPOSITORIES,
  validateGithubSnapshot,
} from '../src/lib/github-snapshot.ts';
import { verifySignedCatalog } from '../src/lib/catalog.ts';
const A = 'a'.repeat(40),
  B = 'b'.repeat(40),
  C = 'c'.repeat(40),
  T = 'd'.repeat(40);
const at = '2026-11-08T15:00:00Z';
function fixture(id = 'consolostruct', opts = {}) {
  const p = PRODUCT_POLICIES[id];
  const version = opts.version ?? '1.0.0';
  const channel = opts.channel ?? 'stable';
  const product = {
    status: 'ready',
    release: {
      version,
      channel,
      assets: [{ sha256: 'e'.repeat(64) }],
      releaseUrl: `https://github.com/${p.releaseRepo}/releases/tag/${p.tagPrefix}${version}`,
    },
  };
  const release = {
    productId: id,
    version,
    prerelease: opts.gitPrerelease ?? channel === 'beta',
    url: product.release.releaseUrl,
    codeUrl: opts.noSource ? null : `https://github.com/${p.sourceRepo}/tree/v${version}`,
  };
  const repository = { visibility: 'public', summary: { defaultBranch: opts.branch ?? 'master' } };
  const distributor = {
    visibility: 'public',
    releaseHistory: { state: 'fresh', items: [release] },
  };
  const urls = [];
  const cache = {};
  const request = async (url, old) => {
    urls.push(url);
    if (opts.fail) throw Object.assign(Error('request'), { code: opts.fail });
    if (opts.use304 && old) return { items: old.items, etag: old.etag };
    let body;
    if (url.includes('/git/ref/tags/'))
      body = {
        ref: 'refs/tags/v' + version,
        object: {
          sha: opts.annotated ? T : (opts.base ?? A),
          type: opts.annotated ? 'tag' : 'commit',
        },
      };
    else if (url.includes('/git/tags/'))
      body = {
        sha: T,
        object: { sha: opts.cycle ? T : (opts.base ?? A), type: opts.cycle ? 'tag' : 'commit' },
      };
    else if (url.includes('/git/ref/heads/'))
      body = {
        ref: 'refs/heads/' + repository.summary.defaultBranch,
        object: { sha: opts.head ?? B, type: 'commit' },
      };
    else if (url.includes('/compare/'))
      body = {
        status: opts.status ?? 'ahead',
        ahead_by: opts.ahead ?? 1,
        behind_by: opts.behind ?? 0,
        base_commit: { sha: opts.base ?? A },
        merge_base_commit: { sha: opts.merge ?? opts.base ?? A },
        commits: [
          { message: 'PRIVATE MESSAGE', commit: { author: { email: 'secret@example.com' } } },
        ],
        files: [{ patch: 'never export' }],
      };
    else throw Error('Unexpected URL ' + url);
    return { body, etag: '"fixture"', next: 'sample-limit' };
  };
  return {
    args: {
      id,
      product,
      channel,
      catalogPublishedAt: at,
      repository,
      distributor,
      request,
      cache,
      at,
    },
    urls,
    cache,
    product,
  };
}
test('identical, ahead, behind and Mola 6/1 diverged use endpoint totals, never commit lists or workflow semantics', async () => {
  for (const opts of [
    { status: 'identical', head: A, ahead: 0, behind: 0 },
    { status: 'ahead', ahead: 351 },
    { status: 'behind', ahead: 0, behind: 4, merge: B },
    { status: 'diverged', ahead: 6, behind: 1, merge: C },
  ]) {
    const f = fixture('molastruct', opts);
    const row = await collectCodeRelation(f.args);
    validateCodeRelation(row, PRODUCT_POLICIES.molastruct.sourceRepo, true);
    assert.equal(row.state, 'fresh');
    assert.equal(row.relation, opts.status);
    assert.equal(row.aheadBy, opts.ahead);
    const view = relationView(row, f.product, Date.parse(at));
    assert.ok(!/atras|recurso novo|atualizad[oa]/i.test(view.text));
    if (opts.status === 'diverged') assert.match(view.text, /históricos diferentes/);
    assert.ok(!JSON.stringify({ row, cache: f.cache }).includes('PRIVATE MESSAGE'));
    assert.ok(!JSON.stringify(f.cache).includes('secret@'));
    assert.ok(!JSON.stringify(f.cache).includes('patch'));
    assert.ok(f.urls.at(-1).endsWith('?per_page=1'));
  }
});
test('source mappings distinguish Armadura hub notes, unlinked sources and Launcher, annotated refs are bounded and branches encoded', async () => {
  const f = fixture('armadurastruct', { annotated: true, branch: 'feature/ação+teste' });
  const row = await collectCodeRelation(f.args);
  assert.equal(row.evidence, 'hub-note');
  assert.ok(f.urls.every((u) => u.includes('/repos/ricardocorsini/armadura-struct/')));
  assert.ok(f.urls.some((u) => u.includes(encodeURIComponent('feature/ação+teste'))));
  assert.equal(row.baseSha, A);
  const missing = fixture('armadurastruct', { noSource: true });
  const r = await collectCodeRelation(missing.args);
  assert.equal(r.state, 'unconfirmed');
  assert.equal(missing.urls.length, 0);
  const loop = fixture('consolostruct', { annotated: true, cycle: true });
  assert.equal((await collectCodeRelation(loop.args)).state, 'unconfirmed');
  assert.ok(loop.urls.length <= 4);
  assert.throws(() =>
    validateCodeRelation({ ...row, productId: 'launcher' }, row.sourceRepo, true),
  );
});
test('moved tags and fixed provenance mismatches never retain counters, transient failures retain stale same-identity evidence only', async () => {
  const first = fixture();
  const old = await collectCodeRelation(first.args);
  const moved = fixture('consolostruct', { base: C });
  const row = await collectCodeRelation({ ...moved.args, previous: old });
  assert.equal(row.reason, 'tag-moved');
  assert.equal(row.pinnedBaseSha, A);
  assert.equal(row.relation, null);
  validateCodeRelation(row, row.sourceRepo, true);
  const again = await collectCodeRelation({ ...moved.args, previous: row });
  assert.equal(again.reason, 'tag-moved');
  const gone = fixture('consolostruct', { fail: 'not-found' });
  const tombstone = await collectCodeRelation({ ...gone.args, previous: old });
  assert.equal(tombstone.pinnedBaseSha, A);
  assert.equal(
    (await collectCodeRelation({ ...moved.args, previous: tombstone })).reason,
    'tag-moved',
  );
  assert.equal(
    (
      await collectCodeRelation({
        ...first.args,
        fixedSource: { version: '1.0.0', sourceCommit: C },
      })
    ).reason,
    'tag-moved',
  );
  for (const fail of ['request', 'rate-limit', 'not-found']) {
    const f = fixture('consolostruct', { fail });
    const r = await collectCodeRelation({ ...f.args, previous: old });
    assert.equal(r.state, fail === 'not-found' ? 'unconfirmed' : 'stale');
    if (fail === 'not-found') assert.equal(r.aheadBy, null);
  }
  const fresh = fixture('consolostruct', { fail: 'request', version: '2.0.0' });
  const changed = await collectCodeRelation({ ...fresh.args, previous: old });
  assert.equal(changed.state, 'unavailable');
  assert.equal(changed.aheadBy, null);
  assert.equal(changed.version, '2.0.0');
  assert.equal(relationView(old, fresh.product, Date.parse(at)).row, undefined);
  const replaced = structuredClone(first.product);
  replaced.release.assets[0].sha256 = 'f'.repeat(64);
  assert.equal(relationView(old, replaced, Date.parse(at)).row, undefined);
  const restored = fixture('consolostruct', {
    base: A,
    head: C,
    status: 'diverged',
    ahead: 10,
    behind: 3,
    merge: T,
  });
  assert.equal(
    (await collectCodeRelation({ ...restored.args, previous: old })).relation,
    'diverged',
  );
});
test('304 cache, channel identity, missing packages, zero-evidence and malicious normalized counters fail conservatively', async () => {
  const f = fixture();
  const first = await collectCodeRelation(f.args);
  const cached = fixture('consolostruct', { use304: true });
  const second = await collectCodeRelation({ ...cached.args, cache: f.cache });
  assert.deepEqual(second, first);
  assert.equal(
    (await collectCodeRelation({ ...f.args, product: { status: 'unavailable' } })).state,
    'no-distribution',
  );
  const beta = fixture('consolostruct', {
    version: '2.0.0-beta.1',
    channel: 'beta',
    gitPrerelease: false,
  });
  const b = await collectCodeRelation(beta.args);
  assert.equal(b.channel, 'beta');
  assert.equal(b.releasePrerelease, false);
  assert.equal(relationView(b, f.product, Date.parse(at)).row, undefined);
  const no = blankRelation('consolostruct');
  assert.equal(no.aheadBy, null);
  assert.ok(!relationView(undefined, f.product, Date.parse(at)).text.includes('0 commits'));
  const tampered = structuredClone(f.cache);
  const key = Object.keys(tampered).find((u) => u.includes('/compare/'));
  tampered[key].items[0].ahead = -2;
  assert.equal(
    (await collectCodeRelation({ ...cached.args, cache: tampered })).state,
    'unconfirmed',
  );
  assert.equal(relationView(first, f.product, Date.parse(at) + 3 * 3600000).stale, true);
  assert.equal(relationView(first, f.product, Date.parse(at), true).stale, true);
  assert.throws(() => validateCodeRelation({ ...first, headSha: A }, first.sourceRepo, true));
  assert.throws(() => validateCodeRelation({ ...first, extra: 'raw' }, first.sourceRepo, true));
});
function githubFixture(override = () => null) {
  return async (url) => {
    const custom = override(url);
    if (custom) return custom;
    const [, repo, endpoint] = new URL(url).pathname.match(/^\/repos\/([^/]+\/[^/]+)(?:\/(.*))?$/);
    assert.ok(GITHUB_REPOSITORIES.includes(repo));
    if (!endpoint)
      return new Response(
        JSON.stringify({
          private: false,
          visibility: 'public',
          full_name: repo,
          html_url: 'https://github.com/' + repo,
          name: repo.split('/')[1],
          default_branch: 'master',
        }),
      );
    if (endpoint === 'releases/latest') return new Response('{}', { status: 404 });
    return new Response('[]');
  };
}
test('snapshot v8 migration preserves v7 history, removes unconfirmed source data and never reads private Launcher', async () => {
  const legacy = emptyGithubSnapshot();
  legacy.schemaVersion = 7;
  for (const repo of legacy.repositories) {
    delete repo.codeRelations;
    delete repo.recentCommits;
  }
  const migrated = validateGithubSnapshot(legacy);
  assert.equal(migrated.schemaVersion, 9);
  assert.ok(migrated.repositories.every((r) => !r.codeRelations.length));
  assert.equal(validateGithubSnapshot(migrated), migrated);
  const bad = structuredClone(migrated);
  bad.repositories[1].codeRelations = [
    { ...blankRelation('consolostruct'), state: 'no-distribution', reason: null },
  ];
  assert.throws(() => validateGithubSnapshot(bad));
  const envelope = JSON.parse(
    await readFile(new URL('./fixtures/catalog-2026-11-07.signed.json', import.meta.url), 'utf8'),
  );
  const verified = await verifySignedCatalog(envelope);
  assert.equal(verified.products.consolostruct.status, 'ready');
  const seen = [];
  const result = await collectGithub({
    includeCodeRelations: true,
    catalogEnvelope: envelope,
    fetchImpl: githubFixture((url) => {
      seen.push(url);
      return null;
    }),
    now: () => Date.parse(at),
  });
  assert.ok(!seen.some((u) => u.includes('launcher-struct')));
  assert.equal(result.snapshot.schemaVersion, 9);
  assert.equal(result.snapshot.repositories[1].codeRelations[0].state, 'unconfirmed');
  const hidden = await collectGithub({
    previous: result.snapshot,
    includeCodeRelations: true,
    catalogEnvelope: envelope,
    now: () => Date.parse(at),
    fetchImpl: githubFixture((url) =>
      url === 'https://api.github.com/repos/ricardocorsini/consolo-struct'
        ? new Response(JSON.stringify({ private: true, visibility: 'private' }))
        : null,
    ),
  });
  assert.deepEqual(hidden.snapshot.repositories[1].codeRelations, []);
  const hubHidden = await collectGithub({
    previous: result.snapshot,
    includeCodeRelations: true,
    catalogEnvelope: envelope,
    now: () => Date.parse(at),
    fetchImpl: githubFixture((url) =>
      url === 'https://api.github.com/repos/ricardocorsini/openstruct-catalog'
        ? new Response('{}', { status: 404 })
        : null,
    ),
  });
  assert.deepEqual(hubHidden.snapshot.repositories[3].codeRelations, []);
});

test('an active shared quota preserves last known relation as stale without inventing a new check', async () => {
  const result = await collectGithub({ fetchImpl: githubFixture(), now: () => Date.parse(at) });
  const f = fixture();
  const row = await collectCodeRelation(f.args);
  result.snapshot.repositories[1].codeRelations = [row];
  result.snapshot.retryAt = new Date(Date.parse(at) + 600000).toISOString();
  const skipped = await collectGithub({
    previous: result.snapshot,
    includeCodeRelations: true,
    now: () => Date.parse(at),
    fetchImpl: () => {
      throw Error('quota must skip requests');
    },
  });
  assert.equal(skipped.requests, 0);
  assert.equal(skipped.snapshot.repositories[1].codeRelations[0].state, 'stale');
  assert.equal(skipped.snapshot.repositories[1].codeRelations[0].checkedAt, at);
  assert.equal(result.snapshot.repositories[1].codeRelations[0].state, 'fresh');
});

test('a hub note linking a different tag suffix does not confirm the source of this distribution', () => {
  const body = {
    draft: false,
    prerelease: false,
    tag_name: 'armadurastruct-v0.3.0',
    html_url:
      'https://github.com/ricardocorsini/openstruct-catalog/releases/tag/armadurastruct-v0.3.0',
    published_at: at,
    name: 'ArmaduraStruct',
    body: 'Código: https://github.com/ricardocorsini/armadura-struct/tree/v0.3.0-outro',
  };
  assert.equal(
    normalizeReleaseHistory([body], 'ricardocorsini/openstruct-catalog')[0].codeUrl,
    null,
  );
  body.body = 'Código: https://github.com/ricardocorsini/armadura-struct/tree/v0.3.0';
  assert.ok(normalizeReleaseHistory([body], 'ricardocorsini/openstruct-catalog')[0].codeUrl);
});
