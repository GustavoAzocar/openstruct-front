import { GITHUB_REPOSITORIES, SNAPSHOT_STALE_MS } from './github-snapshot.ts';
import type { GithubSnapshot } from './github-snapshot.ts';
import type { DevelopmentSource } from './development.ts';
import { emptyRecentCommits } from './commit-contract.ts';

export function commitSectionLink(params: URLSearchParams, slug: string) {
  const next = new URLSearchParams(params);
  if (GITHUB_REPOSITORIES.some((r) => r.split('/')[1] === slug)) next.set('repo', slug);
  else next.delete('repo');
  return '/development' + (next.size ? '?' + next.toString() : '') + '#commits';
}
export function recentCommitsView(
  snapshot: GithubSnapshot | null | undefined,
  sources: DevelopmentSource[],
  now: number,
  offline = false,
) {
  return sources.map((source) => {
    const repo = snapshot?.repositories.find(
      (r) => r.repository === source.repository && r.visibility === 'public',
    );
    const list = repo?.recentCommits ?? emptyRecentCommits();
    const age = now - Date.parse(list.checkedAt ?? '');
    const state =
      list.state === 'unavailable'
        ? 'unavailable'
        : offline ||
            list.state === 'stale' ||
            !Number.isFinite(age) ||
            age < 0 ||
            age > SNAPSHOT_STALE_MS
          ? 'stale'
          : 'fresh';
    const branch = list.branch ?? repo?.summary?.defaultBranch ?? null;
    return {
      source,
      list,
      state,
      branch,
      partial: repo?.status === 'partial',
      historyUrl: branch
        ? source.url + '/commits/' + encodeURIComponent(branch)
        : source.url + '/commits',
    };
  });
}
