import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { validateGithubSnapshot, SNAPSHOT_MAX_BYTES } from '../src/lib/github-snapshot.ts';

const repository = 'ricardocorsini/openstruct-front';
const branch = 'github-data';
// The data branch must carry its own config: Vercel reads the pushed branch,
// and every publication replaces the complete tree without a base tree.
export const DATA_BRANCH_VERCEL_CONFIG =
  JSON.stringify(
    { $schema: 'https://openapi.vercel.sh/vercel.json', git: { deploymentEnabled: false } },
    null,
    2,
  ) + '\n';

export async function publishGithubSnapshot({ raw, token, request = fetch, wait = pause }) {
  if (Buffer.byteLength(raw) > SNAPSHOT_MAX_BYTES) throw new Error('Snapshot too large');
  const snapshot = validateGithubSnapshot(JSON.parse(raw));
  if (!snapshot.generatedAt) throw new Error('Cannot publish an uncollected snapshot');
  if (!token) throw new Error('Missing publication credential');

  async function api(path, method = 'GET', data) {
    const response = await request('https://api.github.com/repos/' + repository + path, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (response.status === 404 && method === 'GET') return null;
    if (!response.ok) throw new Error('Snapshot publication failed: HTTP ' + response.status);
    const result = await response.json();
    if (method !== 'GET') await wait(1000);
    return result;
  }
  const matches = (file, content) =>
    file?.encoding === 'base64' && Buffer.from(file.content, 'base64').toString('utf8') === content;

  const ref = await api('/git/ref/heads/' + branch);
  if (ref) {
    // Pin both reads to the same parent, even if another publisher advances the branch.
    const revision = ref.object.sha;
    const file = await api('/contents/snapshot.json?ref=' + revision);
    const config = await api('/contents/vercel.json?ref=' + revision);
    if (matches(file, raw) && matches(config, DATA_BRANCH_VERCEL_CONFIG)) return false;
  }
  const blob = await api('/git/blobs', 'POST', { content: raw, encoding: 'utf-8' });
  const configBlob = await api('/git/blobs', 'POST', {
    content: DATA_BRANCH_VERCEL_CONFIG,
    encoding: 'utf-8',
  });
  // No base tree: publish only the validated snapshot and this fixed, inert control file.
  const tree = await api('/git/trees', 'POST', {
    tree: [
      { path: 'snapshot.json', mode: '100644', type: 'blob', sha: blob.sha },
      { path: 'vercel.json', mode: '100644', type: 'blob', sha: configBlob.sha },
    ],
  });
  const commit = await api('/git/commits', 'POST', {
    message: 'data: refresh public GitHub snapshot',
    tree: tree.sha,
    parents: ref ? [ref.object.sha] : [],
  });
  if (ref) await api('/git/refs/heads/' + branch, 'PATCH', { sha: commit.sha, force: false });
  else await api('/git/refs', 'POST', { ref: 'refs/heads/' + branch, sha: commit.sha });
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const changed = await publishGithubSnapshot({
    raw: await readFile('out/snapshot.json', 'utf8'),
    token: process.env.GH_WRITE_TOKEN,
  });
  console.log(
    changed
      ? 'Validated public snapshot published to github-data; Vercel deployment disabled.'
      : 'Snapshot and data-branch deployment policy unchanged.',
  );
}
