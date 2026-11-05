import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import type { AppEntry } from '../lib/config';
import { AppGlyph } from './Brand';

export function AppCard({ app, featured = false }: { app: AppEntry; featured?: boolean }) {
  const available = Boolean(app.route);
  return (
    <article className={`app-card ${featured ? 'app-card-featured' : ''}`}>
      <div className={`app-art ${app.color}`}>
        {app.image ? (
          <img
            src={app.image}
            alt={app.imageAlt || app.name}
            width="512"
            height="512"
            loading="lazy"
          />
        ) : (
          <AppGlyph kind={app.symbol} />
        )}
        <span className="art-index">{app.number}</span>
        {app.route && (
          <Link className="art-action" to={app.route} aria-label={`Conhecer ${app.name}`}>
            <ArrowUpRight />
          </Link>
        )}
      </div>
      <div className="app-card-content">
        <div className="app-category">
          {app.category}
          <span className={`status ${available ? 'status-active' : ''}`}>
            <i />
            {app.status}
          </span>
        </div>
        <h3>{app.route ? <Link to={app.route}>{app.name}</Link> : app.name}</h3>
        <p>{app.description}</p>
        {app.route ? (
          <Link className="text-link" to={app.route}>
            Explorar o aplicativo <ArrowRight size={16} />
          </Link>
        ) : (
          <span className="planned-label">O próximo capítulo está por vir.</span>
        )}
      </div>
    </article>
  );
}
