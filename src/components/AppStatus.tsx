import { getAppStatus, getMaturityLabel } from '../lib/app-registry';
import type { AppEntry } from '../lib/app-registry';

export function AppStatus({ app }: { app: AppEntry }) {
  return (
    <span
      className={`status ${app.stage === 'current' ? 'status-active' : ''}`}
      title={app.stage === 'current' ? getMaturityLabel(app) : undefined}
    >
      <i /> {getAppStatus(app)}
    </span>
  );
}
