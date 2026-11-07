import { readFile } from 'node:fs/promises';
import { setTimeout as pause } from 'node:timers/promises';
import { validateGithubSnapshot } from '../src/lib/github-snapshot.ts';

const repository = 'ricardocorsini/openstruct-front';
const branch = 'github-data';
const raw = await readFile('out/snapshot.json', 'utf8');
if (Buffer.byteLength(raw) > 400_000) throw new Error('Snapshot too large');
const snapshot = validateGithubSnapshot(JSON.parse(raw));
if (!snapshot.generatedAt) throw new Error('Cannot publish an uncollected snapshot');
const token = process.env.GH_WRITE_TOKEN;
if (!token) throw new Error('Missing publication credential');
async function api(path, method = 'GET', data) {
  const response = await fetch('https://api.github.com/repos/' + repository + path, {
    method, redirect: 'error', signal: AbortSignal.timeout(15_000),
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (response.status === 404 && method === 'GET') return null;
  if (!response.ok) throw new Error('Snapshot publication failed: HTTP ' + response.status);
  const result = await response.json();
  if (method !== 'GET') await pause(1000);
  return result;
}
const ref = await api('/git/ref/heads/' + branch);
if (ref) {
  const file = await api('/contents/snapshot.json?ref=' + branch);
  if (file?.encoding === 'base64' && Buffer.from(file.content, 'base64').toString('utf8') === raw) {
    console.log('Snapshot unchanged.');
    process.exit(0);
  }
}
const blob = await api('/git/blobs', 'POST', { content: raw, encoding: 'utf-8' });
// No base tree: the public data branch contains exactly one validated JSON file.
const tree = await api('/git/trees', 'POST', {
  tree: [{ path: 'snapshot.json', mode: '100644', type: 'blob', sha: blob.sha }],
});
const commit = await api('/git/commits', 'POST', {
  message: 'data: refresh public GitHub snapshot',
  tree: tree.sha, parents: ref ? [ref.object.sha] : [],
});
if (ref) await api('/git/refs/heads/' + branch, 'PATCH', { sha: commit.sha, force: false });
else await api('/git/refs', 'POST', { ref: 'refs/heads/' + branch, sha: commit.sha });
console.log('Validated public snapshot published to github-data.');
