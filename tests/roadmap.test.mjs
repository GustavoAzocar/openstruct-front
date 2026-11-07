import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyGithubSnapshot,
  SNAPSHOT_STALE_MS,
  validateGithubSnapshot,
} from '../src/lib/github-snapshot.ts';
import { developmentSources } from '../src/lib/development.ts';
import {
  roadmapView,
  milestoneProgress,
  roadmapDocuments,
  roadmapDocumentUrl,
} from '../src/lib/roadmap.ts';
const now = Date.parse('2026-11-07T22:00:00Z');
const at = new Date(now).toISOString();
function fixture() {
  const snapshot = emptyGithubSnapshot();
  const repo = snapshot.repositories[0];
  repo.visibility = 'public';
  repo.verifiedPublicAt = at;
  repo.status = 'partial';
  repo.problem = 'request';
  repo.summary = {
    name: 'openstruct-front',
    description: '',
    url: developmentSources[0].url,
    stars: 0,
    forks: 0,
    openIssuesAndPullRequests: 999,
    defaultBranch: 'master',
  };
  repo.lists.milestones = { state: 'fresh', checkedAt: at, truncated: false, items: [milestone()] };
  return snapshot;
}
function milestone(extra = {}) {
  return {
    id: '1',
    title: 'Marco público',
    url: developmentSources[0].url + '/milestone/1',
    updatedAt: at,
    count: 3,
    milestone: { state: 'open', openItems: 3, closedItems: 1, dueOn: null, closedAt: null },
    ...extra,
  };
}
test('milestone denominator uses its own complete counters, not repository or loaded issue counts', () => {
  const row = roadmapView(fixture(), developmentSources, now)[0];
  assert.deepEqual(milestoneProgress(row.items[0]), { closed: 1, total: 4, percent: 25 });
  assert.equal(row.items[0].milestone.state, 'open');
  for (const item of [
    milestone({ milestone: undefined }),
    milestone({ milestone: { openItems: 0, closedItems: 0 } }),
  ])
    assert.equal(milestoneProgress(item), null);
  assert.equal(
    milestoneProgress(milestone({ milestone: { openItems: 0, closedItems: 4 } })).percent,
    100,
  );
});
test('empty, unavailable, stale and offline milestones have distinct coverage, never fabricated progress', () => {
  const snapshot = fixture();
  assert.equal(roadmapView(snapshot, developmentSources, now)[0].state, 'fresh');
  assert.equal(
    roadmapView(snapshot, developmentSources, now + SNAPSHOT_STALE_MS + 1)[0].state,
    'stale',
  );
  assert.equal(roadmapView(snapshot, developmentSources, now, true)[0].state, 'stale');
  assert.equal(roadmapView(snapshot, developmentSources, now - 1)[0].state, 'stale');
  snapshot.repositories[0].lists.milestones.items = [];
  assert.equal(roadmapView(snapshot, developmentSources, now)[0].items.length, 0);
  snapshot.repositories[0].visibility = 'unknown';
  assert.equal(roadmapView(snapshot, developmentSources, now)[0].state, 'unavailable');
  assert.ok(roadmapView(null, developmentSources, now).every((r) => r.items.length === 0));
});
test('milestone sources, uniqueness, stable order and truncated coverage survive per-app filtering', () => {
  const snapshot = fixture();
  const list = snapshot.repositories[0].lists.milestones;
  list.truncated = true;
  list.items = [
    milestone(),
    milestone(),
    milestone({
      id: '2',
      url: developmentSources[0].url + '/milestone/2',
      milestone: { state: 'closed', openItems: 0, closedItems: 2, dueOn: null, closedAt: at },
    }),
    milestone({ id: '3', url: 'https://github.com/foreign/repo/milestone/3' }),
  ];
  const rows = roadmapView(snapshot, [developmentSources[0]], now);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].truncated, true);
  assert.deepEqual(
    rows[0].items.map((r) => r.id),
    ['1', '2'],
  );
});
test('v6 contract rejects invalid milestone counters, dates, foreign sources and unexpected fields', () => {
  assert.doesNotThrow(() => validateGithubSnapshot(fixture()));
  for (const patch of [
    { openItems: -1 },
    { closedItems: 1.5 },
    { closedItems: null },
    { state: 'in_progress' },
    { dueOn: 'amanhã' },
    { closedAt: at },
    { openItems: Number.MAX_SAFE_INTEGER },
  ]) {
    const snapshot = fixture();
    Object.assign(snapshot.repositories[0].lists.milestones.items[0].milestone, patch);
    assert.throws(() => validateGithubSnapshot(snapshot));
  }
  const snapshot = fixture();
  snapshot.repositories[0].lists.milestones.items[0].url = 'javascript:alert(1)';
  assert.throws(() => validateGithubSnapshot(snapshot));
});
test('legacy open-only milestones migrate to unknown; do not imply a complete roadmap', () => {
  const legacy = fixture();
  legacy.schemaVersion = 5;
  delete legacy.repositories[0].lists.milestones.items[0].milestone;
  const migrated = validateGithubSnapshot(legacy);
  assert.equal(migrated.schemaVersion, 6);
  assert.equal(migrated.repositories[0].lists.milestones.state, 'unavailable');
  assert.equal(migrated.repositories[0].lists.milestones.items.length, 0);
  assert.equal(legacy.repositories[0].lists.milestones.items.length, 1);
  assert.doesNotThrow(() => validateGithubSnapshot(migrated));
});
test('document excerpts link to reviewed public refs; no implicit in-progress or scheduled items', () => {
  assert.equal(Object.keys(roadmapDocuments).length, 2);
  for (const source of developmentSources) {
    const doc = roadmapDocuments[source.repository];
    if (!doc) continue;
    assert.match(doc.ref, /^[a-f0-9]{40}$/);
    assert.equal(doc.reviewedAt, '2026-11-07');
    assert.equal(roadmapDocumentUrl(source, doc), `${source.url}/blob/${doc.ref}/${doc.path}`);
    assert.ok(doc.items.every((item) => ['proposal', 'completed'].includes(item.state)));
    assert.ok(!JSON.stringify(doc).toLowerCase().includes('todoist'));
  }
  assert.ok(!roadmapDocuments['ricardocorsini/consolo-struct']);
});
