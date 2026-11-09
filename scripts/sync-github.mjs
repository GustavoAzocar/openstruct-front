import { loadPublicCatalog } from '../src/lib/catalog.ts';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { collectGithub } from './github-collector.mjs';
import {
  emptyGithubSnapshot,
  validateGithubSnapshot,
  SNAPSHOT_MAX_BYTES,
} from '../src/lib/github-snapshot.ts';

const output = resolve(process.env.GITHUB_SNAPSHOT_OUTPUT || 'out/snapshot.json');
const cacheFile = resolve('.cache/github/pages.json');
async function readJson(path, fallback, limit) {
  try {
    const raw = await readFile(path, 'utf8');
    if (Buffer.byteLength(raw) > limit) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
let previous;
try {
  previous = validateGithubSnapshot(
    await readJson('previous/snapshot.json', emptyGithubSnapshot(), SNAPSHOT_MAX_BYTES),
  );
} catch {
  previous = emptyGithubSnapshot();
}
const cache = await readJson(cacheFile, {}, 2_000_000);
let envelope = null;
try {
  envelope = (await loadPublicCatalog()).envelope;
} catch {
  /* Retain only marked stale comparisons, if visibility is confirmed. */
}
const result = await collectGithub({
  includeCodeRelations: true,
  includeRecentCommits: true,
  catalogEnvelope: envelope,
  previous,
  cache,
  includeDiscussions: true,
  token: process.env.GH_READ_TOKEN || '',
});
await mkdir(resolve(output, '..'), { recursive: true });
await mkdir(resolve(cacheFile, '..'), { recursive: true });
const json = JSON.stringify(validateGithubSnapshot(result.snapshot)) + '\n';
await writeFile(output + '.tmp', json);
await rename(output + '.tmp', output);
await writeFile(cacheFile, JSON.stringify(result.cache));
console.log(
  'Public snapshot validated. Requests: ' +
    result.requests +
    '; ready repositories: ' +
    result.snapshot.repositories.filter((entry) => entry.status === 'ready').length,
);
