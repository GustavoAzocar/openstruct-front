import type { ActivityItem, GithubSnapshot, PublicRepository } from './github-snapshot.ts';
import { SNAPSHOT_STALE_MS } from './github-snapshot.ts';
import type { DevelopmentSource } from './development.ts';

type RoadmapDocument = {
  path: string;
  ref: string;
  reviewedAt: string;
  title: string;
  summary: string;
  items: { title: string; state: 'proposal' | 'completed'; anchor: string }[];
};

/** Editorial excerpts of identified public sources, never the internal task board. */
export const roadmapDocuments: Partial<Record<PublicRepository, RoadmapDocument>> = {
  'ricardocorsini/mola-struct': {
    path: 'docs/ROADMAP.md',
    ref: 'aeda58309ddadcd53cac16aa1625473391d8efad',
    reviewedAt: '2026-11-07',
    title: 'Roadmap do MolaStruct',
    summary:
      'A ordem depende de referências e resultados independentes. A fonte não fixa datas de lançamento. Seleção editorial de cinco itens; consulte o documento completo.',
    items: [
      {
        title: 'Estabelecer uma matriz de validação geotécnica com dados independentes.',
        state: 'proposal',
        anchor: 'consistência-e-validação',
      },
      {
        title: 'Terzaghi e documentação do alcance das comparações de capacidade.',
        state: 'proposal',
        anchor: 'evolução-do-motor',
      },
      {
        title: 'Contato unilateral e perda de contato das sapatas.',
        state: 'proposal',
        anchor: 'evolução-do-motor',
      },
      {
        title: 'Interação vertical entre estacas no perfil Mindlin.',
        state: 'completed',
        anchor: 'evolução-do-motor',
      },
      {
        title: 'Conferência parcial com referência explícita à NBR 6122:2022 e separação ELU/ELS.',
        state: 'completed',
        anchor: 'evolução-do-motor',
      },
    ],
  },
  'ricardocorsini/armadura-struct': {
    path: 'README.md',
    ref: '7fd484d4b0be110dea2a15174c3e1bf92b86a043',
    reviewedAt: '2026-11-07',
    title: 'Direções de contribuição do ArmaduraStruct',
    summary:
      'O README menciona testes com desenhos reais e refinamento de comandos CAD. Não define o estado de cada próxima etapa; algumas também aparecem entre os recursos. Consulte o contexto, sem presumir pendência ou prazo.',
    items: [],
  },
};

export function roadmapDocumentUrl(source: DevelopmentSource, document: RoadmapDocument) {
  return `${source.url}/blob/${document.ref}/${document.path}`;
}

export function milestoneProgress(item: ActivityItem) {
  if (!item.milestone) return null;
  const { openItems, closedItems } = item.milestone;
  const total = openItems + closedItems;
  if (!Number.isSafeInteger(total) || openItems < 0 || closedItems < 0 || total === 0) return null;
  return { total, closed: closedItems, percent: Math.round((100 * closedItems) / total) };
}

export function roadmapView(
  snapshot: GithubSnapshot | null | undefined,
  sources: DevelopmentSource[],
  now: number,
  offline = false,
) {
  return sources.map((source) => {
    const repo = snapshot?.repositories.find(
      (entry) => entry.repository === source.repository && entry.visibility === 'public',
    );
    const list = repo?.lists.milestones;
    const age = now - Date.parse(list?.checkedAt ?? '');
    const state =
      !list || list.state === 'unavailable'
        ? 'unavailable'
        : offline ||
            list.state === 'stale' ||
            !Number.isFinite(age) ||
            age < 0 ||
            age > SNAPSHOT_STALE_MS
          ? 'stale'
          : 'fresh';
    const seen = new Set<string>();
    const items =
      state === 'unavailable'
        ? []
        : list!.items
            .filter((item) => {
              const number = Number(item.id);
              if (
                !Number.isSafeInteger(number) ||
                number < 1 ||
                item.url !== `${source.url}/milestone/${number}` ||
                seen.has(item.url)
              )
                return false;
              seen.add(item.url);
              return true;
            })
            .sort(
              (a, b) =>
                Number(a.milestone?.state === 'closed') - Number(b.milestone?.state === 'closed') ||
                (Date.parse(b.updatedAt ?? '') || 0) - (Date.parse(a.updatedAt ?? '') || 0) ||
                Number(a.id) - Number(b.id),
            );
    return {
      source,
      state,
      checkedAt: list?.checkedAt,
      truncated: list?.truncated ?? false,
      items,
      document: roadmapDocuments[source.repository],
    };
  });
}
