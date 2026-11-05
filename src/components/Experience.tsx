import { createContext, useContext, useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, GitFork, X, ExternalLink } from 'lucide-react';
import { site } from '../lib/config';

type ExperienceState = { launch: () => void; community: () => void };
const ExperienceContext = createContext<ExperienceState | null>(null);
export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error('ExperienceProvider ausente');
  return ctx;
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [kind, setKind] = useState<'launch' | 'community' | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (kind) {
      dialog.showModal();
      document.body.classList.add('dialog-open');
    } else {
      dialog.close();
      document.body.classList.remove('dialog-open');
    }
    return () => document.body.classList.remove('dialog-open');
  }, [kind]);
  const close = () => setKind(null);
  return (
    <ExperienceContext.Provider
      value={{
        launch: () => setKind('launch'),
        community: () => {
          if (site.discord) window.open(site.discord, '_blank', 'noopener,noreferrer');
          else setKind('community');
        },
      }}
    >
      {children}
      <dialog
        ref={ref}
        className="experience-dialog"
        aria-labelledby="dialog-title"
        onCancel={close}
        onClose={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <button className="icon-button dialog-close" onClick={close} aria-label="Fechar janela">
          <X size={21} />
        </button>
        {kind === 'launch' ? (
          <>
            <span className="eyebrow">OPENSTRUCT / APLICATIVOS</span>
            <h2 id="dialog-title">
              Seu próximo
              <br />
              ponto de partida.
            </h2>
            <p>Escolha uma ferramenta e explore o que estamos construindo.</p>
            <div className="launch-app">
              <img src="/assets/consolostruct-atlas.webp" alt="" width="76" height="76" />
              <div>
                <strong>ConsoloStruct</strong>
                <span>Concreto armado · Em desenvolvimento</span>
              </div>
            </div>
            {site.appUrl ? (
              <a
                href={site.appUrl}
                className="button button-primary"
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                Abrir ConsoloStruct <ExternalLink size={17} />
              </a>
            ) : (
              <Link
                to="/apps/consolostruct#demonstracao"
                className="button button-primary"
                onClick={close}
              >
                Explorar a prévia interativa <ArrowRight size={17} />
              </Link>
            )}
            <small>
              A prévia apresenta a experiência visual. O aplicativo está em desenvolvimento.
            </small>
          </>
        ) : (
          <>
            <span className="eyebrow">COMUNIDADE EM CONSTRUÇÃO</span>
            <h2 id="dialog-title">
              Uma boa ideia
              <br />
              começa uma conversa.
            </h2>
            <p>
              Nosso espaço no Discord está sendo preparado. Enquanto isso, acompanhe o projeto e
              compartilhe sugestões no GitHub.
            </p>
            <a
              className="button button-primary"
              href={site.repository}
              target="_blank"
              rel="noreferrer"
            >
              <GitFork size={18} /> Acompanhar no GitHub <ArrowUpRight size={17} />
            </a>
          </>
        )}
      </dialog>
    </ExperienceContext.Provider>
  );
}
