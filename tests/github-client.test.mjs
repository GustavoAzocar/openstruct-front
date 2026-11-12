import test from 'node:test';
import assert from 'node:assert/strict';
import { createGithubLoader, snapshotIsStale } from '../src/lib/github-client.ts';
import { emptyGithubSnapshot, GITHUB_SNAPSHOT_URL } from '../src/lib/github-snapshot.ts';
import { collectGithub } from '../scripts/github-collector.mjs';
const at = Date.parse('2026-11-07T16:00:00Z');
async function validSnapshot() {
  return (
    await collectGithub({
      now: () => at,
      fetchImpl: async (url) => {
        const match = new URL(url).pathname.match(/^\/repos\/([^/]+\/[^/]+)(?:\/(.*))?$/);
        const [, repository, endpoint] = match;
        if (endpoint === 'releases/latest') return new Response('{}', { status: 404 });
        return new Response(
          JSON.stringify(
            endpoint
              ? []
              : {
                  private: false,
                  visibility: 'public',
                  full_name: repository,
                  html_url: 'https://github.com/' + repository,
                  name: repository.split('/')[1],
                  default_branch: 'master',
                },
          ),
        );
      },
    })
  ).snapshot;
}
test('shares the pending static request, omits credentials and never queries the REST API', async () => {
  const snapshot = await validSnapshot();
  const calls = [];
  const loader = createGithubLoader({
    now: () => at,
    fetchImpl: async (url, options) => {
      calls.push(url);
      assert.equal(options.credentials, 'omit');
      assert.equal(options.cache, 'no-cache');
      assert.equal(options.headers.Authorization, undefined);
      return new Response(JSON.stringify(snapshot));
    },
  });
  const [a, b] = await Promise.all([loader(), loader()]);
  assert.equal(a, b);
  assert.deepEqual(calls, [GITHUB_SNAPSHOT_URL]);
  assert.equal(a.source, 'public');
  assert.equal(a.stale, false);
});
test('falls back to bundled validated JSON, then to unavailable when both origins fail', async () => {
  const loader = createGithubLoader({
    fetchImpl: async (url) => {
      if (url === GITHUB_SNAPSHOT_URL) throw new Error('offline');
      assert.equal(url, '/data/github-snapshot.json');
      return new Response(JSON.stringify(emptyGithubSnapshot()));
    },
  });
  assert.equal((await loader()).source, 'bundled');
  const broken = createGithubLoader({ fetchImpl: async () => new Response('{}') });
  assert.equal((await broken()).source, 'unavailable');
});
test('preserves last valid session data on timeout or invalid later feed and marks it stale', async () => {
  const snapshot = await validSnapshot();
  let time = at;
  let calls = 0;
  const loader = createGithubLoader({
    now: () => time,
    timeoutMs: 1,
    fetchImpl: async (_, options) => {
      if (calls++ === 0) return new Response(JSON.stringify(snapshot));
      return new Promise((_, reject) =>
        options.signal.addEventListener('abort', () => reject(new Error('timeout'))),
      );
    },
  });
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

test('TTL expires exactly once, manual invalidation bypasses only a successful settled cache', async () => {
  const snapshot = await validSnapshot();
  let time = at,
    calls = 0;
  const loader = createGithubLoader({
    now: () => time,
    fetchImpl: async () => {
      calls++;
      return Response.json(snapshot);
    },
  });
  const a = await loader();
  time += 299_999;
  assert.equal(await loader(), a);
  time++;
  await Promise.all([loader(), loader(), loader({ force: true })]);
  assert.equal(calls, 2);
  await loader({ force: true });
  assert.equal(calls, 3);
});

test('in-flight deduplication survives TTL and cancellation permits a fresh request', async () => {
  const snapshot = await validSnapshot();
  let time = at,
    calls = 0,
    resolve;
  const loader = createGithubLoader({
    now: () => time,
    fetchImpl: (_, { signal }) => {
      calls++;
      return new Promise((done, reject) => {
        resolve = () => done(Response.json(snapshot));
        signal.addEventListener('abort', () => reject(signal.reason));
      });
    },
  });
  const controller = new AbortController();
  const first = loader({ signal: controller.signal });
  time += 600_000;
  assert.equal(loader(), first);
  controller.abort();
  await assert.rejects(first, { name: 'AbortError' });
  const next = loader();
  resolve();
  assert.equal((await next).source, 'public');
  assert.equal(calls, 2);
});

test('304 is revalidated by the browser; a bare 304 cannot invent an empty success', async () => {
  const snapshot = await validSnapshot();
  let time = at,
    status = 200;
  const loader = createGithubLoader({
    now: () => time,
    fetchImpl: async () =>
      status === 200 ? Response.json(snapshot) : new Response(null, { status }),
  });
  await loader();
  time += 300_000;
  status = 304;
  const value = await loader();
  assert.equal(value.source, 'cache');
  assert.deepEqual(value.snapshot, snapshot);
  // fetch normally combines a network 304 with its cached body and exposes a 200.
  time = value.nextCheckAt;
  status = 200;
  assert.equal((await loader()).source, 'public');
});

test('403/429 respect Retry-After, quota reset and exponential backoff, including forced reloads', async () => {
  const snapshot = await validSnapshot();
  for (const status of [403, 429]) {
    let time = at,
      calls = 0,
      failure = false;
    const loader = createGithubLoader({
      now: () => time,
      fetchImpl: async () => {
        calls++;
        return failure
          ? new Response(null, { status, headers: { 'retry-after': '900' } })
          : Response.json(snapshot);
      },
    });
    await loader();
    failure = true;
    time += 300_000;
    const bad = await loader();
    assert.equal(bad.nextCheckAt, time + 900_000);
    time += 600_000;
    await loader({ force: true });
    assert.equal(calls, 2);
    time = bad.nextCheckAt;
    const badAgain = await loader();
    assert.equal(badAgain.source, 'cache');
    assert.equal(calls, 3);
    failure = false;
    time = badAgain.nextCheckAt;
    assert.equal((await loader()).nextCheckAt, time + 300_000);
  }
  let time = at,
    calls = 0;
  const loader = createGithubLoader({
    now: () => time,
    fetchImpl: async (url) => {
      if (url !== GITHUB_SNAPSHOT_URL) return Response.json(emptyGithubSnapshot());
      calls++;
      return new Response(null, {
        status: 429,
        headers: {
          'retry-after': new Date(at + 600_000).toUTCString(),
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String((at + 1200_000) / 1000),
        },
      });
    },
  });
  const a = await loader();
  assert.equal(a.nextCheckAt, at + 1200_000);
  time = a.nextCheckAt;
  await loader();
  time += 1200_000;
  const c = await loader();
  assert.equal(c.nextCheckAt, time + 1200_000); // third failure: 20 minutes
  time = c.nextCheckAt;
  const d = await loader();
  assert.equal(d.nextCheckAt, time + 1800_000); // capped at 30 minutes
  assert.equal(calls, 4);
});

test('CDN rollback retains newer session data and new generations do not refresh old collections', async () => {
  const snapshot = await validSnapshot();
  let time = at,
    data = snapshot;
  const loader = createGithubLoader({
    now: () => time,
    fetchImpl: async () => Response.json(data),
  });
  await loader();
  time += 300_000;
  data = { ...snapshot, generatedAt: new Date(at - 60_000).toISOString() };
  assert.equal((await loader()).source, 'cache');
  time += 8_000_000;
  const newGeneration = structuredClone(snapshot);
  newGeneration.generatedAt = new Date(time).toISOString();
  for (const repo of newGeneration.repositories)
    repo.verifiedPublicAt = new Date(time).toISOString();
  assert.equal(snapshotIsStale(newGeneration, time), true);
  assert.equal(snapshotIsStale(snapshot, at + 7_200_001), true);
  data = newGeneration;
  assert.equal((await loader()).stale, true);
});
