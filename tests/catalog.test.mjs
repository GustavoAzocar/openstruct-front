import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateKeyPairSync, sign } from 'node:crypto';
import {
  verifySignedCatalog,
  loadPublicCatalog,
  packageMessage,
  compareVersions,
} from '../src/lib/catalog.ts';
import { CATALOG_IDS, CATALOG_URL, PRODUCT_POLICIES } from '../src/lib/catalog-trust.ts';

const realEnvelope = JSON.parse(
  await readFile(new URL('../src/data/catalog.signed.json', import.meta.url), 'utf8'),
);
const original = JSON.parse(realEnvelope.payload);
const keyIds = ['catalog-test', ...new Set(Object.values(PRODUCT_POLICIES).map((p) => p.keyId))];
const pairs = Object.fromEntries(keyIds.map((id) => [id, generateKeyPairSync('ed25519')]));
const trust = {
  catalogKeyId: 'catalog-test',
  keys: Object.fromEntries(
    keyIds.map((id) => [
      id,
      Buffer.from(pairs[id].publicKey.export({ format: 'jwk' }).x, 'base64url').toString('base64'),
    ]),
  ),
};
const seal = (catalog) => {
  const payload = JSON.stringify(catalog);
  return {
    payload,
    keyId: trust.catalogKeyId,
    signature: sign(null, Buffer.from(payload), pairs['catalog-test'].privateKey).toString(
      'base64',
    ),
  };
};
function fixture(edit = () => {}) {
  const catalog = structuredClone(original);
  edit(catalog);
  for (const app of catalog.apps)
    for (const release of app.releases)
      for (const asset of release.assets) {
        const pair = pairs[asset.keyId];
        if (pair)
          asset.signature = sign(
            null,
            Buffer.from(packageMessage(app.id, release.version, asset)),
            pair.privateKey,
          ).toString('base64');
      }
  return catalog;
}
const verify = (catalog, channel) =>
  verifySignedCatalog(seal(catalog), CATALOG_URL, trust, channel);

test('verifica o envelope e todos os pacotes reais com as chaves públicas oficiais', async () => {
  const catalog = await verifySignedCatalog(realEnvelope);
  assert.deepEqual(
    CATALOG_IDS.map((id) => catalog.products[id].release.version),
    ['0.6.0', '0.5.1', '0.2.0'],
  );
  assert.equal(catalog.products.armadurastruct.release.assets.length, 2);
  assert.equal(
    catalog.products.armadurastruct.release.releaseUrl.endsWith('/armadurastruct-v0.2.0'),
    true,
  );
  assert.equal(catalog.products.launcher, undefined);
});

test('recusa origem, chave e bytes do envelope adulterados antes de ler releases', async () => {
  await assert.rejects(
    verifySignedCatalog(realEnvelope, 'https://example.com/catalog.signed.json'),
  );
  await assert.rejects(verifySignedCatalog({ ...realEnvelope, keyId: 'launcher-packages-v1' }));
  await assert.rejects(
    verifySignedCatalog({ ...realEnvelope, payload: realEnvelope.payload + ' ' }),
  );
  await assert.rejects(verifySignedCatalog({ ...realEnvelope, signature: 'A'.repeat(88) }));
  await assert.rejects(verifySignedCatalog(original));
});

test('ordena a versão de cada produto por SemVer e seleciona o canal explicitamente', async () => {
  const data = fixture((catalog) => {
    const app = catalog.apps.find((a) => a.id === 'molastruct');
    const release = structuredClone(app.releases[0]);
    release.version = '0.10.0';
    release.publishedAt = '2026-11-01T00:00:00Z';
    release.assets.forEach((asset) => {
      asset.url = asset.url.replaceAll('0.5.1', release.version);
    });
    app.releases.push(release);
    const beta = structuredClone(release);
    beta.version = '1.0.0-beta.1';
    beta.channel = 'beta';
    beta.assets.forEach((asset) => {
      asset.url = asset.url.replaceAll('0.10.0', beta.version);
    });
    app.releases.unshift(beta);
  });
  assert.equal((await verify(data)).products.molastruct.release.version, '0.10.0');
  assert.equal((await verify(data, 'beta')).products.molastruct.release.version, '1.0.0-beta.1');
  assert.equal((await verify(data)).products.consolostruct.release.version, '0.6.0');
  assert.equal(compareVersions('1.0.0-beta.10', '1.0.0-beta.2'), 1);
});

test('catálogo incompleto, produto duplicado e produto desconhecido não escondem os outros', async () => {
  const data = fixture((catalog) => {
    catalog.apps = catalog.apps.filter((app) => app.id !== 'molastruct');
    catalog.apps.push(structuredClone(catalog.apps.find((app) => app.id === 'armadurastruct')));
    catalog.apps.push({ ...structuredClone(catalog.apps[0]), id: 'vigasstruct' });
  });
  const result = await verify(data);
  assert.equal(result.products.molastruct.reason, 'missing');
  assert.equal(result.products.armadurastruct.reason, 'invalid');
  assert.equal(result.products.consolostruct.status, 'ready');
  assert.equal(result.products.vigasstruct, undefined);
});

