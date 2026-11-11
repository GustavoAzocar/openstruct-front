import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './manual-reading.css';

type ReadingMetadata = {
  title: string;
  summary: string;
  edition: string;
  reviewedAt: string;
};

type Chapter = {
  html: string;
  headings: { id: string; title: string; depth: number }[];
};

const reviewDate = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export function ManualReading({
  metadata,
  chapter,
}: {
  metadata: ReadingMetadata;
  chapter: Chapter;
}) {
  const location = useLocation();
  const title = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('');
  const [tocOpen, setTocOpen] = useState(
    () => typeof window === 'undefined' || !window.matchMedia('(max-width: 760px)').matches,
  );
  // Uma mudança no sumário não pode recriar o HTML que contém a seção em foco.
  const markup = useMemo(() => ({ __html: chapter.html }), [chapter.html]);

  useEffect(() => {
    let target: HTMLElement | null = null;
    if (location.hash) {
      try {
        target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      } catch {
        /* Um fragmento malformado não impede a leitura. */
      }
    }
    if (target && body.current?.contains(target)) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'instant' });
      setActive(target.id);
      return;
    }
    title.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActive('');
  }, [chapter, location.hash, location.key]);

  useEffect(() => {
    const headings = Array.from(
      body.current?.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id], h5[id], h6[id]') ?? [],
    ).reverse();
    const readingLine =
      Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 1;
    let frame = 0;
    function updateActive() {
      frame = 0;
      const current = headings.find(
        (heading) => heading.getBoundingClientRect().top <= readingLine,
      );
      setActive(current?.id ?? '');
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(updateActive);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [chapter]);

  return (
    <div className="container manual-reading">
      <nav className="manual-reading-breadcrumb" aria-label="Localização">
        <ol>
          <li>
            <Link to="/docs">Documentação</Link>
          </li>
          <li>
            <ChevronRight aria-hidden="true" size={14} />
            <Link to="/docs#recursos-editoriais">Recursos editoriais</Link>
          </li>
          <li aria-current="page">
            <ChevronRight aria-hidden="true" size={14} />
            {metadata.title}
          </li>
        </ol>
      </nav>
      <div className="manual-reading-layout">
        <nav className="manual-reading-toc" aria-label="Sumário do capítulo">
          <details open={tocOpen} onToggle={(event) => setTocOpen(event.currentTarget.open)}>
            <summary>Sumário do capítulo</summary>
            <ul>
              {chapter.headings.map(({ id, title, depth }) => (
                <li key={id} data-depth={depth}>
                  <Link
                    to={{ hash: `#${id}` }}
                    aria-current={active === id ? 'location' : undefined}
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </nav>
        <article className="manual-reading-article" aria-labelledby="manual-reading-title">
          <header className="manual-reading-cover">
            <p className="manual-reading-status">Amostra didática</p>
            <h1 id="manual-reading-title" ref={title} tabIndex={-1}>
              {metadata.title}
            </h1>
            <p>{metadata.summary}</p>
            <p className="manual-reading-edition">
              {metadata.edition} <span aria-hidden="true">·</span> Revisão de{' '}
              <time dateTime={metadata.reviewedAt}>
                {reviewDate.format(new Date(metadata.reviewedAt))}
              </time>
            </p>
          </header>
          {/* O plugin Vite valida e higieniza o HTML gerado do Markdown versionado. */}
          <div className="manual-reading-content" ref={body} dangerouslySetInnerHTML={markup} />
          <Link className="manual-reading-back text-link" to="/docs#recursos-editoriais">
            <ArrowLeft aria-hidden="true" size={16} /> Voltar aos recursos editoriais
          </Link>
        </article>
      </div>
    </div>
  );
}
