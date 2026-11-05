import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import type { AppEntry } from '../lib/config';
import { AppGlyph } from './Brand';

export function AppCard({ app, featured = false }: { app: AppEntry; featured?: boolean }) {
  const available = app.id === 'consolostruct';
  return (
    <article className={`app-card ${featured ? 'app-card-featured' : ''}`}>
      <div className={`app-art ${app.color}`}>
        {available ? (
          <img
            src="/assets/consolostruct-atlas.webp"
            alt="Atlas em gravura sustentando uma peça de pedra, ilustração do ConsoloStruct"
            width="512"
            height="512"
            loading="lazy"
          />
        ) : (
          <AppGlyph kind={app.symbol} />
        )}
        <span className="art-index">
          {available
            ? '01'
            : app.id === 'vigasstruct'
              ? '02'
              : app.id === 'pilarstruct'
                ? '03'
                : app.id === 'sapatastruct'
                  ? '04'
                  : '05'}
        </span>
        {available && (
          <Link className="art-action" to="/apps/consolostruct" aria-label="Conhecer ConsoloStruct">
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
        <h3>{available ? <Link to="/apps/consolostruct">{app.name}</Link> : app.name}</h3>
        <p>{app.description}</p>
        {available ? (
          <Link className="text-link" to="/apps/consolostruct">
            Explorar o aplicativo <ArrowRight size={16} />
          </Link>
        ) : (
          <span className="planned-label">O próximo capítulo está por vir.</span>
        )}
      </div>
    </article>
  );
}
