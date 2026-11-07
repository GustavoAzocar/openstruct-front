import { currentApps } from './apps.ts';
import { GITHUB_REPOSITORIES, SNAPSHOT_STALE_MS } from './github-snapshot.ts';
import type {
  ActivityItem,
  ActivityList,
  GithubSnapshot,
  PublicRepository,
  ReleaseSnapshot,
} from './github-snapshot.ts';

export type DevelopmentSource = {
  repository: PublicRepository;
  slug: string;
  name: string;
  description: string;
  kind: string;
  url: string;
  appId?: string;
  appRoute?: string;
};

/** Same public allowlist as the collector; product names/routes come from OSF-01. */
export const developmentSources: DevelopmentSource[] = GITHUB_REPOSITORIES.map((repository) => {
  const url = 'https://github.com/' + repository;
  const app = currentApps.find((candidate) => candidate.repository.url === url);
  return {
    repository,
    url,
    slug: repository.split('/')[1],
    name:
      app?.name ??
      (repository.endsWith('/openstruct-front') ? 'Site OpenStruct' : 'Catálogo e distribuição'),
    description:
      app?.description ??
      (repository.endsWith('/openstruct-front')
        ? 'Apresentação, documentação e acesso ao ecossistema.'
        : 'Hub público de distribuição dos aplicativos e do Struct Launcher.'),
    kind: app ? 'Aplicativo' : 'Infraestrutura pública',
    appId: app?.id,
    appRoute: app?.route,
  };
});

export function selectDevelopmentSources(value: string | null): DevelopmentSource[] {
  const source = developmentSources.find((entry) => entry.slug === value);
  return source ? [source] : developmentSources;
}

function isOld(checkedAt: string | null, now: number) {
  return !checkedAt || now - Date.parse(checkedAt) > SNAPSHOT_STALE_MS;
}
function uniqueItems(items: ActivityItem[], prefix: string) {
  return [
    ...new Map(
      items
        .filter(
          (item) => item.url.startsWith(prefix) && /^\d+$/.test(item.url.slice(prefix.length)),
        )
        .map((item) => [item.url, item]),
    ).values(),
  ];
}
export function developmentView(
  snapshot: GithubSnapshot | null | undefined,
  sources: DevelopmentSource[],
  now: number,
  offline = false,
) {
  const repositories = sources.map((source) => {
    const entry = snapshot?.repositories.find(
      (repo) => repo.repository === source.repository && repo.visibility === 'public',
    );
    function list(kind: 'issues' | 'pulls'): ActivityList {
      const value = entry?.lists[kind];
      if (!value || value.state === 'unavailable')
        return { state: 'unavailable', checkedAt: null, truncated: false, items: [] };
      const items = uniqueItems(
        value.items,
        source.url + (kind === 'issues' ? '/issues/' : '/pull/'),
      );
      // GitHub shares one number namespace for issues and PRs within a repository.
      const pullNumbers = new Set(
        uniqueItems(entry!.lists.pulls.items, source.url + '/pull/').map((item) =>
          item.url.slice(item.url.lastIndexOf('/') + 1),
        ),
      );
      return {
        ...value,
        items:
          kind === 'issues'
            ? items.filter(
                (item) => !pullNumbers.has(item.url.slice(item.url.lastIndexOf('/') + 1)),
              )
            : items,
        state:
          offline || value.state === 'stale' || isOld(value.checkedAt, now) ? 'stale' : 'fresh',
      };
    }
    const release: ReleaseSnapshot =
      !entry || entry.release.state === 'unavailable'
        ? { state: 'unavailable', checkedAt: null, item: null }
        : {
            ...entry.release,
            state:
              offline || entry.release.state === 'stale' || isOld(entry.release.checkedAt, now)
                ? 'stale'
                : 'fresh',
          };
    return { source, entry, issues: list('issues'), pulls: list('pulls'), release };
  });
  function aggregate(kind: 'issues' | 'pulls') {
    const known = repositories.filter((repo) => repo[kind].state !== 'unavailable');
    const items = known.flatMap((repo) =>
      repo[kind].items.map((item) => ({ item, source: repo.source, state: repo[kind].state })),
    );
    items.sort(
      (a, b) =>
        (Date.parse(b.item.updatedAt ?? '') || 0) - (Date.parse(a.item.updatedAt ?? '') || 0),
    );
    return {
      count: known.length ? items.length : null,
      knownSources: known.length,
      unavailableSources: repositories.length - known.length,
      truncatedSources: known.filter((repo) => repo[kind].truncated).length,
      staleSources: known.filter((repo) => repo[kind].state === 'stale').length,
      items,
    };
  }
  return { repositories, issues: aggregate('issues'), pulls: aggregate('pulls') };
}

export function githubListUrl(source: DevelopmentSource, kind: 'issues' | 'pulls') {
  return (
    source.url +
    (kind === 'issues' ? '/issues?q=is%3Aissue%20is%3Aopen' : '/pulls?q=is%3Apr%20is%3Aopen')
  );
}

export function githubDate(value: string | null | undefined) {
  return value
    ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : 'Não confirmada';
}
