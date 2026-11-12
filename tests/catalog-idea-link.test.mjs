import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('o convite para ideias aponta para as issues do repositório do frontend', async () => {
  const catalog = await readFile(new URL('../src/pages/Catalog.tsx', import.meta.url), 'utf8');
  const config = await readFile(new URL('../src/lib/config.ts', import.meta.url), 'utf8');
  assert.match(config, /websiteRepository:\s*'https:\/\/github\.com\/ricardocorsini\/openstruct-front'/);
  assert.match(catalog, /<a\s+href=\{`\$\{site\.websiteRepository\}\/issues`\}\s+className="button button-ink">\s*Compartilhe uma ideia\s*<ArrowRight size=\{17\} \/>\s*<\/a>/);
});
