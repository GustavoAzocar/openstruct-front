import { CatalogRequestError, loadPublicCatalog, verifySignedCatalog } from './catalog.ts';
import type { CatalogRelease, SignedCatalog, VerifiedCatalog } from './catalog.ts';
import { CATALOG_IDS } from './catalog-trust.ts';
import type { CatalogProductId } from './catalog-trust.ts';

export const CATALOG_CACHE_KEY = 'openstruct:verified-catalog:v1';
export const CATALOG_TTL_MS = 15 * 60_000;
export const CATALOG_MAX_ATTEMPTS = 3;
export type ProductAvailability = {
  status: 'unknown' | 'ready' | 'unavailable';
  release?: CatalogRelease;
  checkedAt?: string;
  catalogPublishedAt?: string;
  stale: boolean;
  issue?: 'missing' | 'invalid' | 'offline' | 'expired' | 'rollback';
};
export type CatalogState = {
  loading: boolean;
  products: Record<CatalogProductId, ProductAvailability>;
  attempts: number;
  retryAt: number;
  canRetry: boolean;
  lastAttemptAt?: string;
  failed: boolean;
};
type CacheEntry = { envelope: SignedCatalog; checkedAt: string };
type Cache = Partial<Record<CatalogProductId, CacheEntry>>;
type StoreOptions = {
  baseline: CacheEntry;
  load?: typeof loadPublicCatalog;
  readCache?: () => string | null;
  writeCache?: (value: string) => void;
  now?: () => number;
};

/** One store per app session: all routes and the dialog share one request and retry budget. */
export function createCatalogStore(options: StoreOptions) {
  const now = options.now ?? Date.now;
  const load = options.load ?? loadPublicCatalog;
  const initialProducts = Object.fromEntries(
    CATALOG_IDS.map((id) => [id, { status: 'unknown', stale: false }]),
  ) as CatalogState['products'];
  let state: CatalogState = {
    loading: true,
    products: initialProducts,
    attempts: 0,
    retryAt: 0,
    canRetry: false,
    failed: false,
  };
  let started: Promise<void> | undefined;
  let cache: Cache = {};
  const listeners = new Set<() => void>();
  function update(next: CatalogState) {
    state = next;
    listeners.forEach((listener) => listener());
  }
  function persist() {
    try {
      options.writeCache?.(JSON.stringify(cache));
    } catch {
      /* Private browsing/quota: keep session data. */
    }
  }
  function accept(
    catalog: VerifiedCatalog,
    entry: CacheEntry,
    stale: boolean,
    onlyId?: CatalogProductId,
  ) {
    const products = { ...state.products };
    for (const id of onlyId ? [onlyId] : CATALOG_IDS) {
      const incoming = catalog.products[id];
      const previous = products[id];
      if (
        previous.catalogPublishedAt &&
        Date.parse(catalog.publishedAt) < Date.parse(previous.catalogPublishedAt)
      ) {
        products[id] = { ...previous, stale: true, issue: 'rollback' };
      } else if (incoming.status === 'invalid') {
        products[id] = { ...previous, stale: Boolean(previous.checkedAt), issue: incoming.reason };
      } else {
        products[id] = {
          status: incoming.status,
          release: incoming.status === 'ready' ? incoming.release : undefined,
          checkedAt: entry.checkedAt,
          catalogPublishedAt: catalog.publishedAt,
          stale,
        };
        cache[id] = entry;
      }
    }
    update({ ...state, products });
  }
  function tick() {
    const canRetry =
      !state.loading && state.attempts < CATALOG_MAX_ATTEMPTS && now() >= state.retryAt;
    let changed = canRetry !== state.canRetry;
    const products = { ...state.products };
    for (const id of CATALOG_IDS) {
      const product = products[id];
      if (
        !product.stale &&
        product.checkedAt &&
        now() - Date.parse(product.checkedAt) >= CATALOG_TTL_MS
      ) {
        products[id] = { ...product, stale: true, issue: 'expired' };
        changed = true;
      }
    }
    if (changed) update({ ...state, products, canRetry });
  }
  async function refresh(): Promise<boolean> {
    if (state.loading || state.attempts >= CATALOG_MAX_ATTEMPTS || now() < state.retryAt)
      return false;
    update({
      ...state,
      loading: true,
      canRetry: false,
      attempts: state.attempts + 1,
      lastAttemptAt: new Date(now()).toISOString(),
    });
    let retryDelay = 60_000;
    try {
      const { envelope, catalog } = await load();
      accept(catalog, { envelope, checkedAt: new Date(now()).toISOString() }, false);
      persist();
      update({ ...state, failed: false });
    } catch (error) {
      if (error instanceof CatalogRequestError) retryDelay = error.retryAfterMs;
      const products = { ...state.products };
      for (const id of CATALOG_IDS)
        products[id] = {
          ...products[id],
          stale: Boolean(products[id].checkedAt),
          issue: 'offline',
        };
      update({ ...state, products, failed: true });
    } finally {
      update({ ...state, loading: false, retryAt: now() + retryDelay, canRetry: false });
    }
    return true;
  }
  function start(): Promise<void> {
    if (started) return started;
    started = (async () => {
      // Reverify every saved envelope. Neither localStorage nor the bundled JSON is trusted by itself.
      try {
        accept(await verifySignedCatalog(options.baseline.envelope), options.baseline, true);
      } catch {
        /* No crypto support: no downloads. */
      }
      try {
        const raw = options.readCache?.();
        if (raw && raw.length <= 3_100_000) {
          const saved = JSON.parse(raw) as Cache;
          const verified = new Map<string, VerifiedCatalog>();
          for (const id of CATALOG_IDS) {
            try {
              const entry = saved[id];
              if (
                !entry ||
                !Number.isFinite(Date.parse(entry.checkedAt)) ||
                Date.parse(entry.checkedAt) > now()
              )
                continue;
              const identity = JSON.stringify(entry.envelope);
              let catalog = verified.get(identity);
              if (!catalog) {
                catalog = await verifySignedCatalog(entry.envelope);
                verified.set(identity, catalog);
              }
              accept(catalog, entry, true, id);
            } catch {
              /* Discard an invalid cache item without hiding other products. */
            }
          }
        }
      } catch {
        /* Storage is optional. */
      }
      update({ ...state, loading: false });
      await refresh();
    })();
    return started;
  }
  return {
    start,
    refresh,
    tick,
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function availabilityLabel(product?: ProductAvailability): string {
  if (product?.status === 'ready')
    return product.stale ? 'Disponível · dado desatualizado' : 'Disponível para desktop';
  if (product?.status === 'unavailable')
    return product.stale ? 'Sem pacote · dado desatualizado' : 'Sem pacote no canal estável';
  return 'Disponibilidade não confirmada';
}
