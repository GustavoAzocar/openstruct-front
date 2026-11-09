import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { PublicRepository } from '../lib/github-snapshot';
import { useGithubActivity } from './useGithubActivity';
import { contributorsView, githubAvatarUrl } from '../lib/contributors';
import { developmentSources, githubDate } from '../lib/development';
import './contributors.css';

export function ContributorAvatar({ login }: { login: string }) {
  const [failed, setFailed] = useState(false);
  const src = githubAvatarUrl(login);
  return (
    <span className="contributor-avatar" aria-hidden="true">
      {src && !failed ? (
        <img
          src={src}
          width="64"
          height="64"
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="contributor-avatar-fallback">{login.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}
export function Contributors({ repository }: { repository?: PublicRepository }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selected = repository
    ? developmentSources.find((s) => s.repository === repository)
    : developmentSources.find((s) => s.slug === params.get('contributorsRepo'));
  const sources = selected ? [selected] : developmentSources;
  function choose(slug: string) {
    const next = new URLSearchParams(params);
    next.delete('contributorsRepo');
    if (developmentSources.some((s) => s.slug === slug)) next.set('contributorsRepo', slug);
    navigate(
      { pathname: location.pathname, search: next.toString(), hash: '#contribuidores' },
      { preventScrollReset: true },
    );
  }

  const { result, loading, now } = useGithubActivity();
  const { people, coverage } = contributorsView(
    result?.snapshot,
    now,
    Boolean(result && result.source !== 'public'),
    undefined,
    sources,
  );
  return (
    <section
      id="contribuidores"
      className={repository ? 'contributors container contributors-product' : 'contributors'}
      aria-labelledby="contributors-title"
    >
      <span className="eyebrow">PESSOAS QUE CONSTROEM</span>
      <h2 id="contributors-title">
        {selected ? 'Colaboradores · ' + selected.name : 'Contribuições reconhecidas.'}
      </h2>
      <p>
        Código, documentação, exemplos e design ajudam o OpenStruct a crescer. Aqui reunimos os
        logins públicos reconhecidos {selected ? 'no repositório deste projeto' : 'nas fontes'}, em
        ordem alfabética, com a foto pública da conta no GitHub.
      </p>
      {!repository && (
        <label className="contributors-filter" htmlFor="contributors-repository">
          Colaboradores por projeto
          <select
            id="contributors-repository"
            value={selected?.slug ?? ''}
            onChange={(event) => choose(event.target.value)}
          >
            <option value="">Todos os projetos</option>
            {developmentSources.map((source) => (
              <option key={source.repository} value={source.slug}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="contributors-note" role="status">
        {loading
          ? 'Consultando os créditos públicos…'
          : `${people.length} ${people.length === 1 ? 'pessoa identificada' : 'pessoas identificadas'} no recorte. Não é um censo de todas as contribuições.`}
      </p>
      {people.length ? (
        <div className="contributors-grid">
          {people.map((person) => (
            <article key={person.login}>
              <h3>
                <a
                  className="contributor-profile"
                  href={person.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ContributorAvatar key={person.login} login={person.login} />
                  <span>@{person.login} ↗</span>
                </a>
              </h3>
              {person.repositories.length > 0 && (
                <>
                  <h4>Contribuição registrada pelo GitHub</h4>
                  <ul>
                    {person.repositories.map(({ source, checkedAt, stale }) => (
                      <li key={source.repository}>
                        <Link to={'/development?repo=' + source.slug}>{source.name}</Link>
                        <span>
                          Coleta: {githubDate(checkedAt)}
                          {stale ? ' · dado desatualizado' : ''}.
                        </span>
                        <a
                          href={source.url + '/graphs/contributors'}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Fonte de contribuições ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {person.credits.length > 0 && (
                <>
                  <h4>Crédito editorial com fonte</h4>
                  <ul>
                    {person.credits.map((credit) => (
                      <li key={credit.repository + credit.contribution}>
                        <span>
                          {developmentSources.find((s) => s.repository === credit.repository)!.name}
                          : {credit.contribution}
                        </span>
                        <a href={credit.sourceUrl} target="_blank" rel="noreferrer">
                          Atribuição original ↗
                        </a>
                        <span>Revisão: {credit.reviewedAt.split('-').reverse().join('/')}.</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          ))}
        </div>
      ) : (
        !loading && (
          <p className="contributors-empty">
            Nenhuma pessoa pôde ser identificada neste recorte. Isso não significa ausência de
            colaboração; consulte as fontes e as orientações de cada projeto.
          </p>
        )
      )}
      <details className="contributors-coverage">
        <summary>Fontes, datas e limites dos créditos</summary>
        <p>
          O GitHub identifica parte das contribuições por commits. Até 60 entradas são consultadas
          por repositório; contribuições sem conta associada e trabalhos fora dos commits podem não
          aparecer. Bots são excluídos. Não há pontuação, ranking ou contagem de commits por pessoa.
          As fotos públicas são carregadas do GitHub; quando não carregam, aparecem as iniciais. A
          identificação e os links continuam utilizáveis.
        </p>
        <ul>
          {coverage.map(({ source, state, checkedAt, truncated }) => (
            <li key={source.repository}>
              <a href={source.url + '/graphs/contributors'} target="_blank" rel="noreferrer">
                {source.name} ↗
              </a>{' '}
              ·{' '}
              {state === 'unavailable'
                ? 'Coleta não confirmada'
                : `${githubDate(checkedAt)}${state === 'stale' ? ' · desatualizado' : ''}`}
              {truncated ? ' · recorte limitado' : ''}
            </li>
          ))}
        </ul>
      </details>
      <p className="contributors-note">
        Lista sincronizada pelo snapshot público, aproximadamente a cada hora. As fotos seguem a
        disponibilidade e o cache do GitHub. Créditos editoriais de documentação, testes ou design
        exigem atribuição pública ou autorização documentada e revisão.{' '}
        {people.every((person) => !person.credits.length)
          ? 'Ainda não há créditos editoriais adicionais registrados.'
          : 'As atribuições editoriais são identificadas separadamente acima.'}
      </p>
      <Link
        className="text-link"
        to={
          selected ? '/community/como-colaborar?repo=' + selected.slug : '/community#para-comecar'
        }
      >
        Encontre uma forma de contribuir →
      </Link>
    </section>
  );
}
