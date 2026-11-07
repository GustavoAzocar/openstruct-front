import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CircleDot, GitPullRequest, GitBranch, RefreshCw, Tag } from 'lucide-react';
import { usePublicCatalog } from '../components/CatalogProvider';
import { useGithubActivity } from '../components/useGithubActivity';
import { IssuesList } from '../components/IssuesList';
import { issueRepositoryParams } from '../lib/issues';
import {
  developmentSources,
  developmentView,
  githubDate,
  githubListUrl,
  selectDevelopmentSources,
} from '../lib/development';
import { site } from '../lib/config';
import type { CatalogProductId } from '../lib/catalog-trust';
import type { ProductAvailability } from '../lib/catalog-store';
import type { ActivityList } from '../lib/github-snapshot';
import { SNAPSHOT_STALE_MS } from '../lib/github-snapshot';
import '../development.css';

type RepoView = ReturnType<typeof developmentView>['repositories'][number];
type Aggregate = ReturnType<typeof developmentView>['issues'];

function ListCount({ list }: { list: ActivityList }) {
  return (
    <span>
      {list.state === 'unavailable'
        ? 'Não confirmado'
        : list.items.length + (list.truncated ? '+' : '')}
      {list.state === 'stale' && <small> · desatualizado</small>}
    </span>
  );
}

function RepositoryCard({
  repo,
  product,
  loading,
}: {
  repo: RepoView;
  product?: ProductAvailability;
  loading: boolean;
}) {
  const { source, issues, pulls, release } = repo;
  const partial = repo.entry?.status === 'partial';
  return (
    <article className="development-repository" aria-labelledby={'repo-' + source.slug}>
      <div className="development-repo-kicker">
        <span>{source.kind}</span>
        <span>
          {loading
            ? 'Consultando…'
            : !repo.entry
              ? 'Fonte indisponível'
              : partial
                ? 'Atualização parcial'
                : 'Fonte pública'}
        </span>
      </div>
      <h3 id={'repo-' + source.slug}>{source.name}</h3>
      <a className="development-repo-name" href={source.url} target="_blank" rel="noreferrer">
        {source.slug} <ArrowUpRight size={13} />
      </a>
      <p>{source.description}</p>
      <dl className="development-repo-counts">
        <div>
          <dt>Issues abertas no recorte</dt>
          <dd>{loading && !repo.entry ? '—' : <ListCount list={issues} />}</dd>
        </div>
        <div>
          <dt>PRs no recorte</dt>
          <dd>{loading && !repo.entry ? '—' : <ListCount list={pulls} />}</dd>
        </div>
      </dl>
      <div className="development-release">
        <span className="development-label">
          <Tag size={14} /> Última release estável do repositório
        </span>
        {release.item ? (
          <>
            <a href={release.item.url} target="_blank" rel="noreferrer">
              {release.item.tag} <ArrowUpRight size={13} />
            </a>
            <p>Publicada em {githubDate(release.item.publishedAt)}.</p>
          </>
        ) : (
          <p>
            {loading
              ? 'Consultando release…'
              : release.state === 'unavailable'
                ? 'Release não confirmada nesta coleta.'
                : release.state === 'stale'
                  ? 'Última consulta sem release estável; dado desatualizado.'
                  : 'Nenhuma release estável publicada.'}
          </p>
        )}
        {release.state !== 'unavailable' && (
          <p className="development-check">
            Conferida em {githubDate(release.checkedAt)}
            {release.state === 'stale' ? ' · desatualizada' : ''}.
          </p>
        )}
      </div>
      {source.appId && (
        <div className="development-installation">
          {product?.status === 'ready' && product.release ? (
            <p>
              Versão para instalar:{' '}
              <a href={product.release.releaseUrl} target="_blank" rel="noreferrer">
                {product.release.version}
              </a>
              {product.stale ? ' · dado desatualizado' : ''}.{' '}
              <Link to="/launcher">Instalar pelo Struct Launcher</Link>
            </p>
          ) : (
            <p>
              Instalação: <Link to="/launcher">consulte o catálogo do Struct Launcher</Link>.
            </p>
          )}
        </div>
      )}
      {!loading && !repo.entry && (
        <p className="development-warning">
          Não foi possível confirmar esta fonte. Os links oficiais continuam disponíveis.
        </p>
      )}
      <p className="development-check">
        Issues: {githubDate(issues.checkedAt)} · PRs: {githubDate(pulls.checkedAt)}
      </p>
      <nav className="development-card-links" aria-label={'Acompanhar ' + source.name}>
        <Link to={site.developmentPath + '?repo=' + source.slug + '#issues'}>
          Issues na central
        </Link>
        <Link to={site.developmentPath + '?repo=' + source.slug + '#pull-requests'}>
          PRs na central
        </Link>
        <a href={githubListUrl(source, 'issues')} target="_blank" rel="noreferrer">
          Issues no GitHub <ArrowUpRight size={12} />
        </a>
        <a href={githubListUrl(source, 'pulls')} target="_blank" rel="noreferrer">
          PRs no GitHub <ArrowUpRight size={12} />
        </a>
        <a href={source.url + '/releases'} target="_blank" rel="noreferrer">
          Todas as releases <ArrowUpRight size={12} />
        </a>
        <a href={source.url + '/issues/new'} target="_blank" rel="noreferrer">
          Propor melhoria ou relatar problema <ArrowUpRight size={12} />
        </a>
        {source.appRoute && <Link to={source.appRoute}>Conhecer o aplicativo</Link>}
      </nav>
    </article>
  );
}

