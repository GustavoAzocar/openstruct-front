import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { useGithubActivity } from './useGithubActivity';
import { contributionPolicies, selectFirstContributions } from '../lib/contributions';
import { developmentSources, githubDate } from '../lib/development';
import { site } from '../lib/config';
import { CONTRIBUTION_MANUAL_PATH } from '../lib/contribution-manual';
import './first-contributions.css';

export function FirstContributions() {
  const { result, loading, now, canRefresh, refresh } = useGithubActivity();
  const view = selectFirstContributions(
    result?.snapshot,
    now,
    Boolean(result && result.source !== 'public'),
  );
  const fresh = view.coverage.filter((row) => row.state === 'fresh').length;
  return (
    <section
      id="para-comecar"
      className="first-contributions"
      aria-labelledby="first-contributions-title"
    >
      <span className="eyebrow">CONSTRUA UMA PRIMEIRA PARTE</span>
      <h2 id="first-contributions-title">Para começar.</h2>
      <p>
        Encontre uma issue aberta com convite à participação. Consideramos apenas labels presentes
        na issue e configuradas para aquele repositório, como <code>good first issue</code> e{' '}
        <code>help wanted</code>. Elas não são uma estimativa automática de dificuldade.
      </p>
      <Link className="text-link" to={CONTRIBUTION_MANUAL_PATH}>
        Como colaborar: siga o manual passo a passo <ArrowRight size={16} />
      </Link>
      <div className="first-contributions-status">
        <p role="status">
          {loading
            ? 'Conferindo oportunidades no resumo público…'
            : !fresh
              ? 'Não há uma coleta recente confirmada para exibir oportunidades.'
              : `${view.opportunities.length} oportunidades no recorte confirmado · ${fresh} de ${view.coverage.length} fontes com coleta recente.`}
        </p>
        <button className="text-link" disabled={!canRefresh} onClick={refresh}>
          <RefreshCw size={14} />
          {loading
            ? 'Consultando…'
            : canRefresh
              ? 'Atualizar resumo'
              : 'Nova consulta após o intervalo'}
        </button>
      </div>
      {!loading && view.coverage.some((row) => row.state !== 'fresh') && (
        <p className="first-contributions-note">
          Fontes antigas, em cache ou indisponíveis não geram cards de oportunidade. Os links e
          guias dos projetos continuam disponíveis abaixo.
        </p>
      )}
      {view.opportunities.length ? (
        <>
          <div className="first-opportunities">
            {view.opportunities.slice(0, 6).map(({ issue, source, labels, policy }) => (
              <article key={issue.url}>
                <p className="first-contributions-kicker">
                  {source.name} · #{issue.number}
                </p>
                <h3>
                  <a href={issue.url} target="_blank" rel="noreferrer">
                    {issue.title} <ArrowUpRight size={15} />
                  </a>
                </h3>
                <div className="first-contributions-labels" aria-label="Labels originais da issue">
                  {labels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <p className="first-contributions-note">
                  Atualizada em {githubDate(issue.updatedAt)}.
                </p>
                <a className="text-link" href={policy.guide.url} target="_blank" rel="noreferrer">
                  {policy.guide.label} <ArrowUpRight size={14} />
                </a>
              </article>
            ))}
          </div>
          <p className="first-contributions-note">
            Mostrando {Math.min(6, view.opportunities.length)} de {view.opportunities.length}{' '}
            correspondências neste recorte, por atualização. Confirme o estado atual e combine o
            escopo na issue antes de começar.
          </p>
        </>
      ) : (
        !loading && (
          <div className="first-contributions-empty">
            <p>
              {fresh
                ? 'Nenhuma issue com as labels configuradas foi encontrada no recorte recente.'
                : 'As oportunidades não puderam ser confirmadas nesta consulta.'}{' '}
              Você pode contribuir com documentação, reprodução de exemplos ou revisão visual sem
              depender de um ticket selecionado.
            </p>
          </div>
        )
      )}
      <details className="first-contributions-coverage">
        <summary>Fontes e limites da seleção</summary>
        <ul>
          {view.coverage.map((row) => (
            <li key={row.source.repository}>
              <strong>{row.source.name}</strong>
              <span>
                {row.state === 'unavailable'
                  ? 'Coleta não confirmada'
                  : `${row.state === 'fresh' ? 'Coletado' : 'Dado desatualizado'}: ${githubDate(row.checkedAt)}`}
                {row.truncated ? ' · Há mais entradas além do limite coletado.' : ''}
              </span>
            </li>
          ))}
        </ul>
        <p>
          Até 60 entradas recentes de issues abertas por repositório; PRs são excluídos. Não
          representa todo o histórico nem uma busca completa de oportunidades no GitHub.
        </p>
      </details>
      <h3 className="first-contributions-paths-title">Outras formas de contribuir</h3>
      <p>
        Revise uma instrução, reproduza um exemplo público ou registre um problema de leitura e
        navegação. Consulte as orientações do projeto e compartilhe o que observou no repositório
        correspondente. Para reproduzir exemplos, use a versão indicada na documentação do
        repositório.
      </p>
      <div className="first-contribution-paths">
        {developmentSources.map((source) => {
          const policy = contributionPolicies[source.repository];
          return (
            <article key={source.repository}>
              <span className="first-contributions-kicker">{source.kind}</span>
              <h4>{source.name}</h4>
              <a className="text-link" href={policy.guide.url} target="_blank" rel="noreferrer">
                {policy.guide.label} <ArrowUpRight size={13} />
              </a>
              <Link className="text-link" to={CONTRIBUTION_MANUAL_PATH + '?repo=' + source.slug}>
                Primeiros passos neste projeto →
              </Link>
              <nav aria-label={`Caminhos para contribuir com ${source.name}`}>
                <a href={policy.documentation} target="_blank" rel="noreferrer">
                  Revisar documentação ↗
                </a>
                {policy.examples && (
                  <a href={policy.examples} target="_blank" rel="noreferrer">
                    Reproduzir exemplos públicos ↗
                  </a>
                )}
                <a href={source.url + '/issues'} target="_blank" rel="noreferrer">
                  Compartilhar reprodução ou revisão visual ↗
                </a>
              </nav>
            </article>
          );
        })}
      </div>
      <Link className="text-link first-contributions-central" to={site.developmentPath + '#issues'}>
        Explorar as issues na central <ArrowRight size={15} />
      </Link>
    </section>
  );
}
