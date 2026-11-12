import { Link } from 'react-router-dom';
import { useGithubActivity } from './useGithubActivity';
import { GITHUB_REPOSITORIES, SNAPSHOT_STALE_MS } from '../lib/github-snapshot';
import { site } from '../lib/config';
import './public-github-status.css';

export function PublicGithubStatus() {
  const { result, loading, now } = useGithubActivity();
  return (
    <section className="public-github" aria-labelledby="github-public-title">
      <span className="eyebrow">FONTES PÚBLICAS DO ECOSSISTEMA</span>
      <h2 id="github-public-title">Acompanhe o desenvolvimento.</h2>
      <div className="button-row">
        <Link to={site.developmentPath} className="button button-outline">
          Abrir central de desenvolvimento
        </Link>
      </div>
      <p role="status">
        {loading || !result
          ? 'Carregando o resumo público…'
          : !result.snapshot?.generatedAt
            ? 'Resumo temporariamente indisponível. Os repositórios continuam acessíveis.'
            : (result.stale
                ? result.source !== 'public'
                  ? 'Último resumo em cache; origem pública indisponível. '
                  : 'Resumo público com dados desatualizados ou parciais. '
                : 'Resumo público sincronizado. ') +
              'Snapshot gerado em: ' +
              new Date(result.snapshot.generatedAt).toLocaleString('pt-BR') +
              '.'}
      </p>
      <p>
        Coleta agendada aproximadamente a cada hora, sujeita a atrasos do GitHub. Issues abertas,
        PRs e milestones de todos os estados e contribuidores são recortes de até 60 itens por
        lista. O total de pendências do GitHub inclui issues e PRs; não representa uma contagem
        separada de cada tipo.
      </p>
      <ul>
        {GITHUB_REPOSITORIES.map((repository) => {
          const entry = result?.snapshot?.repositories.find(
            (item) => item.repository === repository,
          );
          return (
            <li key={repository}>
              <a href={'https://github.com/' + repository} target="_blank" rel="noreferrer">
                {repository.split('/')[1]}
              </a>
              <span>
                {entry?.summary
                  ? entry.summary.stars +
                    ' estrelas · ' +
                    entry.summary.openIssuesAndPullRequests +
                    ' issues e PRs abertos' +
                    (entry.status !== 'ready' ||
                    result?.source !== 'public' ||
                    !entry.verifiedPublicAt ||
                    now - Date.parse(entry.verifiedPublicAt) > SNAPSHOT_STALE_MS
                      ? ' · dados parciais ou desatualizados'
                      : '')
                  : 'Dados não confirmados nesta coleta'}
              </span>
            </li>
          );
        })}
      </ul>
      <p>
        As informações de distribuição do Struct Launcher vêm do{' '}
        <a
          href="https://github.com/ricardocorsini/openstruct-catalog"
          target="_blank"
          rel="noreferrer"
        >
          hub público
        </a>
        . Este resumo de atividade não define versões, funcionalidades ou downloads dos aplicativos.
      </p>
    </section>
  );
}
