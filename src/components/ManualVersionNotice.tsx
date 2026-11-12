import { useId, useSyncExternalStore } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATALOG_URL } from '../lib/catalog-trust';
import { githubDate } from '../lib/development';
import { GITHUB_SNAPSHOT_URL } from '../lib/github-snapshot';
import { manualEditionPath, publicManualEditions } from '../lib/manual-chapters';
import type { ManualEdition, ManualSystem } from '../lib/manual-chapters';
import { manualCoverageIncludes, manualVersionView } from '../lib/manual-versions';
import type { ManualReleaseEvidence, ManualVersionView } from '../lib/manual-versions';
import { usePublicCatalog } from './CatalogProvider';
import { useGithubActivity } from './useGithubActivity';
import './manual-version-notice.css';

const reviewDate = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

function subscribeOnline(update: () => void) {
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  return () => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
  };
}

function onlineSnapshot() {
  return navigator.onLine;
}

function sourceStatus(source: ManualVersionView['catalog'], absent: string) {
  switch (source.state) {
    case 'loading':
      return 'Consulta em andamento';
    case 'fresh':
      return source.absent ? absent : 'Dados recentes';
    case 'stale':
      return source.failed ? 'Dado desatualizado após falha na consulta' : 'Dado desatualizado';
    case 'offline':
      return source.checkedAt ? 'Sem conexão. Último dado disponível' : 'Sem conexão';
    case 'failed':
      return 'Falha na consulta';
    case 'unavailable':
      return 'Fonte indisponível';
  }
}

function comparisonMessage(view: ManualVersionView) {
  const version = view.reference?.version;
  switch (view.relation) {
    case 'covered':
      return `A publicação ${version} está na cobertura editorial desta edição.`;
    case 'newer':
      return view.reference?.stale
        ? `Uma fonte desatualizada registra a versão ${version}, acima da cobertura editorial desta edição.`
        : `A versão ${version} já foi publicada. A cobertura editorial desta edição ainda não inclui essa versão.`;
    case 'older':
      return `A cobertura editorial desta edição está à frente da publicação ${version} identificada nas fontes.`;
    case 'same-precedence':
      return `A publicação ${version} tem a mesma precedência SemVer, com metadados diferentes. Compatibilidade não verificada.`;
    case 'unknown': {
      if (view.reference) return 'Compatibilidade com a publicação de referência não verificada.';
      if (view.history.state === 'offline' || view.catalog.state === 'offline') {
        return 'Sem conexão para verificar a publicação de referência.';
      }
      if (view.history.absent) return 'Nenhuma publicação deste sistema no histórico verificado.';
      if (view.history.state === 'loading' || view.catalog.state === 'loading') {
        return 'Consultando as fontes de versão.';
      }
      if (view.history.failed || view.catalog.failed) {
        return 'Falha na consulta. A publicação de referência não pôde ser verificada.';
      }
      return 'Compatibilidade não verificada. As fontes disponíveis não confirmam uma publicação de referência.';
    }
  }
}

function ReleaseEvidence({ label, release }: { label: string; release: ManualReleaseEvidence }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        <strong>{release.version}</strong>
        {release.channel === 'stable' && (
          <span className="manual-version-channel">
            {release.prerelease ? 'Canal marcado como estável' : 'Canal estável'}
          </span>
        )}
        {release.channel === 'beta' && <span className="manual-version-channel">Canal beta</span>}
        {release.origin === 'github' && <span className="manual-version-channel">GitHub</span>}
        {release.stale && <span className="manual-version-source">Dado desatualizado</span>}
        <a className="manual-version-link" href={release.notesUrl} target="_blank" rel="noreferrer">
          Notas da versão {release.version} <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </dd>
    </div>
  );
}

