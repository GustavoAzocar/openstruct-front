import { nextCapture } from '../lib/gallery';
import { useId, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import './capture-gallery.css';

export type GalleryCapture = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  caption: string;
  version: string;
  sourceUrl: string;
};

function CaptureImage({ capture }: { capture: GalleryCapture }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span role="status" className="capture-unavailable">
      Imagem indisponível. Consulte a fonte oficial indicada na legenda.
    </span>
  ) : (
    <img
      src={capture.src}
      alt={capture.alt}
      width={capture.width}
      height={capture.height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function CaptureGallery({
  captures,
  label,
}: {
  captures: readonly GalleryCapture[];
  label: string;
}) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const capture = captures[index];
  const open = (i: number, event: MouseEvent<HTMLButtonElement>) => {
    trigger.current = event.currentTarget;
    setIndex(i);
    dialog.current?.showModal();
    closeButton.current?.focus();
  };
  const close = () => dialog.current?.close();
  const restoreFocus = () => trigger.current?.focus({ preventScroll: true });
  if (!capture)
    return (
      <p className="capture-empty">
        Capturas reais do aplicativo serão adicionadas após a revisão de suas fontes.
      </p>
    );
  return (
    <div className="capture-gallery" role="group" aria-label={label}>
      <div className="capture-thumbnails" aria-label="Capturas disponíveis">
        {captures.map((item, i) => (
          <button
            type="button"
            key={item.id}
            onClick={(event) => open(i, event)}
            aria-label={`Ampliar ${item.title}`}
          >
            <CaptureImage capture={item} />
            <span>
              {item.title} · v{item.version}
            </span>
          </button>
        ))}
      </div>
      {captures.map((item, i) => (
        <figure key={item.id} id={item.id} className="capture-figure">
          <button
            type="button"
            className="capture-open"
            onClick={(event) => open(i, event)}
            aria-label={`Abrir captura: ${item.title}`}
          >
            <CaptureImage capture={item} />
          </button>
          <figcaption>
            <h3>{item.title}</h3>
            <p>{item.caption}</p>
            <div className="capture-meta">
              <span>CAPTURA REAL · v{item.version}</span>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                Fonte da mídia
              </a>
              <button type="button" onClick={(event) => open(i, event)}>
                Ampliar {item.title}
              </button>
            </div>
          </figcaption>
        </figure>
      ))}
      <dialog
        ref={dialog}
        className="capture-dialog"
        aria-labelledby={titleId}
        onClose={restoreFocus}
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          if (event.key === 'ArrowRight' && index < captures.length - 1) {
            event.preventDefault();
            setIndex(nextCapture(index, 1, captures.length));
          }
          if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault();
            setIndex(nextCapture(index, -1, captures.length));
          }
        }}
      >
        <header>
          <h2 id={titleId}>{capture.title}</h2>
          <button type="button" ref={closeButton} onClick={close} autoFocus>
            Fechar galeria
          </button>
        </header>
        <div className="capture-controls">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex(nextCapture(index, -1, captures.length))}
          >
            Anterior
          </button>
          <span aria-live="polite">
            {index + 1} de {captures.length} · v{capture.version}
          </span>
          <button
            type="button"
            disabled={index === captures.length - 1}
            onClick={() => setIndex(nextCapture(index, 1, captures.length))}
          >
            Próxima
          </button>
          <a href={capture.src} target="_blank" rel="noreferrer">
            Tamanho original (nova aba)
          </a>
        </div>
        <CaptureImage key={capture.id} capture={capture} />
        <p>{capture.caption}</p>
        <a href={capture.sourceUrl} target="_blank" rel="noreferrer">
          Fonte da mídia
        </a>
      </dialog>
    </div>
  );
}
