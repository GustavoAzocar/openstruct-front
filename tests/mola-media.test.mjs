import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
test('capturas oficiais do Mola preservam origem fixa, versões históricas e arquivos revisados', async () => {
  const m = JSON.parse(
    await readFile(new URL('../src/lib/mola-media.json', import.meta.url), 'utf8'),
  );
  assert.equal(m.captures.length, 3);
  assert.equal(new Set(m.captures.map((c) => c.id)).size, 3);
  for (const c of m.captures) {
    assert.ok(c.sourceUrl.includes('/blob/' + m.sourceCommit + '/docs/assets/'));
    const b = await readFile(new URL('../public' + c.src, import.meta.url));
    assert.equal(b.length, c.bytes);
    assert.equal(createHash('sha256').update(b).digest('hex'), c.sha256);
    assert.ok(c.width > 1000 && c.height > 900);
  }
  assert.match(m.captures[0].version, /0.1/);
  assert.match(m.captures[1].version, /0.2/);
  assert.match(m.captures[2].version, /0.5/);
});
