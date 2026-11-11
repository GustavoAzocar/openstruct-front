import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeReleaseHistory } from '../scripts/github-release-history.mjs';
import { CATALOG_TTL_MS } from '../src/lib/catalog-store.ts';
import { CATALOG_IDS, PRODUCT_POLICIES } from '../src/lib/catalog-trust.ts';
import { emptyGithubSnapshot, SNAPSHOT_STALE_MS } from '../src/lib/github-snapshot.ts';
import { manualCoverageIncludes, manualVersionView } from '../src/lib/manual-versions.ts';
import { RELEASE_PRODUCTS } from '../src/lib/release-history-contract.ts';

const DEFAULT_PRODUCT = 'consolostruct';
const now = Date.parse('2026-11-11T14:00:00Z');
const checkedAt = new Date(now).toISOString();

function catalogRelease(
  version,
  { productId = DEFAULT_PRODUCT, channel = 'stable', publishedAt = checkedAt } = {},
) {
  const { releaseRepo, tagPrefix } = PRODUCT_POLICIES[productId];
  return {
    version,
    channel,
    publishedAt,
    releaseUrl: `https://github.com/${releaseRepo}/releases/tag/${tagPrefix}${version}`,
    assets: [],
  };
}

function catalogWith(history, { productId = DEFAULT_PRODUCT, product = {}, ...state } = {}) {
  const release = history.find(({ channel }) => channel === 'stable');
  return {
    loading: false,
    products: {
      ...Object.fromEntries(CATALOG_IDS.map((id) => [id, { status: 'unknown', stale: false }])),
      [productId]: {
        status: release ? 'ready' : 'unavailable',
        release,
        history,
        checkedAt,
        stale: false,
        ...product,
      },
    },
    attempts: 1,
    retryAt: now + 60_000,
    canRetry: false,
    failed: false,
    ...state,
  };
}

function publicRelease(
  version,
  { productId = DEFAULT_PRODUCT, prerelease = false, draft = false } = {},
) {
  const { releaseRepo, tagPrefix } = RELEASE_PRODUCTS[productId];
  const tag = tagPrefix + version;
  return {
    tag_name: tag,
    html_url: `https://github.com/${releaseRepo}/releases/tag/${tag}`,
    published_at: checkedAt,
    body: 'Notas públicas',
    prerelease,
    draft,
  };
}

function historyWith(
  releases,
  { productId = DEFAULT_PRODUCT, source = 'public', collection = {}, problem = null } = {},
) {
  const snapshot = emptyGithubSnapshot();
  snapshot.generatedAt = checkedAt;
  const repository = RELEASE_PRODUCTS[productId].releaseRepo;
  const distributor = snapshot.repositories.find((entry) => entry.repository === repository);
  distributor.visibility = 'public';
  distributor.status = problem ? 'partial' : 'ready';
  distributor.problem = problem;
  distributor.releaseHistory = {
    state: 'fresh',
    checkedAt,
    truncated: false,
    items: normalizeReleaseHistory(releases, repository),
    ...collection,
  };
  return { snapshot, source, stale: source !== 'public' };
}

function coverage(version, range) {
  return { version, sources: [], ...(range ? { range } : {}) };
}

function view(overrides = {}) {
  return manualVersionView({
    productId: DEFAULT_PRODUCT,
    coverage: coverage('1.9.0'),
    catalog: catalogWith([]),
    history: historyWith([]),
    historyLoading: false,
    now,
    ...overrides,
  });
}

