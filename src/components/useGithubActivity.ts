import { useSyncExternalStore } from 'react';
import { githubActivityStore } from '../lib/github-activity-store.ts';
import { snapshotIsStale } from '../lib/github-client.ts';

export function useGithubActivity() {
  const state = useSyncExternalStore(
    githubActivityStore.subscribe,
    githubActivityStore.getSnapshot,
    githubActivityStore.getSnapshot,
  );
  const result = state.result && {
    ...state.result,
    stale:
      state.result.source !== 'public' ||
      !state.result.snapshot ||
      snapshotIsStale(state.result.snapshot, state.now),
  };
  return {
    ...state,
    result,
    loading: state.loading || !result,
    canRefresh: Boolean(result) && !state.loading && state.now >= state.retryAt,
    refresh: githubActivityStore.refresh,
  };
}
