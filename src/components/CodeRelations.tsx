import { currentApps } from '../lib/apps';
import { PRODUCT_POLICIES } from '../lib/catalog-trust';
import type { CatalogProductId } from '../lib/catalog-trust';
import type { CatalogState } from '../lib/catalog-store';
import type { GithubSnapshot } from '../lib/github-snapshot';
import { relationView } from '../lib/code-relation';
import { githubDate } from '../lib/development';
import './code-relations.css';

export function CodeRelations({
  snapshot,
  products,
  now,
  offline = false,
  ids,
  launcher = false,
  loading = false,
}: {
  snapshot?: GithubSnapshot | null;
  products: CatalogState['products'];
  now: number;
  offline?: boolean;
  ids: CatalogProductId[];
  launcher?: boolean;
  loading?: boolean;
}) {
  return (
    <section className="code-relations" aria-labelledby="code-relations-title" id="code-relations">
      <h2 id="code-relations-title">Distribuição e desenvolvimento público</h2>
      <p>
        Uma release é um marco de distribuição. A branch pode continuar recebendo trabalho sem
        exigir uma versão por commit. As contagens medem histórico, não recursos, qualidade,
        segurança ou prontidão.
      </p>
      {loading && <p role="status">Conferindo a versão distribuída e o snapshot público…</p>}
      {launcher && (
        <p>
          Struct Launcher: a distribuição é pública no hub; a relação com seu código privado não é
          aplicável nesta visão.
        </p>
      )}
      <div className="code-relations-grid">
        {ids.map((id) => {
          const app = currentApps.find((a) => a.id === id)!;
          const entry = snapshot?.repositories.find(
            (r) => r.repository === PRODUCT_POLICIES[id].sourceRepo && r.visibility === 'public',
          );
          const distributor = snapshot?.repositories.find(
            (r) => r.repository === PRODUCT_POLICIES[id].releaseRepo && r.visibility === 'public',
          );
          const candidate = distributor
            ? entry?.codeRelations.find((r) => r.productId === id && r.channel === 'stable')
            : undefined;
          const view = relationView(candidate, products[id], now, offline);
          const row = view.row;
          const product = products[id];
          return (
            <article key={id} className="code-relation">
              <h3>{app.name}</h3>
              <p className="code-relation-version">
                Versão para instalar:{' '}
                {product?.status === 'ready' && product.release
                  ? product.release.version
                  : 'não confirmada'}{' '}
                · canal stable
              </p>
              <p>{view.text}</p>
              {row && (
                <>
                  <p className="code-relation-date">
                    {view.stale
                      ? 'Último dado conhecido · dado antigo. '
                      : row.relation
                        ? 'Coleta da comparação: '
                        : 'Consulta da fonte: '}
                    {githubDate(row.checkedAt)}.
                  </p>
                  <details>
                    <summary>Refs, histórico e origem de {app.name}</summary>
                    {row.relation === 'ahead' && (
                      <p>
                        {row.aheadBy} {row.aheadBy === 1 ? 'commit' : 'commits'} na {row.branch}{' '}
                        após {row.tag}.
                      </p>
                    )}
                    {(row.relation === 'behind' || row.relation === 'diverged') && (
                      <p>
                        Exclusivos da branch: {row.aheadBy}. Exclusivos da tag: {row.behindBy}.
                        Históricos de manutenção e hotfix podem diferir legitimamente.
                      </p>
                    )}
                    {row.relation === 'identical' && (
                      <p>0 commits exclusivos em cada lado, conforme comparação válida.</p>
                    )}
                    {row.releasePrerelease && (
                      <p>
                        A publicação no GitHub está marcada como pré-release. O canal exibido acima
                        é a seleção do catálogo assinado.
                      </p>
                    )}
                    <dl>
                      <div>
                        <dt>Fonte pública</dt>
                        <dd>{row.sourceRepo}</dd>
                      </div>
                      <div>
                        <dt>Tag-fonte</dt>
                        <dd>
                          {row.tag ?? 'não confirmada'}
                          {row.baseSha && (
                            <>
                              {' '}
                              ·{' '}
                              <a
                                href={`https://github.com/${row.sourceRepo}/commit/${row.baseSha}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {row.baseSha.slice(0, 7)} ↗
                              </a>
                            </>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>Branch na coleta</dt>
                        <dd>
                          {row.branch ?? 'não confirmada'}
                          {row.headSha && (
                            <>
                              {' '}
                              ·{' '}
                              <a
                                href={`https://github.com/${row.sourceRepo}/commit/${row.headSha}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {row.headSha.slice(0, 7)} ↗
                              </a>
                            </>
                          )}
                        </dd>
                      </div>
                      {row.reason === 'tag-moved' && (
                        <div>
                          <dt>Revisão anteriormente fixada</dt>
                          <dd>{row.pinnedBaseSha}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Associação de fonte</dt>
                        <dd>
                          {row.evidence === 'hub-note'
                            ? 'Link declarado nas notas públicas do hub'
                            : row.evidence === 'source-release'
                              ? 'Release pública no repositório do aplicativo'
                              : 'não confirmada'}
                        </dd>
                      </div>
                    </dl>
                    {row.compareUrl && (
                      <a href={row.compareUrl} target="_blank" rel="noreferrer">
                        Consultar comparação no GitHub ↗
                      </a>
                    )}
                    {row.releaseUrl && (
                      <p>
                        <a href={row.releaseUrl} target="_blank" rel="noreferrer">
                          Release usada como fonte ↗
                        </a>
                      </p>
                    )}
                    <p>
                      Os totais vêm do endpoint de comparação. O snapshot não exporta a lista de
                      commits nem arquivos alterados; não há changelog automático.
                    </p>
                  </details>
                </>
              )}
              {!row &&
                candidate &&
                candidate.version !==
                  (product?.status === 'ready' && product.release
                    ? product.release.version
                    : null) && (
                  <p className="code-relation-date">
                    O snapshot refere-se a outra versão. Aguardando uma coleta correspondente;
                    contadores anteriores não foram aplicados.
                  </p>
                )}
            </article>
          );
        })}
      </div>
      <p className="code-relation-note">
        Tag, SHA igual ou branch atual não comprovam validação de engenharia, compatibilidade ou que
        o binário foi construído desse SHA. Instale a versão oficial pelo Struct Launcher; esta
        comparação não recomenda usar a branch.
      </p>
    </section>
  );
}
