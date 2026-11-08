import { currentApps } from './apps.ts';
import { RELEASE_PRODUCTS } from './release-history-contract.ts';
import type { ReleaseProductId } from './release-history-contract.ts';
import type { CatalogState } from './catalog-store.ts';
import type { CatalogRelease } from './catalog.ts';
import type { GithubSnapshot } from './github-snapshot.ts';
import { SNAPSHOT_STALE_MS } from './github-snapshot.ts';
import type { LauncherRelease } from './launcher.ts';

export const releaseProducts = [
  ...currentApps.map((app) => ({ id: app.id as ReleaseProductId, name: app.name })),
  { id: 'launcher' as const, name: 'Struct Launcher' },
];
export const RELEASE_PAGE_SIZE = 8;
export function readReleaseFilters(params: URLSearchParams) {
  const product = releaseProducts.some((p) => p.id === params.get('product'))
    ? params.get('product')!
    : '';
  const rawPage = params.get('page') ?? '1';
  const page = /^[1-9]\d{0,3}$/.test(rawPage) ? Number(rawPage) : 1;
  return { product, page };
}
export function releaseFilterParams(params: URLSearchParams, product: string, page = 1) {
  const next = new URLSearchParams(params);
  next.delete('product');
  next.delete('page');
  if (releaseProducts.some((p) => p.id === product)) next.set('product', product);
  if (Number.isSafeInteger(page) && page > 1 && page <= 9999) next.set('page', String(page));
  return next;
}
type ReleaseRow = {
  productId: ReleaseProductId;
  version: string;
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  notes: string;
  notesTruncated: boolean;
  codeUrl: string | null;
  prerelease: boolean | null;
  channel: 'stable' | 'beta' | null;
  catalogRelease?: CatalogRelease;
  checkedAt: string | null;
  stale: boolean;
  origin: 'catalog' | 'github' | 'launcher-feed';
  launcherCurrent: boolean;
};
export function releaseAnchor(product: ReleaseProductId, version: string) {
  return `release-${product}-${version}`;
}
export function releasesView(
  snapshot: GithubSnapshot | null | undefined,
  products: CatalogState['products'],
  now: number,
  offline = false,
  launcher?: { release: LauncherRelease; checkedAt: string },
) {
  const rows = new Map<string, ReleaseRow>();
  const repositories = [...new Set(Object.values(RELEASE_PRODUCTS).map((p) => p.releaseRepo))];
  const coverage = repositories.map((repository) => {
    const entry = snapshot?.repositories.find(
      (r) => r.repository === repository && r.visibility === 'public',
    );
    const list = entry?.releaseHistory;
    const age = now - Date.parse(list?.checkedAt ?? '');
    const state =
      !list || list.state === 'unavailable'
        ? 'unavailable'
        : offline ||
            list.state === 'stale' ||
            !Number.isFinite(age) ||
            age < 0 ||
            age > SNAPSHOT_STALE_MS
          ? 'stale'
          : 'fresh';
    if (state !== 'unavailable')
      for (const item of list!.items) {
        const policy = RELEASE_PRODUCTS[item.productId];
        if (
          !policy ||
          policy.releaseRepo !== repository ||
          item.tag !== policy.tagPrefix + item.version ||
          item.url !== `https://github.com/${repository}/releases/tag/${item.tag}`
        )
          continue;
        rows.set(item.productId + ':' + item.version, {
          ...item,
          channel: null,
          origin: 'github',
          checkedAt: list!.checkedAt,
          stale: state === 'stale',
          launcherCurrent: false,
        });
      }
    return { repository, state, checkedAt: list?.checkedAt, truncated: list?.truncated ?? false };
  });
  for (const [id, product] of Object.entries(products)) {
    if (!Object.hasOwn(RELEASE_PRODUCTS, id) || id === 'launcher') continue;
    const productId = id as Exclude<ReleaseProductId, 'launcher'>;
    const policy = RELEASE_PRODUCTS[productId];
    for (const release of product.history ?? (product.release ? [product.release] : [])) {
      const key = id + ':' + release.version;
      const original = rows.get(key);
      const url = `https://github.com/${policy.releaseRepo}/releases/tag/${policy.tagPrefix}${release.version}`;
      if (release.releaseUrl !== url) continue;
      const code = `https://github.com/${policy.sourceRepo}/tree/v${release.version}`;
      rows.set(key, {
        productId,
        version: release.version,
        tag: policy.tagPrefix + release.version,
        name: releaseProducts.find((p) => p.id === id)!.name + ' ' + release.version,
        url,
        publishedAt: release.publishedAt,
        notes: release.notes ?? original?.notes ?? '',
        notesTruncated: release.notesTruncated ?? original?.notesTruncated ?? false,
        codeUrl: original?.codeUrl ?? (release.notes?.includes(code) ? code : null),
        prerelease: original?.prerelease ?? null,
        channel: release.channel,
        catalogRelease: release,
        origin: 'catalog',
        checkedAt: product.checkedAt ?? null,
        stale: product.stale,
        launcherCurrent: false,
      });
    }
  }
  if (launcher) {
    const { release, checkedAt } = launcher;
    const key = 'launcher:' + release.version;
    const original = rows.get(key);
    rows.set(
      key,
      original
        ? { ...original, launcherCurrent: true }
        : {
            productId: 'launcher',
            version: release.version,
            tag: 'launcher-v' + release.version,
            name: 'Struct Launcher ' + release.version,
            url: release.releaseUrl,
            publishedAt: release.publishedAt,
            notes: '',
            notesTruncated: false,
            codeUrl: null,
            prerelease: null,
            channel: null,
            checkedAt,
            stale: false,
            origin: 'launcher-feed',
            launcherCurrent: true,
          },
    );
  }
  return {
    rows: [...rows.values()].sort(
      (a, b) =>
        Date.parse(b.publishedAt) - Date.parse(a.publishedAt) ||
        a.productId.localeCompare(b.productId) ||
        a.version.localeCompare(b.version),
    ),
    coverage,
  };
}
