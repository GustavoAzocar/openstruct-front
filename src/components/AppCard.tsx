import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import type { AppEntry } from '../lib/app-registry';
import { getAppPage } from '../lib/app-registry';
import { AppGlyph } from './Brand';
import { AppStatus } from './AppStatus';
import { ProductCatalogMeta } from './CatalogAvailability';

export function AppCard({ app, featured = false }: { app: AppEntry; featured?: boolean }) {
  const page = getAppPage(app);
  const notStarted = app.stage === 'planned' && app.planningStatus === 'not-started';
  return (
    <article
      className={`app-card ${featured ? 'app-card-featured' : ''} ${notStarted ? 'app-card-not-started' : ''}`}
    >
      <div className={`app-art ${app.color}`}>
        {page?.image ? (
          <img src={page.image} alt={page.imageAlt} width="512" height="512" loading="lazy" />
        ) : (
          <AppGlyph kind={app.symbol} />
        )}
        <span className="art-index">{app.number}</span>
        {page && (
          <Link className="art-action" to={page.route} aria-label={`Conhecer ${app.name}`}>
            <ArrowUpRight />
          </Link>
        )}
      </div>
      <div className="app-card-content">
        <div className="app-category">
          {app.category}
          <AppStatus app={app} />
        </div>
        <h3>{page ? <Link to={page.route}>{app.name}</Link> : app.name}</h3>
        <p>{app.description}</p>
        {notStarted && <span className="planned-label">Desenvolvimento não iniciado.</span>}
        {app.stage === 'current' && <ProductCatalogMeta app={app} />}
        {page ? (
          <Link className="text-link" to={page.route}>
            {app.stage === 'planned' ? 'Conhecer a proposta' : 'Explorar o aplicativo'}{' '}
            <ArrowRight size={16} />
          </Link>
        ) : (
          <span className="planned-label">O próximo capítulo está por vir.</span>
        )}
      </div>
    </article>
  );
}
