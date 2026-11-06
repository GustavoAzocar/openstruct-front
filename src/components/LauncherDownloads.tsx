import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Monitor, RefreshCw, Terminal } from 'lucide-react';
import { detectDesktopPlatform, LAUNCHER_RELEASES_URL, loadLauncherRelease } from '../lib/launcher';
import type { LauncherAvailability } from '../lib/launcher';

type DownloadState = LauncherAvailability | { status: 'loading' | 'error' };
const systems = [
  { id: 'windows', title: 'Windows', format: 'Instalador .exe', Icon: Monitor },
  { id: 'linux', title: 'Linux', format: 'AppImage', Icon: Terminal },
] as const;

export function LauncherDownloads() {
  const [state, setState] = useState<DownloadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const preferred = detectDesktopPlatform(navigator.userAgent);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    setState({ status: 'loading' });
    loadLauncherRelease(controller.signal)
      .then((value) => {
        if (active) setState(value);
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  const release = state.status === 'ready' ? state.release : null;
  return (
    <section className="launcher-downloads" id="downloads" aria-labelledby="downloads-title">
      <div className="launcher-download-heading">
        <span className="eyebrow">UM PONTO DE PARTIDA</span>
        <h2 id="downloads-title">Baixe o Struct Launcher.</h2>
        <p>Escolha o sistema do computador em que você vai instalar.</p>
      </div>
      <div className="launcher-release-status" role="status" aria-live="polite">
        {release ? (
          <>
            <span className="release-dot" /> Versão {release.version} · Publicada em{' '}
            {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
              new Date(release.publishedAt),
            )}
          </>
        ) : state.status === 'loading' ? (
          <>Consultando a versão mais recente…</>
        ) : state.status === 'pending' ? (
          <>Os instaladores da primeira versão estão em preparação.</>
        ) : (
          <>Não foi possível consultar os downloads. Tente novamente ou veja os lançamentos.</>
        )}
      </div>
      <div className="launcher-system-grid">
        {systems.map(({ id, title, format, Icon }) => (
          <article
            className={`launcher-system ${preferred === id ? 'is-recommended' : ''}`}
            key={id}
          >
            <div className="launcher-system-top">
              <Icon size={27} strokeWidth={1.5} />
              {preferred === id && <span>PARA SEU SISTEMA</span>}
            </div>
            <h3>{title}</h3>
            <p>{format} · x86_64</p>
            {release ? (
              <a className="button button-primary" href={release.downloads[id].url}>
                <ArrowDownToLine size={17} /> Baixar para {title}
              </a>
            ) : (
              <button className="button button-outline" disabled>
                {state.status === 'loading' ? 'Consultando…' : 'Download indisponível'}
              </button>
            )}
          </article>
        ))}
      </div>
      <div className="launcher-download-links">
        <a
          className="text-link"
          href={release?.releaseUrl ?? LAUNCHER_RELEASES_URL}
          target="_blank"
          rel="noreferrer"
        >
          {release ? 'Notas da versão e outros arquivos' : 'Ver lançamentos no GitHub'}{' '}
          <ArrowUpRight size={15} />
        </a>
        {state.status !== 'loading' && (
          <button className="text-link" onClick={() => setAttempt((n) => n + 1)}>
            <RefreshCw size={14} /> Verificar novamente
          </button>
        )}
      </div>
      <small className="launcher-download-note">
        Downloads públicos. Sem conta GitHub para baixar ou usar.
      </small>
    </section>
  );
}
