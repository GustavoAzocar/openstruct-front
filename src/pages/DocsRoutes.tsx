import { lazy, Suspense, useEffect } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import chapterLoaders from 'virtual:manual-content';
import { ManualLanding } from '../components/ManualLanding';
import { ManualReading } from '../components/ManualReading';
import {
  getManualSystem,
  manualChapterPath,
  manualEditionPath,
  manualSystemPath,
  publicManualChapters,
  publicManualEditions,
  MANUAL_CHAPTER_ROUTE,
  MANUAL_EDITION_ROUTE,
  MANUAL_SYSTEM_ROUTE,
} from '../lib/manual-chapters';
import type { ManualChapter } from '../lib/manual-chapters';
import { Docs } from './Docs';

type ReadingProps = Omit<ComponentProps<typeof ManualReading>, 'chapter'>;

const readers = new Map(
  Object.entries(chapterLoaders).map(([source, load]) => [
    source,
    lazy(async () => {
      try {
        const chapter = await load();
        return { default: (props: ReadingProps) => <ManualReading {...props} chapter={chapter} /> };
      } catch {
        return { default: ChapterUnavailable };
      }
    }),
  ]),
);

function ChapterUnavailable({ breadcrumbs, back }: ReadingProps) {
  return (
    <div data-docs-load-error>
      <DocumentationView title="Capítulo indisponível">
        <ManualLanding
          title="Capítulo indisponível"
          status="Erro de carregamento"
          summary="Recarregue a página para tentar novamente ou volte à edição do manual."
          breadcrumbs={breadcrumbs}
          back={back}
          links={[]}
        />
      </DocumentationView>
    </div>
  );
}

function DocumentationView({
  title,
  reading = false,
  children,
}: {
  title: string;
  reading?: boolean;
  children: ReactNode;
}) {
  const { hash, key } = useLocation();
  useEffect(() => {
    document.title = `${title} — OpenStruct`;
    if (reading) return;

    const main = document.getElementById('conteudo');
    let target: HTMLElement | null = null;
    try {
      target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    } catch {
      // Fragmentos inválidos levam ao início da página.
    }

    const fragment = target && main?.contains(target) ? target : null;
    const focus = fragment ?? main?.querySelector('h1');
    if (focus) {
      if (!focus.hasAttribute('tabindex') && focus.tabIndex < 0) focus.tabIndex = -1;
      focus.focus({ preventScroll: true });
    }
    if (fragment) fragment.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [title, hash, key, reading]);

  return children;
}

function DocsNotFound() {
  return (
    <div data-docs-not-found>
      <DocumentationView title="Página da documentação não encontrada">
        <ManualLanding
          title="Página da documentação não encontrada"
          status="Endereço indisponível"
          summary="Consulte a central para encontrar os sistemas, edições e capítulos disponíveis."
          back={{ label: 'Voltar à documentação', to: '/docs' }}
        />
      </DocumentationView>
    </div>
  );
}

function ManualPage() {
  const { systemId, editionId, chapterSlug } = useParams();
  const system = systemId && getManualSystem(systemId);
  if (!system) return <DocsNotFound />;

  const editions = publicManualEditions(system);
  const official =
    system.kind === 'app'
      ? { label: `Consultar documentação do ${system.name}`, to: system.app.documentation.url }
      : undefined;

  if (!editionId) {
    return (
      <DocumentationView title={system.name}>
        <ManualLanding
          title={system.name}
          summary={system.summary}
          status={editions.length ? 'Edições disponíveis' : 'Manual em elaboração'}
          official={official}
          notice={
            official && !editions.length
              ? 'O guia do aplicativo reúne as instruções disponíveis para este sistema.'
              : undefined
          }
          linksTitle="Edições do manual"
          links={editions.map((edition) => ({
            title: edition.title,
            summary: `${edition.id === system.currentEditionId ? 'Edição vigente' : 'Edição histórica'}${edition.status === 'sample' ? ' · Amostra' : ''}`,
            to: manualEditionPath(system.id, edition.id),
          }))}
        />
      </DocumentationView>
    );
  }

  const edition = editions.find(({ id }) => id === editionId);
  if (!edition) return <DocsNotFound />;

  const systemLink = { label: system.name, to: manualSystemPath(system.id) };
  const editionLink = { label: edition.title, to: manualEditionPath(system.id, edition.id) };
  const chapters = publicManualChapters(edition);
  const editionAge = edition.id === system.currentEditionId ? 'Edição vigente' : 'Edição histórica';
  const editionReview = edition.status === 'sample' ? 'Amostra didática' : 'Manual revisado';

  if (!chapterSlug) {
    return (
      <DocumentationView title={`${system.name} · ${edition.title}`}>
        <ManualLanding
          title={edition.title}
          summary={system.summary}
          status={`${editionReview} · ${editionAge}`}
          breadcrumbs={[systemLink]}
          linksTitle="Capítulos disponíveis"
          links={chapters.map((chapter) => ({
            title: chapter.title,
            summary: chapter.summary,
            to: manualChapterPath(system.id, edition.id, chapter.slug),
          }))}
          back={{ label: `Voltar para ${system.name}`, to: systemLink.to }}
        />
      </DocumentationView>
    );
  }

  const chapterIndex = chapters.findIndex(({ slug }) => slug === chapterSlug);
  const chapter = chapters[chapterIndex];
  const Reader = chapter && readers.get(chapter.source);
  if (!Reader) return <DocsNotFound />;

  const chapterReview = chapter.status === 'sample' ? 'Amostra didática' : editionReview;
  const chapterLink = (neighbor: ManualChapter | undefined) =>
    neighbor && {
      label: neighbor.title,
      to: manualChapterPath(system.id, edition.id, neighbor.slug),
    };
  return (
    <DocumentationView title={chapter.title} reading>
      <Suspense
        fallback={
          <p className="container page-hero" role="status">
            Carregando capítulo…
          </p>
        }
      >
        <Reader
          metadata={{
            title: chapter.title,
            summary: chapter.summary,
            edition: edition.title,
            reviewedAt: chapter.reviewedAt,
          }}
          breadcrumbs={[systemLink, editionLink]}
          status={`${chapterReview} · ${editionAge}`}
          adjacent={{
            previous: chapterLink(chapters[chapterIndex - 1]),
            next: chapterLink(chapters[chapterIndex + 1]),
          }}
          back={{ label: `Voltar para ${edition.title}`, to: editionLink.to }}
        />
      </Suspense>
    </DocumentationView>
  );
}

export function DocsRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <DocumentationView title="Documentação">
            <Docs />
          </DocumentationView>
        }
      />
      <Route path={MANUAL_SYSTEM_ROUTE} element={<ManualPage />} />
      <Route path={MANUAL_EDITION_ROUTE} element={<ManualPage />} />
      <Route path={MANUAL_CHAPTER_ROUTE} element={<ManualPage />} />
      <Route path="*" element={<DocsNotFound />} />
    </Routes>
  );
}
