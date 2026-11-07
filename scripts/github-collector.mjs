import {
  GITHUB_REPOSITORIES, ACTIVITY_KINDS, PAGE_SIZE, MAX_PAGES,
  emptyGithubSnapshot, emptyRepository, validateGithubSnapshot,
} from '../src/lib/github-snapshot.ts';

const API = 'https://api.github.com/repos/';
const RESPONSE_LIMIT = 2_000_000;
const REQUEST_LIMIT = GITHUB_REPOSITORIES.length * (1 + ACTIVITY_KINDS.length * MAX_PAGES);
const safeText = (value, max) => String(value ?? '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email removido]').slice(0, max);
const count = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const timestamp = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value))
  ? new Date(value).toISOString() : null;
class RequestError extends Error {
  constructor(code) { super(code); this.code = code; }
}
function nextPage(header, current) {
  const match = header?.match(/<([^>]+)>;\s*rel="next"/);
  if (!match) return null;
  const next = new URL(match[1]);
  const here = new URL(current);
  const page = Number(next.searchParams.get('page'));
  if (next.origin !== here.origin || next.pathname !== here.pathname ||
      !Number.isInteger(page) || page < 2 ||
      next.searchParams.get('per_page') !== String(PAGE_SIZE) ||
      [...next.searchParams.keys()].some((key) =>
        !['page', 'per_page', 'state', 'sort', 'direction', 'anon'].includes(key)))
    throw new RequestError('pagination');
  for (const [key, value] of here.searchParams)
    if (key !== 'page' && next.searchParams.get(key) !== value) throw new RequestError('pagination');
  return next.href;
}
function normalizeItems(kind, body) {
  if (!Array.isArray(body) || body.length > PAGE_SIZE) throw new RequestError('shape');
  return body.filter((item) => item && (kind !== 'issues' || !item.pull_request))
    .filter((item) => kind !== 'contributors' || (item.type === 'User' &&
      /^[a-z\d][a-z\d-]{0,38}$/i.test(item.login ?? '')))
    .map((item) => ({
      id: safeText(kind === 'contributors' ? item.login : item.number, 100),
      title: safeText(kind === 'contributors' ? item.login : item.title, 200),
      url: item.html_url,
      updatedAt: kind === 'issues' || kind === 'pulls' ? timestamp(item.updated_at) : null,
      count: kind === 'contributors' ? count(item.contributions)
        : kind === 'milestones' ? count(item.open_issues) : null,
    }));
}
async function boundedJson(response) {
  if (Number(response.headers.get('content-length')) > RESPONSE_LIMIT) throw new RequestError('size');
  const reader = response.body?.getReader();
  if (!reader) throw new RequestError('body');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > RESPONSE_LIMIT) throw new RequestError('size');
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Only normalized public fields enter the cache; raw GitHub responses never reach disk. */
export async function collectGithub({
  fetchImpl = fetch, token = '', previous = emptyGithubSnapshot(), cache = {},
  now = () => Date.now(), timeoutMs = 10_000,
} = {}) {
  previous = validateGithubSnapshot(previous);
  if (previous.retryAt && Date.parse(previous.retryAt) > now())
    return { snapshot: previous, cache, requests: 0 };
  const at = new Date(now()).toISOString();
  let retryAt = null;
  let requests = 0;
  const pages = cache && typeof cache === 'object' && !Array.isArray(cache) ? { ...cache } : {};
  // Discard keys outside the exact authorized REST namespaces.
  for (const key of Object.keys(pages)) {
    if (!GITHUB_REPOSITORIES.some((repository) => key.startsWith(API + repository + '/')))
      delete pages[key];
  }
  async function request(url, old) {
    if (retryAt || requests >= REQUEST_LIMIT) throw new RequestError('rate-limit');
    requests++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'OpenStruct-public-snapshot' };
      if (token) headers.Authorization = 'Bearer ' + token;
      if (old?.etag && typeof old.etag === 'string' && old.etag.length < 200 &&
          !/[\r\n]/.test(old.etag)) headers['If-None-Match'] = old.etag;
      const response = await fetchImpl(url, { headers, signal: controller.signal, redirect: 'error' });
      if (response.status === 403 || response.status === 429) {
        const raw = response.headers.get('retry-after');
        const delay = raw && /^\d+$/.test(raw) ? now() + Number(raw) * 1000 : Date.parse(raw ?? '');
        const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
        retryAt = new Date(Math.max(now() + 60_000,
          Number.isFinite(delay) ? delay : 0,
          response.headers.get('x-ratelimit-remaining') === '0' && Number.isFinite(reset) ? reset : 0))
          .toISOString();
        throw new RequestError('rate-limit');
      }
      if (response.status === 304) {
        if (!old || !Array.isArray(old.items)) throw new RequestError('cache');
        return { items: old.items, next: old.next ?? null, etag: old.etag };
      }
      if (!response.ok) throw new RequestError('request');
      const body = await boundedJson(response);
      const etag = response.headers.get('etag');
      const next = nextPage(response.headers.get('link'), url);
      if (response.headers.get('x-ratelimit-remaining') === '0') {
        const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
        retryAt = new Date(Math.max(now() + 60_000, reset || 0)).toISOString();
      }
      return { body, etag, next };
    } catch (error) {
      throw error instanceof RequestError ? error : new RequestError('request');
    } finally { clearTimeout(timer); }
  }
  const repositories = [];
  for (const repository of GITHUB_REPOSITORIES) {
    const prefix = API + repository;
    const old = previous.repositories.find((entry) => entry.repository === repository);
    const entry = emptyRepository(repository);
    try {
      // Deliberately unconditional: an old ETag is not a current visibility confirmation.
      const { body } = await request(prefix);
      if (!body || body.private !== false || body.visibility !== 'public' ||
          body.full_name !== repository || body.html_url !== 'https://github.com/' + repository)
        throw new RequestError('visibility');
      entry.visibility = 'public';
      entry.verifiedPublicAt = at;
      entry.status = 'ready';
      entry.problem = null;
      entry.lastSuccessAt = old?.lastSuccessAt ?? null;
      entry.summary = { name: safeText(body.name, 100), description: safeText(body.description, 350),
        url: body.html_url, stars: count(body.stargazers_count), forks: count(body.forks_count),
        openIssuesAndPullRequests: count(body.open_issues_count),
        defaultBranch: safeText(body.default_branch, 100) };
      for (const kind of ACTIVITY_KINDS) {
        try {
          const query = kind === 'contributors' ? 'anon=false'
            : kind === 'milestones' ? 'state=open&sort=due_on&direction=asc'
              : 'state=open&sort=updated&direction=desc';
          let url = prefix + '/' + kind + '?per_page=' + PAGE_SIZE + '&page=1&' + query;
          const items = [];
          const seenPages = new Set();
          for (let page = 0; page < MAX_PAGES; page++) {
            if (seenPages.has(url)) throw new RequestError('pagination');
            seenPages.add(url);
            const response = await request(url, pages[url]);
            const normalized = response.body === undefined
              ? response.items : normalizeItems(kind, response.body);
            pages[url] = { items: normalized, etag: response.etag, next: response.next };
            items.push(...normalized);
            if (!response.next) { url = ''; break; }
            // Validate cached next links as well as new Link headers.
            url = nextPage('<' + response.next + '>; rel="next"', url);
          }
          entry.lists[kind] = { state: 'fresh', checkedAt: at, truncated: Boolean(url),
            items: [...new Map(items.map((item) => [item.id, item])).values()] };
          validateGithubSnapshot({ schemaVersion: 1, generatedAt: at, retryAt: null,
            repositories: GITHUB_REPOSITORIES.map((id) => id === repository
              ? { ...entry, status: 'partial' } : emptyRepository(id)) });
        } catch (error) {
          const last = old?.visibility === 'public' ? old.lists[kind] : null;
          entry.lists[kind] = last?.checkedAt
            ? { ...last, state: 'stale' } : emptyRepository(repository).lists[kind];
          for (const key of Object.keys(pages))
            if (key.startsWith(prefix + '/' + kind + '?')) delete pages[key];
          entry.status = 'partial';
          entry.problem = error.code === 'rate-limit' ? 'rate-limit' : 'request';
        }
      }
      if (entry.status === 'ready') entry.lastSuccessAt = at;
    } catch (error) {
      // Fail closed: inability to reconfirm visibility removes even the previous public data.
      entry.problem = error.code === 'rate-limit' ? 'rate-limit' : 'visibility';
      for (const key of Object.keys(pages)) if (key.startsWith(prefix + '/')) delete pages[key];
    }
    repositories.push(entry);
  }
  const snapshot = validateGithubSnapshot({ schemaVersion: 1, generatedAt: at, retryAt, repositories });
  // Keep only pages actually visited in this cycle or used by a retained public repository.
  return { snapshot, cache: pages, requests };
}
