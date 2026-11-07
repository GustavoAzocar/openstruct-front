/** Public activity is independent of the signed installer catalog. */
export const GITHUB_REPOSITORIES = [
  'ricardocorsini/openstruct-front',
  'ricardocorsini/consolo-struct',
  'ricardocorsini/mola-struct',
  'ricardocorsini/armadura-struct',
  'ricardocorsini/openstruct-catalog',
] as const;
export type PublicRepository = (typeof GITHUB_REPOSITORIES)[number];
export const ACTIVITY_KINDS = ['issues', 'pulls', 'milestones', 'contributors'] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];
export const SNAPSHOT_MAX_BYTES = 400_000;
export const PAGE_SIZE = 30;
export const MAX_PAGES = 2;
export const SNAPSHOT_STALE_MS = 2 * 60 * 60_000;
export const GITHUB_SNAPSHOT_URL =
  'https://raw.githubusercontent.com/ricardocorsini/openstruct-front/github-data/snapshot.json?schema=2';
export type ActivityItem = {
  id: string;
  title: string;
  url: string;
  updatedAt: string | null;
  count: number | null;
};
export type ActivityList = {
  state: 'fresh' | 'stale' | 'unavailable';
  checkedAt: string | null;
  truncated: boolean;
  items: ActivityItem[];
};
export type PublicRelease = {
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
};
export type ReleaseSnapshot = {
  state: 'fresh' | 'stale' | 'unavailable';
  checkedAt: string | null;
  item: PublicRelease | null;
};
export type RepositorySnapshot = {
  repository: PublicRepository;
  visibility: 'public' | 'unknown';
  verifiedPublicAt: string | null;
  lastSuccessAt: string | null;
  status: 'ready' | 'partial' | 'unavailable';
  problem: 'visibility' | 'request' | 'rate-limit' | null;
  summary: {
    name: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    openIssuesAndPullRequests: number;
    defaultBranch: string;
  } | null;
  lists: Record<ActivityKind, ActivityList>;
  release: ReleaseSnapshot;
};
export type GithubSnapshot = {
  schemaVersion: 2;
  generatedAt: string | null;
  retryAt: string | null;
  repositories: RepositorySnapshot[];
};

