import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CONTRIBUTION_MANUAL_PATH,
  contributionPaths,
  frontendCommands,
  frontendManualSource,
  manualRepository,
  manualReview,
  manualSections,
} from '../src/lib/contribution-manual.ts';
import { developmentSources } from '../src/lib/development.ts';

test('each chosen public project keeps its own guides and issue channel; invalid selection has no default destination', () => {
  for (const source of developmentSources) {
    const repo = manualRepository(source.slug);
    assert.equal(repo.source.repository, source.repository);
    assert.ok(repo.guide.url.startsWith(source.url + '/'));
    assert.ok(repo.issues.startsWith(source.url + '/issues?'));
    assert.ok(repo.newIssue.startsWith(source.url + '/issues/new'));
    assert.match(repo.reviewedRef, /^[a-f0-9]{40}$/);
  }
  for (const invalid of [
    null,
    '',
    'launcher-struct',
    'https://example.com',
    'mola-struct&repo=openstruct-front',
  ])
    assert.equal(manualRepository(invalid), undefined);
  assert.ok(!manualRepository('mola-struct').newIssue.includes('openstruct-front'));
});
test('choosers are limited to reviewed repos with templates; the site and other repos use a blank issue', () => {
  for (const slug of ['consolo-struct', 'mola-struct'])
    assert.ok(manualRepository(slug).newIssue.endsWith('/issues/new/choose'));
  for (const slug of ['openstruct-front', 'armadura-struct', 'openstruct-catalog'])
    assert.ok(manualRepository(slug).newIssue.endsWith('/issues/new'));
  assert.ok(
    !JSON.stringify(developmentSources.map((s) => manualRepository(s.slug))).includes('template='),
  );
});
test('the frontend recipe follows the current npm scripts, lockfile and documented environment without pushing upstream', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  assert.ok(readme.includes('Node.js 24 LTS e npm'));
  assert.ok(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
  for (const script of ['dev', 'test', 'build']) {
    assert.equal(typeof pkg.scripts[script], 'string');
    assert.ok(
      Object.values(frontendCommands).some(
        (block) => block.includes('npm run ' + script) || block.includes('npm ' + script),
      ),
    );
  }
  assert.equal(frontendManualSource.source.repository, 'ricardocorsini/openstruct-front');
  assert.equal(manualReview.frontendBranch, 'master');
  assert.match(
    frontendCommands.clone,
    /git clone https:\/\/github\.com\/SEU-USUARIO\/openstruct-front\.git/,
  );
  assert.match(frontendCommands.clone, /upstream\/master/);
  assert.ok(frontendCommands.install.includes('npm ci'));
  assert.ok(frontendCommands.send.includes('git diff --cached'));
  assert.ok(frontendCommands.update.includes('git push origin docs/primeira-contribuicao'));
  assert.ok(
    !Object.values(frontendCommands).some((block) =>
      /git push .*upstream|--force|reset --hard/.test(block),
    ),
  );
});
test('manual navigation and all six contribution paths have prerequisites, actions, examples and expected outcomes', () => {
  assert.equal(CONTRIBUTION_MANUAL_PATH, '/community/como-colaborar');
  assert.equal(new Set(manualSections.map((s) => s.id)).size, manualSections.length);
  assert.equal(contributionPaths.length, 6);
  assert.equal(contributionPaths.filter((p) => p.target === 'sem-codigo').length, 5);
  for (const path of contributionPaths) {
    for (const key of ['prerequisites', 'next', 'example', 'result'])
      assert.ok(path[key].length > 25);
    assert.ok(manualSections.some((section) => section.id === path.target));
  }
});
