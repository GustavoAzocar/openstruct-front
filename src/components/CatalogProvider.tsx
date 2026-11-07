import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import envelope from '../data/catalog.signed.json';
import { CATALOG_CACHE_KEY, createCatalogStore } from '../lib/catalog-store';
import type { CatalogProductId } from '../lib/catalog-trust';

const CatalogContext = createContext<ReturnType<typeof createCatalogStore> | null>(null);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() =>
    createCatalogStore({
      baseline: { envelope, checkedAt: '2026-11-07T10:48:13Z' },
      readCache: () => localStorage.getItem(CATALOG_CACHE_KEY),
      writeCache: (value) => localStorage.setItem(CATALOG_CACHE_KEY, value),
    }),
  );
  useEffect(() => {
    void store.start();
    const timer = window.setInterval(store.tick, 1_000);
    return () => window.clearInterval(timer);
  }, [store]);
  return <CatalogContext.Provider value={store}>{children}</CatalogContext.Provider>;
}
export function usePublicCatalog() {
  const store = useContext(CatalogContext);
  if (!store) throw new Error('CatalogProvider ausente');
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { ...state, refresh: store.refresh };
}
export function useProductAvailability(id: string) {
  return usePublicCatalog().products[id as CatalogProductId];
}
