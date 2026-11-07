import { githubDate } from '../lib/development';
import type { CommentSample, PublicDiscussion } from '../lib/discussion-contract';
import { PublicDiscussionText } from './PublicDiscussionText';
import './discussion-details.css';

function Comments({ sample, title }: { sample: CommentSample; title: string }) {
  return (
    <section className="discussion-comments" aria-label={title}>
      <h4>{title}</h4>
      {sample.state === 'unavailable' ? (
        <p>Não foi possível atualizar esta amostra. Nenhum comentário anterior é exibido.</p>
      ) : (
        <>
          <p className="issue-filter-note">
            Coleta: {githubDate(sample.checkedAt)}. Até os cinco primeiros comentários da consulta.
            {sample.truncated
              ? ' Há mais comentários no GitHub.'
              : ' Fim da paginação desta consulta.'}
          </p>
          {!sample.items.length ? (
            <p>Nenhum comentário nesta categoria na data da coleta.</p>
          ) : (
            <ol>
              {sample.items.map((comment) => (
                <li key={comment.id}>
                  <p className="issue-row-meta">
                    {comment.author ?? 'Autor não informado'} · Criado:{' '}
                    {githubDate(comment.createdAt)} · Atualizado: {githubDate(comment.updatedAt)}
                  </p>
                  <PublicDiscussionText text={comment.body || 'Comentário sem texto público.'} />
                  {comment.bodyTruncated && <p>Texto abreviado; consulte o comentário original.</p>}
                  {comment.path && (
                    <p className="discussion-context">
                      Arquivo: {comment.path}
                      {comment.line !== null
                        ? ` · linha ${comment.line}`
                        : ' · linha atual não informada'}
                    </p>
                  )}
                  <a className="text-link" href={comment.url} target="_blank" rel="noreferrer">
                    {title === 'Revisão de código'
                      ? 'Ver comentário no contexto do código'
                      : 'Ver comentário original'}{' '}
                    ↗
                  </a>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
export function DiscussionDetails({
  discussion,
  url,
}: {
  discussion?: PublicDiscussion;
  url: string;
}) {
  return (
    <details className="discussion-details">
      <summary>Detalhes e comentários públicos</summary>
      <div className="discussion-content">
        <p className="issue-filter-note">
          Amostra limitada a dois itens recentes por repositório. Texto simples; links, imagens e
          anexos contidos nos comentários não são carregados.
        </p>
        {!discussion ? (
          <p>
            Este item não foi selecionado no recorte de detalhes. A conversa completa continua
            disponível no GitHub.
          </p>
        ) : (
          <>
            <p>Detalhes consultados em {githubDate(discussion.checkedAt)}.</p>
            {discussion.state === 'unavailable' ? (
              <p>
                Detalhe indisponível ou removido da fonte. Nenhum texto anterior é mantido nesta
                amostra.
              </p>
            ) : (
              <>
                <h4>Resumo da {discussion.kind === 'pull' ? 'solicitação de pull' : 'issue'}</h4>
                <PublicDiscussionText text={discussion.body || 'Sem descrição pública.'} />
                {discussion.bodyTruncated && (
                  <p>Descrição abreviada; leia o texto completo no GitHub.</p>
                )}
                <Comments title="Conversa geral" sample={discussion.conversation} />
                {discussion.review && (
                  <Comments title="Revisão de código" sample={discussion.review} />
                )}
                {discussion.review && (
                  <p className="issue-filter-note">
                    Comentários de revisão não indicam aprovação, resultado de checks ou decisão de
                    merge.
                  </p>
                )}
              </>
            )}
          </>
        )}
        <a className="button button-outline" href={url} target="_blank" rel="noreferrer">
          Continuar a conversa no GitHub ↗
        </a>
      </div>
    </details>
  );
}
