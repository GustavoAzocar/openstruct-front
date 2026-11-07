import { ArrowUpRight, RefreshCw } from 'lucide-react';
import type { CurrentApp } from '../lib/app-registry';
import { CATALOG_MAX_ATTEMPTS, availabilityLabel } from '../lib/catalog-store';
import { useProductAvailability, usePublicCatalog } from './CatalogProvider';
import { productReleasesUrl } from '../lib/installation';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
export function CatalogSyncStatus() {
  const { loading, failed, attempts, canRetry, refresh, lastAttemptAt } = usePublicCatalog();
  return (
    <div className="catalog-sync-status">
      <p role="status">
        {loading
          ? 'Consultando versões no catálogo público…'
          : failed
            ? 'Consulta indisponível. Os últimos dados verificados estão marcados como desatualizados.'
            : 'Consulta concluída. Versões e disponibilidade são conferidas por aplicativo.'}
        {lastAttemptAt && (
          <>
            {' '}
            <span>Consulta: {formatDate(lastAttemptAt)}.</span>
          </>
        )}
      </p>
      <button className="text-link" disabled={!canRetry} onClick={() => void refresh()}>
        <RefreshCw size={14} />
        {loading
          ? 'Consultando…'
          : attempts >= CATALOG_MAX_ATTEMPTS
            ? 'Limite de consultas atingido'
            : canRetry
              ? 'Consultar novamente'
              : 'Nova consulta após o intervalo'}
      </button>
      <small>Canal estável · até 3 consultas por sessão, com intervalo mínimo de 1 minuto.</small>
    </div>
  );
}

export function ProductCatalogMeta({ app }: { app: CurrentApp }) {
  const product = useProductAvailability(app.id);
  return (
    <p className="catalog-product-meta">
      {product?.release && <>Versão para instalar: {product.release.version} · </>}
      {product?.checkedAt ? (
        <>Verificado em {formatDate(product.checkedAt)}.</>
      ) : (
        'Aguardando confirmação do catálogo.'
      )}
      {product?.stale && <strong> Dado desatualizado.</strong>}
      {product?.issue === 'missing' && ' Produto ausente na última consulta.'}
      {product?.issue === 'invalid' && ' Publicação recusada pela validação.'}
      {product?.issue === 'rollback' && ' Catálogo anterior ao último dado válido.'}
    </p>
  );
}

/** Download buttons remain in the product page; this shared block synchronizes availability. */
export function ProductAvailability({ app }: { app: CurrentApp }) {
  const product = useProductAvailability(app.id);
  const { loading, canRetry, refresh, attempts } = usePublicCatalog();
  const release = product?.release;
  return (
    <aside className="product-availability" aria-label={`Disponibilidade do ${app.name}`}>
      <span className="eyebrow">VERSÃO PARA INSTALAR / CANAL ESTÁVEL</span>
      <p role="status">
        <strong>
          {app.name}
          {release && <> {release.version}</>}
        </strong>{' '}
        · {availabilityLabel(product)}
      </p>
      <ProductCatalogMeta app={app} />
      {release && (
        <p>
          Pacotes:{' '}
          {release.assets
            .map((asset) => `${asset.platform === 'windows' ? 'Windows' : 'Linux'} ${asset.arch}`)
            .join(' · ')}
          . Publicada em {formatDate(release.publishedAt)}.
        </p>
      )}
      <p>
        Conteúdo técnico desta página: versão {app.distribution?.version ?? 'em revisão'}.
        {release &&
          release.version !== app.distribution?.version &&
          ' A versão para instalar mudou; os recursos descritos permanecem vinculados à documentação revisada.'}
      </p>
      <div className="product-availability-actions">
        <a
          className="text-link"
          href={release?.releaseUrl ?? productReleasesUrl(app.id)}
          target="_blank"
          rel="noreferrer"
        >
          {release ? 'Notas da versão para instalar' : 'Consultar releases oficiais'}{' '}
          <ArrowUpRight size={14} />
        </a>
        <button className="text-link" disabled={!canRetry} onClick={() => void refresh()}>
          <RefreshCw size={14} />
          {loading
            ? 'Consultando…'
            : attempts >= CATALOG_MAX_ATTEMPTS
              ? 'Limite de consultas atingido'
              : canRetry
                ? 'Consultar novamente'
                : 'Aguarde 1 min para consultar'}
        </button>
      </div>
    </aside>
  );
}
