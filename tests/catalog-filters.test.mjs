import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { apps } from '../src/lib/apps.ts';
import { verifySignedCatalog } from '../src/lib/catalog.ts';
import {
  defaultFilters,
  readFilters,
  writeFilters,
  selectCatalog,
} from '../src/lib/catalog-filters.ts';
const categories = ['Todos', ...new Set(apps.map((a) => a.category))];
const envelope = JSON.parse(
  await readFile(new URL('../src/data/catalog.signed.json', import.meta.url), 'utf8'),
);
const { products } = await verifySignedCatalog(envelope);
const select = (changes = {}, p = products) =>
  selectCatalog(apps, p, { ...defaultFilters, ...changes });
test('URL conserva seleção combinada, acentos e caracteres reservados', () => {
  const f = {
    q: 'concreto & aço',
    category: 'Concreto armado',
    availability: 'available',
    platform: 'linux',
    future: true,
  };
  assert.deepEqual(readFilters(writeFilters(f), categories), f);
  assert.deepEqual(
    readFilters(
      new URLSearchParams('category=inexistente&availability=bad&platform=macos&future=true'),
      categories,
    ),
    defaultFilters,
  );
  assert.equal(readFilters(new URLSearchParams('q=' + 'x'.repeat(500)), categories).q.length, 200);
  assert.equal(writeFilters(defaultFilters).toString(), '');
});
test('busca sem acentos combina categoria e plataforma oficial', () => {
  assert.deepEqual(
    select({
      q: '  FUNDACOES ',
      category: 'Fundações',
      platform: 'linux',
      availability: 'available',
    }).map((a) => a.id),
    ['molastruct'],
  );
  assert.deepEqual(select({ q: 'armadura', category: 'Fundações' }), []);
});
test('planejamento só aparece por opção explícita e nunca ganha plataforma de um pacote alheio', () => {
  assert.equal(select().length, 3);
  assert.equal(select({ future: true }).length, 7);
  assert.equal(select({ future: true, availability: 'planned' }).length, 4);
  assert.equal(select({ future: true, availability: 'planned', platform: 'windows' }).length, 0);
  assert.equal(select({ future: true, availability: 'available' }).length, 3);
});
test('falha sem pacote não infere instalação dos metadados editoriais; dado validado antigo continua filtrável', () => {
  assert.equal(select({ availability: 'available' }, {}).length, 0);
  assert.equal(select({ platform: 'windows' }, {}).length, 0);
  assert.equal(select({ availability: 'unconfirmed' }, {}).length, 3);
  const stale = Object.fromEntries(
    Object.entries(products).map(([id, p]) => [id, { ...p, stale: true }]),
  );
  assert.equal(select({ availability: 'available' }, stale).length, 3);
});
test('ordem estável coloca pacote confirmado primeiro e preserva ordem dentro dos grupos', () => {
  const p = { armadurastruct: products.armadurastruct };
  assert.deepEqual(
    select({ future: true }, p).map((a) => a.id),
    [
      'armadurastruct',
      'consolostruct',
      'molastruct',
      ...apps.filter((a) => a.stage === 'planned').map((a) => a.id),
    ],
  );
});
