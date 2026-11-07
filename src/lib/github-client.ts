import {
  GITHUB_SNAPSHOT_URL, SNAPSHOT_MAX_BYTES, SNAPSHOT_STALE_MS, validateGithubSnapshot,
} from './github-snapshot.ts';
import type { GithubSnapshot } from './github-snapshot.ts';

export type GithubLoadResult = { snapshot: GithubSnapshot | null; stale: boolean; source: 'public' | 'cache' | 'bundled' | 'unavailable' };
export function snapshotIsStale(snapshot: GithubSnapshot, now = Date.now()) {
  return !snapshot.generatedAt || now - Date.parse(snapshot.generatedAt) > SNAPSHOT_STALE_MS ||
    snapshot.repositories.some((entry) => entry.status !== 'ready');
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
  } finally { await reader.cancel().catch(() => {}); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return validateGithubSnapshot(JSON.parse(new TextDecoder().decode(bytes)));
}
/** One bounded request per five-minute session window; no visitor calls api.github.com. */
export function createGithubLoader(options: {
  fetchImpl?: typeof fetch; now?: () => number; timeoutMs?: number;
} = {}) {
  const request = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  let pending: Promise<GithubLoadResult> | undefined;
  let expires = 0;
  let last: GithubSnapshot | null = null;
  async function loadUrl(url: string) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000);
    try {
      return await readResponse(await request(url, {
        signal: controller.signal, credentials: 'omit', redirect: 'error',
        headers: { Accept: 'application/json' },
      }));
    } finally { clearTimeout(timer); }
  }
  return function load(): Promise<GithubLoadResult> {
    if (pending && now() < expires) return pending;
    expires = now() + 5 * 60_000;
    pending = (async () => {
      try {
        const snapshot = await loadUrl(GITHUB_SNAPSHOT_URL);
        // Do not let a CDN rollback replace a newer successful response in this session.
        if (last?.generatedAt && (!snapshot.generatedAt ||
            Date.parse(snapshot.generatedAt) < Date.parse(last.generatedAt))) throw new Error('Rollback');
        last = snapshot;
        return { snapshot, stale: snapshotIsStale(snapshot, now()), source: 'public' } as GithubLoadResult;
      } catch {
        if (last) return { snapshot: last, stale: true, source: 'cache' } as GithubLoadResult;
        try {
          const snapshot = await loadUrl('/data/github-snapshot.json');
          last = snapshot;
          return { snapshot, stale: true, source: 'bundled' } as GithubLoadResult;
        } catch {
          return { snapshot: null, stale: true, source: 'unavailable' } as GithubLoadResult;
        }
      }
    })();
    return pending;
  };
}
export const loadGithubActivity = createGithubLoader();
