import {
  COMMENT_LIMIT,
  DISCUSSION_LIMIT,
  emptyComments,
  validateDiscussion,
} from '../src/lib/discussion-contract.ts';

const sanitize = (value, max) =>
  String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email removido]')
    .slice(0, max);
const date = (value) =>
  typeof value === 'string' && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : null;
const author = (user) =>
  typeof user?.login === 'string' && /^[a-z\d][a-z\d-]{0,38}(?:\[bot\])?$/i.test(user.login)
    ? user.login
    : null;

/** No old body or comment cache is reused: removals and failed refreshes must withdraw text. */
export async function collectDiscussions(entry, request, at) {
  const candidates = [
    ...Object.values(entry.issueDetails)
      .filter((list) => list.state === 'fresh')
      .flatMap((list) =>
        list.items.map((item) => ({
          kind: 'issue',
          number: item.number,
          title: item.title,
          url: item.url,
          updatedAt: item.updatedAt,
        })),
      ),
    ...(entry.lists.pulls.state === 'fresh'
      ? entry.lists.pulls.items.map((item) => ({
          kind: 'pull',
          number: Number(item.url.slice(item.url.lastIndexOf('/') + 1)),
          title: item.title,
          url: item.url,
          updatedAt: item.updatedAt,
        }))
      : []),
  ].sort(
    (a, b) =>
      (Date.parse(b.updatedAt ?? '') || 0) - (Date.parse(a.updatedAt ?? '') || 0) ||
      a.url.localeCompare(b.url),
  );
  const selected = [...new Map(candidates.map((item) => [item.url, item])).values()].slice(
    0,
    DISCUSSION_LIMIT,
  );
  const records = [];
  for (const item of selected) {
    const root = `https://api.github.com/repos/${entry.repository}`;
    const d = {
      kind: item.kind,
      number: item.number,
      title: item.title,
      url: item.url,
      state: 'unavailable',
      checkedAt: at,
      body: null,
      bodyTruncated: false,
      conversation: emptyComments(),
      review: item.kind === 'pull' ? emptyComments() : null,
    };
    async function comments(kind) {
      try {
        const path = kind === 'conversation' ? 'issues' : 'pulls';
        const response = await request(
          `${root}/${path}/${item.number}/comments?per_page=${COMMENT_LIMIT}&page=1`,
          undefined,
          true,
        );
        if (!Array.isArray(response.body) || response.body.length > COMMENT_LIMIT)
          throw new Error('Invalid comments');
        const items = response.body.map((c) => ({
          id: c.id,
          body: sanitize(c.body, 2000),
          bodyTruncated: String(c.body ?? '').length > 2000,
          author: author(c.user),
          url: c.html_url,
          createdAt: date(c.created_at),
          updatedAt: date(c.updated_at),
          path: kind === 'review' && typeof c.path === 'string' ? sanitize(c.path, 300) : null,
          line: kind === 'review' && Number.isSafeInteger(c.line) && c.line > 0 ? c.line : null,
        }));
        const sample = { state: 'fresh', checkedAt: at, truncated: Boolean(response.next), items };
        validateDiscussion({ ...d, [kind]: sample }, entry.repository);
        return sample;
      } catch {
        return emptyComments();
      }
    }
    try {
      const response = await request(`${root}/issues/${item.number}`);
      const body = response.body;
      if (
        !body ||
        body.number !== item.number ||
        body.html_url !== item.url ||
        Object.hasOwn(body, 'pull_request') !== (item.kind === 'pull')
      )
        throw new Error('Invalid discussion source');
      d.state = 'available';
      d.body = sanitize(body.body, 4000);
      d.bodyTruncated = String(body.body ?? '').length > 4000;
      d.conversation = await comments('conversation');
      if (item.kind === 'pull') d.review = await comments('review');
      validateDiscussion(d, entry.repository);
    } catch {
      d.state = 'unavailable';
      d.body = null;
      d.bodyTruncated = false;
      d.conversation = emptyComments();
      d.review = item.kind === 'pull' ? emptyComments() : null;
    }
    if (
      d.state === 'unavailable' ||
      d.conversation.state === 'unavailable' ||
      d.review?.state === 'unavailable'
    ) {
      entry.status = 'partial';
      entry.problem = 'request';
    }
    records.push(d);
  }
  return records;
}
