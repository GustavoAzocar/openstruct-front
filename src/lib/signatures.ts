export class SignatureVerificationUnavailableError extends Error {
  constructor() {
    super('A verificação de assinaturas não está disponível neste navegador.');
    this.name = 'SignatureVerificationUnavailableError';
  }
}

/** Native-first verification. An invalid signature never triggers the compatibility path. */
export async function verifyEd25519(
  message: Uint8Array<ArrayBuffer>,
  signature: Uint8Array<ArrayBuffer>,
  key: Uint8Array<ArrayBuffer>,
): Promise<boolean> {
  const subtle = globalThis.crypto?.subtle;
  // Preserve the secure-context requirement even though the fallback is JavaScript.
  if (!subtle) throw new SignatureVerificationUnavailableError();
  try {
    const publicKey = await subtle.importKey('raw', key, 'Ed25519', false, ['verify']);
    return await subtle.verify('Ed25519', publicKey, signature, message);
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'NotSupportedError') throw error;
  }
  try {
    const { ed25519 } = await import('@noble/curves/ed25519.js');
    // Strict RFC 8032 rules, rather than the library's more permissive ZIP215 default.
    return ed25519.verify(signature, message, key, { zip215: false });
  } catch {
    throw new SignatureVerificationUnavailableError();
  }
}
