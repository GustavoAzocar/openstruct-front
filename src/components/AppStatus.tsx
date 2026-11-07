import { getMaturityLabel } from '../lib/app-registry';
import type { AppEntry } from '../lib/app-registry';
import { availabilityLabel } from '../lib/catalog-store';
import { useProductAvailability } from './CatalogProvider';

export function AppStatus({ app }: { app: AppEntry }) {
  const availability = useProductAvailability(app.id);
  return (
    <span
      className={`status ${app.stage === 'current' ? 'status-active' : ''}`}
      title={app.stage === 'current' ? getMaturityLabel(app) : undefined}
    >
      <i /> {app.stage === 'planned' ? 'Em planejamento' : availabilityLabel(availability)}
    </span>
  );
}
