import {
  GITHUB_SNAPSHOT_URL,
  SNAPSHOT_MAX_BYTES,
  SNAPSHOT_STALE_MS,
  validateGithubSnapshot,
} from './github-snapshot.ts';
import type { GithubSnapshot } from './github-snapshot.ts';

export type GithubLoadResult = {
  snapshot: GithubSnapshot | null;
  stale: boolean;
  source: 'public' | 'cache' | 'bundled' | 'unavailable';
  /** Next browser revalidation, independent of the collector's snapshot.retryAt. */
  nextCheckAt?: number;
};
export const GITHUB_REFRESH_MS = 5 * 60_000;
export function snapshotIsStale(snapshot: GithubSnapshot, now = Date.now()) {
  return (
    !snapshot.generatedAt ||
    now - Date.parse(snapshot.generatedAt) > SNAPSHOT_STALE_MS ||
    snapshot.repositories.some(
      (entry) =>
        entry.status !== 'ready' ||
        !entry.verifiedPublicAt ||
        now - Date.parse(entry.verifiedPublicAt) > SNAPSHOT_STALE_MS ||
        [
          ...Object.values(entry.lists),
          ...Object.values(entry.issueDetails),
          entry.release,
          entry.releaseHistory,
          entry.recentCommits,
          ...entry.codeRelations,
        ].some((list) => list.checkedAt && now - Date.parse(list.checkedAt) > SNAPSHOT_STALE_MS),
    )
  );
}
async function readResponse(response: Response) {
  if (!response.ok || Number(response.headers.get('content-length')) > SNAPSHOT_MAX_BYTES)
    throw new Error('Snapshot unavailable');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Missing snapshot body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > SNAPSHOT_MAX_BYTES) throw new Error('Snapshot too large');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return validateGithubSnapshot(JSON.parse(new TextDecoder().decode(bytes)));
}
class SnapshotRequestError extends Error {
  retryAt: number;
  constructor(retryAt: number) {
    super('Snapshot unavailable');
    this.retryAt = retryAt;
  }
}
/** One shared request per window; failures back off, without visitor REST calls. */
export function createGithubLoader(
  options: {
    fetchImpl?: typeof fetch;
    now?: () => number;
    timeoutMs?: number;
  } = {},
) {
  const request = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  let pending: Promise<GithubLoadResult> | undefined;
  let expires = 0;
  let inFlight = false;
  let failures = 0;
  let last: GithubSnapshot | null = null;
  async function loadUrl(url: string, signal?: AbortSignal) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000);
    try {
      const response = await request(url, {
        signal: controller.signal,
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-cache',
        headers: { Accept: 'application/json' },
      });
      if (response.status === 403 || response.status === 429) {
        const raw = response.headers.get('retry-after');
        const delay = raw && /^\d+$/.test(raw) ? now() + Number(raw) * 1000 : Date.parse(raw ?? '');
        const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
        throw new SnapshotRequestError(
          Math.max(
            now() + GITHUB_REFRESH_MS,
            Number.isFinite(delay) ? delay : 0,
            response.headers.get('x-ratelimit-remaining') === '0' && Number.isFinite(reset)
              ? reset
              : 0,
          ),
        );
      }
      return await readResponse(response);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  }
  return function load({
    signal,
    force = false,
  }: { signal?: AbortSignal; force?: boolean } = {}): Promise<GithubLoadResult> {
    if (pending && (inFlight || (now() < expires && (!force || failures > 0)))) return pending;
    inFlight = true;
    pending = (async () => {
      try {
        const snapshot = await loadUrl(GITHUB_SNAPSHOT_URL, signal);
        signal?.throwIfAborted();
        // Do not let a CDN rollback replace a newer successful response in this session.
        if (
          last?.generatedAt &&
          (!snapshot.generatedAt || Date.parse(snapshot.generatedAt) < Date.parse(last.generatedAt))
        )
          throw new Error('Rollback');
        last = snapshot;
        failures = 0;
        expires = now() + GITHUB_REFRESH_MS;
        return {
          snapshot,
          stale: snapshotIsStale(snapshot, now()),
          source: 'public',
          nextCheckAt: expires,
        } as GithubLoadResult;
      } catch (error) {
        signal?.throwIfAborted();
        failures++;
        expires = Math.max(
          now() + Math.min(GITHUB_REFRESH_MS * 2 ** Math.min(failures - 1, 3), 30 * 60_000),
          error instanceof SnapshotRequestError ? error.retryAt : 0,
        );
        if (last)
          return {
            snapshot: last,
            stale: true,
            source: 'cache',
            nextCheckAt: expires,
          } as GithubLoadResult;
        try {
          const snapshot = await loadUrl('/data/github-snapshot.json', signal);
          signal?.throwIfAborted();
          last = snapshot;
          return {
            snapshot,
            stale: true,
            source: 'bundled',
            nextCheckAt: expires,
          } as GithubLoadResult;
        } catch {
          signal?.throwIfAborted();
          return {
            snapshot: null,
            stale: true,
            source: 'unavailable',
            nextCheckAt: expires,
          } as GithubLoadResult;
        }
      } finally {
        inFlight = false;
        if (signal?.aborted) {
          pending = undefined;
          expires = 0;
        }
      }
    })();
    return pending;
  };
}
export const loadGithubActivity = createGithubLoader();
