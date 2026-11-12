import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  issueSkill,
  skillAgents,
  skillExamples,
  skillInstallationPrompt,
  skillUsagePrompt,
} from '../src/lib/issue-skill.ts';

test('distributed issue skill ZIP matches its published identity and metadata', async () => {
  const zip = await readFile(new URL(`../public${issueSkill.download}`, import.meta.url));
  assert.equal(issueSkill.version, '2.0.0');
  assert.equal(issueSkill.filename, 'openstruct-issue-v2.0.0.zip');
  assert.equal(zip.length, issueSkill.bytes);
  assert.equal(zip.subarray(0, 4).toString('hex'), '504b0304');
  assert.equal(createHash('sha256').update(zip).digest('hex'), issueSkill.sha256);
});

test('installation prompts use the selected agent and preserve existing installs without publishing', () => {
  for (const agent of ['claude', 'codex']) {
    const prompt = skillInstallationPrompt(agent);
    assert.ok(prompt.includes(skillAgents[agent].label));
    assert.ok(prompt.includes(skillAgents[agent].directory));
    assert.ok(prompt.includes(skillAgents[agent].command));
    assert.ok(prompt.includes(issueSkill.filename));
    assert.match(prompt, /Preserve uma instalação existente antes de substituir/);
    assert.match(prompt, /Não publique nenhuma issue\./);
  }
  assert.notEqual(skillAgents.claude.command, skillAgents.codex.command);
  assert.notEqual(skillAgents.claude.directory, skillAgents.codex.directory);
});

test('all five usage examples retain complete requests for either agent', () => {
  assert.equal(skillExamples.length, 5);
  assert.equal(new Set(skillExamples.map(({ id }) => id)).size, skillExamples.length);
  for (const agent of ['claude', 'codex'])
    for (const example of skillExamples)
      assert.equal(
        skillUsagePrompt(agent, example.request),
        `Use ${skillAgents[agent].command} ${example.request}`,
      );
  assert.match(skillExamples.find(({ id }) => id === 'dividir').request, /Publique no GitHub/);
  assert.match(skillExamples.find(({ id }) => id === 'bug').request, /Entregue só o texto/);
  assert.match(
    skillExamples.find(({ id }) => id === 'plano').request,
    /revisão antes da publicação/,
  );
});
