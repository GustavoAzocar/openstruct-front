import test from 'node:test';
import assert from 'node:assert/strict';
import { nextCapture } from '../src/lib/gallery.ts';
test('navegação da galeria conserva limites, coleção única e estado vazio, sem circular', () => {
  assert.equal(nextCapture(0, -1, 4), 0);
  assert.equal(nextCapture(3, 1, 4), 3);
  assert.equal(nextCapture(0, 1, 4), 1);
  assert.equal(nextCapture(2, -1, 4), 1);
  assert.equal(nextCapture(0, 1, 1), 0);
  assert.equal(nextCapture(0, 1, 0), 0);
});
