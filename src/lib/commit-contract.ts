import { SHA, validRef } from './code-relation.ts';
export const RECENT_COMMIT_LIMIT = 30;
export const COMMIT_PAGE_SIZE = 5;
export type CommitAccount = { login: string; type: 'User' | 'Bot'; url: string };
export type RecentCommit = {
  sha: string;
  url: string;
  subject: string;
  subjectTruncated: boolean;
  author: CommitAccount | null;
  committer: CommitAccount | null;
  authoredAt: string | null;
  committedAt: string | null;
};
export type RecentCommits = {
  state: 'fresh' | 'stale' | 'unavailable';
  checkedAt: string | null;
  branch: string | null;
  headSha: string | null;
  truncated: boolean;
  problem: 'request' | 'rate-limit' | 'empty-repository' | null;
  items: RecentCommit[];
};
export function emptyRecentCommits(): RecentCommits {
  return {
    state: 'unavailable',
    checkedAt: null,
    branch: null,
    headSha: null,
    truncated: false,
    problem: null,
    items: [],
  };
}
function record(v: unknown, keys: string[]): Record<string, unknown> {
  if (
    !v ||
    typeof v !== 'object' ||
    Array.isArray(v) ||
    Object.keys(v).length !== keys.length ||
    Object.keys(v).some((k) => !keys.includes(k))
  )
    throw Error('Invalid commit metadata');
  return v as Record<string, unknown>;
}
const controls = /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/;
export const SENSITIVE_COMMIT_TEXT =
  /[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:gh[pousr]_[a-z0-9_]{16,}|github_pat_[a-z0-9_]{16,}|sk-[a-z0-9_-]{16,}|AKIA[A-Z0-9]{16})\b|\b(?:password|senha|token|secret|api[_-]?key)\s*[:=]\s*["']?[^\s"'`,;]{6,}|\bBearer\s+[a-z0-9._~+\/-]{12,}={0,2}/i;
function date(v: unknown) {
  if (
    v !== null &&
    (typeof v !== 'string' ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(v) ||
      !Number.isFinite(Date.parse(v)))
  )
    throw Error('Invalid commit date');
}
function account(v: unknown) {
  if (v === null) return;
  const a = record(v, ['login', 'type', 'url']);
  if (
    typeof a.login !== 'string' ||
    !/^(?:[a-z\d][a-z\d-]{0,38})(?:\[bot\])?$/i.test(a.login) ||
    !['User', 'Bot'].includes(String(a.type)) ||
    (a.url !== `https://github.com/${encodeURIComponent(a.login)}` &&
      !(
        a.type === 'Bot' &&
        String(a.login).endsWith('[bot]') &&
        a.url === `https://github.com/apps/${String(a.login).slice(0, -5)}`
      ))
  )
    throw Error('Invalid public commit account');
}
export function validateRecentCommits(
  value: unknown,
  repository: string,
  publicSource: boolean,
): asserts value is RecentCommits {
  const c = record(value, [
    'state',
    'checkedAt',
    'branch',
    'headSha',
    'truncated',
    'problem',
    'items',
  ]);
  if (
    !['fresh', 'stale', 'unavailable'].includes(String(c.state)) ||
    typeof c.truncated !== 'boolean' ||
    ![null, 'request', 'rate-limit', 'empty-repository'].includes(c.problem as string | null) ||
    !Array.isArray(c.items) ||
    c.items.length > RECENT_COMMIT_LIMIT
  )
    throw Error('Invalid commit collection');
  date(c.checkedAt);
  if (c.state === 'unavailable') {
    if (
      c.checkedAt !== null ||
      c.branch !== null ||
      c.headSha !== null ||
      c.items.length ||
      c.truncated ||
      c.problem === 'empty-repository'
    )
      throw Error('Uncollected commits cannot imply empty history');
  } else {
    if (!publicSource || !c.checkedAt || !validRef(c.branch))
      throw Error('Unconfirmed commit source');
    if (c.problem === 'empty-repository') {
      if (c.headSha !== null || c.items.length || c.truncated)
        throw Error('Invalid empty repository');
    } else if (
      typeof c.headSha !== 'string' ||
      !SHA.test(c.headSha) ||
      !c.items.length ||
      !c.items.some((i) => i.sha === c.headSha)
    )
      throw Error('Missing pinned HEAD');
  }
  if (!publicSource && c.state !== 'unavailable') throw Error('Nonpublic commits');
  const seen = new Set();
  for (const raw of c.items) {
    const i = record(raw, [
      'sha',
      'url',
      'subject',
      'subjectTruncated',
      'author',
      'committer',
      'authoredAt',
      'committedAt',
    ]);
    if (
      typeof i.sha !== 'string' ||
      !SHA.test(i.sha) ||
      seen.has(i.sha) ||
      i.url !== `https://github.com/${repository}/commit/${i.sha}` ||
      typeof i.subject !== 'string' ||
      i.subject.length > 240 ||
      controls.test(i.subject) ||
      SENSITIVE_COMMIT_TEXT.test(i.subject) ||
      typeof i.subjectTruncated !== 'boolean'
    )
      throw Error('Invalid public commit');
    seen.add(i.sha);
    account(i.author);
    account(i.committer);
    date(i.authoredAt);
    date(i.committedAt);
  }
}
