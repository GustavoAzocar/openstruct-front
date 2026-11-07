import { SNAPSHOT_STALE_MS } from './github-snapshot.ts';
import type { ActivityItem, GithubSnapshot } from './github-snapshot.ts';
import type { DevelopmentSource } from './development.ts';

export const pullLabels = {
  all: 'Todos os estados',
  open: 'Aberto',
  draft: 'Rascunho',
  merged: 'Mesclado',
  closed: 'Fechado sem merge',
  unknown: 'Estado detalhado não informado',
};
export type PullState = Exclude<keyof typeof pullLabels, 'all'>;
export function pullState(item: ActivityItem): PullState {
  const pull = item.pull;
  if (!pull) return 'unknown';
  if (pull.state === 'open') return pull.draft === null ? 'unknown' : pull.draft ? 'draft' : 'open';
  return !pull.mergeKnown ? 'unknown' : pull.mergedAt ? 'merged' : 'closed';
}
export function readPullFilters(params: URLSearchParams) {
  const value = params.get('pullState') ?? 'all';
  const state = Object.hasOwn(pullLabels, value) ? (value as keyof typeof pullLabels) : 'all';
  const page = params.get('pullPage') ?? '';
  return { state, page: /^[1-9]\d{0,3}$/.test(page) ? Number(page) : 1 };
}
export function selectPulls(
  snapshot: GithubSnapshot | null | undefined,
  sources: DevelopmentSource[],
  state: keyof typeof pullLabels,
  now: number,
  offline = false,
) {
  const rows: { item: ActivityItem; source: DevelopmentSource; stale: boolean }[] = [];
  const coverage = sources.map((source) => {
    const repo = snapshot?.repositories.find(
      (repo) => repo.repository === source.repository && repo.visibility === 'public',
    );
    const list = repo?.lists.pulls;
    const known = Boolean(list && list.state !== 'unavailable');
    const stale = Boolean(
      known &&
      (offline ||
        list!.state === 'stale' ||
        now - Date.parse(list!.checkedAt ?? '') > SNAPSHOT_STALE_MS),
    );
    if (known)
      for (const item of list!.items) {
        if (
          !item.url.startsWith(source.url + '/pull/') ||
          !/^\d+$/.test(item.url.slice((source.url + '/pull/').length))
        )
          continue;
        if (state === 'all' || state === pullState(item)) rows.push({ item, source, stale });
      }
    return {
      source,
      known,
      stale,
      checkedAt: list?.checkedAt ?? null,
      truncated: list?.truncated ?? false,
    };
  });
  const unique = [...new Map(rows.map((row) => [row.item.url, row])).values()];
  unique.sort(
    (a, b) =>
      (Date.parse(b.item.updatedAt ?? '') || 0) - (Date.parse(a.item.updatedAt ?? '') || 0) ||
      a.item.url.localeCompare(b.item.url),
  );
  return { rows: unique, coverage };
}
