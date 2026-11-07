import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { GithubSnapshot } from '../lib/github-snapshot';
import { githubDate } from '../lib/development';
import type { DevelopmentSource } from '../lib/development';
import { milestoneProgress, roadmapDocumentUrl, roadmapView } from '../lib/roadmap';
import './public-roadmap.css';

export function PublicRoadmap({
  snapshot,
  sources,
  loading,
  now,
  offline,
}: {
  snapshot?: GithubSnapshot | null;
  sources: DevelopmentSource[];
  loading: boolean;
  now: number;
  offline: boolean;
}) {
  const repositories = roadmapView(snapshot, sources, now, offline);
  return (
    <section id="roadmap" className="public-roadmap" aria-labelledby="roadmap-title">
      <div className="development-section-heading">
        <h2 id="roadmap-title">Roadmap público</h2>
        <span>PRIORIDADES COM ORIGEM</span>
      </div>
      <p className="roadmap-intro">
        Milestones e direções documentadas por projeto. Previsões podem mudar; a seleção não
        representa um compromisso de entrega. O planejamento não define a disponibilidade dos
        aplicativos: <Link to="/apps">consulte o catálogo</Link> para instalar pelo Struct Launcher.
      </p>
      <details className="development-definitions">
        <summary>Fontes, estados e cálculo do progresso</summary>
        <p>
          Milestones mantêm os estados aberto ou fechado do GitHub. Aberto não comprova trabalho em
          andamento; fechado não comprova entrega no instalador. O progresso usa itens fechados ÷
          (abertos + fechados), incluindo issues e PRs vinculados ao milestone. Fechamento não
          implica implementação: consulte os itens. Sem denominador positivo, não há percentual.
        </p>
        <p>
          No roadmap documentado do MolaStruct, [ ] é proposta pendente e [x] é concluído segundo o
          documento, sem comprovar publicação. Não há regra pública de “em andamento” identificada
          nesta revisão. Labels genéricas não são interpretadas como prioridade ou estado. Trechos
          editoriais têm revisão própria; o resumo de milestones é coletado periodicamente.
        </p>
      </details>
      <p className="roadmap-note" role="status">
        {loading
          ? 'Consultando milestones no resumo público…'
          : 'Até 60 milestones por repositório, abertos e fechados; não há um percentual geral do ecossistema.'}
      </p>
      <div className="roadmap-repositories">
        {repositories.map(({ source, state, checkedAt, truncated, items, document }) => (
          <article
            className="roadmap-repository"
            key={source.repository}
            aria-labelledby={'roadmap-' + source.slug}
          >
            <span className="roadmap-kicker">{source.kind}</span>
            <h3 id={'roadmap-' + source.slug}>{source.name}</h3>
            <p className="roadmap-note">
              {loading && !checkedAt
                ? 'Coleta em consulta.'
                : state === 'unavailable'
                  ? 'Milestones não confirmados nesta consulta.'
                  : `Coleta: ${githubDate(checkedAt)}${state === 'stale' ? ' · dado desatualizado' : ''}.`}
              {truncated ? ' Há milestones além do limite coletado.' : ''}
            </p>
            {items.length ? (
              <ul className="roadmap-milestones">
                {items.map((item) => {
                  const metadata = item.milestone;
                  const progress = milestoneProgress(item);
                  return (
                    <li key={item.url}>
                      <span className="roadmap-state">
                        {metadata?.state === 'open'
                          ? 'Milestone aberto'
                          : metadata?.state === 'closed'
                            ? 'Milestone fechado'
                            : 'Estado não confirmado'}
                      </span>
                      <h4>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.title} <ArrowUpRight size={14} />
                        </a>
                      </h4>
                      {metadata && (
                        <p className="roadmap-note">
                          {metadata.closedItems} fechados de{' '}
                          {metadata.openItems + metadata.closedItems} itens vinculados (issues e
                          PRs).
                        </p>
                      )}
                      {progress ? (
                        <div className="roadmap-progress">
                          <progress
                            value={progress.closed}
                            max={progress.total}
                            aria-label={`Itens fechados em ${item.title}`}
                          />
                          <span>{progress.percent}% de itens fechados</span>
                        </div>
                      ) : (
                        <p className="roadmap-note">Sem base para percentual.</p>
                      )}
                      {item.updatedAt && (
                        <p className="roadmap-note">
                          Atualizado na fonte em {githubDate(item.updatedAt)}.
                        </p>
                      )}
                      {metadata?.dueOn && (
                        <p className="roadmap-note">
                          Previsão registrada no GitHub: {githubDate(metadata.dueOn)}. Pode mudar.
                        </p>
                      )}
                      {metadata?.closedAt && (
                        <p className="roadmap-note">
                          Fechado na fonte em {githubDate(metadata.closedAt)}.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              !loading && (
                <p className="roadmap-empty">
                  {state === 'fresh'
                    ? 'Nenhum milestone no recorte consultado.'
                    : state === 'stale'
                      ? 'Último recorte sem milestones; a situação atual não está confirmada.'
                      : 'Não foi possível confirmar o planejamento por milestones. Os canais originais continuam acessíveis.'}
                </p>
              )
            )}
            {document ? (
              <div className="roadmap-document">
                <h4>{document.title}</h4>
                <p>{document.summary}</p>
                {document.items.length > 0 && (
                  <ul className="roadmap-document-items">
                    {document.items.map((item) => (
                      <li key={item.title}>
                        <span className="roadmap-state">
                          {item.state === 'proposal'
                            ? 'Proposta no documento'
                            : 'Concluído no documento'}
                        </span>
                        <a
                          href={roadmapDocumentUrl(source, document) + '#' + item.anchor}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.title} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="roadmap-note">
                  Revisão editorial: {document.reviewedAt.split('-').reverse().join('/')} · ref{' '}
                  {document.ref.slice(0, 7)}. Trecho fixado nessa revisão; consulte também a versão
                  atual.
                </p>
                <div className="roadmap-links">
                  <a href={roadmapDocumentUrl(source, document)} target="_blank" rel="noreferrer">
                    Fonte da revisão ↗
                  </a>
                  <a
                    href={`${source.url}/blob/master/${document.path}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Documento atual ↗
                  </a>
                </div>
              </div>
            ) : (
              <p className="roadmap-note">
                Sem documento de roadmap identificado nesta revisão (07/11/2026). Novas prioridades
                podem ser discutidas nas issues públicas.
              </p>
            )}
            <nav className="roadmap-links" aria-label={'Planejamento de ' + source.name}>
              <a href={source.url + '/milestones'} target="_blank" rel="noreferrer">
                Milestones no GitHub ↗
              </a>
              <Link to={`?repo=${source.slug}#issues`}>Issues na central</Link>
              {source.appRoute && <Link to={source.appRoute}>Conhecer o aplicativo</Link>}
            </nav>
          </article>
        ))}
      </div>
    </section>
  );
}