export function ManualVersionNotice({
  system,
  edition,
}: {
  system: Extract<ManualSystem, { kind: 'app' }>;
  edition: ManualEdition;
}) {
  const label = useId();
  const catalog = usePublicCatalog();
  const activity = useGithubActivity();
  const online = useSyncExternalStore(subscribeOnline, onlineSnapshot, () => true);
  const { coverage, reviewedAt } = edition;
  const view = manualVersionView({
    productId: system.id,
    coverage,
    catalog,
    history: activity.result,
    historyLoading: activity.loading,
    now: Date.now(),
    offline: !online,
  });
  const referenceVersion = view.reference?.version;
  const alternatives =
    view.relation === 'newer' && referenceVersion
      ? publicManualEditions(system).filter(
          (candidate) =>
            candidate.id !== edition.id &&
            manualCoverageIncludes(candidate.coverage, referenceVersion),
        )
      : [];
  const alternative =
    alternatives.find(({ id }) => id === system.currentEditionId) ?? alternatives[0];
  const catalogStatus = sourceStatus(view.catalog, 'Sem pacote estável no catálogo verificado');
  const historyStatus = sourceStatus(
    view.history,
    'Nenhuma publicação deste sistema no histórico verificado',
  );
  const historySource = {
    public: 'Resumo público',
    cache: 'Cache da sessão',
    bundled: 'Cópia incluída no site',
    unavailable: '',
  };

  return (
    <aside className="manual-version" aria-labelledby={label} data-relation={view.relation}>
      <h2 id={label}>Cobertura e versões</h2>
      <dl className="manual-version-grid">
        <div>
          <dt>Cobertura desta edição</dt>
          <dd>
            {coverage ? (
              <>
                <strong>{coverage.version}</strong>
                {coverage.range && (
                  <span className="manual-version-source">
                    Faixa revisada de {coverage.range.min} a {coverage.range.max}
                  </span>
                )}
              </>
            ) : (
              'Versão não informada'
            )}
            {reviewedAt && (
              <span className="manual-version-source">
                Revisão da edição em{' '}
                <time dateTime={reviewedAt}>{reviewDate.format(new Date(reviewedAt))}</time>
              </span>
            )}
          </dd>
        </div>
        {view.distribution ? (
          <ReleaseEvidence
            label={view.distribution.stale ? 'Distribuição registrada' : 'Distribuição confirmada'}
            release={view.distribution}
          />
        ) : (
          <div>
            <dt>Distribuição estável</dt>
            <dd>{catalogStatus}</dd>
          </div>
        )}
        {view.reference?.origin === 'github' && view.publication && (
          <ReleaseEvidence
            label="Publicação sem distribuição confirmada"
            release={view.publication}
          />
        )}
        {view.prerelease && <ReleaseEvidence label="Pré-release" release={view.prerelease} />}
      </dl>
      <p className="manual-version-message" role="status">
        {comparisonMessage(view)}
        {!view.canConfirmLatest && view.reference && (
          <span className="manual-version-source">
            As fontes disponíveis não confirmam qual é a publicação mais recente.
          </span>
        )}
      </p>
      {alternative && (
        <Link className="manual-version-link" to={manualEditionPath(system.id, alternative.id)}>
          Consultar {alternative.title} para a versão {referenceVersion}
          {alternative.status === 'sample' && ' · Amostra'}
        </Link>
      )}
      <details className="manual-version-details">
        <summary>Fontes e última verificação</summary>
        <ul>
          <li>
            <a className="manual-version-link" href={CATALOG_URL} target="_blank" rel="noreferrer">
              Catálogo público assinado
            </a>
            <span className="manual-version-source">
              {catalogStatus}
              {view.catalog.checkedAt && (
                <>
                  {' '}
                  · Verificado em{' '}
                  <time dateTime={view.catalog.checkedAt}>
                    {githubDate(view.catalog.checkedAt)}
                  </time>
                </>
              )}
            </span>
          </li>
          <li>
            <a
              className="manual-version-link"
              href={GITHUB_SNAPSHOT_URL}
              target="_blank"
              rel="noreferrer"
            >
              Histórico público do GitHub
            </a>
            <span className="manual-version-source">
              {historyStatus}
              {view.history.source &&
                historySource[view.history.source] &&
                ` · ${historySource[view.history.source]}`}
              {view.history.checkedAt && (
                <>
                  {' '}
                  · Coletado em{' '}
                  <time dateTime={view.history.checkedAt}>
                    {githubDate(view.history.checkedAt)}
                  </time>
                </>
              )}
              {view.history.truncated && ' · Recorte parcial'}
            </span>
          </li>
          {coverage?.sources.map((source) => (
            <li key={source.url}>
              <a className="manual-version-link" href={source.url} target="_blank" rel="noreferrer">
                {source.url.split('/').at(-1)} · Fonte da cobertura editorial
              </a>
              <span className="manual-version-source">
                Referência <code>{source.ref}</code>
              </span>
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