test('uses SemVer order and distinguishes publication from confirmed distribution', () => {
  const olderByVersion = catalogRelease('1.9.0');
  const newerByVersion = catalogRelease('1.10.0', { publishedAt: '2026-11-10T12:00:00Z' });
  const catalog = catalogWith([olderByVersion, newerByVersion]);
  const history = historyWith([publicRelease('1.10.0'), publicRelease('1.11.0')]);
  const state = view({ catalog, history });

  assert.deepEqual(state.distribution, {
    version: '1.10.0',
    origin: 'catalog',
    channel: 'stable',
    prerelease: false,
    notesUrl: newerByVersion.releaseUrl,
    publishedAt: newerByVersion.publishedAt,
    checkedAt,
    stale: false,
  });
  assert.equal(state.publication.version, '1.11.0');
  assert.equal(state.publication.origin, 'github');
  assert.equal(state.publication.channel, null);
  assert.equal(state.publication.notesUrl, publicRelease('1.11.0').html_url);
  assert.equal(state.reference, state.publication);
  assert.equal(state.relation, 'newer');
  assert.equal(state.canConfirmLatest, true);
  assert.equal(view({ catalog, history, coverage: coverage('1.11.0') }).relation, 'covered');
  assert.equal(view({ catalog, history, coverage: coverage('1.12.0') }).relation, 'older');
});

test('isolates hub products and prereleases even when a beta version has no suffix', () => {
  const productId = 'armadurastruct';
  const stable = catalogRelease('1.9.0', { productId });
  const beta = catalogRelease('2.0.0', { productId, channel: 'beta' });
  const catalog = catalogWith([stable, beta], { productId });
  const history = historyWith(
    [
      publicRelease('1.9.0', { productId }),
      publicRelease('2.0.0-rc.1', { productId, prerelease: true }),
      publicRelease('9.0.0', { productId: 'geosptstruct' }),
      publicRelease('12.0.0', { productId: 'launcher' }),
    ],
    { productId },
  );
  const state = view({ productId, catalog, history });

  assert.equal(state.reference.version, '1.9.0');
  assert.equal(state.publication, null);
  assert.equal(state.prerelease.version, '2.0.0');
  assert.equal(state.prerelease.channel, 'beta');
  assert.equal(state.relation, 'covered');
  assert.equal(
    view({ productId, catalog, history, coverage: coverage('1.9.0-rc.1') }).relation,
    'newer',
  );
});

test('keeps prerelease suffixes, publication markers and conflicting stable labels out of the reference', () => {
  const history = historyWith([
    publicRelease('2.0.0', { prerelease: true }),
    publicRelease('2.1.0-rc.2'),
    publicRelease('2.1.0-rc.10'),
  ]);
  const state = view({ catalog: catalogWith([catalogRelease('2.0.0')]), history });
  assert.equal(state.reference, null);
  assert.equal(state.distribution, null);
  assert.equal(state.prerelease.version, '2.1.0-rc.10');
  assert.equal(state.prerelease.prerelease, true);
  assert.equal(state.history.absent, false);
  assert.equal(state.relation, 'unknown');
  assert.equal(state.canConfirmLatest, false);
});

test('handles exact version identity, explicit inclusive ranges and invalid coverage', () => {
  const catalog = catalogWith([catalogRelease('1.10.0+pacote')]);
  const status = (review) => view({ catalog, coverage: review }).relation;
  assert.equal(status(coverage('1.10.0+pacote')), 'covered');
  assert.equal(status(coverage('1.10.0+outro')), 'same-precedence');
  assert.equal(status(coverage('1.10.0')), 'same-precedence');
  assert.equal(status(coverage('1.9.0', { min: '1.9.0', max: '1.10.0' })), 'covered');
  assert.equal(status(coverage('1.9.0', { min: '1.9.0', max: '1.9.1' })), 'newer');
  assert.equal(status(coverage('2.0.0', { min: '1.11.0', max: '2.1.0' })), 'older');
  assert.equal(status(coverage('1.9.0', { min: '1.10.0', max: '1.9.0' })), 'unknown');
  assert.equal(status(coverage('v1.10.0')), 'unknown');
  assert.equal(status(null), 'unknown');
});

test('links an alternative edition only when it explicitly covers the release', () => {
  const version = '1.10.0+pacote';
  assert.equal(manualCoverageIncludes(coverage(version), version), true);
  assert.equal(manualCoverageIncludes(coverage('1.10.0'), version), false);
  assert.equal(
    manualCoverageIncludes(coverage('1.9.0', { min: '1.8.0', max: '1.10.0' }), version),
    true,
  );
  assert.equal(manualCoverageIncludes(coverage('1.9.0'), version), false);
  assert.equal(manualCoverageIncludes(null, version), false);
});

