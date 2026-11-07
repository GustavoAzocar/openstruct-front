import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleDot, MessageSquare } from 'lucide-react';
import { developmentSources, githubDate, githubListUrl } from '../lib/development';
import type { DevelopmentSource } from '../lib/development';
import type { GithubSnapshot, PublicIssue } from '../lib/github-snapshot';
import {
  defaultIssueFilters,
  issueRepositoryParams,
  loadedIssueLabels,
  readIssueFilters,
  selectIssues,
  writeIssueFilters,
} from '../lib/issues';
import type { IssueFilters } from '../lib/issues';
import './issues-list.css';

function IssueRow({
  issue,
  source,
  stale,
}: {
  issue: PublicIssue;
  source: DevelopmentSource;
  stale: boolean;
}) {
  return (
    <li className="issue-row">
      <div className="issue-row-kicker">
        <span>
          {source.name} · #{issue.number}
        </span>
        <span className="issue-state">{issue.state === 'open' ? 'Aberta' : 'Fechada'}</span>
      </div>
      <a className="issue-title" href={issue.url} target="_blank" rel="noreferrer">
        {issue.title} <ArrowUpRight size={14} />
      </a>
      <div className="issue-labels" aria-label="Labels da issue">
        {issue.labels === null ? (
          <span>Labels não informadas neste recorte</span>
        ) : !issue.labels.length ? (
          <span>Sem labels</span>
        ) : (
          issue.labels.map((label) => (
            <span className="issue-label" key={label}>
              {label}
            </span>
          ))
        )}
      </div>
      <div className="issue-row-meta">
        <span>
          Autor:{' '}
          {issue.author ? (
            issue.author.url ? (
              <a href={issue.author.url} target="_blank" rel="noreferrer">
                {issue.author.login}
              </a>
            ) : (
              issue.author.login
            )
          ) : (
            'não informado'
          )}
        </span>
        <span>Atualizada: {githubDate(issue.updatedAt)}</span>
        <span>
          <MessageSquare size={13} />
          {issue.comments === null
            ? 'Comentários não informados'
            : issue.comments + (issue.comments === 1 ? ' comentário' : ' comentários')}
        </span>
        {stale && <span>Recorte desatualizado</span>}
      </div>
    </li>
  );
}

