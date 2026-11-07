import { normalizeSearch } from './catalog-filters.ts';
import { SNAPSHOT_STALE_MS } from './github-snapshot.ts';
import type { GithubSnapshot, IssueState, PublicIssue } from './github-snapshot.ts';
import type { DevelopmentSource } from './development.ts';
import { developmentSources } from './development.ts';

export const ISSUE_PAGE_SIZE = 10;
export type IssueFilters = { state: IssueState | 'all'; label: string; q: string; page: number };
export const defaultIssueFilters: IssueFilters = { state: 'open', label: '', q: '', page: 1 };

export function issueRepositoryParams(base: URLSearchParams, slug: string) {
  const next = new URLSearchParams(base);
  if (developmentSources.some((source) => source.slug === slug)) next.set('repo', slug);
  else next.delete('repo');
  next.delete('issueLabel');
  next.delete('issuePage');
  return next;
}

export function loadedIssueLabels(
  snapshot: GithubSnapshot | null | undefined,
  sources: DevelopmentSource[],
) {
  const names = new Set<string>();
  for (const source of sources) {
    const repo = snapshot?.repositories.find(
      (entry) => entry.repository === source.repository && entry.visibility === 'public',
    );
    if (!repo) continue;
    for (const collection of Object.values(repo.issueDetails)) {
      if (collection.state === 'unavailable') continue;
      for (const issue of collection.items)
        for (const label of issue.labels ?? []) names.add(label);
    }
  }
  return [...names].sort(new Intl.Collator('pt-BR').compare);
}
export function readIssueFilters(params: URLSearchParams, labels: string[]): IssueFilters {
  const state = params.get('issueState');
  const page = params.get('issuePage') ?? '';
  const label = params.get('issueLabel') ?? '';
  return {
    state: state === 'closed' || state === 'all' ? state : 'open',
    label: labels.includes(label) ? label : '',
    q: (params.get('issueQ') ?? '').slice(0, 200),
    page: /^[1-9]\d{0,3}$/.test(page) ? Number(page) : 1,
  };
}
export function writeIssueFilters(base: URLSearchParams, filters: IssueFilters) {
  const next = new URLSearchParams(base);
  for (const key of ['issueState', 'issueLabel', 'issueQ', 'issuePage']) next.delete(key);
  if (filters.state !== 'open') next.set('issueState', filters.state);
  if (filters.label) next.set('issueLabel', filters.label);
  if (filters.q) next.set('issueQ', filters.q);
  if (filters.page > 1) next.set('issuePage', String(filters.page));
  return next;
}

export function selectIssues(
  snapshot: GithubSnapshot | null | undefined,
  sources: DevelopmentSource[],
  filters: IssueFilters,
  now: number,
  offline = false,
) {
  const scopes: IssueState[] = filters.state === 'all' ? ['open', 'closed'] : [filters.state];
  const rows: { issue: PublicIssue; source: DevelopmentSource; stale: boolean }[] = [];
  const coverage = sources.flatMap((source) => {
    const repo = snapshot?.repositories.find(
      (entry) => entry.repository === source.repository && entry.visibility === 'public',
    );
    return scopes.map((scope) => {
      const collection = repo?.issueDetails[scope];
      const known = Boolean(collection && collection.state !== 'unavailable');
      const stale =
        known &&
        (offline ||
          collection!.state === 'stale' ||
          !collection!.checkedAt ||
          now - Date.parse(collection!.checkedAt) > SNAPSHOT_STALE_MS);
      if (known)
        for (const issue of collection!.items) {
          if (issue.state !== scope || issue.url !== source.url + '/issues/' + issue.number)
            continue;
          rows.push({ issue, source, stale });
        }
      return {
        source,
        scope,
        state: !known ? ('unavailable' as const) : stale ? ('stale' as const) : ('fresh' as const),
        checkedAt: known ? collection!.checkedAt : null,
        truncated: known && collection!.truncated,
      };
    });
  });
  const unique = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const key = row.source.repository + '#' + row.issue.number;
    const last = unique.get(key);
    if (
      !last ||
      (Date.parse(row.issue.updatedAt ?? '') || 0) > (Date.parse(last.issue.updatedAt ?? '') || 0)
    )
      unique.set(key, row);
  }
  const query = normalizeSearch(filters.q).trim();
  const filtered = [...unique.values()].filter(
    ({ issue, source }) =>
      (!filters.label || issue.labels?.includes(filters.label)) &&
      (!query ||
        normalizeSearch(
          [
            issue.title,
            '#' + issue.number,
            source.name,
            source.slug,
            issue.author?.login ?? '',
            ...(issue.labels ?? []),
          ].join(' '),
        ).includes(query)),
  );
  filtered.sort(
    (a, b) =>
      (Date.parse(b.issue.updatedAt ?? '') || 0) - (Date.parse(a.issue.updatedAt ?? '') || 0) ||
      a.source.slug.localeCompare(b.source.slug) ||
      b.issue.number - a.issue.number,
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / ISSUE_PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, filters.page));
  return {
    loadedCount: unique.size,
    total: filtered.length,
    page,
    pageCount,
    coverage,
    knownCollections: coverage.filter((entry) => entry.state !== 'unavailable').length,
    rows: filtered.slice((page - 1) * ISSUE_PAGE_SIZE, page * ISSUE_PAGE_SIZE),
  };
}
