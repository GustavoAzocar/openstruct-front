import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { consoloMedia as media } from '../src/lib/consolo-media.ts';

function jpegDimensions(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'asset deve ser um JPEG real');
  let offset = 2;
  while (offset + 4 < bytes.length) {
    assert.equal(bytes[offset++], 0xff);
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    const length = bytes.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  throw new Error('Dimensões JPEG não encontradas');
}

test('o manifesto das capturas identifica versão, exemplo público e os quatro momentos do fluxo', () => {
  assert.equal(media.source.tag, `v${media.version}`);
  assert.match(media.source.ref, /^[a-f0-9]{40}$/);
  assert.ok(media.source.url.endsWith(`/tree/${media.source.ref}`));
  assert.ok(media.project.url.includes(`/blob/${media.source.ref}/examples/`));
  assert.ok(media.license.url.includes(`/blob/${media.source.ref}/LICENSE`));
  assert.equal(media.project.fictional, true);
  assert.deepEqual(
    media.captures.map((capture) => capture.stage),
    ['model', 'memory', 'drawing', 'schedule'],
  );
  assert.equal(new Set(media.captures.map((capture) => capture.id)).size, 4);
  for (const capture of media.captures) {
    assert.ok(capture.src.startsWith(`/assets/consolostruct/${media.source.tag}/`));
    assert.ok(capture.alt.includes(media.version));
    assert.ok(capture.caption.length > 80);
    const crop = capture.viewportCrop;
    if (crop) {
      assert.equal(crop.width, capture.width);
      assert.equal(crop.height, capture.height);
      assert.ok(crop.x >= 0 && crop.x + crop.width <= media.environment.viewport.width);
      assert.ok(crop.y >= 0 && crop.y + crop.height <= media.environment.viewport.height);
    }
  }
});

test('as imagens publicadas correspondem aos bytes, dimensões e hashes revisados no manifesto', async () => {
  for (const capture of media.captures) {
    const bytes = await readFile(new URL(`../public${capture.src}`, import.meta.url));
    assert.equal(bytes.length, capture.bytes, capture.src);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), capture.sha256, capture.src);
    assert.deepEqual(
      jpegDimensions(bytes),
      { width: capture.width, height: capture.height },
      capture.src,
    );
  }
  const notice = await readFile(
    new URL(`../public${media.license.localNotice}`, import.meta.url),
    'utf8',
  );
  assert.ok(notice.includes(media.license.copyright));
  assert.ok(notice.includes('MIT License'));
});
