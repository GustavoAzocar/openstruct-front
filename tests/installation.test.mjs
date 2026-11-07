import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { verifySignedCatalog } from '../src/lib/catalog.ts';
import {
  manualInstallationOptions,
  productReleasesUrl,
  copyOfficialChecksum,
} from '../src/lib/installation.ts';

const envelope = JSON.parse(
  await readFile(new URL('../src/data/catalog.signed.json', import.meta.url), 'utf8'),
);
const { products } = await verifySignedCatalog(envelope);
const windows = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

test('a alternativa manual conserva os pacotes verificados de cada produto e o publicador correto', () => {
  for (const [id, product] of Object.entries(products)) {
    const view = manualInstallationOptions({ ...product, stale: false }, windows);
    assert.equal(view.release.version, product.release.version);
    assert.deepEqual(
      view.packages.map((p) => p.asset.url),
      product.release.assets.map((a) => a.url),
    );
    assert.deepEqual(
      view.packages.map((p) => p.asset.sha256),
      product.release.assets.map((a) => a.sha256),
    );
    assert.equal(view.packages.filter((p) => p.suggested).length, 1);
    assert.equal(view.packages.find((p) => p.suggested).asset.platform, 'windows');
    assert.equal(
      productReleasesUrl(id),
      id === 'armadurastruct'
        ? 'https://github.com/ricardocorsini/openstruct-catalog/releases'
        : `https://github.com/ricardocorsini/${id === 'molastruct' ? 'mola-struct' : 'consolo-struct'}/releases`,
    );
  }
  assert.throws(() => productReleasesUrl('vigasstruct'));
});

test('celular, macOS e arquitetura não reconhecida conservam todas as opções, sem sugerir pacote incompatível', () => {
  const product = { ...products.armadurastruct, stale: false };
  for (const ua of [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
    'Mozilla/5.0 (Linux; Android 14)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    'Mozilla/5.0 (Linux aarch64)',
    'unknown',
  ]) {
    const view = manualInstallationOptions(product, ua);
    assert.equal(view.packages.length, 2);
    assert.equal(
      view.packages.some((p) => p.suggested),
      false,
      ua,
    );
    assert.match(view.deviceHint, /outro computador/);
  }
});

test('ausência de confirmação não oferece pacotes, e um alvo ausente não é inferido', () => {
  for (const product of [
    undefined,
    { status: 'unknown', stale: false },
    { status: 'unavailable', stale: false, release: products.armadurastruct.release },
  ]) {
    const view = manualInstallationOptions(product, windows);
    assert.equal(view.packages.length, 0);
    assert.equal(view.release, undefined);
  }
  const partial = {
    ...products.armadurastruct,
    stale: false,
    release: {
      ...products.armadurastruct.release,
      assets: products.armadurastruct.release.assets.filter((a) => a.platform === 'linux'),
    },
  };
  const view = manualInstallationOptions(partial, windows);
  assert.deepEqual(
    view.packages.map((p) => p.asset.platform),
    ['linux'],
  );
  assert.equal(view.packages[0].suggested, false);
});

test('trocar a release substitui versão, URLs e checksums juntos; dados antigos continuam identificáveis', () => {
  const first = { ...products.armadurastruct, stale: true };
  const next = structuredClone(first);
  next.release.version = '0.3.0';
  next.release.releaseUrl = next.release.releaseUrl.replace('0.2.0', '0.3.0');
  next.release.assets.forEach((a) => {
    a.url = a.url.replaceAll('0.2.0', '0.3.0');
    a.sha256 = 'a'.repeat(64);
  });
  const initial = manualInstallationOptions(first, windows);
  const changed = manualInstallationOptions(next, windows);
  assert.equal(initial.release.version, '0.2.0');
  assert.equal(changed.release.version, '0.3.0');
  assert.equal(
    changed.packages.every(
      (p) => p.asset.url.includes('0.3.0') && p.asset.sha256 === 'a'.repeat(64),
    ),
    true,
  );
  assert.equal(first.stale, true);
});

test('a cópia usa o SHA-256 oficial e sinaliza erro em vez de anunciar sucesso quando recusada', async () => {
  const expected = products.armadurastruct.release.assets[0].sha256;
  let clipboard;
  await copyOfficialChecksum(expected, async (value) => {
    clipboard = value;
  });
  assert.equal(clipboard, expected);
  await assert.rejects(
    copyOfficialChecksum('invalid', async () => {
      throw new Error('não deveria copiar');
    }),
    /indisponível/,
  );
  await assert.rejects(
    copyOfficialChecksum(expected, async () => {
      throw new Error('clipboard denied');
    }),
    /clipboard denied/,
  );
});
