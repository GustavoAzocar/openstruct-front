export const DISCUSSION_LIMIT = 2;
export const COMMENT_LIMIT = 5;
export type PublicComment = {
  id: number;
  body: string;
  bodyTruncated: boolean;
  author: string | null;
  url: string;
  createdAt: string | null;
  updatedAt: string | null;
  path: string | null;
  line: number | null;
};
export type CommentSample = {
  state: 'fresh' | 'unavailable';
  checkedAt: string | null;
  truncated: boolean;
  items: PublicComment[];
};
export type PublicDiscussion = {
  kind: 'issue' | 'pull';
  number: number;
  title: string;
  url: string;
  state: 'available' | 'unavailable';
  checkedAt: string;
  body: string | null;
  bodyTruncated: boolean;
  conversation: CommentSample;
  review: CommentSample | null;
};
export function emptyComments(): CommentSample {
  return { state: 'unavailable', checkedAt: null, truncated: false, items: [] };
}
function requireValue(value: unknown): asserts value {
  if (!value) throw new Error('Invalid public discussion');
}
function record(value: unknown, keys: string[]): Record<string, unknown> {
  requireValue(value && typeof value === 'object' && !Array.isArray(value));
  const data = value as Record<string, unknown>;
  requireValue(
    Object.keys(data).length === keys.length &&
      Object.keys(data).every((key) => keys.includes(key)),
  );
  return data;
}
function plain(value: unknown, max: number): asserts value is string {
  requireValue(
    typeof value === 'string' &&
      value.length <= max &&
      !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) &&
      !/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value),
  );
}
function date(value: unknown, nullable = true) {
  requireValue(
    (nullable && value === null) ||
      (typeof value === 'string' &&
        /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) &&
        Number.isFinite(Date.parse(value))),
  );
}
export function validateDiscussion(
  value: unknown,
  repository: string,
): asserts value is PublicDiscussion {
  const d = record(value, [
    'kind',
    'number',
    'title',
    'url',
    'state',
    'checkedAt',
    'body',
    'bodyTruncated',
    'conversation',
    'review',
  ]);
  requireValue(d.kind === 'issue' || d.kind === 'pull');
  requireValue(Number.isSafeInteger(d.number) && Number(d.number) > 0);
  const url = `https://github.com/${repository}/${d.kind === 'pull' ? 'pull' : 'issues'}/${d.number}`;
  requireValue(
    d.url === url &&
      ['available', 'unavailable'].includes(String(d.state)) &&
      typeof d.bodyTruncated === 'boolean',
  );
  plain(d.title, 200);
  date(d.checkedAt, false);
  if (d.state === 'available') plain(d.body, 4000);
  else requireValue(d.body === null && d.bodyTruncated === false);
  requireValue(d.kind === 'pull' ? d.review !== null : d.review === null);
  for (const kind of ['conversation', 'review'] as const) {
    if (d[kind] === null) continue;
    const sample = record(d[kind], ['state', 'checkedAt', 'truncated', 'items']);
    requireValue(
      ['fresh', 'unavailable'].includes(String(sample.state)) &&
        typeof sample.truncated === 'boolean' &&
        Array.isArray(sample.items) &&
        sample.items.length <= COMMENT_LIMIT,
    );
    date(sample.checkedAt, sample.state === 'unavailable');
    if (sample.state === 'unavailable')
      requireValue(sample.checkedAt === null && !sample.items.length && !sample.truncated);
    if (d.state === 'unavailable') requireValue(sample.state === 'unavailable');
    const ids = new Set();
    for (const raw of sample.items) {
      const c = record(raw, [
        'id',
        'body',
        'bodyTruncated',
        'author',
        'url',
        'createdAt',
        'updatedAt',
        'path',
        'line',
      ]);
      requireValue(Number.isSafeInteger(c.id) && Number(c.id) > 0 && !ids.has(c.id));
      ids.add(c.id);
      plain(c.body, 2000);
      requireValue(typeof c.bodyTruncated === 'boolean');
      requireValue(
        c.author === null ||
          (typeof c.author === 'string' && /^[a-z\d][a-z\d-]{0,38}(?:\[bot\])?$/i.test(c.author)),
      );
      date(c.createdAt);
      date(c.updatedAt);
      requireValue(
        c.url === url + (kind === 'conversation' ? '#issuecomment-' : '#discussion_r') + c.id,
      );
      if (kind === 'conversation') requireValue(c.path === null && c.line === null);
      else {
        if (c.path !== null) plain(c.path, 300);
        requireValue(c.line === null || (Number.isSafeInteger(c.line) && Number(c.line) > 0));
      }
    }
  }
}
