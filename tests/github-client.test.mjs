import test from 'node:test';
import assert from 'node:assert/strict';
import { createGithubLoader, snapshotIsStale } from '../src/lib/github-client.ts';
import { emptyGithubSnapshot, GITHUB_SNAPSHOT_URL } from '../src/lib/github-snapshot.ts';
import { collectGithub } from '../scripts/github-collector.mjs';
const at = Date.parse('2026-11-07T16:00:00Z');
async function validSnapshot() {
  return (await collectGithub({ now: () => at, fetchImpl: async (url) => {
    const match = new URL(url).pathname.match(/^\/repos\/([^/]+\/[^/]+)(?:\/(.*))?$/);
    const [, repository, endpoint] = match;
    return new Response(JSON.stringify(endpoint ? [] : {
      private: false, visibility: 'public', full_name: repository,
      html_url: 'https://github.com/' + repository, name: repository.split('/')[1], default_branch: 'master',
    }));
  } })).snapshot;
}
test('shares the pending static request, omits credentials and never queries the REST API', async () => {
  const snapshot = await validSnapshot();
  const calls = [];
  const loader = createGithubLoader({ now: () => at, fetchImpl: async (url, options) => {
    calls.push(url);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Authorization, undefined);
    return new Response(JSON.stringify(snapshot));
  } });
  const [a, b] = await Promise.all([loader(), loader()]);
  assert.equal(a, b);
  assert.deepEqual(calls, [GITHUB_SNAPSHOT_URL]);
  assert.equal(a.source, 'public');
  assert.equal(a.stale, false);
});
test('falls back to bundled validated JSON, then to unavailable when both origins fail', async () => {
  const loader = createGithubLoader({ fetchImpl: async (url) => {
    if (url === GITHUB_SNAPSHOT_URL) throw new Error('offline');
    assert.equal(url, '/data/github-snapshot.json');
    return new Response(JSON.stringify(emptyGithubSnapshot()));
  } });
  assert.equal((await loader()).source, 'bundled');
  const broken = createGithubLoader({ fetchImpl: async () => new Response('{}') });
  assert.equal((await broken()).source, 'unavailable');
});
test('preserves last valid session data on timeout or invalid later feed and marks it stale', async () => {
  const snapshot = await validSnapshot();
  let time = at;
  let calls = 0;
  const loader = createGithubLoader({ now: () => time, timeoutMs: 1, fetchImpl: async (_, options) => {
    if (calls++ === 0) return new Response(JSON.stringify(snapshot));
    return new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('timeout'))));
  } });
  assert.equal((await loader()).stale, false);
  time += 5 * 60_000;
  const fallback = await loader();
  assert.equal(fallback.source, 'cache');
  assert.equal(fallback.stale, true);
  assert.deepEqual(fallback.snapshot, snapshot);
});
test('old, partial and never-collected snapshots are explicitly stale', async () => {
  const snapshot = await validSnapshot();
  assert.equal(snapshotIsStale(snapshot, at), false);
  assert.equal(snapshotIsStale(snapshot, at + 2 * 60 * 60_000 + 1), true);
  snapshot.repositories[0].status = 'partial';
  assert.equal(snapshotIsStale(snapshot, at), true);
  assert.equal(snapshotIsStale(emptyGithubSnapshot(), at), true);
});
