import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyGithubSnapshot } from '../src/lib/github-snapshot.ts';
import { releaseIdentity, validateReleaseHistory } from '../src/lib/release-history-contract.ts';
import { normalizeReleaseHistory } from '../scripts/github-release-history.mjs';
import {
  readReleaseFilters,
  releaseFilterParams,
  releaseAnchor,
  releasesView,
} from '../src/lib/releases.ts';
const now = Date.parse('2026-11-07T23:00:00Z');
const at = new Date(now).toISOString();
const hub = 'ricardocorsini/openstruct-catalog';
function raw(tag, extra = {}) {
  return {
    tag_name: tag,
    draft: false,
    prerelease: false,
    published_at: at,
    html_url: `https://github.com/${hub}/releases/tag/${tag}`,
    body: 'Notas oficiais',
    ...extra,
  };
}
function fixture() {
  const snapshot = emptyGithubSnapshot();
  const repo = snapshot.repositories.find((r) => r.repository === hub);
  repo.visibility = 'public';
  repo.releaseHistory = {
    state: 'fresh',
    checkedAt: at,
    truncated: false,
    items: normalizeReleaseHistory([raw('launcher-v0.2.4'), raw('armadurastruct-v0.3.0')], hub),
  };
  return snapshot;
}
test('hub prefix and authorized distributor identify each product without importing the private Launcher', () => {
  assert.deepEqual(releaseIdentity(hub, 'launcher-v0.2.4'), {
    productId: 'launcher',
    version: '0.2.4',
  });
  assert.equal(releaseIdentity(hub, 'v0.2.4'), null);
  assert.equal(releaseIdentity('ricardocorsini/armadura-struct', 'v0.3.0'), null);
  assert.equal(releaseIdentity('ricardocorsini/launcher-struct', 'launcher-v0.2.4'), null);
  assert.equal(releaseIdentity(hub, 'armadurastruct-v00.3.0'), null);
  assert.equal(releaseIdentity(hub, 'armadurastruct-v0.3.0/evil'), null);
});
test('drafts and unknown prefixes never export text; notes remain bounded inert text without personal fields', () => {
  const items = normalizeReleaseHistory(
    [
      raw('launcher-v0.2.4', { draft: true, body: 'private secret' }),
      raw('unknown', { body: 'private secret' }),
      raw('armadurastruct-v0.3.0', {
        body:
          '<script>alert(1)</script> [x](javascript:alert(1)) ![x](https://images.example/x) someone@example.com\n' +
          'A'.repeat(2100),
      }),
    ],
    hub,
  );
  assert.equal(items.length, 1);
  assert.match(items[0].notes, /<script>/);
  assert.ok(!JSON.stringify(items).includes('someone@example.com'));
  assert.equal(items[0].notes.length, 2000);
  assert.equal(items[0].notesTruncated, true);
  assert.ok(!JSON.stringify(items).includes('private secret'));
});
test('strict history contract rejects foreign URLs, invalid dates, fields, private data and duplicate publications', () => {
  const list = fixture().repositories.at(-1).releaseHistory;
  assert.doesNotThrow(() => validateReleaseHistory(list, hub, true));
  for (const patch of [
    { url: 'javascript:alert(1)' },
    { productId: 'consolostruct' },
    { version: '9.0.0' },
    { draft: false },
    { publishedAt: 'tomorrow' },
    { codeUrl: 'https://github.com/ricardocorsini/launcher-struct/tree/v0.2.4' },
  ]) {
    const changed = structuredClone(list);
    Object.assign(changed.items[0], patch);
    assert.throws(() => validateReleaseHistory(changed, hub, true));
  }
  assert.throws(() => validateReleaseHistory(list, hub, false));
  assert.throws(() =>
    validateReleaseHistory({ ...list, items: [list.items[0], list.items[0]] }, hub, true),
  );
});
test('signed history merges with the hub once per product/version; Launcher never becomes an application update', () => {
  const snapshot = fixture();
  const release = {
    version: '0.3.0',
    channel: 'stable',
    publishedAt: at,
    releaseUrl: `https://github.com/${hub}/releases/tag/armadurastruct-v0.3.0`,
    assets: [],
    notes: 'Notas assinadas',
  };
  const products = {
    armadurastruct: { status: 'ready', release, history: [release], checkedAt: at, stale: false },
  };
  const view = releasesView(snapshot, products, now);
  assert.equal(view.rows.length, 2);
  assert.equal(view.rows.find((r) => r.productId === 'armadurastruct').origin, 'catalog');
  assert.equal(view.rows.find((r) => r.productId === 'armadurastruct').channel, 'stable');
  assert.equal(view.rows.find((r) => r.productId === 'launcher').channel, null);
  assert.equal(view.rows.find((r) => r.productId === 'launcher').version, '0.2.4');
  assert.equal(new Set(view.rows.map((r) => r.productId + ':' + r.version)).size, view.rows.length);
});
test('prerelease evidence is separate from signed channel and dates drive order; empty notes stay empty', () => {
  const snapshot = fixture();
  snapshot.repositories.at(-1).releaseHistory.items = normalizeReleaseHistory(
    [
      raw('armadurastruct-v0.4.0-rc.1', {
        prerelease: true,
        body: '',
        published_at: '2026-11-06T00:00:00Z',
      }),
      raw('armadurastruct-v0.3.0', { published_at: at }),
    ],
    hub,
  );
  const view = releasesView(snapshot, {}, now);
  assert.equal(view.rows[0].version, '0.3.0');
  assert.equal(view.rows[1].prerelease, true);
  assert.equal(view.rows[1].notes, '');
  assert.equal(view.rows[1].channel, null);
});
test('stale and unavailable sources preserve signed data and public links without fabricated releases', () => {
  const snapshot = fixture();
  assert.equal(releasesView(snapshot, {}, now, true).rows[0].stale, true);
  snapshot.repositories.at(-1).visibility = 'unknown';
  assert.equal(releasesView(snapshot, {}, now).rows.length, 0);
  assert.equal(releasesView(null, {}, now).coverage[0].state, 'unavailable');
});
test('URL filters tolerate invalid values and reproduce pagination; release anchors do not collide', () => {
  assert.deepEqual(readReleaseFilters(new URLSearchParams('product=private&page=-1')), {
    product: '',
    page: 1,
  });
  const params = releaseFilterParams(new URLSearchParams('page=99'), 'launcher', 2);
  assert.deepEqual(readReleaseFilters(params), { product: 'launcher', page: 2 });
  assert.equal(releaseFilterParams(params, '').toString(), '');
  assert.notEqual(releaseAnchor('launcher', '1.0.0+rc'), releaseAnchor('launcher', '1.0.0-rc'));
});
