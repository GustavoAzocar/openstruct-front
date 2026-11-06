import assert from 'node:assert/strict';
import test from 'node:test';
import {
  detectDesktopPlatform,
  LAUNCHER_FEED_URL,
  loadLauncherRelease,
  parseLauncherFeed,
} from '../src/lib/launcher.ts';

const fixture = () => ({
  version: '0.2.0',
  pub_date: '2026-11-06T17:00:00Z',
  platforms: Object.fromEntries(
    ['windows', 'linux'].map((platform) => [
      `${platform}-x86_64`,
      {
        url: `https://github.com/ricardocorsini/openstruct-catalog/releases/download/launcher-v0.2.0/launcher-0.2.0-${platform}-x86_64${platform === 'windows' ? '.exe' : '.AppImage'}`,
        signature: 'test-fixture-signature-not-a-real-package-signature',
      },
    ]),
  ),
});

test('os dois downloads correspondem à versão e aos formatos oficiais', () => {
  const release = parseLauncherFeed(fixture());
  assert.equal(release.version, '0.2.0');
  assert.equal(release.downloads.windows.filename, 'launcher-0.2.0-windows-x86_64.exe');
  assert.equal(release.downloads.linux.filename, 'launcher-0.2.0-linux-x86_64.AppImage');
  assert.equal(
    release.releaseUrl,
    'https://github.com/ricardocorsini/openstruct-catalog/releases/tag/launcher-v0.2.0',
  );
});

test('recusa origem, repositório, versão e formato de arquivo trocados', () => {
  for (const url of [
    'https://example.com/launcher.exe',
    fixture().platforms['windows-x86_64'].url.replace('https:', 'http:'),
    fixture().platforms['windows-x86_64'].url.replace('openstruct-catalog', 'other-repo'),
    fixture().platforms['windows-x86_64'].url.replace(
      'launcher-0.2.0-windows',
      'launcher-0.3.0-windows',
    ),
    fixture().platforms['windows-x86_64'].url.replace('.exe', '.zip'),
  ]) {
    const data = fixture();
    data.platforms['windows-x86_64'].url = url;
    assert.throws(() => parseLauncherFeed(data));
  }
});

test('publicação incompleta, sem assinatura ou com metadados inválidos não libera downloads', () => {
  const missing = fixture();
  delete missing.platforms['linux-x86_64'];
  assert.throws(() => parseLauncherFeed(missing));
  const unsigned = fixture();
  unsigned.platforms['linux-x86_64'].signature = '';
  assert.throws(() => parseLauncherFeed(unsigned));
  for (const version of ['0.2.0-beta.1', '01.2.3', 'main', 'v0.2.0']) {
    assert.throws(() => parseLauncherFeed({ ...fixture(), version }));
  }
  assert.throws(() => parseLauncherFeed({ ...fixture(), pub_date: 'invalid' }));
  assert.throws(() => parseLauncherFeed(null));
});

test('ausência da primeira release e falha de rede são estados distintos', async () => {
  assert.deepEqual(
    await loadLauncherRelease(undefined, async () => new Response('', { status: 404 })),
    { status: 'pending' },
  );
  await assert.rejects(
    loadLauncherRelease(undefined, async () => new Response('', { status: 503 })),
  );
  await assert.rejects(
    loadLauncherRelease(undefined, async () => {
      throw new Error('offline');
    }),
  );
  await assert.rejects(loadLauncherRelease(undefined, async () => new Response('invalid JSON')));
});

test('consulta o feed oficial, permite cancelamento e usa a versão recebida', async () => {
  const signal = new AbortController().signal;
  const result = await loadLauncherRelease(signal, async (url, options) => {
    assert.equal(url, LAUNCHER_FEED_URL);
    assert.equal(options.signal, signal);
    assert.equal(options.cache, 'no-cache');
    return new Response(JSON.stringify(fixture()));
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.release.version, '0.2.0');
});

test('sugere Windows/Linux e deixa a escolha explícita em outros sistemas', () => {
  assert.equal(detectDesktopPlatform('Windows NT 10.0; Win64; x64'), 'windows');
  assert.equal(detectDesktopPlatform('X11; Linux x86_64'), 'linux');
  for (const agent of [
    'Macintosh',
    'iPhone',
    'Linux; Android 15',
    'Linux aarch64',
    'Linux i686',
    'Windows ARM64',
    'CrOS x86_64',
    '',
  ]) {
    assert.equal(detectDesktopPlatform(agent), null, agent);
  }
});
