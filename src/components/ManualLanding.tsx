import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ManualBreadcrumbs } from './ManualReading';
import type { ManualLink } from './ManualReading';
import './manual-landing.css';

export function ManualLanding({
  title,
  summary,
  breadcrumbs = [],
  status,
  notice,
  official,
  links = [],
  linksTitle = 'Conteúdo disponível',
  back,
}: {
  title: string;
  summary: string;
  breadcrumbs?: readonly ManualLink[];
  status?: string;
  notice?: string;
  official?: ManualLink;
  links?: readonly { title: string; summary?: string; to: string }[];
  linksTitle?: string;
  back?: ManualLink;
}) {
  return (
    <div className="container manual-landing">
      <ManualBreadcrumbs breadcrumbs={breadcrumbs} title={title} />
      <div className="manual-landing-column">
        <header className="manual-reading-cover">
          {status && <p className="manual-reading-status">{status}</p>}
          <h1 tabIndex={-1}>{title}</h1>
          <p>{summary}</p>
        </header>
        {(notice || official) && (
          <div className="manual-landing-notice">
            {notice && <p>{notice}</p>}
            {official && (
              <a className="text-link" href={official.to} target="_blank" rel="noreferrer">
                {official.label} <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            )}
          </div>
        )}
        {links.length > 0 && (
          <section className="manual-landing-index" aria-labelledby="manual-landing-index">
            <h2 id="manual-landing-index">{linksTitle}</h2>
            <ul>
              {links.map(({ title, summary, to }) => (
                <li key={to}>
                  <Link className="text-link" to={to}>
                    {title} <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                  {summary && <p>{summary}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {back && (
          <Link className="manual-reading-back text-link" to={back.to}>
            <ArrowLeft aria-hidden="true" size={16} /> {back.label}
          </Link>
        )}
      </div>
    </div>
  );
}
