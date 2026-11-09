import { SHA, validRef } from '../src/lib/code-relation.ts';
import {
  emptyRecentCommits,
  validateRecentCommits,
  RECENT_COMMIT_LIMIT,
  SENSITIVE_COMMIT_TEXT,
} from '../src/lib/commit-contract.ts';
const clean = (v) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, ' ')
    .replace(new RegExp(SENSITIVE_COMMIT_TEXT.source, 'gi'), '[dado removido]')
    .trim();
const timestamp = (v) =>
  typeof v === 'string' && Number.isFinite(Date.parse(v)) ? new Date(v).toISOString() : null;
function account(v) {
  if (
    !v ||
    !['User', 'Bot'].includes(v.type) ||
    typeof v.login !== 'string' ||
    !/^(?:[a-z\d][a-z\d-]{0,38})(?:\[bot\])?$/i.test(v.login)
  )
    return null;
  const expected = 'https://github.com/' + encodeURIComponent(v.login);
  // GitHub may return literal brackets for bots. Normalize only this exact public profile.
  const app =
    v.type === 'Bot' && v.login.endsWith('[bot]')
      ? 'https://github.com/apps/' + v.login.slice(0, -5)
      : null;
  if (
    v.html_url !== expected &&
    v.html_url !== 'https://github.com/' + v.login &&
    v.html_url !== app
  )
    return null;
  return { login: v.login, type: v.type, url: v.html_url === app ? app : expected };
}
export function normalizeRecentCommits(body, repository) {
  if (!Array.isArray(body) || body.length > RECENT_COMMIT_LIMIT)
    throw Error('Invalid commit slice');
  const items = [];
  const seen = new Set();
  for (const item of body) {
    if (
      !item ||
      !SHA.test(item.sha) ||
      item.html_url !== `https://github.com/${repository}/commit/${item.sha}` ||
      typeof item.commit?.message !== 'string'
    )
      throw Error('Invalid commit source');
    if (seen.has(item.sha)) continue;
    seen.add(item.sha);
    const subject = clean(item.commit.message.split(/\r?\n/).find((s) => s.trim()) ?? '');
    items.push({
      sha: item.sha,
      url: item.html_url,
      subject: subject.slice(0, 240),
      subjectTruncated: subject.length > 240,
      author: account(item.author),
      committer: account(item.committer),
      authoredAt: timestamp(item.commit.author?.date),
      committedAt: timestamp(item.commit.committer?.date),
    });
  }
  return items;
}
export async function collectRecentCommits({ repository, branch, request, cache, previous, at }) {
  const prefix = 'https://api.github.com/repos/' + repository;
  const used = [];
  const unavailable = () => ({ ...emptyRecentCommits(), problem: 'request' });
  function empty() {
    for (const key of Object.keys(cache))
      if (key.startsWith(prefix + '/commits?')) delete cache[key];
    for (const url of used) delete cache[url];
    return {
      ...emptyRecentCommits(),
      state: 'fresh',
      branch,
      checkedAt: at,
      problem: 'empty-repository',
    };
  }
  try {
    if (!validRef(branch)) throw Error('Invalid default branch');
    const refUrl = prefix + '/git/ref/heads/' + encodeURIComponent(branch);
    used.push(refUrl);
    let ref;
    try {
      ref = await request(refUrl, cache[refUrl], true);
    } catch (error) {
      if (error.code !== 'not-found') throw error;
      // A missing ref is not proof of an empty repository. Confirm using the default history.
      const probe = await request(prefix + '/commits?per_page=1', undefined, true);
      if (
        probe.body?.emptyRepository === true ||
        (Array.isArray(probe.body) && probe.body.length === 0)
      )
        return empty();
      throw error;
    }
    if (ref.body?.emptyRepository === true) return empty();
    if (ref.body !== undefined && ref.body.ref !== 'refs/heads/' + branch)
      throw Error('Wrong branch');
    const object = ref.body === undefined ? ref.items?.[0] : ref.body.object;
    if (object?.type !== 'commit' || !SHA.test(object.sha)) throw Error('Invalid HEAD');
    cache[refUrl] = { items: [{ type: 'commit', sha: object.sha }], etag: ref.etag, next: null };
    const url = prefix + '/commits?sha=' + object.sha + '&per_page=' + RECENT_COMMIT_LIMIT;
    used.push(url);
    const response = await request(url, cache[url], true);
    const items =
      response.body === undefined
        ? response.items
        : normalizeRecentCommits(response.body, repository);
    const list = {
      state: 'fresh',
      branch,
      headSha: object.sha,
      checkedAt: at,
      truncated: Boolean(response.next),
      problem: null,
      items,
    };
    validateRecentCommits(list, repository, true);
    cache[url] = { items, etag: response.etag, next: response.next };
    // Retire histories for former HEADs; never mix them after a push/force-push.
    for (const key of Object.keys(cache))
      if (key.startsWith(prefix + '/commits?') && key !== url) delete cache[key];
    return list;
  } catch (error) {
    for (const url of used) delete cache[url];
    if (previous?.checkedAt) {
      validateRecentCommits(previous, repository, true);
      return {
        ...previous,
        state: 'stale',
        problem: error.code === 'rate-limit' ? 'rate-limit' : 'request',
      };
    }
    return { ...unavailable(), problem: error.code === 'rate-limit' ? 'rate-limit' : 'request' };
  }
}
