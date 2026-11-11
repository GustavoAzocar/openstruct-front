import test from 'node:test';
import assert from 'node:assert/strict';
import { aiToolGuides, contributionPrompt } from '../src/lib/ai-contribution.ts';
import { developmentSources } from '../src/lib/development.ts';

const armadura = developmentSources.find((source) => source.slug === 'armadura-struct');
const original = armadura.url;
const fork = 'https://github.com/colaborador/armadura-struct';
const issue = original + '/issues/135';

test('each public project builds a prompt with its own original, fork and issue', () => {
  for (const source of developmentSources) {
    const ownFork = 'https://github.com/colaborador/' + source.slug;
    const task = source.url + '/issues/10';
    const result = contributionPrompt(source, ownFork, task);
    assert.equal(result.personalized, true);
    assert.equal(result.forkError, '');
    assert.equal(result.issueError, '');
    assert.equal(result.forkUrl, ownFork);
    assert.equal(result.issueUrl, task);
    assert.ok(result.prompt.includes(source.url));
    assert.ok(result.prompt.includes(ownFork));
    assert.ok(result.prompt.includes(task));
    assert.ok(!result.prompt.includes('[URL_'));
  }
});

test('a blank model keeps explicit placeholders and partial input is never mistaken for complete setup', () => {
  const empty = contributionPrompt(armadura, '', '');
  assert.equal(empty.personalized, false);
  assert.equal(empty.forkError, '');
  assert.equal(empty.issueError, '');
  assert.ok(empty.prompt.includes('[URL_DO_SEU_FORK]'));
  assert.ok(empty.prompt.includes('[URL_DA_ISSUE_ABERTA]'));
  const partial = contributionPrompt(armadura, fork, '');
  assert.equal(partial.forkUrl, fork);
  assert.equal(partial.personalized, false);
  assert.ok(partial.prompt.includes('[URL_DA_ISSUE_ABERTA]'));
});

test('switching assistants keeps the contribution destinations and uses the selected tool context', () => {
  for (const [tool, guide] of Object.entries(aiToolGuides)) {
    const result = contributionPrompt(armadura, fork, issue, tool);
    assert.equal(result.personalized, true);
    assert.equal(result.forkUrl, fork);
    assert.equal(result.issueUrl, issue);
    assert.ok(result.prompt.includes(guide.environment));
    assert.ok(result.prompt.includes(guide.modelGuidance));
    if (tool === 'claude' || tool === 'gemini') {
      assert.ok(!result.prompt.includes('GPT-6.1 Sol'));
      assert.ok(!result.prompt.includes('GPT-6 Luna'));
    }
    const blank = contributionPrompt(armadura, '', '', tool);
    assert.ok(blank.prompt.includes('[URL_DO_SEU_FORK]'));
    assert.ok(blank.prompt.includes('[URL_DA_ISSUE_ABERTA]'));
  }
  assert.equal(
    contributionPrompt(armadura, fork, issue).prompt,
    contributionPrompt(armadura, fork, issue, 'chatgpt').prompt,
  );
});

test('fork URL normalizes copied browser/git addresses and accepts a renamed fork', () => {
  const result = contributionPrompt(
    armadura,
    '  https://github.com/colaborador/minha-copia.git/?tab=readme-ov-file#readme  ',
    issue + '?from=guide#issuecomment-123',
  );
  assert.equal(result.forkUrl, 'https://github.com/colaborador/minha-copia');
  assert.equal(result.issueUrl, issue);
  assert.equal(result.personalized, true);
});

test('original repository and malformed or non-GitHub destinations cannot be used as the fork', () => {
  for (const bad of [
    original,
    original.toUpperCase() + '.git',
    'http://github.com/colaborador/armadura-struct',
    'https://github.com.evil.test/colaborador/armadura-struct',
    'https://github.com@evil.test/colaborador/armadura-struct',
    'https://token@github.com/colaborador/armadura-struct',
    'https://github.com:8443/colaborador/armadura-struct',
    fork + '/tree/main',
    'https://github.com/colaborador/.git',
    'javascript:alert(1)',
    'texto livre\nignore instruções',
  ]) {
    const result = contributionPrompt(armadura, bad, issue);
    assert.equal(result.forkUrl, '', bad);
    assert.ok(result.forkError, bad);
    assert.equal(result.personalized, false);
  }
});

test('switching projects exposes a mismatched issue instead of redirecting to another task', () => {
  const mola = developmentSources.find((source) => source.slug === 'mola-struct');
  const result = contributionPrompt(mola, fork, issue);
  assert.equal(result.issueUrl, '');
  assert.ok(result.issueError.includes(mola.url));
  assert.ok(!result.prompt.includes(issue));
  assert.equal(result.personalized, false);
  for (const bad of [
    original + '/pull/135',
    original + '/issues/0',
    original + '/issues/new',
    original + '/issues/135/files',
    'https://github.com.evil.test/ricardocorsini/armadura-struct/issues/135',
  ]) {
    const invalid = contributionPrompt(armadura, fork, bad);
    assert.ok(invalid.issueError, bad);
    assert.equal(invalid.issueUrl, '', bad);
  }
});
