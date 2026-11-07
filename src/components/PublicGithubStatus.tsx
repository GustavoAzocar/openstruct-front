import { useEffect, useState } from 'react';
import { loadGithubActivity } from '../lib/github-client';
import type { GithubLoadResult } from '../lib/github-client';
import { GITHUB_REPOSITORIES, SNAPSHOT_STALE_MS } from '../lib/github-snapshot';
import './public-github-status.css';

export function PublicGithubStatus() {
  const [result, setResult] = useState<GithubLoadResult>();
  useEffect(() => {
    let active = true;
    void loadGithubActivity().then((value) => { if (active) setResult(value); });
    return () => { active = false; };
  }, []);
  return (
    <section className="public-github" aria-labelledby="github-public-title">
      <span className="eyebrow">FONTES PÚBLICAS DO ECOSSISTEMA</span>
      <h2 id="github-public-title">Acompanhe o desenvolvimento.</h2>
      <p role="status">
        {!result ? 'Carregando o resumo público…'
          : !result.snapshot?.generatedAt ? 'Resumo temporariamente indisponível. Os repositórios continuam acessíveis.'
          : (result.stale ? 'Último resumo em cache; há dados desatualizados ou indisponíveis. ' : 'Resumo público sincronizado. ') +
            'Coleta: ' + new Date(result.snapshot.generatedAt).toLocaleString('pt-BR') + '.'}
      </p>
      <p>Atualização aproximadamente horária. Issues, PRs e milestones abertos e contribuidores são recortes de até 60 itens por lista.
        O total de pendências do GitHub inclui issues e PRs; não representa uma contagem separada de cada tipo.</p>
      <ul>
        {GITHUB_REPOSITORIES.map((repository) => {
          const entry = result?.snapshot?.repositories.find((item) => item.repository === repository);
          return (
            <li key={repository}>
              <a href={'https://github.com/' + repository} target="_blank" rel="noreferrer">{repository.split('/')[1]}</a>
              <span>{entry?.summary
                ? entry.summary.stars + ' estrelas · ' + entry.summary.openIssuesAndPullRequests + ' issues e PRs abertos' +
                  (entry.status !== 'ready' || result?.source !== 'public' || !entry.verifiedPublicAt ||
                    Date.now() - Date.parse(entry.verifiedPublicAt) > SNAPSHOT_STALE_MS
                    ? ' · dados parciais ou desatualizados' : '')
                : 'Dados não confirmados nesta coleta'}</span>
            </li>
          );
        })}
      </ul>
      <p>As informações de distribuição do Struct Launcher vêm do <a href="https://github.com/ricardocorsini/openstruct-catalog" target="_blank" rel="noreferrer">hub público</a>.
        Este resumo de atividade não define versões, funcionalidades ou downloads dos aplicativos.</p>
    </section>
  );
}
