import { ArrowUpRight, Expand } from 'lucide-react';
import { consoloMedia as media } from '../lib/consolo-media';

export function ConsoloCaptures({ scopeVersion }: { scopeVersion?: string }) {
  return (
    <section
      className="section container consolo-captures"
      id="capturas"
      aria-labelledby="consolo-captures-title"
    >
      <div className="section-kicker">
        <span>CONSOLOSTRUCT / CAPTURAS REAIS</span>
        <span>
          APLICATIVO {media.version} · MOTOR {media.engine.version}
        </span>
      </div>
      <div className="section-heading">
        <h2 id="consolo-captures-title">
          O aplicativo,
          <br />
          em uso.
        </h2>
        <p>
          Um exemplo público, das entradas ao quadro de aço. Abra cada imagem em tamanho original
          para ampliar e conferir os detalhes. São capturas da interface do aplicativo, executada no
          navegador a partir da tag {media.source.tag}.
        </p>
      </div>
      <div className="consolo-capture-grid">
        {media.captures.map((capture, index) => (
          <figure
            key={capture.id}
            id={capture.id}
            className="consolo-capture"
            data-stage={capture.stage}
          >
            <a
              className="consolo-capture-image"
              href={capture.src}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ampliar ${capture.title.replace(/\.$/, '')} (abre em nova aba)`}
            >
              <img
                src={capture.src}
                alt={capture.alt}
                width={capture.width}
                height={capture.height}
                loading="lazy"
                decoding="async"
              />
            </a>
            <figcaption>
              <div className="consolo-capture-title">
                <span>0{index + 1}</span>
                <h3>{capture.title}</h3>
              </div>
              <p>{capture.caption}</p>
              <div className="consolo-capture-footer">
                <span>
                  CAPTURA REAL · v{media.version} · {media.project.piece}
                </span>
                <a href={capture.src} target="_blank" rel="noreferrer">
                  Ampliar imagem <Expand size={14} aria-hidden="true" />
                  <span className="sr-only">: {capture.title} Abre em nova aba.</span>
                </a>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="consolo-capture-provenance">
        <p>
          Projeto de estudo, com dados fictícios. A vista 3D é esquemática e as saídas exigem
          revisão do responsável técnico.{' '}
          {scopeVersion && (
            <>
              As telas mostram a {media.version}; o escopo técnico abaixo permanece revisado para a{' '}
              {scopeVersion}.
            </>
          )}
        </p>
        <nav aria-label="Fontes das capturas do ConsoloStruct">
          <a href={media.project.url} target="_blank" rel="noreferrer">
            Projeto de exemplo <ArrowUpRight size={14} />
          </a>
          <a href={media.source.url} target="_blank" rel="noreferrer">
            Código da versão <ArrowUpRight size={14} />
          </a>
          <a href={media.license.localNotice} target="_blank" rel="noreferrer">
            Capturas · {media.license.spdx} <ArrowUpRight size={14} />
          </a>
        </nav>
        <span>
          REVISADO EM{' '}
          {new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(media.reviewedAt))}
        </span>
      </div>
    </section>
  );
}
