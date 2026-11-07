import type { AppEntry } from './app-registry.ts';
import type { ProductAvailability } from './catalog-store.ts';
export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export type CatalogFilters = {
  q: string;
  category: string;
  availability: 'all' | 'available' | 'unconfirmed' | 'planned';
  platform: 'all' | 'windows' | 'linux';
  future: boolean;
};
export const defaultFilters: CatalogFilters = {
  q: '',
  category: 'Todos',
  availability: 'all',
  platform: 'all',
  future: false,
};
export function readFilters(
  params: URLSearchParams,
  categories: readonly string[],
): CatalogFilters {
  const availability = params.get('availability');
  const platform = params.get('platform');
  return {
    q: (params.get('q') ?? '').slice(0, 200),
    category: categories.includes(params.get('category') ?? '') ? params.get('category')! : 'Todos',
    availability:
      availability === 'available' || availability === 'unconfirmed' || availability === 'planned'
        ? availability
        : 'all',
    platform: platform === 'windows' || platform === 'linux' ? platform : 'all',
    future: params.get('future') === '1' || availability === 'planned',
  };
}
export function writeFilters(filters: CatalogFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.q) p.set('q', filters.q);
  if (filters.category !== 'Todos') p.set('category', filters.category);
  if (filters.availability !== 'all') p.set('availability', filters.availability);
  if (filters.platform !== 'all') p.set('platform', filters.platform);
  if (filters.future) p.set('future', '1');
  return p;
}
export function selectCatalog(
  entries: readonly AppEntry[],
  products: Partial<Record<string, ProductAvailability>>,
  filters: CatalogFilters,
) {
  const ready = (app: AppEntry) =>
    app.stage === 'current' &&
    products[app.id]?.status === 'ready' &&
    Boolean(products[app.id]?.release?.assets.length);
  const rank = (app: AppEntry) => (ready(app) ? 0 : app.stage === 'current' ? 1 : 2);
  return entries
    .map((app, index) => ({ app, index }))
    .filter(({ app }) => {
      if (app.stage === 'planned' && !filters.future) return false;
      if (filters.category !== 'Todos' && app.category !== filters.category) return false;
      if (
        !normalizeSearch(`${app.name} ${app.description} ${app.category}`).includes(
          normalizeSearch(filters.q.trim()),
        )
      )
        return false;
      if (filters.availability === 'available' && !ready(app)) return false;
      if (filters.availability === 'unconfirmed' && (app.stage !== 'current' || ready(app)))
        return false;
      if (filters.availability === 'planned' && app.stage !== 'planned') return false;
      if (
        filters.platform !== 'all' &&
        (!ready(app) ||
          !products[app.id]?.release?.assets.some((a) => a.platform === filters.platform))
      )
        return false;
      return true;
    })
    .sort((a, b) => rank(a.app) - rank(b.app) || a.index - b.index)
    .map(({ app }) => app);
}
