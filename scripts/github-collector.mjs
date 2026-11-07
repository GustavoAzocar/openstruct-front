import {
  GITHUB_REPOSITORIES,
  ACTIVITY_KINDS,
  PAGE_SIZE,
  MAX_PAGES,
  emptyGithubSnapshot,
  emptyRepository,
  emptyRelease,
  emptyIssueCollection,
  ISSUE_STATES,
  validateGithubSnapshot,
} from '../src/lib/github-snapshot.ts';

const API = 'https://api.github.com/repos/';
const RESPONSE_LIMIT = 2_000_000;
const REQUEST_LIMIT = GITHUB_REPOSITORIES.length * (2 + (ACTIVITY_KINDS.length + 1) * MAX_PAGES);
const safeText = (value, max) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email removido]')
    .slice(0, max);
const count = (value) => (Number.isSafeInteger(value) && value >= 0 ? value : 0);
const timestamp = (value) =>
  typeof value === 'string' && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : null;
class RequestError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
function nextPage(header, current) {
  const match = header?.match(/<([^>]+)>;\s*rel="next"/);
  if (!match) return null;
  const next = new URL(match[1]);
  const here = new URL(current);
  const page = Number(next.searchParams.get('page'));
  if (
    next.origin !== here.origin ||
    next.pathname !== here.pathname ||
    !Number.isInteger(page) ||
    page < 2 ||
    next.searchParams.get('per_page') !== String(PAGE_SIZE) ||
    [...next.searchParams.keys()].some(
      (key) => !['page', 'per_page', 'state', 'sort', 'direction', 'anon'].includes(key),
    )
  )
    throw new RequestError('pagination');
  for (const [key, value] of here.searchParams)
    if (key !== 'page' && next.searchParams.get(key) !== value)
      throw new RequestError('pagination');
  return next.href;
}
function normalizeItems(kind, body) {
  if (!Array.isArray(body) || body.length > PAGE_SIZE) throw new RequestError('shape');
  return body
    .filter((item) => item && (kind !== 'issues' || !Object.hasOwn(item, 'pull_request')))
    .filter(
      (item) =>
        kind !== 'contributors' ||
        (item.type === 'User' && /^[a-z\d][a-z\d-]{0,38}$/i.test(item.login ?? '')),
    )
    .map((item) => ({
      id: safeText(kind === 'contributors' ? item.login : item.number, 100),
      title: safeText(kind === 'contributors' ? item.login : item.title, 200),
      url: item.html_url,
      updatedAt: kind === 'issues' || kind === 'pulls' ? timestamp(item.updated_at) : null,
      ...(kind === 'pulls' ? { pull: normalizePull(item) } : {}),
      count:
        kind === 'contributors'
          ? count(item.contributions)
          : kind === 'milestones'
            ? count(item.open_issues)
            : null,
    }));
}
function normalizePull(item) {
  if (item.state !== 'open' && item.state !== 'closed') throw new RequestError('pull');
  const author = item.user?.login;
  const mergedAt = timestamp(item.merged_at);
  if (item.merged_at != null && !mergedAt) throw new RequestError('pull');
  return {
    state: item.state,
    draft: typeof item.draft === 'boolean' ? item.draft : null,
    mergeKnown: Object.hasOwn(item, 'merged_at'),
    mergedAt,
    createdAt: timestamp(item.created_at),
    closedAt: timestamp(item.closed_at),
    author:
      typeof author === 'string' && /^[a-z\d][a-z\d-]{0,38}(?:\[bot\])?$/i.test(author)
        ? author
        : null,
    head: typeof item.head?.ref === 'string' ? safeText(item.head.ref, 100) : null,
    base: typeof item.base?.ref === 'string' ? safeText(item.base.ref, 100) : null,
  };
}
function normalizeIssues(body, scope) {
  if (!Array.isArray(body) || body.length > PAGE_SIZE) throw new RequestError('shape');
  return body
    .filter((item) => item && !Object.hasOwn(item, 'pull_request'))
    .map((item) => {
      if (!Number.isSafeInteger(item.number) || item.number < 1 || item.state !== scope)
        throw new RequestError('issue');
      const names = Array.isArray(item.labels)
        ? item.labels.map((label) => (typeof label === 'string' ? label : label?.name))
        : null;
      // Preserve exact real label names; privacy/size failures are unknown, never invented labels.
      const labels =
        names &&
        names.length <= 30 &&
        names.every(
          (name) =>
            typeof name === 'string' && name && name.length <= 100 && safeText(name, 100) === name,
        )
          ? [...new Set(names)]
          : null;
      const login = item.user?.login;
      let author = null;
      if (typeof login === 'string' && /^[a-z\d][a-z\d-]{0,38}(?:\[bot\])?$/i.test(login)) {
        const url = item.user.html_url;
        author = {
          login,
          url:
            url === 'https://github.com/' + login ||
            (login.endsWith('[bot]') && url === 'https://github.com/apps/' + login.slice(0, -5))
              ? url
              : null,
        };
      }
      return {
        number: item.number,
        title: safeText(item.title, 200),
        state: scope,
        url: item.html_url,
        updatedAt: timestamp(item.updated_at),
        labels,
        author,
        comments: Number.isSafeInteger(item.comments) && item.comments >= 0 ? item.comments : null,
      };
    });
}
function normalizeRelease(body) {
  if (body === null) return null; // A 404 from /releases/latest confirms absence of a stable release.
  if (
    !body ||
    Array.isArray(body) ||
    body.draft !== false ||
    body.prerelease !== false ||
    typeof body.tag_name !== 'string' ||
    !timestamp(body.published_at)
  )
    throw new RequestError('release');
  return {
    tag: safeText(body.tag_name, 100),
    name: safeText(body.name || body.tag_name, 200),
    url: body.html_url,
    publishedAt: timestamp(body.published_at),
  };
}
async function boundedJson(response) {
  if (Number(response.headers.get('content-length')) > RESPONSE_LIMIT)
    throw new RequestError('size');
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
  } finally {
    await reader.cancel().catch(() => {});
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Only normalized public fields enter the cache; raw GitHub responses never reach disk. */
export async function collectGithub({
  fetchImpl = fetch,
  token = '',
  previous = emptyGithubSnapshot(),
  cache = {},
  now = () => Date.now(),
  timeoutMs = 10_000,
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
      const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'OpenStruct-public-snapshot',
      };
      if (token) headers.Authorization = 'Bearer ' + token;
      if (
        old?.etag &&
        typeof old.etag === 'string' &&
        old.etag.length < 200 &&
        !/[\r\n]/.test(old.etag)
      )
        headers['If-None-Match'] = old.etag;
      const response = await fetchImpl(url, {
        headers,
        signal: controller.signal,
        redirect: 'error',
      });
      if (response.status === 403 || response.status === 429) {
        const raw = response.headers.get('retry-after');
        const delay = raw && /^\d+$/.test(raw) ? now() + Number(raw) * 1000 : Date.parse(raw ?? '');
        const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
        retryAt = new Date(
          Math.max(
            now() + 60_000,
            Number.isFinite(delay) ? delay : 0,
            response.headers.get('x-ratelimit-remaining') === '0' && Number.isFinite(reset)
              ? reset
              : 0,
          ),
        ).toISOString();
        throw new RequestError('rate-limit');
      }
      if (response.status === 304) {
        if (!old || !Array.isArray(old.items)) throw new RequestError('cache');
        return { items: old.items, next: old.next ?? null, etag: old.etag };
      }
      if (response.status === 404 && url.endsWith('/releases/latest'))
        return { body: null, etag: null, next: null };
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
    } finally {
      clearTimeout(timer);
    }
  }
  const repositories = [];
  for (const repository of GITHUB_REPOSITORIES) {
    const prefix = API + repository;
    const old = previous.repositories.find((entry) => entry.repository === repository);
    const entry = emptyRepository(repository);
    try {
      // Deliberately unconditional: an old ETag is not a current visibility confirmation.
      const { body } = await request(prefix);
      if (
        !body ||
        body.private !== false ||
        body.visibility !== 'public' ||
        body.full_name !== repository ||
        body.html_url !== 'https://github.com/' + repository
      )
        throw new RequestError('visibility');
      entry.visibility = 'public';
      entry.verifiedPublicAt = at;
      entry.status = 'ready';
      entry.problem = null;
      entry.lastSuccessAt = old?.lastSuccessAt ?? null;
      entry.summary = {
        name: safeText(body.name, 100),
        description: safeText(body.description, 350),
        url: body.html_url,
        stars: count(body.stargazers_count),
        forks: count(body.forks_count),
        openIssuesAndPullRequests: count(body.open_issues_count),
        defaultBranch: safeText(body.default_branch, 100),
      };
      for (const kind of ACTIVITY_KINDS) {
        if (kind === 'issues') continue;
        try {
          const query =
            kind === 'contributors'
              ? 'anon=false'
              : kind === 'milestones'
                ? 'state=open&sort=due_on&direction=asc'
                : 'state=all&sort=updated&direction=desc';
          let url = prefix + '/' + kind + '?per_page=' + PAGE_SIZE + '&page=1&' + query;
          const items = [];
          const seenPages = new Set();
          for (let page = 0; page < MAX_PAGES; page++) {
            if (seenPages.has(url)) throw new RequestError('pagination');
            seenPages.add(url);
            const response = await request(url, pages[url]);
            const normalized =
              response.body === undefined ? response.items : normalizeItems(kind, response.body);
            pages[url] = { items: normalized, etag: response.etag, next: response.next };
            items.push(...normalized);
            if (!response.next) {
              url = '';
              break;
            }
            // Validate cached next links as well as new Link headers.
            url = nextPage('<' + response.next + '>; rel="next"', url);
          }
          entry.lists[kind] = {
            state: 'fresh',
            checkedAt: at,
            truncated: Boolean(url),
            items: [...new Map(items.map((item) => [item.id, item])).values()],
          };
          validateGithubSnapshot({
            schemaVersion: 4,
            generatedAt: at,
            retryAt: null,
            repositories: GITHUB_REPOSITORIES.map((id) =>
              id === repository ? { ...entry, status: 'partial' } : emptyRepository(id),
            ),
          });
        } catch (error) {
          const last = old?.visibility === 'public' ? old.lists[kind] : null;
          entry.lists[kind] = last?.checkedAt
            ? { ...last, state: 'stale' }
            : emptyRepository(repository).lists[kind];
          for (const key of Object.keys(pages))
            if (key.startsWith(prefix + '/' + kind + '?')) delete pages[key];
          entry.status = 'partial';
          entry.problem = error.code === 'rate-limit' ? 'rate-limit' : 'request';
        }
      }
      for (const scope of ISSUE_STATES) {
        const firstUrl =
          prefix +
          '/issues?per_page=' +
          PAGE_SIZE +
          '&page=1&state=' +
          scope +
          '&sort=updated&direction=desc';
        try {
          let url = firstUrl;
          const items = [];
          const seenPages = new Set();
          for (let page = 0; page < MAX_PAGES; page++) {
            if (seenPages.has(url)) throw new RequestError('pagination');
            seenPages.add(url);
            const response = await request(url, pages[url]);
            const normalized =
              response.body === undefined ? response.items : normalizeIssues(response.body, scope);
            pages[url] = { items: normalized, etag: response.etag, next: response.next };
            items.push(...normalized);
            if (!response.next) {
              url = '';
              break;
            }
            url = nextPage('<' + response.next + '>; rel="next"', url);
          }
          entry.issueDetails[scope] = {
            state: 'fresh',
            checkedAt: at,
            truncated: Boolean(url),
            items: [...new Map(items.map((item) => [item.number, item])).values()],
          };
          validateGithubSnapshot({
            schemaVersion: 4,
            generatedAt: at,
            retryAt: null,
            repositories: GITHUB_REPOSITORIES.map((id) =>
              id === repository
                ? {
                    ...entry,
                    status: 'partial',
                    issueDetails: {
                      ...entry.issueDetails,
                      [scope === 'open' ? 'closed' : 'open']: emptyIssueCollection(),
                    },
                  }
                : emptyRepository(id),
            ),
          });
        } catch (error) {
          const last = old?.visibility === 'public' ? old.issueDetails[scope] : null;
          entry.issueDetails[scope] = last?.checkedAt
            ? { ...last, state: 'stale' }
            : emptyIssueCollection();
          for (const key of Object.keys(pages))
            if (
              key.startsWith(prefix + '/issues?') &&
              new URL(key).searchParams.get('state') === scope
            )
              delete pages[key];
          entry.status = 'partial';
          entry.problem = error.code === 'rate-limit' ? 'rate-limit' : 'request';
        }
      }
      // An issue can close/reopen between the two requests. Prefer fresh evidence, then the latest update.
      const owners = new Map();
      for (const scope of ISSUE_STATES)
        for (const issue of entry.issueDetails[scope].items) {
          const candidate = { issue, scope, fresh: entry.issueDetails[scope].state === 'fresh' };
          const last = owners.get(issue.number);
          if (
            !last ||
            (candidate.fresh && !last.fresh) ||
            (candidate.fresh === last.fresh &&
              (Date.parse(issue.updatedAt ?? '') || 0) >=
                (Date.parse(last.issue.updatedAt ?? '') || 0))
          )
            owners.set(issue.number, candidate);
        }
      for (const scope of ISSUE_STATES)
        entry.issueDetails[scope].items = entry.issueDetails[scope].items.filter(
          (issue) => owners.get(issue.number).scope === scope,
        );
      // Keep the OSF-18 open summary coherent, without a second API request or double counting.
      const open = entry.issueDetails.open;
      entry.lists.issues = {
        state: open.state,
        checkedAt: open.checkedAt,
        truncated: open.truncated,
        items: open.items.map((item) => ({
          id: String(item.number),
          title: item.title,
          url: item.url,
          updatedAt: item.updatedAt,
          count: null,
        })),
      };
      const releaseUrl = prefix + '/releases/latest';
      try {
        const response = await request(releaseUrl, pages[releaseUrl]);
        if (response.items && response.items.length > 1) throw new RequestError('release');
        const item =
          response.body === undefined
            ? (response.items[0] ?? null)
            : normalizeRelease(response.body);
        entry.release = { state: 'fresh', checkedAt: at, item };
        validateGithubSnapshot({
          schemaVersion: 4,
          generatedAt: at,
          retryAt: null,
          repositories: GITHUB_REPOSITORIES.map((id) =>
            id === repository ? { ...entry, status: 'partial' } : emptyRepository(id),
          ),
        });
        pages[releaseUrl] = { items: item ? [item] : [], etag: response.etag, next: null };
      } catch (error) {
        entry.release =
          old?.visibility === 'public' && old.release.checkedAt
            ? { ...old.release, state: 'stale' }
            : emptyRelease();
        delete pages[releaseUrl];
        entry.status = 'partial';
        entry.problem = error.code === 'rate-limit' ? 'rate-limit' : 'request';
      }
      if (entry.status === 'ready') entry.lastSuccessAt = at;
    } catch (error) {
      // Fail closed: inability to reconfirm visibility removes even the previous public data.
      entry.problem = error.code === 'rate-limit' ? 'rate-limit' : 'visibility';
      for (const key of Object.keys(pages)) if (key.startsWith(prefix + '/')) delete pages[key];
    }
    repositories.push(entry);
  }
  const snapshot = validateGithubSnapshot({
    schemaVersion: 4,
    generatedAt: at,
    retryAt,
    repositories,
  });
  // Keep only pages actually visited in this cycle or used by a retained public repository.
  return { snapshot, cache: pages, requests };
}