function ActivityOverview({
  kind,
  data,
  sources,
  loading,
}: {
  kind: 'issues' | 'pulls';
  data: Aggregate;
  sources: typeof developmentSources;
  loading: boolean;
}) {
  const issues = kind === 'issues';
  const title = issues ? 'Issues abertas' : 'Pull requests abertos';
  return (
    <section
      className="development-activity"
      id={issues ? 'issues' : 'pull-requests'}
      aria-labelledby={'title-' + kind}
    >
      <div className="development-section-heading">
        <h2 id={'title-' + kind}>
          {issues ? <CircleDot size={24} /> : <GitPullRequest size={24} />}
          {title}
        </h2>
        <span>RECORTE PÚBLICO · MAIS RECENTES</span>
      </div>
      <p>
        {data.count === null
          ? 'Sem contagem confirmada nesta seleção.'
          : data.count +
            ' no recorte de ' +
            data.knownSources +
            (data.knownSources === 1 ? ' fonte com dados.' : ' fontes com dados.')}{' '}
        Até 60 itens por repositório; não inclui o histórico fechado.
      </p>
      {data.truncatedSources > 0 && (
        <p className="development-warning">
          Há mais itens além do limite coletado. Consulte o GitHub para ver todos os itens.
        </p>
      )}
      {data.staleSources > 0 && (
        <p className="development-warning">
          Há listas desatualizadas; as contagens são do último recorte conhecido.
        </p>
      )}
      {data.unavailableSources > 0 && !loading && (
        <p className="development-warning">
          {data.unavailableSources}{' '}
          {data.unavailableSources === 1
            ? 'fonte sem lista confirmada.'
            : 'fontes sem lista confirmada.'}{' '}
          Ausência de dados não é zero.
        </p>
      )}
      {data.items.length > 0 ? (
        <>
          <ul className="development-item-list">
            {data.items.slice(0, 12).map(({ item, source, state }) => (
              <li key={item.url}>
                <span className="development-item-source">
                  {source.name} · #{item.url.slice(item.url.lastIndexOf('/') + 1)}
                </span>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title} <ArrowUpRight size={14} />
                </a>
                <span className="development-check">
                  Atualização: {githubDate(item.updatedAt)}
                  {state === 'stale' ? ' · dado desatualizado' : ''}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Mostrando {Math.min(12, data.items.length)} de {data.items.length} itens coletados, por
            atualização. As listas completas estão no GitHub.
          </p>
        </>
      ) : (
        <div className="development-empty">
          <p>
            {loading
              ? 'Carregando a atividade pública…'
              : data.count === null
                ? 'Não foi possível confirmar esta lista. Acompanhe o trabalho pelos links oficiais abaixo.'
                : issues
                  ? 'Nenhuma issue aberta neste recorte. Você pode propor uma melhoria ou relatar um problema no repositório correspondente.'
                  : 'Nenhum PR aberto neste recorte. Consulte o GitHub para acompanhar também os PRs fechados e mesclados.'}
          </p>
        </div>
      )}
      <div className="development-source-links">
        {sources.map((source) => (
          <a
            key={source.repository}
            href={githubListUrl(source, kind)}
            target="_blank"
            rel="noreferrer"
          >
            {title} · {source.name} <ArrowUpRight size={13} />
          </a>
        ))}
      </div>
    </section>
  );
}

export function Development() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { result, loading, now, retryAt, canRefresh, refresh } = useGithubActivity();
  const { products } = usePublicCatalog();
  const sources = selectDevelopmentSources(params.get('repo'));
  const selected = sources.length === 1 ? sources[0].slug : '';
  const view = developmentView(
    result?.snapshot,
    sources,
    now,
    Boolean(result && result.source !== 'public'),
  );
  const generatedAt = result?.snapshot?.generatedAt;
  const old = Boolean(generatedAt && now - Date.parse(generatedAt) > SNAPSHOT_STALE_MS);
  const hasProblems = view.repositories.some(
    (repo) =>
      repo.entry?.status !== 'ready' ||
      repo.issues.state !== 'fresh' ||
      repo.pulls.state !== 'fresh' ||
      repo.release.state !== 'fresh',
  );
  function changeRepository(slug: string) {
    const next = issueRepositoryParams(new URLSearchParams(window.location.search), slug);
    const search = next.toString();
    navigate(
      { search: search ? '?' + search : '', hash: window.location.hash },
      { preventScrollReset: true },
    );
  }
  return (
    <div className="container development-page">
      <section className="page-hero development-hero">
        <span className="eyebrow">CENTRAL DE DESENVOLVIMENTO</span>
        <h1>
          O ecossistema,
          <br />
          <span className="blue-text">em construção.</span>
        </h1>
        <p>
          Acompanhe issues, pull requests e publicações de cada projeto. Encontre o lugar certo para
          contribuir com o OpenStruct.
        </p>
        <div className="button-row">
          <a className="button button-primary" href="#repositories">
            <GitBranch size={17} /> Explorar repositórios
          </a>
          <Link className="button button-outline" to="/community">
            Como contribuir
          </Link>
        </div>
      </section>
      <section className="development-sync" aria-label="Atualização dos dados">
        <div>
          <p role="status">
            {loading
              ? 'Consultando o resumo público…'
              : !generatedAt
                ? 'Dados temporariamente indisponíveis. Os links oficiais continuam acessíveis.'
                : result?.source !== 'public'
                  ? 'Último resumo em cache · origem pública indisponível.'
                  : old
                    ? 'Resumo desatualizado.'
                    : hasProblems
                      ? 'Resumo disponível · há fontes parciais ou indisponíveis.'
                      : 'Resumo público atualizado.'}
          </p>
          <p>Coleta: {githubDate(generatedAt)}. Atualização aproximadamente horária.</p>
          {result?.snapshot?.retryAt && Date.parse(result.snapshot.retryAt) > now && (
            <p>Coletor aguardando o limite do GitHub até {githubDate(result.snapshot.retryAt)}.</p>
          )}
          {!canRefresh && !loading && (
            <p>
              Nova consulta ao resumo a partir de {githubDate(new Date(retryAt).toISOString())}.
            </p>
          )}
        </div>
        <button className="button button-outline" onClick={refresh} disabled={!canRefresh}>
          <RefreshCw size={15} />
          {loading ? 'Consultando…' : 'Consultar novamente'}
        </button>
      </section>
      <div className="development-filter">
        <label htmlFor="development-repository">Repositório</label>
        <select
          id="development-repository"
          value={selected}
          onChange={(event) => changeRepository(event.target.value)}
        >
          <option value="">Visão geral · todos os repositórios</option>
          {developmentSources.map((source) => (
            <option key={source.repository} value={source.slug}>
              {source.name} · {source.slug}
            </option>
          ))}
        </select>
        {selected && (
          <button className="text-link" onClick={() => changeRepository('')}>
            Mostrar todos
          </button>
        )}
      </div>
      <div className="development-metrics" aria-label="Resumo da seleção">
        <a href="#issues">
          <CircleDot size={20} />
          <strong>{view.issues.count ?? '—'}</strong>
          <span>Issues abertas no recorte</span>
          <small>
            {view.issues.knownSources} de {sources.length}{' '}
            {sources.length === 1 ? 'fonte' : 'fontes'} com dados
          </small>
        </a>
        <a href="#pull-requests">
          <GitPullRequest size={20} />
          <strong>{view.pulls.count ?? '—'}</strong>
          <span>PRs abertos no recorte</span>
          <small>
            {view.pulls.knownSources} de {sources.length}{' '}
            {sources.length === 1 ? 'fonte' : 'fontes'} com dados
          </small>
        </a>
        <a href="#releases">
          <Tag size={20} />
          <strong>{sources.length}</strong>
          <span>
            {sources.length === 1 ? 'Repositório acompanhado' : 'Repositórios acompanhados'}
          </span>
          <small>Fontes e releases por projeto</small>
        </a>
      </div>
      <details className="development-definitions">
        <summary>Como interpretar as contagens e versões</summary>
        <p>
          As contagens usam itens únicos das listas coletadas, separando issues de PRs. Até 60
          entradas por lista são consultadas; a lista de issues pode conter menos itens porque o
          resultado da consulta também inclui PRs, que são excluídos. Uma lista indisponível não é
          contada como zero. Dados antigos mantêm sua data e identificação.
        </p>
        <p>
          As releases são as publicações estáveis mais recentes do repositório, sem rascunhos ou
          pré-releases. A versão para instalar vem do catálogo assinado e pode estar publicada em
          outro repositório. A release mais recente do hub não é a versão de todos os aplicativos.
        </p>
      </details>
      <section id="repositories" aria-labelledby="releases">
        <div className="development-section-heading">
          <h2 id="releases">Por sistema e repositório</h2>
          <span>REGISTRO PÚBLICO OPENSTRUCT</span>
        </div>
        <div className="development-repository-grid">
          {view.repositories.map((repo) => (
            <RepositoryCard
              key={repo.source.repository}
              repo={repo}
              loading={loading}
              product={
                repo.source.appId ? products[repo.source.appId as CatalogProductId] : undefined
              }
            />
          ))}
        </div>
      </section>
      <IssuesList
        snapshot={result?.snapshot}
        sources={sources}
        loading={loading}
        now={now}
        offline={Boolean(result && result.source !== 'public')}
      />
      <ActivityOverview kind="pulls" data={view.pulls} sources={sources} loading={loading} />
      <aside className="development-launcher">
        <h2>Distribuição pelo Struct Launcher</h2>
        <p>
          A distribuição do Struct Launcher é acompanhada pelo hub público do ecossistema. Consulte
          suas versões e pacotes por lá.
        </p>
        <div className="button-row">
          <Link to="/launcher" className="button button-primary">
            Conhecer o Struct Launcher
          </Link>
          <a
            href="https://github.com/ricardocorsini/openstruct-catalog/releases"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Releases do hub público <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
    </div>
  );
}
