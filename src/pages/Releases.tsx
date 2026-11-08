import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { usePublicCatalog } from '../components/CatalogProvider';
import { useGithubActivity } from '../components/useGithubActivity';
import { githubDate } from '../lib/development';
import { loadLauncherRelease } from '../lib/launcher';
import type { LauncherRelease } from '../lib/launcher';
import { RELEASE_PRODUCTS } from '../lib/release-history-contract';
import {
  RELEASE_PAGE_SIZE,
  readReleaseFilters,
  releaseAnchor,
  releaseFilterParams,
  releaseProducts,
  releasesView,
} from '../lib/releases';
import '../releases.css';

export function Releases() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const catalog = usePublicCatalog();
  const activity = useGithubActivity();
  const [launcher, setLauncher] = useState<{ release: LauncherRelease; checkedAt: string }>();
  const [launcherLoading, setLauncherLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 10_000);
    void loadLauncherRelease(controller.signal)
      .then((result) => {
        if (active && result.status === 'ready')
          setLauncher({ release: result.release, checkedAt: new Date().toISOString() });
      })
      .catch(() => {
        /* History and official links remain usable without this feed. */
      })
      .finally(() => {
        if (active) setLauncherLoading(false);
        window.clearTimeout(timer);
      });
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);
  const view = releasesView(
    activity.result?.snapshot,
    catalog.products,
    activity.now,
    Boolean(activity.result && activity.result.source !== 'public'),
    launcher,
  );
  const filters = readReleaseFilters(params);
  const rows = view.rows.filter((row) => !filters.product || row.productId === filters.product);
  const pages = Math.max(1, Math.ceil(rows.length / RELEASE_PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const visible = rows.slice((page - 1) * RELEASE_PAGE_SIZE, page * RELEASE_PAGE_SIZE);
  const anchors = visible.map((row) => releaseAnchor(row.productId, row.version)).join('|');
  useEffect(() => {
    if (!location.hash) return;
    try {
      document
        .getElementById(decodeURIComponent(location.hash.slice(1)))
        ?.scrollIntoView({ behavior: 'instant' });
    } catch {
      /* Malformed fragments do not affect the history. */
    }
  }, [location.hash, anchors]);
  function change(product: string, nextPage = 1) {
    const next = releaseFilterParams(params, product, nextPage);
    navigate({ pathname: '/releases', search: next.toString(), hash: '' });
  }
  const loading = catalog.loading || activity.loading || launcherLoading;
  return (
    <div className="container releases-page">
      <section className="page-hero">
        <span className="eyebrow">PUBLICAÇÕES DO ECOSSISTEMA</span>
        <h1>
          Versões e <span className="blue-text">suas mudanças.</span>
        </h1>
        <p>
          Releases dos aplicativos e do Struct Launcher, com notas originais, datas e arquivos
          oficiais. Um histórico público para acompanhar a evolução.
        </p>
        <div className="button-row">
          <Link to="/launcher" className="button button-primary">
            Instalar pelo Struct Launcher
          </Link>
          <Link to="/development" className="button button-outline">
            Central de desenvolvimento
          </Link>
        </div>
      </section>
      <p className="releases-notice">
        O canal stable identifica distribuição, sem atestar maturidade, validação de engenharia ou
        conformidade normativa integral. Pré-release e beta são identificados separadamente.
        Publicação no GitHub, sozinha, não confirma um pacote no catálogo.
      </p>
      <div className="releases-filter">
        <label htmlFor="release-product">Sistema</label>
        <select
          id="release-product"
          value={filters.product}
          onChange={(e) => change(e.target.value)}
        >
          <option value="">Todos os sistemas</option>
          {releaseProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {filters.product && (
          <button className="text-link" onClick={() => change('')}>
            Mostrar todos
          </button>
        )}
      </div>
      <p role="status" className="releases-note">
        {loading ? 'Conferindo as fontes públicas… ' : ''}
        {rows.length} publicações no recorte selecionado · ordem cronológica, mais recentes
        primeiro.
      </p>
      <details className="releases-sources">
        <summary>Fontes, atualização e cobertura do histórico</summary>
        <p>
          O catálogo assinado preserva até 200 versões por aplicativo, com assinaturas de pacotes
          verificadas. O snapshot consulta até 60 releases por repositório distribuidor; o hub
          compartilha esse limite entre produtos. Drafts e prefixos desconhecidos são excluídos. O
          histórico pode omitir publicações antigas. As notas são texto simples limitado a 2.000
          caracteres, sem carregar anexos.
        </p>
        <ul>
          {releaseProducts
            .filter((p) => !filters.product || p.id === filters.product)
            .map((p) => {
              const source = view.coverage.find(
                (s) => s.repository === RELEASE_PRODUCTS[p.id].releaseRepo,
              )!;
              const product = p.id === 'launcher' ? undefined : catalog.products[p.id];
              return (
                <li key={p.id}>
                  <strong>{p.name}</strong> ·{' '}
                  {product?.checkedAt
                    ? `Catálogo: ${githubDate(product.checkedAt)}${product.stale ? ' · desatualizado' : ''}. `
                    : ''}
                  {source.state === 'unavailable'
                    ? 'Histórico GitHub não confirmado.'
                    : `GitHub: ${githubDate(source.checkedAt)}${source.state === 'stale' ? ' · desatualizado' : ''}.`}
                  {source.truncated ? ' Há releases além do recorte.' : ''}
                  {p.id === 'launcher' && (
                    <span>
                      {launcher
                        ? ` Feed do Launcher consultado em ${githubDate(launcher.checkedAt)}; fornece somente a versão atual. Validação de formato/origem, sem verificação criptográfica do binário nesta página.`
                        : ' Feed atual do Launcher não confirmado.'}
                    </span>
                  )}
                </li>
              );
            })}
        </ul>
        <button className="text-link" onClick={activity.refresh} disabled={!activity.canRefresh}>
          Atualizar resumo GitHub
        </button>
        {catalog.canRetry && (
          <button className="text-link" onClick={() => void catalog.refresh()}>
            Consultar catálogo novamente
          </button>
        )}
      </details>
      {visible.length ? (
        <ol className="release-timeline">
          {visible.map((row) => {
            const name = releaseProducts.find((p) => p.id === row.productId)!.name;
            const anchor = releaseAnchor(row.productId, row.version);
            const productRows = view.rows.filter((r) => r.productId === row.productId);
            const ownPage =
              Math.floor(
                productRows.findIndex((r) => r.version === row.version) / RELEASE_PAGE_SIZE,
              ) + 1;
            const permalink =
              '/releases?' +
              releaseFilterParams(new URLSearchParams(), row.productId, ownPage).toString() +
              '#' +
              encodeURIComponent(anchor);
            return (
              <li id={anchor} key={row.productId + ':' + row.version}>
                <div className="release-kicker">
                  <span>{name}</span>
                  <time dateTime={row.publishedAt}>{githubDate(row.publishedAt)}</time>
                </div>
                <h2>
                  {name} <span className="blue-text">{row.version}</span>
                </h2>
                <p className="release-labels">
                  <span>
                    {row.channel
                      ? `Catálogo: ${row.channel}`
                      : 'Canal de distribuição não confirmado'}
                  </span>
                  {(row.prerelease || row.version.split('+')[0].includes('-')) && (
                    <span>Pré-release</span>
                  )}
                  {row.launcherCurrent && <span>Versão atual no feed do Launcher</span>}
                  {row.stale && <span>Dado desatualizado</span>}
                </p>
                {row.channel === 'stable' && row.prerelease && (
                  <p className="releases-note">
                    As fontes divergem: catálogo stable e GitHub pré-release. Confira a publicação
                    original.
                  </p>
                )}
                <p className="release-summary">
                  {row.notes.trim()
                    ? row.notes
                        .split('\n')
                        .find((line) => line.trim())
                        ?.slice(0, 240)
                    : 'Sem notas neste recorte. Consulte a publicação original.'}
                </p>
                {row.notes.trim() && (
                  <details className="release-notes">
                    <summary>Ler notas oficiais em texto simples</summary>
                    <p>{row.notes}</p>
                    {row.notesTruncated && (
                      <p className="releases-note">
                        Notas parciais; continue na publicação original.
                      </p>
                    )}
                  </details>
                )}
                <p className="releases-note">
                  Tag: <code>{row.tag}</code> · Consulta: {githubDate(row.checkedAt)}.{' '}
                  {row.origin === 'catalog'
                    ? 'Metadados e pacotes do catálogo assinado.'
                    : row.origin === 'github'
                      ? 'Registro público do GitHub; disponibilidade no catálogo não confirmada para esta versão.'
                      : 'Metadados do feed público do Launcher.'}
                </p>
                <nav className="release-links" aria-label={`Fontes de ${name} ${row.version}`}>
                  <a href={row.url} target="_blank" rel="noreferrer">
                    Notas e arquivos oficiais ↗
                  </a>
                  {row.codeUrl && (
                    <a href={row.codeUrl} target="_blank" rel="noreferrer">
                      Código da versão ↗
                    </a>
                  )}
                  <Link to={permalink}>Link desta versão</Link>
                </nav>
                {row.catalogRelease && (
                  <p className="releases-note">
                    Pacotes confirmados:{' '}
                    {row.catalogRelease.assets
                      .map((a) => `${a.platform === 'windows' ? 'Windows' : 'Linux'} ${a.arch}`)
                      .join(' · ')}
                    . Instale pelo <Link to="/launcher">Struct Launcher</Link>; versões antigas
                    podem ter limites conhecidos.
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        !loading && (
          <p className="releases-empty">
            Não foi possível confirmar publicações para esta seleção. Os registros oficiais
            permanecem acessíveis abaixo.
          </p>
        )
      )}
      <nav className="releases-pagination" aria-label="Paginação de releases">
        <button
          className="button button-outline"
          disabled={page <= 1}
          onClick={() => change(filters.product, page - 1)}
        >
          Anterior
        </button>
        <span>
          Página {page} de {pages}
        </span>
        <button
          className="button button-outline"
          disabled={page >= pages}
          onClick={() => change(filters.product, page + 1)}
        >
          Próxima
        </button>
      </nav>
      <nav className="release-links" aria-label="Registros originais de releases">
        {releaseProducts
          .filter((p) => !filters.product || p.id === filters.product)
          .map((p) => (
            <a
              key={p.id}
              href={`https://github.com/${RELEASE_PRODUCTS[p.id].releaseRepo}/releases`}
              target="_blank"
              rel="noreferrer"
            >
              {p.name} no GitHub ↗
            </a>
          ))}
      </nav>
    </div>
  );
}
