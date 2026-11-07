import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { emptyGithubSnapshot } from '../src/lib/github-snapshot.ts';
import {
  publishGithubSnapshot,
  DATA_BRANCH_VERCEL_CONFIG,
} from '../scripts/publish-github-snapshot.mjs';

const collected = emptyGithubSnapshot();
collected.generatedAt = '2026-11-07T18:29:00Z';
const raw = JSON.stringify(collected);

function github({
  exists = true,
  snapshot = raw,
  config = null,
  configReadFails = false,
  conflict = false,
} = {}) {
  const calls = [];
  let head = 'a'.repeat(40);
  let files = new Map([
    ['snapshot.json', snapshot],
    ...(config === null ? [] : [['vercel.json', config]]),
  ]);
  const blobs = new Map();
  const trees = new Map();
  const commits = new Map();
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status });
  return {
    calls,
    get files() {
      return files;
    },
    request: async (address, options) => {
      const url = new URL(address);
      assert.equal(url.origin, 'https://api.github.com');
      assert.ok(url.pathname.startsWith('/repos/ricardocorsini/openstruct-front/'));
      assert.equal(options.redirect, 'error');
      const path = url.pathname.slice('/repos/ricardocorsini/openstruct-front'.length);
      const method = options.method;
      const data = options.body ? JSON.parse(options.body) : undefined;
      calls.push({ path, method, data });
      if (method === 'GET' && path === '/git/ref/heads/github-data')
        return exists ? json({ object: { sha: head } }) : json({}, 404);
      if (method === 'GET' && path.startsWith('/contents/')) {
        assert.equal(url.searchParams.get('ref'), head);
        const name = path.slice('/contents/'.length);
        if (configReadFails && name === 'vercel.json') return json({}, 503);
        return files.has(name)
          ? json({ encoding: 'base64', content: Buffer.from(files.get(name)).toString('base64') })
          : json({}, 404);
      }
      const sha = String(calls.length).padStart(40, '0');
      if (method === 'POST' && path === '/git/blobs') {
        blobs.set(sha, data.content);
        return json({ sha });
      }
      if (method === 'POST' && path === '/git/trees') {
        assert.equal(data.base_tree, undefined);
        assert.deepEqual(data.tree.map((file) => file.path).sort(), [
          'snapshot.json',
          'vercel.json',
        ]);
        trees.set(sha, data.tree);
        return json({ sha });
      }
      if (method === 'POST' && path === '/git/commits') {
        assert.deepEqual(data.parents, exists ? [head] : []);
        commits.set(sha, data.tree);
        return json({ sha });
      }
      if (
        (method === 'PATCH' && path === '/git/refs/heads/github-data') ||
        (method === 'POST' && path === '/git/refs')
      ) {
        if (method === 'PATCH') {
          assert.equal(data.force, false);
          if (conflict) return json({}, 409);
        } else assert.equal(data.ref, 'refs/heads/github-data');
        files = new Map(
          trees.get(commits.get(data.sha)).map((file) => [file.path, blobs.get(file.sha)]),
        );
        head = data.sha;
        exists = true;
        return json({ object: { sha: head } });
      }
      throw new Error('Unexpected API request: ' + method + ' ' + path);
    },
  };
}
const publish = (server, value = raw) =>
  publishGithubSnapshot({
    raw: value,
    token: 'test-publication-token',
    request: server.request,
    wait: async () => {},
  });

test('new data branch publishes only validated JSON and a deployment-disabled control file', async () => {
  const server = github({ exists: false });
  assert.equal(await publish(server), true);
  assert.deepEqual([...server.files.keys()].sort(), ['snapshot.json', 'vercel.json']);
  assert.equal(server.files.get('snapshot.json'), raw);
  assert.equal(JSON.parse(server.files.get('vercel.json')).git.deploymentEnabled, false);
  assert.equal(server.files.get('vercel.json').includes('test-publication-token'), false);
});

test('unchanged snapshot still repairs a missing or incorrect deployment exclusion', async () => {
  for (const config of [null, '{"git":{"deploymentEnabled":true}}']) {
    const server = github({ config });
    assert.equal(await publish(server), true);
    assert.equal(server.files.get('snapshot.json'), raw);
    assert.equal(server.files.get('vercel.json'), DATA_BRANCH_VERCEL_CONFIG);
  }
});

test('subsequent hourly snapshots preserve the exclusion; identical files cause no write', async () => {
  const server = github({ config: DATA_BRANCH_VERCEL_CONFIG });
  assert.equal(await publish(server), false);
  assert.equal(
    server.calls.some((call) => call.method !== 'GET'),
    false,
  );
  const next = JSON.stringify({ ...collected, generatedAt: '2026-11-07T19:29:00Z' });
  assert.equal(await publish(server, next), true);
  assert.equal(server.files.get('snapshot.json'), next);
  assert.equal(server.files.get('vercel.json'), DATA_BRANCH_VERCEL_CONFIG);
  assert.equal(await publish(server, next), false);
});

test('invalid or uncollected snapshots fail before any remote read or write', async () => {
  for (const value of [
    '{}',
    JSON.stringify(emptyGithubSnapshot()),
    'not json',
    'x'.repeat(1_000_001),
  ]) {
    const server = github();
    await assert.rejects(publish(server, value));
    assert.equal(server.calls.length, 0);
  }
});

test('failed config read and concurrent branch update never force publication', async () => {
  const failedRead = github({ configReadFails: true });
  await assert.rejects(publish(failedRead), /HTTP 503/);
  assert.equal(
    failedRead.calls.some((call) => call.method !== 'GET'),
    false,
  );
  const concurrent = github({ conflict: true });
  await assert.rejects(publish(concurrent), /HTTP 409/);
  assert.equal(concurrent.files.has('vercel.json'), false);
  assert.equal(concurrent.files.get('snapshot.json'), raw);
  assert.equal(concurrent.calls.filter((call) => call.method === 'PATCH').length, 1);
});

test('frontend policy excludes only the data branch while keeping code deployments enabled', async () => {
  const frontend = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.deepEqual(frontend.git.deploymentEnabled, { 'github-data': false });
  assert.equal(frontend.git.deploymentEnabled.master ?? true, true);
  assert.equal(frontend.git.deploymentEnabled['feature/example'] ?? true, true);
  assert.equal(frontend.buildCommand, 'npm run build');
});
