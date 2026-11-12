import { getAppStatus, getMaturityLabel } from '../lib/app-registry';
import type { AppEntry } from '../lib/app-registry';
import { availabilityLabel } from '../lib/catalog-store';
import { usePublicCatalog } from './CatalogProvider';
import type { CatalogProductId } from '../lib/catalog-trust';

export function AppStatus({ app }: { app: AppEntry }) {
  const { products, loading } = usePublicCatalog();
  const availability = products[app.id as CatalogProductId];
  return (
    <span
      className={`status ${app.stage === 'current' && availability?.status === 'ready' ? 'status-active' : ''}`}
      title={
        app.stage === 'current'
          ? getMaturityLabel(app)
          : app.planningStatus === 'not-started'
            ? 'Desenvolvimento não iniciado'
            : undefined
      }
    >
      <i /> {app.stage === 'planned' ? getAppStatus(app) : availabilityLabel(availability, loading)}
    </span>
  );
}