test('preserves stale, offline, cached and bundled evidence without confirming freshness', () => {
  const catalog = catalogWith([catalogRelease('1.9.0')]);
  const history = historyWith([publicRelease('1.10.0')]);
  const offline = view({ catalog, history, offline: true });
  assert.equal(offline.reference.version, '1.10.0');
  assert.equal(offline.reference.checkedAt, checkedAt);
  assert.equal(offline.reference.stale, true);
  assert.equal(offline.catalog.state, 'offline');
  assert.equal(offline.history.state, 'offline');
  assert.equal(offline.history.absent, false);
  assert.equal(offline.canConfirmLatest, false);

  for (const source of ['cache', 'bundled']) {
    const state = view({ catalog, history: { ...history, source, stale: true } });
    assert.equal(state.history.source, source);
    assert.equal(state.history.failed, true);
    assert.equal(state.history.state, 'stale');
    assert.equal(state.reference.stale, true);
    assert.equal(state.canConfirmLatest, false);
  }

  const catalogOlder = view({ catalog, history, now: now + CATALOG_TTL_MS });
  assert.equal(catalogOlder.catalog.state, 'stale');
  assert.equal(catalogOlder.history.state, 'fresh');
  assert.equal(catalogOlder.canConfirmLatest, false);
  const allOlder = view({ catalog, history, now: now + SNAPSHOT_STALE_MS + 1 });
  assert.equal(allOlder.history.state, 'stale');
  assert.equal(allOlder.history.checkedAt, checkedAt);
});

test('distinguishes verified absence, truncation, loading and failed queries', () => {
  const absent = view();
  assert.equal(absent.catalog.absent, true);
  assert.equal(absent.history.absent, true);
  assert.equal(absent.reference, null);

  const partial = view({ history: historyWith([], { collection: { truncated: true } }) });
  assert.equal(partial.history.state, 'fresh');
  assert.equal(partial.history.truncated, true);
  assert.equal(partial.history.absent, false);
  assert.equal(partial.canConfirmLatest, false);

  const pending = view({
    catalog: catalogWith([], {
      loading: true,
      product: { status: 'unknown', checkedAt: undefined },
    }),
    history: undefined,
    historyLoading: true,
  });
  assert.equal(pending.catalog.state, 'loading');
  assert.equal(pending.history.state, 'loading');

  const failure = view({
    catalog: catalogWith([], {
      failed: true,
      product: { status: 'unknown', checkedAt: undefined },
    }),
    history: { source: 'unavailable', stale: true, snapshot: null },
  });
  assert.equal(failure.catalog.state, 'failed');
  assert.equal(failure.history.state, 'failed');
  assert.equal(failure.catalog.absent, false);
  assert.equal(failure.history.absent, false);

  const collectionFailed = view({
    history: historyWith([], {
      problem: 'request',
      collection: { state: 'unavailable', checkedAt: null },
    }),
  });
  assert.equal(collectionFailed.history.state, 'failed');
  assert.equal(collectionFailed.history.absent, false);
});

test('refresh removes withdrawn publications and never promotes drafts or incomparable versions', () => {
  const catalog = catalogWith([catalogRelease('1.9.0')]);
  const old = view({ catalog, history: historyWith([publicRelease('1.10.0')]) });
  assert.equal(old.reference.version, '1.10.0');

  const updated = view({
    catalog,
    history: historyWith([publicRelease('2.0.0', { draft: true })]),
  });
  assert.equal(updated.publication, null);
  assert.equal(updated.reference.version, '1.9.0');
  assert.equal(updated.relation, 'covered');

  const incomparable = view({ history: historyWith([publicRelease('9007199254740992.0.0')]) });
  assert.equal(incomparable.reference, null);
  assert.equal(incomparable.relation, 'unknown');
  assert.equal(incomparable.history.absent, false);
  assert.equal(incomparable.canConfirmLatest, false);
});
