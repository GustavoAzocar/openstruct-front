import test from 'node:test';
import assert from 'node:assert/strict';
import { createGithubActivityStore } from '../src/lib/github-activity-store.ts';
import { GITHUB_REFRESH_MS } from '../src/lib/github-client.ts';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGithubActivity } from '../src/components/useGithubActivity.ts';

test('static content audit renders the initial activity state without browser globals or requests', () => {
  function Consumer() {
    const { loading, result, canRefresh } = useGithubActivity();
    assert.equal(result, undefined);
    assert.equal(loading, true);
    assert.equal(canRefresh, false);
    return createElement('p', null, 'Consultando');
  }
  assert.equal(renderToStaticMarkup(createElement(Consumer)), '<p>Consultando</p>');
});

const flush = () => new Promise((resolve) => setImmediate(resolve));
function harness(load) {
  let time = 1_000_000,
    visible = true,
    tick,
    wake;
  let timers = 0,
    events = 0;
  const calls = [];
  const store = createGithubActivityStore({
    now: () => time,
    isVisible: () => visible,
    interval: (fn) => {
      tick = fn;
      timers++;
      return 1;
    },
    clearInterval: () => {
      timers--;
    },
    listen: (fn) => {
      wake = fn;
      events++;
      return () => events--;
    },
    load: async (options) => {
      calls.push(options);
      return load
        ? load(options)
        : { source: 'public', snapshot: null, stale: true, nextCheckAt: time + GITHUB_REFRESH_MS };
    },
  });
  return {
    store,
    calls,
    advance: (ms) => (time += ms),
    tick: () => tick(),
    wake: () => wake(),
    visible: (value) => (visible = value),
    resources: () => [timers, events],
  };
}

test('consumers share one load, clock, manual refresh and consistent updates across navigation', async () => {
  const h = harness();
  const seenA = [],
    seenB = [];
  const offA = h.store.subscribe(() => seenA.push(h.store.getSnapshot()));
  const offB = h.store.subscribe(() => seenB.push(h.store.getSnapshot()));
  await flush();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.resources(), [1, 1]);
  h.store.refresh();
  assert.equal(h.calls.length, 1);
  h.advance(60_000);
  h.tick();
  h.store.refresh();
  h.store.refresh();
  await flush();
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].force, true);
  assert.equal(seenA.at(-1), seenB.at(-1));
  offA();
  offB();
  await flush();
  assert.deepEqual(h.resources(), [0, 0]);
  const offNextRoute = h.store.subscribe(() => {});
  await flush();
  assert.equal(h.calls.length, 2);
  offNextRoute();
});

test('visible tabs revalidate at expiry; hidden tabs wait and focus/visibility deduplicate', async () => {
  const h = harness();
  const off = h.store.subscribe(() => {});
  await flush();
  h.advance(GITHUB_REFRESH_MS - 1);
  h.tick();
  await flush();
  assert.equal(h.calls.length, 1);
  h.visible(false);
  h.advance(2 * GITHUB_REFRESH_MS);
  h.tick();
  assert.equal(h.calls.length, 1);
  h.visible(true);
  h.wake();
  h.wake();
  h.tick();
  await flush();
  assert.equal(h.calls.length, 2);
  h.advance(GITHUB_REFRESH_MS);
  h.tick();
  await flush();
  assert.equal(h.calls.length, 3);
  off();
});

test('failure cooldown applies to both automatic and manual refresh and clock still ages', async () => {
  const h = harness(async () => ({
    snapshot: null,
    stale: true,
    source: 'unavailable',
    nextCheckAt: 2_000_000,
  }));
  const off = h.store.subscribe(() => {});
  await flush();
  h.advance(GITHUB_REFRESH_MS);
  h.tick();
  h.store.refresh();
  await flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.store.getSnapshot().now, 1_300_000);
  h.advance(700_000);
  h.wake();
  await flush();
  assert.equal(h.calls.length, 2);
  off();
});

test('unmount cancels the last pending request; StrictMode resubscription retains it', async () => {
  let signal;
  const h = harness(({ signal: value }) => {
    signal = value;
    return new Promise((_, reject) => value.addEventListener('abort', () => reject(value.reason)));
  });
  const offA = h.store.subscribe(() => {});
  offA();
  const offB = h.store.subscribe(() => {});
  await flush();
  assert.equal(signal.aborted, false);
  assert.equal(h.calls.length, 1);
  offB();
  await flush();
  assert.equal(signal.aborted, true);
  assert.equal(h.store.getSnapshot().loading, false);
  assert.deepEqual(h.resources(), [0, 0]);
  const offC = h.store.subscribe(() => {});
  await flush();
  assert.equal(h.calls.length, 2);
  offC();
  await flush();
});
