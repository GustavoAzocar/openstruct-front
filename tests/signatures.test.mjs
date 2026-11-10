import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { verifyEd25519, SignatureVerificationUnavailableError } from '../src/lib/signatures.ts';
import { verifySignedCatalog } from '../src/lib/catalog.ts';
import { CATALOG_TRUST } from '../src/lib/catalog-trust.ts';

const envelope = JSON.parse(
  await readFile(new URL('./fixtures/catalog-2026-11-07.signed.json', import.meta.url), 'utf8'),
);
const bytes = (value) => new Uint8Array(Buffer.from(value, 'base64'));
const message = new TextEncoder().encode(envelope.payload);
const signature = bytes(envelope.signature);
const key = bytes(CATALOG_TRUST.keys[envelope.keyId]);
const unsupported = () => {
  throw new DOMException('Unrecognized algorithm', 'NotSupportedError');
};

test('verificação nativa e alternativa aceitam o mesmo catálogo real e seus pacotes', async (t) => {
  const native = await verifySignedCatalog(envelope);
  t.mock.method(crypto.subtle, 'importKey', unsupported);
  assert.deepEqual(await verifySignedCatalog(envelope), native);
});

test('alternativa rejeita mensagem e assinatura adulteradas', async (t) => {
  t.mock.method(crypto.subtle, 'importKey', unsupported);
  assert.equal(await verifyEd25519(message, signature, key), true);
  assert.equal(
    await verifyEd25519(new TextEncoder().encode(envelope.payload + ' '), signature, key),
    false,
  );
  const tampered = signature.slice();
  tampered[0] ^= 1;
  assert.equal(await verifyEd25519(message, tampered, key), false);
  await assert.rejects(verifySignedCatalog({ ...envelope, payload: envelope.payload + ' ' }));
});

test('alternativa usa regras estritas e rejeita chave de ordem pequena aceita por ZIP215', async (t) => {
  t.mock.method(crypto.subtle, 'importKey', unsupported);
  const identityKey = new Uint8Array(32);
  identityKey[0] = 1;
  const identitySignature = new Uint8Array(64);
  identitySignature[0] = 1;
  assert.equal(await verifyEd25519(message, identitySignature, identityKey), false);
});

test('recusa nativa não é substituída por resultado positivo da alternativa', async (t) => {
  t.mock.method(crypto.subtle, 'verify', async () => false);
  // This signature is valid: the fallback would accept it if invoked incorrectly.
  assert.equal(await verifyEd25519(message, signature, key), false);
});

test('erros diferentes de algoritmo não suportado não ativam a alternativa', async (t) => {
  const error = new DOMException('Bad key', 'DataError');
  t.mock.method(crypto.subtle, 'importKey', () => {
    throw error;
  });
  await assert.rejects(verifyEd25519(message, signature, key), (actual) => actual === error);
});

test('ausência de contexto criptográfico seguro mantém a falha fechada', async (t) => {
  t.mock.getter(globalThis, 'crypto', () => undefined);
  await assert.rejects(
    verifyEd25519(message, signature, key),
    SignatureVerificationUnavailableError,
  );
  await assert.rejects(verifySignedCatalog(envelope), SignatureVerificationUnavailableError);
});
