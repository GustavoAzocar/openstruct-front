import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { armaduraHomeScreenshot } from '../src/lib/product-media.ts';

const source = await readFile(new URL('../public/home-image-preload.js', import.meta.url), 'utf8');

test('home preloads the registered screenshot with high priority and an existing local asset', async () => {
  const links = [];
  runInNewContext(source, {
    window: { location: { pathname: '/' } },
    document: {
      createElement(tag) {
        assert.equal(tag, 'link');
        return {};
      },
      head: { append: (link) => links.push(link) },
    },
  });
  assert.equal(links.length, 1);
  assert.equal(links[0].rel, 'preload');
  assert.equal(links[0].as, 'image');
  assert.equal(links[0].href, armaduraHomeScreenshot.src);
  assert.equal(links[0].fetchPriority, 'high');
  assert.ok((await stat(new URL(`../public${links[0].href}`, import.meta.url))).isFile());
});

test('direct internal routes do not preload the home image', () => {
  for (const pathname of [
    '/apps',
    '/docs',
    '/docs/consolostruct/edicao-1/apresentacao',
    '/launcher',
  ])
    runInNewContext(source, {
      window: { location: { pathname } },
      document: {
        createElement() {
          assert.fail(`Unexpected home preload on ${pathname}`);
        },
      },
    });
});