test('ausência explícita de release estável é indisponibilidade, não erro de rede', async () => {
  const result = await verify(
    fixture((c) => {
      c.apps[0].releases = [];
    }),
  );
  assert.equal(result.products.consolostruct.status, 'unavailable');
  assert.equal(result.products.molastruct.status, 'ready');
});

test('versões e esquema inválidos são recusados mesmo com assinatura válida', async () => {
  for (const invalid of ['latest', 'v0.6.0', '01.6.0', '0.6', '0.6.0-01', '0.6.0-beta.1']) {
    const data = fixture((c) => {
      c.apps[0].releases[0].version = invalid;
    });
    assert.equal((await verify(data)).products.consolostruct.status, 'invalid', invalid);
  }
  await assert.rejects(verify({ ...fixture(), schemaVersion: 2 }));
  await assert.rejects(verify({ ...fixture(), publishedAt: '2026-02-30T00:00:00Z' }));
});

test('repositório, produto, versão, plataforma e URL trocados não liberam pacote', async () => {
  const edits = [
    (app) => {
      app.repository = 'https://github.com/another/consolo-struct';
    },
    (app) => {
      app.releases[0].assets[0].url = 'https://example.com/installer.exe';
    },
    (app) => {
      app.releases[0].assets[0].url = app.releases[0].assets[0].url.replace(
        'consolostruct-',
        'molastruct-',
      );
    },
    (app) => {
      app.releases[0].assets[0].url = app.releases[0].assets[0].url.replaceAll('0.6.0', '0.7.0');
    },
    (app) => {
      app.releases[0].assets[0].platform = 'macos';
    },
    (app) => {
      app.releases[0].assets[0].arch = 'other';
    },
    (app) => {
      app.releases[0].assets[0].keyId = 'launcher-packages-v1';
    },
    (app) => {
      app.releases[0].assets.push(app.releases[0].assets[0]);
    },
  ];
  for (const edit of edits) {
    const result = await verify(fixture((c) => edit(c.apps[0])));
    assert.equal(result.products.consolostruct.status, 'invalid');
    assert.equal(result.products.armadurastruct.status, 'ready');
  }
});

test('assinatura individual adulterada invalida somente o produto correspondente', async () => {
  const data = fixture();
  data.apps[0].releases[0].assets[0].sha256 = 'a'.repeat(64);
  const result = await verify(data);
  assert.equal(result.products.consolostruct.status, 'invalid');
  assert.equal(result.products.molastruct.status, 'ready');
});

test('um pacote ausente não é inventado e o snapshot conserva somente plataformas verificadas', async () => {
  const result = await verify(
    fixture((c) => {
      c.apps[0].releases[0].assets = c.apps[0].releases[0].assets.slice(1);
    }),
  );
  assert.deepEqual(
    result.products.consolostruct.release.assets.map((a) => a.platform),
    ['linux'],
  );
});

test('leitor usa somente o feed assinado e respeita Retry-After e limites da resposta', async () => {
  const result = await loadPublicCatalog(async (url, options) => {
    assert.equal(url, CATALOG_URL);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-cache');
    return new Response(JSON.stringify(realEnvelope));
  });
  assert.equal(result.catalog.products.consolostruct.status, 'ready');
  await assert.rejects(
    loadPublicCatalog(
      async () => new Response('', { status: 429, headers: { 'retry-after': '120' } }),
    ),
    (error) => error.retryAfterMs === 120_000,
  );
  await assert.rejects(
    loadPublicCatalog(async () => new Response('{}', { headers: { 'content-length': '1000001' } })),
  );
  await assert.rejects(loadPublicCatalog(async () => new Response('not json')));
});

test('verified catalog preserves historical channels and bounded notes without changing stable installation selection', async () => {
  const data = fixture((catalog) => {
    const app = catalog.apps.find((app) => app.id === 'consolostruct');
    app.releases[0].notes = '<script>alert(1)</script> someone@example.com ' + 'A'.repeat(2200);
    const beta = structuredClone(app.releases[0]);
    const old = beta.version;
    beta.version += '-rc.1';
    beta.channel = 'beta';
    beta.assets.forEach((a) => {
      a.url = a.url.replaceAll(old, beta.version);
    });
    app.releases.push(beta);
  });
  const result = await verify(data);
  const product = result.products.consolostruct;
  assert.equal(product.release.channel, 'stable');
  assert.ok(product.history.some((r) => r.channel === 'beta'));
  assert.ok(product.history.every((r) => r.notes.length === 2000 && r.notesTruncated));
  assert.ok(product.history.every((r) => !r.notes.includes('someone@example.com')));
});
