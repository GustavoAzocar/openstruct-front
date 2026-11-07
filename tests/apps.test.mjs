import assert from 'node:assert/strict';
import test from 'node:test';
import { apps, currentApps, getCurrentApp } from '../src/lib/apps.ts';
import { getAppStatus, validateAppRegistry } from '../src/lib/app-registry.ts';

const copy = () => structuredClone(apps);

test('preserva os sete produtos, suas rotas e os quatro itens em planejamento', () => {
  assert.doesNotThrow(() => validateAppRegistry(apps));
  assert.deepEqual(
    currentApps.map((app) => [app.name, app.route]),
    [
      ['ConsoloStruct', '/apps/consolostruct'],
      ['MolaStruct', '/apps/molastruct'],
      ['ArmaduraStruct', '/apps/armadurastruct'],
    ],
  );
  const planned = apps.filter((app) => app.stage === 'planned');
  assert.deepEqual(
    planned.map((app) => app.name),
    ['VigasStruct', 'PilarStruct', 'SapataStruct', '3DStruct'],
  );
  assert.equal(apps.length, 7);
  for (const app of planned) {
    assert.equal(getAppStatus(app), 'Em planejamento');
    assert.equal(app.distribution, undefined);
    assert.equal(app.code, undefined);
    assert.equal(app.repository, undefined);
  }
});

test('rejeita id duplicado e metadados incompletos antes de servir o catálogo', () => {
  assert.throws(() => validateAppRegistry([...copy(), structuredClone(apps[0])]), /id único/);
  for (const key of [
    'name',
    'description',
    'repository',
    'documentation',
    'license',
    'code',
    'editorial',
  ]) {
    const data = copy();
    delete data[0][key];
    assert.throws(() => validateAppRegistry(data), undefined, key);
  }
  for (const value of [null, {}, []]) assert.throws(() => validateAppRegistry(value));
  assert.throws(() => getCurrentApp('produto-inexistente'), /não cadastrado/);
  assert.throws(() => getCurrentApp('vigasstruct'), /não cadastrado/);
});

test('planejamento não aceita versão, download ou repositório inventados', () => {
  for (const [key, value] of [
    ['code', { version: '1.0.0' }],
    ['distribution', structuredClone(apps[0].distribution)],
    ['version', '1.0.0'],
    ['downloadUrl', 'https://example.com/package.exe'],
    ['repository', structuredClone(apps[0].repository)],
    ['route', '/apps/vigasstruct'],
  ]) {
    const data = copy();
    data[3][key] = value;
    assert.throws(() => validateAppRegistry(data), undefined, key);
  }
});

test('disponibilidade não promove a versão de código nem implica maturidade estável', () => {
  const mola = getCurrentApp('molastruct');
  assert.equal(mola.code.version, '0.7.0');
  assert.equal(mola.distribution.version, '0.5.1');
  assert.equal(mola.maturity, 'experimental');
  assert.equal(mola.distribution.channel, 'stable');
  assert.equal(getAppStatus(mola), 'Disponível para desktop');
  const armadura = getCurrentApp('armadurastruct');
  assert.equal(armadura.code.version, armadura.distribution.version);
  assert.notEqual(armadura.code.ref, armadura.distribution.sourceCommit);
  for (const app of currentApps) assert.equal(getAppStatus(app), 'Disponível para desktop');
  const unpublished = copy();
  delete unpublished[0].distribution;
  assert.doesNotThrow(() => validateAppRegistry(unpublished));
  assert.equal(getAppStatus(unpublished[0]), 'Em desenvolvimento');
});

test('uma fonte posterior à tag não pode fundamentar a descrição do instalador', () => {
  const data = copy();
  const app = data[1];
  const evidence = app.editorial.sources.find((source) => source.kind === 'description');
  evidence.ref = app.code.ref;
  evidence.url = app.code.url.replace('package.json', 'README.md');
  assert.throws(() => validateAppRegistry(data), /fonte da versão distribuída/);
});

test('exige evidências fixadas, data de revisão e repositório declarado público', () => {
  for (const modify of [
    (app) => {
      app.editorial.reviewedAt = '2026-02-30';
    },
    (app) => {
      app.repository.visibility = 'private';
    },
    (app) => {
      delete app.repository.branch;
    },
    (app) => {
      app.documentation.ref = 'master';
    },
    (app) => {
      app.documentation.url = app.documentation.url.replace(app.documentation.ref, 'master');
    },
    (app) => {
      app.code.url = app.code.url.replace('https:', 'http:');
    },
    (app) => {
      app.editorial.sources = [];
    },
    (app) => {
      app.editorial.sources = app.editorial.sources.filter((s) => s.kind !== 'distribution');
    },
  ]) {
    const data = copy();
    modify(data[0]);
    assert.throws(() => validateAppRegistry(data));
  }
});

test('pacotes precisam pertencer ao produto, versão, plataforma e origem declarados', () => {
  for (const modify of [
    (release) => {
      release.platforms = [];
    },
    (release) => {
      release.platforms.push(structuredClone(release.platforms[0]));
    },
    (release) => {
      release.platforms[0].arch = 'arm64';
    },
    (release) => {
      release.platforms[0].format = 'zip';
    },
    (release) => {
      release.platforms[0].url = release.platforms[0].url.replace('github.com', 'example.com');
    },
    (release) => {
      release.platforms[0].url = release.platforms[0].url.replace('0.6.0-windows', '0.7.0-windows');
    },
    (release) => {
      release.releaseUrl = release.releaseUrl.replace('consolo-struct', 'mola-struct');
    },
  ]) {
    const data = copy();
    modify(data[0].distribution);
    assert.throws(() => validateAppRegistry(data));
  }
});
