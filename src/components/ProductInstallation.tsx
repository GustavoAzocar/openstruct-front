import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Copy, Download } from 'lucide-react';
import type { CurrentApp } from '../lib/app-registry';
import {
  copyOfficialChecksum,
  manualInstallationOptions,
  productReleasesUrl,
  LAUNCHER_INSTALL_LABEL,
} from '../lib/installation';
import { ProductCatalogMeta } from './CatalogAvailability';
import { useProductAvailability, usePublicCatalog } from './CatalogProvider';

export function ProductInstallation({ app }: { app: CurrentApp }) {
  const product = useProductAvailability(app.id);
  const { loading } = usePublicCatalog();
  const { release, packages, deviceHint } = manualInstallationOptions(product, navigator.userAgent);
  const [copyResult, setCopyResult] = useState<{ url: string; success: boolean } | null>(null);

  async function copyHash(url: string, hash: string) {
    try {
      await copyOfficialChecksum(hash, (value) => navigator.clipboard.writeText(value));
      setCopyResult({ url, success: true });
    } catch {
      setCopyResult({ url, success: false });
    }
  }

  return (
    <div className="product-installation">
      <Link className="button button-primary" to="/launcher">
        <Download size={17} /> {LAUNCHER_INSTALL_LABEL}
      </Link>
      <p className="installation-guidance">
        No Launcher, escolha {app.name} na biblioteca para instalar e acompanhar as atualizações. Se
        já o instalou, abra-o no seu computador.
      </p>
      <details className="manual-installation" id={`instalacao-manual-${app.id}`}>
        <summary>
          <span>Instalação manual e versões anteriores</span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="manual-installation-content">
          <p>
            Alternativa opcional para quem precisa do pacote avulso. Você escolhe quando baixar e
            atualizar.
          </p>
          <ProductCatalogMeta app={app} />
          {loading && <p role="status">Consultando a publicação mais recente…</p>}
          {release ? (
            <>
              <p className="manual-release-title">
                <strong>
                  {app.name} {release.version}
                </strong>{' '}
                · Publicada em{' '}
                {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
                  new Date(release.publishedAt),
                )}
              </p>
              <p>{deviceHint}</p>
              <ul className="manual-package-list">
                {packages.map(({ asset, system, format, size, suggested }) => (
                  <li key={asset.url}>
                    <div className="manual-package-header">
                      <strong>
                        {system} · {asset.arch}
                      </strong>
                      {suggested && <span>PARA ESTE COMPUTADOR</span>}
                    </div>
                    <p>
                      {format} · {size}
                    </p>
                    <a className="text-link manual-package-download" href={asset.url}>
                      Baixar {app.name} {release.version} para {system} {asset.arch}{' '}
                      <Download size={14} />
                    </a>
                    <div className="manual-checksum">
                      <span>SHA-256 oficial</span>
                      <code>{asset.sha256}</code>
                      <button
                        className="text-link"
                        onClick={() => void copyHash(asset.url, asset.sha256)}
                        aria-label={`Copiar SHA-256 do pacote ${system} ${asset.arch}`}
                      >
                        <Copy size={13} /> Copiar hash
                      </button>
                      {copyResult?.url === asset.url && (
                        <span role="status">
                          {copyResult.success
                            ? 'Hash copiado.'
                            : 'Não foi possível copiar. Selecione o hash acima para copiá-lo manualmente.'}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="manual-integrity-note">
                Para conferir o arquivo baixado, calcule seu SHA-256 localmente e compare os 64
                caracteres com o valor acima. No Windows, use{' '}
                <code>Get-FileHash -Algorithm SHA256</code>; no Linux, <code>sha256sum</code>,
                informando o caminho do arquivo. O site verifica o catálogo e os metadados
                assinados; copiar o hash não verifica o instalador. O Launcher confere o pacote
                durante a instalação.
              </p>
            </>
          ) : (
            <p role="status">
              {loading
                ? 'Os pacotes aparecem após a confirmação do catálogo.'
                : 'Nenhum pacote estável confirmado para download nesta consulta. Consulte as releases oficiais abaixo.'}
            </p>
          )}
          <a
            className="text-link"
            href={release?.releaseUrl ?? productReleasesUrl(app.id)}
            target="_blank"
            rel="noreferrer"
          >
            {release
              ? `Notas e arquivos da versão ${release.version}`
              : 'Consultar releases oficiais'}{' '}
            <ArrowUpRight size={14} />
          </a>
          {release && (
            <a
              className="text-link manual-release-history"
              href={productReleasesUrl(app.id)}
              target="_blank"
              rel="noreferrer"
            >
              Versões anteriores no GitHub <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </details>
    </div>
  );
}