export function emptyRelease(): ReleaseSnapshot {
  return { state: 'unavailable', checkedAt: null, item: null };
}
export function emptyRepository(repository: PublicRepository): RepositorySnapshot {
  return {
    repository,
    visibility: 'unknown',
    verifiedPublicAt: null,
    lastSuccessAt: null,
    status: 'unavailable',
    problem: 'visibility',
    summary: null,
    release: emptyRelease(),
    lists: {
      issues: { state: 'unavailable', checkedAt: null, truncated: false, items: [] },
      pulls: { state: 'unavailable', checkedAt: null, truncated: false, items: [] },
      milestones: { state: 'unavailable', checkedAt: null, truncated: false, items: [] },
      contributors: { state: 'unavailable', checkedAt: null, truncated: false, items: [] },
    },
  };
}
export function emptyGithubSnapshot(): GithubSnapshot {
  return {
    schemaVersion: 2,
    generatedAt: null,
    retryAt: null,
    repositories: GITHUB_REPOSITORIES.map(emptyRepository),
  };
}
function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Expected object');
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).length !== keys.length ||
    Object.keys(record).some((key) => !keys.includes(key))
  )
    throw new Error('Unexpected fields');
  return record;
}
function text(value: unknown, max: number): asserts value is string {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value)
  )
    throw new Error('Invalid public text');
}
function date(value: unknown) {
  if (
    value !== null &&
    (typeof value !== 'string' ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) ||
      !Number.isFinite(Date.parse(value)))
  )
    throw new Error('Invalid date');
}
function integer(value: unknown) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    throw new Error('Invalid counter');
}
export function validateGithubSnapshot(value: unknown): GithubSnapshot {
  if (new TextEncoder().encode(JSON.stringify(value)).length > SNAPSHOT_MAX_BYTES)
    throw new Error('Snapshot too large');
  const root = object(value, ['schemaVersion', 'generatedAt', 'retryAt', 'repositories']);
  if (
    ![1, 2].includes(root.schemaVersion as number) ||
    !Array.isArray(root.repositories) ||
    root.repositories.length !== GITHUB_REPOSITORIES.length
  )
    throw new Error('Invalid snapshot');
  date(root.generatedAt);
  date(root.retryAt);
  const seen = new Set<string>();
  for (const raw of root.repositories) {
    const repo = object(raw, [
      'repository',
      'visibility',
      'verifiedPublicAt',
      'lastSuccessAt',
      'status',
      'problem',
      'summary',
      'lists',
      ...(root.schemaVersion === 2 ? ['release'] : []),
    ]);
    if (
      !GITHUB_REPOSITORIES.includes(repo.repository as PublicRepository) ||
      seen.has(repo.repository as string)
    )
      throw new Error('Unauthorized or duplicate repository');
    seen.add(repo.repository as string);
    if (
      !['public', 'unknown'].includes(repo.visibility as string) ||
      !['ready', 'partial', 'unavailable'].includes(repo.status as string) ||
      ![null, 'visibility', 'request', 'rate-limit'].includes(repo.problem as null | string)
    )
      throw new Error('Invalid repository state');
    date(repo.verifiedPublicAt);
    date(repo.lastSuccessAt);
    if (
      repo.visibility === 'unknown' &&
      (repo.summary !== null ||
        repo.verifiedPublicAt !== null ||
        repo.lastSuccessAt !== null ||
        repo.status !== 'unavailable')
    )
      throw new Error('Unconfirmed visibility must not export data');
    if (
      repo.visibility === 'public' &&
      (repo.verifiedPublicAt === null || repo.summary === null || repo.status === 'unavailable')
    )
      throw new Error('Missing public evidence');
    if (repo.summary !== null) {
      const summary = object(repo.summary, [
        'name',
        'description',
        'url',
        'stars',
        'forks',
        'openIssuesAndPullRequests',
        'defaultBranch',
      ]);
      text(summary.name, 100);
      text(summary.description, 350);
      text(summary.defaultBranch, 100);
      if (summary.url !== 'https://github.com/' + repo.repository)
        throw new Error('Invalid source');
      integer(summary.stars);
      integer(summary.forks);
      integer(summary.openIssuesAndPullRequests);
    }
    if (root.schemaVersion === 2) {
      const release = object(repo.release, ['state', 'checkedAt', 'item']);
      if (!['fresh', 'stale', 'unavailable'].includes(release.state as string))
        throw new Error('Invalid release state');
      date(release.checkedAt);
      if (release.state === 'unavailable' && (release.checkedAt !== null || release.item !== null))
        throw new Error('Unavailable release contains data');
      if (release.state !== 'unavailable' && release.checkedAt === null)
        throw new Error('Missing release check');
      if (repo.visibility !== 'public' && release.state !== 'unavailable')
        throw new Error('Unconfirmed release visibility');
      if (release.item !== null) {
        const item = object(release.item, ['tag', 'name', 'url', 'publishedAt']);
        text(item.tag, 100);
        text(item.name, 200);
        date(item.publishedAt);
        if (!item.tag || item.publishedAt === null || typeof item.url !== 'string')
          throw new Error('Incomplete release');
        const url = new URL(item.url);
        const prefix = 'https://github.com/' + repo.repository + '/releases/tag/';
        if (
          !item.url.startsWith(prefix) ||
          item.url === prefix ||
          url.href !== item.url ||
          url.search ||
          url.hash ||
          url.username ||
          url.password ||
          url.port ||
          decodeURIComponent(item.url.slice(prefix.length)) !== item.tag
        )
          throw new Error('Invalid release source');
      }
    }
    const lists = object(repo.lists, [...ACTIVITY_KINDS]);
    for (const kind of ACTIVITY_KINDS) {
      const list = object(lists[kind], ['state', 'checkedAt', 'truncated', 'items']);
      date(list.checkedAt);
      if (
        !['fresh', 'stale', 'unavailable'].includes(list.state as string) ||
        typeof list.truncated !== 'boolean' ||
        !Array.isArray(list.items) ||
        list.items.length > PAGE_SIZE * MAX_PAGES
      )
        throw new Error('Invalid list');
      if (list.state === 'unavailable' && (list.items.length || list.checkedAt !== null))
        throw new Error('Unavailable list contains data');
      if (list.state !== 'unavailable' && list.checkedAt === null) throw new Error('Missing check');
      if (repo.visibility !== 'public' && list.state !== 'unavailable')
        throw new Error('Private or unconfirmed data');
      if (repo.status === 'ready' && list.state !== 'fresh') throw new Error('Invalid ready state');
      const ids = new Set<string>();
      for (const rawItem of list.items) {
        const item = object(rawItem, ['id', 'title', 'url', 'updatedAt', 'count']);
        text(item.id, 100);
        text(item.title, 200);
        if (!item.id || ids.has(item.id)) throw new Error('Duplicate item');
        ids.add(item.id);
        date(item.updatedAt);
        if (item.count !== null) integer(item.count);
        const prefix = 'https://github.com/' + repo.repository + '/';
        if (
          typeof item.url !== 'string' ||
          (kind === 'contributors'
            ? !/^https:\/\/github\.com\/[a-z\d](?:[a-z\d-]{0,38})(?:\[bot\])?$/i.test(item.url)
            : !item.url.startsWith(
                prefix +
                  ({ issues: 'issues/', pulls: 'pull/', milestones: 'milestone/' } as const)[kind],
              ) ||
              !/^\d+$/.test(
                item.url.slice(
                  (
                    prefix +
                    ({ issues: 'issues/', pulls: 'pull/', milestones: 'milestone/' } as const)[kind]
                  ).length,
                ),
              ))
        )
          throw new Error('Invalid item source');
      }
    }
  }
  const validated = value as GithubSnapshot;
  // v1 has no release evidence. Never infer a release from a version or combined issue count.
  return root.schemaVersion === 2
    ? validated
    : {
        ...validated,
        schemaVersion: 2,
        repositories: validated.repositories.map((repo) => ({ ...repo, release: emptyRelease() })),
      };
}
