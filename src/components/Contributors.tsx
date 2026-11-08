import { Link } from 'react-router-dom';
import { useGithubActivity } from './useGithubActivity';
import { contributorsView } from '../lib/contributors';
import { developmentSources, githubDate } from '../lib/development';
import './contributors.css';

export function Contributors() {
  const { result, loading, now } = useGithubActivity();
  const { people, coverage } = contributorsView(
    result?.snapshot,
    now,
    Boolean(result && result.source !== 'public'),
  );
  return (
    <section id="contribuidores" className="contributors" aria-labelledby="contributors-title">
      <span className="eyebrow">PESSOAS QUE CONSTROEM</span>
      <h2 id="contributors-title">Contribuições reconhecidas.</h2>
      <p>
        Código, documentação, exemplos e design ajudam o OpenStruct a crescer. Aqui reunimos os
        logins públicos reconhecidos nas fontes, em ordem alfabética.
      </p>
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
                <a href={person.url} target="_blank" rel="noreferrer">
                  @{person.login} ↗
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
          aparecer. Bots são excluídos. Não há pontuação, ranking, contagem de commits por pessoa ou
          fotos remotas.
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
        Créditos editoriais de documentação, testes ou design exigem atribuição pública ou
        autorização documentada e revisão.{' '}
        {people.every((person) => !person.credits.length)
          ? 'Ainda não há créditos editoriais adicionais registrados.'
          : 'As atribuições editoriais são identificadas separadamente acima.'}
      </p>
      <Link className="text-link" to="/community#para-comecar">
        Encontre uma forma de contribuir →
      </Link>
    </section>
  );
}
