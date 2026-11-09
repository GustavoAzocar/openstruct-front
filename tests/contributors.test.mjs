import test from 'node:test';
import assert from 'node:assert/strict';
import { contributorsView, validateEditorialCredits } from '../src/lib/contributors.ts';
import { emptyGithubSnapshot, SNAPSHOT_STALE_MS } from '../src/lib/github-snapshot.ts';
const now = Date.parse('2026-11-07T23:00:00Z');
const at = new Date(now).toISOString();
function fixture() {
  const snapshot = emptyGithubSnapshot();
  for (const repo of snapshot.repositories) {
    repo.visibility = 'public';
    repo.lists.contributors = { state: 'fresh', checkedAt: at, truncated: false, items: [] };
  }
  return snapshot;
}
function person(login, count = 1) {
  return { id: login, title: login, url: 'https://github.com/' + login, count, updatedAt: null };
}
test('deduplicates identities across products case-insensitively with alphabetical, noncompetitive order', () => {
  const snapshot = fixture();
  snapshot.repositories[0].lists.contributors.items = [
    person('Zoe', 999),
    person('ana', 1),
    person('Ana', 2),
  ];
  snapshot.repositories[1].lists.contributors.items = [person('ANA', 80)];
  const view = contributorsView(snapshot, now);
  assert.deepEqual(
    view.people.map((p) => p.login),
    ['ana', 'zoe'],
  );
  assert.equal(view.people[0].repositories.length, 2);
  assert.equal(
    view.people[0].repositories[1].source.repository,
    snapshot.repositories[1].repository,
  );
  assert.equal(Object.hasOwn(view.people[0], 'count'), false);
});
test('excludes bots, foreign profiles and unconfirmed repositories; preserves empty and stale coverage', () => {
  const snapshot = fixture();
  snapshot.repositories[0].lists.contributors.items = [
    person('dependabot'),
    person('github-actions'),
    person('renovate[bot]'),
    { ...person('foreign'), url: 'javascript:alert(1)' },
    person('ana'),
  ];
  assert.deepEqual(
    contributorsView(snapshot, now).people.map((p) => p.login),
    ['ana'],
  );
  assert.equal(contributorsView(snapshot, now, true).people[0].repositories[0].stale, true);
  assert.equal(contributorsView(snapshot, now + SNAPSHOT_STALE_MS + 1).coverage[0].state, 'stale');
  snapshot.repositories[0].visibility = 'unknown';
  assert.equal(contributorsView(snapshot, now).people.length, 0);
  assert.equal(contributorsView(null, now).coverage[0].state, 'unavailable');
});
test('editorial attribution remains separate from commit evidence and requires a public source', () => {
  const snapshot = fixture();
  const credit = {
    login: 'ana',
    repository: snapshot.repositories[0].repository,
    contribution: 'Documentação',
    sourceUrl: 'https://github.com/ricardocorsini/openstruct-front/blob/master/README.md',
    basis: 'public-credit',
    reviewedAt: '2026-11-07',
  };
  const view = contributorsView(snapshot, now, false, [credit]);
  assert.equal(view.people[0].repositories.length, 0);
  assert.equal(view.people[0].credits[0].contribution, 'Documentação');
  for (const patch of [
    { sourceUrl: 'javascript:alert(1)' },
    { repository: 'ricardocorsini/launcher-struct' },
    { basis: 'guess' },
    { login: 'dependabot' },
    { contribution: 'Contato someone@example.com' },
  ])
    assert.throws(() => validateEditorialCredits([{ ...credit, ...patch }]));
  assert.throws(() => validateEditorialCredits([credit, credit]));
});

test('project selection does not inherit commit attribution or editorial credits from other applications', () => {
  const snapshot = fixture();
  snapshot.repositories[1].lists.contributors.items = [person('ana')];
  snapshot.repositories[2].lists.contributors.items = [person('bruno')];
  const source = {
    repository: snapshot.repositories[1].repository,
    slug: 'consolo-struct',
    name: 'ConsoloStruct',
    description: '',
    kind: 'Aplicativo',
    url: 'https://github.com/' + snapshot.repositories[1].repository,
  };
  const credit = {
    login: 'terceiro',
    repository: snapshot.repositories[2].repository,
    contribution: 'Documentação',
    sourceUrl: 'https://github.com/' + snapshot.repositories[2].repository + '/issues/1',
    basis: 'public-credit',
    reviewedAt: '2026-11-09',
  };
  const view = contributorsView(snapshot, now, false, [credit], [source]);
  assert.deepEqual(
    view.people.map((p) => p.login),
    ['ana'],
  );
  assert.equal(view.coverage.length, 1);
  assert.equal(view.people[0].repositories[0].source.repository, source.repository);
});
test('avatar destinations use only validated public GitHub logins, without arbitrary image URLs', async () => {
  const { githubAvatarUrl } = await import('../src/lib/contributors.ts');
  assert.equal(githubAvatarUrl('Ana'), 'https://github.com/ana.png?size=96');
  for (const value of [
    '../private',
    'https://evil.example/img',
    'ana?token=x',
    'dependabot',
    'github-actions[bot]',
    'a@b.com',
  ])
    assert.equal(githubAvatarUrl(value), null);
});
