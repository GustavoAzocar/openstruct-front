import { useEffect, useMemo } from 'react';
import type { RefObject } from 'react';

function addCodeControl(pre: HTMLPreElement) {
  const code = pre.querySelector('code');
  if (!code) return;
  const text = code.textContent ?? '';

  const block = document.createElement('div');
  block.className = 'manual-code-block';
  const controls = document.createElement('div');
  controls.className = 'manual-code-controls';
  const result = document.createElement('span');
  result.className = 'manual-copy-status';
  result.setAttribute('role', 'status');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Copiar código';

  async function copy() {
    result.textContent = '';
    try {
      await navigator.clipboard.writeText(text);
      result.textContent = 'Código copiado.';
    } catch {
      result.textContent = 'Não foi possível copiar. Selecione o código para copiá-lo manualmente.';
    }
  }

  const previousTabIndex = pre.getAttribute('tabindex');
  const previousLabel = pre.getAttribute('aria-label');
  if (previousTabIndex === null) pre.tabIndex = 0;
  if (previousLabel === null) pre.setAttribute('aria-label', 'Bloco de código');
  button.addEventListener('click', copy);
  controls.append(result, button);
  pre.before(block);
  block.append(controls, pre);

  return () => {
    button.removeEventListener('click', copy);
    if (previousTabIndex === null) pre.removeAttribute('tabindex');
    if (previousLabel === null) pre.removeAttribute('aria-label');
    block.replaceWith(pre);
  };
}

function handleFigureImage(image: HTMLImageElement) {
  const message = document.createElement('p');
  message.className = 'manual-figure-unavailable';
  message.hidden = true;
  message.textContent = ['Imagem indisponível.', image.alt].filter(Boolean).join(' ');
  image.after(message);

  function handleError() {
    image.hidden = true;
    message.hidden = false;
  }

  image.addEventListener('error', handleError);
  if (image.complete && image.naturalWidth === 0) handleError();

  return () => {
    image.removeEventListener('error', handleError);
    image.hidden = false;
    message.remove();
  };
}

export function ManualChapterContent({
  html,
  contentRef,
}: {
  html: string;
  contentRef: RefObject<HTMLDivElement | null>;
}) {
  // A seção em foco deve sobreviver a mudanças no sumário e nos controles do leitor.
  const markup = useMemo(() => ({ __html: html }), [html]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const cleanup = [
      ...Array.from(content.querySelectorAll('pre'), addCodeControl),
      ...Array.from(
        content.querySelectorAll<HTMLImageElement>('.manual-figure img'),
        handleFigureImage,
      ),
    ];
    return () => cleanup.forEach((dispose) => dispose?.());
  }, [contentRef, html]);

  // O plugin Vite valida e higieniza o HTML gerado do Markdown versionado.
  return (
    <div className="manual-reading-content" ref={contentRef} dangerouslySetInnerHTML={markup} />
  );
}
