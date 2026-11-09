import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import type { GithubSnapshot } from '../lib/github-snapshot';
import type { CommitAccount } from '../lib/commit-contract';
import { COMMIT_PAGE_SIZE } from '../lib/commit-contract';
import type { DevelopmentSource } from '../lib/development';
import { githubDate } from '../lib/development';
import { commitSectionLink, recentCommitsView } from '../lib/recent-commits';
import './recent-commits.css';

function Account({ value, fallback }: { value: CommitAccount | null; fallback: string }) {
  return value ? (
    <>
      <a href={value.url} target="_blank" rel="noreferrer">
        {value.login}
      </a>
      {value.type === 'Bot' ? ' (bot)' : ''}
    </>
  ) : (
    <>{fallback}</>
  );
}
function CommitSource({
  view,
  loading,
}: {
  view: ReturnType<typeof recentCommitsView>[number];
  loading: boolean;
}) {
  const [visible, setVisible] = useState(COMMIT_PAGE_SIZE);
  const [feedback, setFeedback] = useState('');
  const [params] = useSearchParams();
  const { source, list, state, branch, historyUrl, partial } = view;
  const items = list.items.slice(0, visible);
  async function copy(sha: string) {
    try {
      await navigator.clipboard.writeText(sha);
      setFeedback('SHA ' + sha.slice(0, 7) + ' copiado.');
    } catch {
      setFeedback(
        'Não foi possível copiar. Abra “SHA completo” para consultar e selecionar o texto.',
      );
    }
  }
  return (
    <article className="recent-commit-source" aria-labelledby={'commits-' + source.slug}>
      <h3 id={'commits-' + source.slug}>{source.name}</h3>
      <p className="recent-commits-meta">
        {source.repository} ·{' '}
        {source.slug === 'openstruct-catalog'
          ? 'Atividade do catálogo e da distribuição; não é o histórico do código do Launcher.'
          : source.kind}
      </p>
      <p className="recent-commits-meta">
        Branch: <code>{branch ?? 'não confirmada'}</code> · Coleta: {githubDate(list.checkedAt)}.
      </p>
      <p className="recent-commits-state" role="status">
        {loading && !list.checkedAt
          ? 'Consultando o recorte público…'
          : state === 'unavailable'
            ? 'Histórico recente não coletado ou temporariamente indisponível; isso não confirma uma lista vazia.'
            : state === 'stale'
              ? 'Último recorte conhecido · dado desatualizado.'
              : list.problem === 'empty-repository'
                ? 'Repositório vazio confirmado na coleta.'
                : partial
                  ? 'Recorte de commits atualizado; outras coleções desta fonte estão parciais.'
                  : 'Recorte de commits atualizado.'}
      </p>
      {state !== 'unavailable' && (
        <>
          <p className="recent-commits-meta" aria-live="polite">
            {items.length} de {list.items.length} commits deste recorte.{' '}
            {list.truncated
              ? 'Há mais histórico ou o recorte foi reduzido pelo limite do snapshot.'
              : 'Sem próxima página indicada na consulta; o tamanho do recorte não é um total permanente.'}
          </p>
          {list.headSha && (
            <p className="recent-commits-meta">
              HEAD fixado:{' '}
              <a href={source.url + '/commit/' + list.headSha} target="_blank" rel="noreferrer">
                {list.headSha.slice(0, 7)}
              </a>
              .
            </p>
          )}
          <ol className="recent-commits-list">
            {items.map((commit) => (
              <li key={commit.sha}>
                <p className="recent-commit-subject">
                  {commit.subject || 'Assunto não informado.'}
                  {commit.subjectTruncated && (
                    <span className="recent-commits-meta">
                      {' '}
                      (assunto limitado a 240 caracteres)
                    </span>
                  )}
                </p>
                <a
                  className="recent-commit-sha"
                  href={commit.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={'Abrir commit ' + commit.sha + ' de ' + source.name}
                >
                  {commit.sha.slice(0, 7)} ↗
                </a>
                <p className="recent-commits-meta">
                  Autor: <Account value={commit.author} fallback="conta pública não confirmada" /> ·
                  Committer:{' '}
                  <Account value={commit.committer} fallback="conta pública não confirmada" />.
                </p>
                <p className="recent-commits-meta">
                  Data de registro no Git:{' '}
                  {commit.committedAt ? (
                    <time dateTime={commit.committedAt}>{githubDate(commit.committedAt)}</time>
                  ) : (
                    'não informada'
                  )}
                  .
                </p>
                <details>
                  <summary>SHA completo e data de autoria · {commit.sha.slice(0, 7)}</summary>
                  <code className="recent-commit-full-sha">{commit.sha}</code>
                  <p className="recent-commits-meta">
                    Data de autoria no Git:{' '}
                    {commit.authoredAt ? (
                      <time dateTime={commit.authoredAt}>{githubDate(commit.authoredAt)}</time>
                    ) : (
                      'não informada'
                    )}
                    . Autor escreve a alteração; committer registra o commit no histórico. As datas
                    podem ser diferentes.
                  </p>
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => void copy(commit.sha)}
                    aria-label={'Copiar SHA ' + commit.sha}
                  >
                    Copiar SHA
                  </button>
                </details>
              </li>
            ))}
          </ol>
          <p className="recent-commits-feedback" role="status" aria-live="polite">
            {feedback}
          </p>
          {visible < list.items.length && (
            <button
              className="button button-outline"
              type="button"
              onClick={() => setVisible((n) => n + COMMIT_PAGE_SIZE)}
              aria-label={'Mostrar mais commits de ' + source.name}
            >
              Mostrar mais ({Math.min(COMMIT_PAGE_SIZE, list.items.length - visible)})
            </button>
          )}
        </>
      )}
      <nav className="recent-commits-links" aria-label={'Histórico de ' + source.name}>
        <a href={historyUrl} target="_blank" rel="noreferrer">
          Ver histórico completo no GitHub ↗
        </a>
        <Link to={commitSectionLink(params, source.slug)}>Link direto deste repositório</Link>
      </nav>
    </article>
  );
}
export function RecentCommits({
  snapshot,
  sources,
  now,
  offline,
  loading,
}: {
  snapshot?: GithubSnapshot | null;
  sources: DevelopmentSource[];
  now: number;
  offline: boolean;
  loading: boolean;
}) {
  const location = useLocation();
  const selection = sources.map((s) => s.repository).join('|');
  useEffect(() => {
    if (location.hash === '#commits')
      document.getElementById('commits')?.scrollIntoView({ behavior: 'instant' });
  }, [location.hash, selection, snapshot?.generatedAt, loading]);
  const views = recentCommitsView(snapshot, sources, now, offline);
  return (
    <section id="commits" className="recent-commits" aria-labelledby="commits-title">
      <div className="development-section-heading">
        <h2 id="commits-title">Últimos commits</h2>
        <span>HISTÓRICO RECENTE PÚBLICO</span>
      </div>
      <p className="recent-commits-intro">
        Até 30 commits por repositório, na ordem retornada pela API para o HEAD fixado na coleta.
        Mensagens são relatos de quem fez o commit: não representam releases, recursos distribuídos,
        aprovação de qualidade ou validação de engenharia. Datas exibidas no fuso horário do
        navegador.
      </p>
      <div className="recent-commits-grid">
        {views.map((view) => (
          <CommitSource
            key={
              view.source.repository +
              ':' +
              sources.length +
              ':' +
              view.list.branch +
              ':' +
              view.list.headSha
            }
            view={view}
            loading={loading}
          />
        ))}
      </div>
    </section>
  );
}
