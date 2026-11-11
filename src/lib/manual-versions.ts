import { compareVersions } from './catalog.ts';
import { CATALOG_TTL_MS } from './catalog-store.ts';
import type { CatalogState, ProductAvailability } from './catalog-store.ts';
import { PRODUCT_POLICIES } from './catalog-trust.ts';
import type { CatalogProductId } from './catalog-trust.ts';
import type { GithubLoadResult } from './github-client.ts';
import { isComparableManualVersion, isManualVersionRange } from './manual-chapters.ts';
import type { ManualCoverage } from './manual-chapters.ts';
import { releasesView } from './releases.ts';

export type ManualReleaseEvidence = {
  version: string;
  origin: 'catalog' | 'github';
  channel: 'stable' | 'beta' | null;
  prerelease: boolean;
  notesUrl: string;
  checkedAt: string | null;
  publishedAt: string;
  stale: boolean;
};

type SourceEvidence = {
  state: 'loading' | 'fresh' | 'stale' | 'offline' | 'failed' | 'unavailable';
  checkedAt: string | null;
  absent: boolean;
  failed: boolean;
};

export type ManualVersionView = {
  reference: ManualReleaseEvidence | null;
  distribution: ManualReleaseEvidence | null;
  publication: ManualReleaseEvidence | null;
  prerelease: ManualReleaseEvidence | null;
  /** The reference is newer/older relative to the reviewed manual coverage. */
  relation: 'covered' | 'newer' | 'older' | 'same-precedence' | 'unknown';
  canConfirmLatest: boolean;
  catalog: SourceEvidence;
  history: SourceEvidence & { source: GithubLoadResult['source'] | null; truncated: boolean };
};

type ManualVersionInput = {
  productId: string;
  coverage: ManualCoverage | null;
  catalog: CatalogState;
  history?: GithubLoadResult;
  historyLoading: boolean;
  now: number;
  offline?: boolean;
};

function catalogEvidence(
  catalog: CatalogState,
  product: ProductAvailability | undefined,
  now: number,
  offline: boolean,
): SourceEvidence {
  const failed = catalog.failed || Boolean(product?.issue && product.issue !== 'expired');
  const age = now - Date.parse(product?.checkedAt ?? '');
  const checkedAt = Number.isFinite(age) && age >= 0 ? (product?.checkedAt ?? null) : null;
  let state: SourceEvidence['state'] = 'unavailable';
  if (offline) state = 'offline';
  else if (product && product.status !== 'unknown' && checkedAt) {
    state = product.stale || failed || age >= CATALOG_TTL_MS ? 'stale' : 'fresh';
  } else if (catalog.loading) state = 'loading';
  else if (failed) state = 'failed';

  return {
    state,
    checkedAt,
    absent: state === 'fresh' && product?.status === 'unavailable',
    failed,
  };
}

function preferRelease(a: ManualReleaseEvidence | null, b: ManualReleaseEvidence | null) {
  if (!a || !b) return a ?? b;
  const comparison = compareVersions(a.version, b.version);
  if (comparison !== 0) return comparison > 0 ? a : b;
  if (a.stale !== b.stale) return a.stale ? b : a;
  return a.origin === 'github' && b.origin === 'catalog' ? b : a;
}

function compareCoverage(
  coverage: ManualCoverage | null,
  version: string | undefined,
): ManualVersionView['relation'] {
  if (
    !coverage ||
    !isComparableManualVersion(version) ||
    !isComparableManualVersion(coverage.version)
  ) {
    return 'unknown';
  }
  if (coverage.range !== undefined) {
    if (!isManualVersionRange(coverage.range, coverage.version)) return 'unknown';
    if (compareVersions(version, coverage.range.min) < 0) return 'older';
    if (compareVersions(version, coverage.range.max) > 0) return 'newer';
    return 'covered';
  }
  if (version === coverage.version) return 'covered';
  const comparison = compareVersions(version, coverage.version);
  if (comparison === 0) return 'same-precedence';
  return comparison > 0 ? 'newer' : 'older';
}

export function manualCoverageIncludes(coverage: ManualCoverage | null, version: string): boolean {
  return compareCoverage(coverage, version) === 'covered';
}

export function manualVersionView({
  productId,
  coverage,
  catalog,
  history,
  historyLoading,
  now,
  offline = false,
}: ManualVersionInput): ManualVersionView {
  const catalogId = Object.hasOwn(PRODUCT_POLICIES, productId)
    ? (productId as CatalogProductId)
    : undefined;
  const product = catalogId ? catalog.products[catalogId] : undefined;
  const repository = catalogId ? PRODUCT_POLICIES[catalogId].releaseRepo : undefined;
  const snapshot = history?.snapshot;
  const snapshotFallback = Boolean(history && history.source !== 'public');
  const releases = releasesView(snapshot, catalog.products, now, offline || snapshotFallback);
  const catalogStatus = catalogEvidence(catalog, product, now, offline);
  const collection = releases.coverage.find((source) => source.repository === repository);
  const distributor = snapshot?.repositories.find((entry) => entry.repository === repository);
  const historyFailed =
    snapshotFallback || (Boolean(distributor?.problem) && collection?.state !== 'fresh');
  let historyState: SourceEvidence['state'] = 'unavailable';
  if (offline) historyState = 'offline';
  else if (collection?.state === 'fresh' || collection?.state === 'stale') {
    historyState = collection.state;
  } else if (historyLoading) historyState = 'loading';
  else if (historyFailed) historyState = 'failed';

  const historyStatus: ManualVersionView['history'] = {
    state: historyState,
    checkedAt: collection?.checkedAt ?? null,
    absent:
      historyState === 'fresh' &&
      collection?.truncated === false &&
      distributor?.releaseHistory.items.every((row) => row.productId !== productId) === true,
    failed: historyFailed,
    source: history?.source ?? null,
    truncated: collection?.truncated ?? false,
  };

  let distribution: ManualReleaseEvidence | null = null;
  let publication: ManualReleaseEvidence | null = null;
  let prerelease: ManualReleaseEvidence | null = null;
  let hasUncertainRelease = false;
  for (const row of releases.rows) {
    if (row.productId !== catalogId || row.origin === 'launcher-feed') continue;
    if (!isComparableManualVersion(row.version)) {
      hasUncertainRelease = true;
      continue;
    }
    const source = row.origin === 'catalog' ? catalogStatus : historyStatus;
    const isPrerelease =
      row.prerelease === true || row.channel === 'beta' || row.version.split('+')[0].includes('-');
    if (row.channel === 'stable' && isPrerelease) hasUncertainRelease = true;
    const evidence: ManualReleaseEvidence = {
      version: row.version,
      origin: row.origin,
      channel: row.channel,
      prerelease: isPrerelease,
      notesUrl: row.url,
      checkedAt: source.checkedAt,
      publishedAt: row.publishedAt,
      stale: source.state !== 'fresh',
    };
    if (isPrerelease) prerelease = preferRelease(prerelease, evidence);
    else if (row.origin === 'github') publication = preferRelease(publication, evidence);
    else if (row.channel === 'stable') distribution = preferRelease(distribution, evidence);
  }

  const reference = preferRelease(distribution, publication);
  return {
    reference,
    distribution,
    publication,
    prerelease,
    relation: compareCoverage(coverage, reference?.version),
    canConfirmLatest:
      !hasUncertainRelease &&
      catalogStatus.state === 'fresh' &&
      historyState === 'fresh' &&
      !historyStatus.truncated,
    catalog: catalogStatus,
    history: historyStatus,
  };
}