export function IssuesList({
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
  const location = useLocation();
  const navigation = useNavigationType();
  const editing = useRef(false);
  const focusAfterPage = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const labels = loadedIssueLabels(snapshot, sources);
  const filters = readIssueFilters(params, labels);
  const view = selectIssues(snapshot, sources, filters, now, offline);
  const ignoredLabel = Boolean(params.get('issueLabel') && !filters.label);
  useEffect(() => {
    if (navigation === 'POP') editing.current = false;
  }, [location.key, navigation]);
  useEffect(() => {
    if (!focusAfterPage.current) return;
    focusAfterPage.current = false;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [view.page]);
  function update(changes: Partial<IssueFilters>, typing = false) {
    const base = new URLSearchParams(window.location.search);
    const next = { ...readIssueFilters(base, labels), ...changes };
    if (changes.page === undefined) next.page = 1;
    const replace = typing && editing.current;
    editing.current = typing;
    const search = writeIssueFilters(base, next).toString();
    navigate(
      { search: search ? '?' + search : '', hash: window.location.hash },
      { replace, preventScrollReset: true },
    );
  }
  function changePage(page: number) {
    if (page === view.page) return;
    focusAfterPage.current = true;
    update({ page });
  }
  return (
    <section
      className="development-activity issues-section"
      id="issues"
      aria-labelledby="title-issues"
    >
      <div className="development-section-heading">
        <h2 id="title-issues" ref={heading} tabIndex={-1}>
          <CircleDot size={24} />
          Issues dos sistemas
        </h2>
        <span>RECORTE PÚBLICO · POR ATUALIZAÇÃO</span>
      </div>
      <p>
        Filtre as issues coletadas por repositório, estado e labels. A seleção de repositório é
        compartilhada com a central. Pull requests ficam na seção própria.
      </p>
      <div className="issue-filters">
        <label>
          Repositório
          <select
            value={sources.length === 1 ? sources[0].slug : ''}
            onChange={(event) => {
              editing.current = false;
              const search = issueRepositoryParams(
                new URLSearchParams(window.location.search),
                event.target.value,
              ).toString();
              navigate(
                { search: search ? '?' + search : '', hash: window.location.hash },
                { preventScrollReset: true },
              );
            }}
          >
            <option value="">Todos os repositórios</option>
            {developmentSources.map((source) => (
              <option key={source.slug} value={source.slug}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            value={filters.state}
            onChange={(event) => update({ state: event.target.value as IssueFilters['state'] })}
          >
            <option value="open">Abertas</option>
            <option value="closed">Fechadas</option>
            <option value="all">Abertas e fechadas</option>
          </select>
        </label>
        <label>
          Label
          <select
            value={filters.label}
            disabled={!labels.length}
            onChange={(event) => update({ label: event.target.value })}
          >
            <option value="">Todas as labels</option>
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="issue-search">
          Buscar issues
          <input
            aria-label="Buscar issues no recorte"
            value={filters.q}
            maxLength={200}
            placeholder="Título, número, autor ou label"
            onChange={(event) => update({ q: event.target.value }, true)}
            onBlur={() => {
              editing.current = false;
            }}
          />
        </label>
        <button className="button button-outline" onClick={() => update(defaultIssueFilters)}>
          Limpar filtros de issues
        </button>
      </div>
      {!labels.length && !loading && (
        <p className="issue-filter-note">
          Nenhuma label confirmada no recorte dos repositórios selecionados.
        </p>
      )}
      {ignoredLabel && !loading && (
        <p className="development-warning">
          A label do endereço não está disponível neste recorte. O filtro foi ignorado; escolha uma
          das labels coletadas.
        </p>
      )}
      <p className="result-count" aria-live="polite">
        {loading
          ? 'Consultando issues…'
          : !view.knownCollections
            ? 'Contagem de issues não confirmada nesta seleção.'
            : view.total +
              (view.total === 1 ? ' correspondência' : ' correspondências') +
              ' entre ' +
              view.loadedCount +
              (view.loadedCount === 1 ? ' issue' : ' issues') +
              ' no recorte dos estados selecionados.'}
      </p>
      <p>
        Até 60 entradas por repositório e estado são consultadas; PRs são removidos. Estes números
        descrevem o recorte carregado, sem representar o total do repositório.
      </p>
      {!loading && view.coverage.some((entry) => entry.state === 'unavailable') && (
        <p className="development-warning">
          Há listas por estado indisponíveis. Elas não entram na contagem como zero.
        </p>
      )}
      {view.coverage.some((entry) => entry.state === 'stale') && (
        <p className="development-warning">
          Há dados desatualizados, preservados com a data da última consulta válida.
        </p>
      )}
      {view.coverage.some((entry) => entry.truncated) && (
        <p className="development-warning">
          Há mais itens além do limite coletado. Consulte o GitHub para ver a lista completa.
        </p>
      )}
      <details className="issue-coverage">
        <summary>
          Cobertura e datas do recorte · {view.knownCollections} de {view.coverage.length}{' '}
          {view.coverage.length === 1 ? 'lista' : 'listas'}
          por estado com dados
        </summary>
        <ul>
          {view.coverage.map((entry) => (
            <li key={entry.source.repository + entry.scope}>
              <strong>
                {entry.source.name} · {entry.scope === 'open' ? 'Abertas' : 'Fechadas'}
              </strong>
              <span>
                {entry.state === 'unavailable'
                  ? 'Não confirmado'
                  : (entry.state === 'stale' ? 'Desatualizado · ' : '') +
                    githubDate(entry.checkedAt)}
              </span>
              <span>
                {entry.truncated
                  ? 'Limite de paginação atingido'
                  : entry.state === 'unavailable'
                    ? 'Sem cobertura confirmada'
                    : 'Fim da lista por estado na consulta'}
              </span>
            </li>
          ))}
        </ul>
      </details>
      {view.rows.length ? (
        <ul className="issues-list">
          {view.rows.map((row) => (
            <IssueRow key={row.issue.url} {...row} />
          ))}
        </ul>
      ) : (
        <div className="development-empty">
          <p>
            {loading
              ? 'Carregando as issues públicas…'
              : !view.knownCollections
                ? 'Não foi possível confirmar as issues. Use os links oficiais abaixo.'
                : !view.loadedCount
                  ? 'Nenhuma issue neste recorte dos estados selecionados. Você pode acompanhar ou propor uma melhoria no GitHub.'
                  : 'Nenhuma issue corresponde aos filtros. Ajuste o estado, a label ou a busca.'}
          </p>
        </div>
      )}
      <nav className="issue-pagination" aria-label="Paginação de issues">
        <button
          className="button button-outline"
          disabled={view.page <= 1}
          onClick={() => changePage(view.page - 1)}
        >
          <ArrowLeft size={14} />
          Anterior
        </button>
        <span>
          Página {view.page} de {view.pageCount} · {view.rows.length}{' '}
          {view.rows.length === 1 ? 'item nesta página' : 'itens nesta página'}
        </span>
        <button
          className="button button-outline"
          disabled={view.page >= view.pageCount}
          onClick={() => changePage(view.page + 1)}
        >
          Próxima
          <ArrowRight size={14} />
        </button>
      </nav>
      <div className="development-source-links">
        {sources.map((source) => (
          <a
            key={source.repository}
            href={githubListUrl(source, 'issues').replace(
              'is%3Aopen',
              filters.state === 'all'
                ? ''
                : filters.state === 'closed'
                  ? 'is%3Aclosed'
                  : 'is%3Aopen',
            )}
            target="_blank"
            rel="noreferrer"
          >
            Issues no GitHub · {source.name}
            <ArrowUpRight size={13} />
          </a>
        ))}
      </div>
    </section>
  );
}
