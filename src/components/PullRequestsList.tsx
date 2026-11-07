import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, GitPullRequest } from 'lucide-react';
import { githubDate } from '../lib/development';
import type { DevelopmentSource } from '../lib/development';
import type { GithubSnapshot } from '../lib/github-snapshot';
import { pullLabels, pullState, readPullFilters, selectPulls } from '../lib/pulls';
import './issues-list.css';

export function PullRequestsList({
  snapshot,
  sources,
  loading,
  now,
  offline,
}: {
  snapshot: GithubSnapshot | null | undefined;
  sources: DevelopmentSource[];
  loading: boolean;
  now: number;
  offline: boolean;
}) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const filters = readPullFilters(params);
  const result = selectPulls(snapshot, sources, filters.state, now, offline);
  const pageCount = Math.max(1, Math.ceil(result.rows.length / 10));
  const page = Math.min(filters.page, pageCount);
  function update(state: keyof typeof pullLabels, nextPage = 1) {
    const next = new URLSearchParams(params);
    if (state === 'all') next.delete('pullState');
    else next.set('pullState', state);
    if (nextPage === 1) next.delete('pullPage');
    else next.set('pullPage', String(nextPage));
    navigate({ search: next.toString(), hash: '#pull-requests' }, { preventScrollReset: true });
  }
  return (
    <section
      id="pull-requests"
      className="development-activity issues-section"
      aria-labelledby="title-pulls"
    >
      <div className="development-section-heading">
        <h2 id="title-pulls">
          <GitPullRequest size={24} />
          Pull requests dos sistemas
        </h2>
        <span>RECORTE PÚBLICO · POR ATUALIZAÇÃO</span>
      </div>
      <p>
        Use o filtro de repositório da central para escolher um sistema. Até 60 PRs recentes por
        repositório, considerando todos os estados juntos; o recorte pode omitir PRs antigos,
        inclusive abertos.
      </p>
      <div className="issue-filters">
        <label>
          Estado do pull request
          <select
            value={filters.state}
            onChange={(event) => update(event.target.value as keyof typeof pullLabels)}
          >
            {Object.entries(pullLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="result-count" role="status">
        {loading
          ? 'Carregando pull requests…'
          : result.coverage.some((row) => row.known)
            ? `${result.rows.length} PRs nesta seleção do recorte. ${result.coverage.filter((row) => row.known).length} de ${sources.length} fontes confirmadas.`
            : 'Quantidade de PRs não confirmada. Nenhuma fonte disponível nesta seleção.'}
      </p>
      <p className="issue-filter-note">
        Aberto não significa aprovado. Reviews e checks de CI não são coletados nesta lista; confira
        essas informações no GitHub.
      </p>
      <details className="issue-coverage">
        <summary>Fontes, datas e cobertura dos PRs</summary>
        <ul>
          {result.coverage.map((row) => (
            <li key={row.source.slug}>
              <strong>{row.source.name}</strong>
              <span>
                {!row.known
                  ? 'Lista indisponível; ausência de dados não é zero.'
                  : `${row.stale ? 'Dado desatualizado' : 'Coletado'}: ${githubDate(row.checkedAt)}. ${row.truncated ? 'Há mais PRs além do limite.' : 'Fim da paginação da consulta.'}`}
              </span>
            </li>
          ))}
        </ul>
      </details>
      {result.rows.length ? (
        <ul className="issues-list">
          {result.rows.slice((page - 1) * 10, page * 10).map(({ item, source, stale }) => (
            <li className="issue-row" key={item.url}>
              <div className="issue-row-kicker">
                <span>
                  {source.name} · #{item.url.slice(item.url.lastIndexOf('/') + 1)}
                </span>
                <span className="issue-state">{pullLabels[pullState(item)]}</span>
              </div>
              <a className="issue-title" href={item.url} target="_blank" rel="noreferrer">
                {item.title} <ArrowUpRight size={14} />
              </a>
              <div className="issue-row-meta">
                <span>Autor: {item.pull?.author ?? 'não informado'}</span>
                <span>Criado: {githubDate(item.pull?.createdAt ?? null)}</span>
                <span>Atualizado: {githubDate(item.updatedAt)}</span>
                {item.pull?.closedAt && <span>Fechado: {githubDate(item.pull.closedAt)}</span>}
                {item.pull?.mergedAt && <span>Mesclado: {githubDate(item.pull.mergedAt)}</span>}
                {stale && <span>Recorte desatualizado</span>}
              </div>
              {item.pull && (item.pull.head || item.pull.base) && (
                <p className="issue-filter-note" style={{ overflowWrap: 'anywhere' }}>
                  Branch de origem: {item.pull.head ?? 'não informada'} → destino:{' '}
                  {item.pull.base ?? 'não informado'}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !loading && (
          <div className="development-empty">
            <p>
              {result.coverage.some((row) => row.known)
                ? 'Nenhum PR corresponde ao filtro neste recorte.'
                : 'Não foi possível confirmar as listas de PRs.'}{' '}
              Consulte as fontes oficiais abaixo.
            </p>
          </div>
        )
      )}
      {pageCount > 1 && (
        <nav className="issue-pagination" aria-label="Paginação dos pull requests">
          <button
            className="button button-outline"
            disabled={page === 1}
            onClick={() => update(filters.state, page - 1)}
          >
            Anterior
          </button>
          <span>
            Página {page} de {pageCount}
          </span>
          <button
            className="button button-outline"
            disabled={page === pageCount}
            onClick={() => update(filters.state, page + 1)}
          >
            Próxima
          </button>
        </nav>
      )}
      <div className="development-source-links">
        {sources.map((source) => (
          <a
            key={source.slug}
            href={source.url + '/pulls?q=is%3Apr'}
            target="_blank"
            rel="noreferrer"
          >
            PRs no GitHub · {source.name} <ArrowUpRight size={13} />
          </a>
        ))}
      </div>
    </section>
  );
}
