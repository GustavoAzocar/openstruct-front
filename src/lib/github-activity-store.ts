import { GITHUB_REFRESH_MS, loadGithubActivity } from './github-client.ts';
import type { GithubLoadResult } from './github-client.ts';

export const GITHUB_MANUAL_REFRESH_MS = 60_000;
type ActivityState = {
  result?: GithubLoadResult;
  loading: boolean;
  now: number;
  nextCheckAt: number;
  retryAt: number;
  attemptedAt: number | null;
};

/** Shared by every activity consumer, including across route changes. */
export function createGithubActivityStore(
  options: {
    load?: typeof loadGithubActivity;
    now?: () => number;
    isVisible?: () => boolean;
    listen?: (wake: () => void) => () => void;
    interval?: typeof globalThis.setInterval;
    clearInterval?: typeof globalThis.clearInterval;
  } = {},
) {
  const load = options.load ?? loadGithubActivity;
  const now = options.now ?? Date.now;
  const visible = options.isVisible ?? (() => document.visibilityState === 'visible');
  const interval = options.interval ?? globalThis.setInterval;
  const clearInterval = options.clearInterval ?? globalThis.clearInterval;
  const listen =
    options.listen ??
    ((wake: () => void) => {
      window.addEventListener('focus', wake);
      document.addEventListener('visibilitychange', wake);
      return () => {
        window.removeEventListener('focus', wake);
        document.removeEventListener('visibilitychange', wake);
      };
    });
  let state: ActivityState = {
    loading: false,
    now: now(),
    nextCheckAt: 0,
    retryAt: 0,
    attemptedAt: null,
  };
  const listeners = new Set<() => void>();
  let controller: AbortController | undefined;
  let timer: ReturnType<typeof globalThis.setInterval> | undefined;
  let unlisten: (() => void) | undefined;
  function update(patch: Partial<ActivityState>) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  }
  async function refresh(manual = false) {
    if (
      !listeners.size ||
      !visible() ||
      state.loading ||
      now() < (manual ? state.retryAt : state.nextCheckAt)
    )
      return;
    const request = new AbortController();
    controller = request;
    update({ loading: true, now: now(), attemptedAt: now() });
    try {
      const result = await load({ signal: request.signal, force: manual });
      if (!request.signal.aborted) {
        const nextCheckAt = result.nextCheckAt ?? now() + GITHUB_REFRESH_MS;
        update({
          result,
          nextCheckAt,
          retryAt: result.source === 'public' ? now() + GITHUB_MANUAL_REFRESH_MS : nextCheckAt,
        });
      }
    } catch {
      if (!request.signal.aborted)
        update({
          result: {
            snapshot: state.result?.snapshot ?? null,
            stale: true,
            source: state.result?.snapshot ? 'cache' : 'unavailable',
          },
          nextCheckAt: now() + GITHUB_REFRESH_MS,
          retryAt: now() + GITHUB_REFRESH_MS,
        });
    } finally {
      if (controller === request) {
        controller = undefined;
        update({ loading: false, now: now() });
      }
    }
  }
  function wake() {
    if (!visible()) return;
    update({ now: now() });
    void refresh();
  }
  return {
    getSnapshot: () => state,
    refresh: () => {
      void refresh(true);
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        timer = interval(wake, 30_000);
        unlisten = listen(wake);
        wake();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size) return;
        clearInterval(timer);
        unlisten?.();
        // React StrictMode can immediately resubscribe; retain that shared request.
        queueMicrotask(() => {
          if (!listeners.size) controller?.abort();
        });
      };
    },
  };
}

export const githubActivityStore = createGithubActivityStore();
