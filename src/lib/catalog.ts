import { CATALOG_IDS, CATALOG_TRUST, CATALOG_URL, PRODUCT_POLICIES } from './catalog-trust.ts';
import type { CatalogProductId, CatalogTrust } from './catalog-trust.ts';
import { SignatureVerificationUnavailableError, verifyEd25519 } from './signatures.ts';

export type CatalogAsset = {
  platform: 'windows' | 'linux';
  arch: 'x86_64' | 'aarch64';
  kind: 'nsis' | 'appimage';
  url: string;
  size: number;
  sha256: string;
  signature: string;
  keyId: string;
  minLauncherVersion: string;
  executable: string | null;
};
export type CatalogRelease = {
  version: string;
  channel: 'stable' | 'beta';
  publishedAt: string;
  releaseUrl: string;
  assets: CatalogAsset[];
  notes?: string;
  notesTruncated?: boolean;
};
export type CatalogProduct =
  | { status: 'ready'; release: CatalogRelease; history: CatalogRelease[] }
  | { status: 'unavailable'; history: CatalogRelease[] }
  | { status: 'invalid'; reason: 'missing' | 'invalid' };
export type VerifiedCatalog = {
  publishedAt: string;
  products: Record<CatalogProductId, CatalogProduct>;
};
export type SignedCatalog = { payload: string; signature: string; keyId: string };
export const CATALOG_MAX_BYTES = 1_000_000;

export class CatalogValidationError extends Error {
  constructor() {
    super('Catálogo público inválido.');
    this.name = 'CatalogValidationError';
  }
}
function requireValue(condition: unknown): asserts condition {
  if (!condition) throw new CatalogValidationError();
}
function record(value: unknown): Record<string, unknown> {
  requireValue(value && typeof value === 'object' && !Array.isArray(value));
  return value as Record<string, unknown>;
}
function text(value: unknown, limit = 20_000): string {
  requireValue(typeof value === 'string' && value.length <= limit && !/\u0000/.test(value));
  return value;
}
function date(value: unknown): string {
  const raw = text(value, 40);
  requireValue(
    /^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(
      raw,
    ) && Number.isFinite(Date.parse(raw)),
  );
  requireValue(
    new Date(`${raw.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === raw.slice(0, 10),
  );
  return raw;
}
// SemVer 2.0: no leading zeroes in numeric identifiers, bounded for safe comparisons.
const versionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
function version(value: unknown): string {
  const raw = text(value, 100);
  requireValue(versionPattern.test(raw));
  requireValue(
    raw
      .split(/[.+-]/)
      .slice(0, 3)
      .every((n) => Number.isSafeInteger(Number(n))),
  );
  return raw;
}
function https(value: unknown): URL {
  const url = new URL(text(value, 2_000));
  requireValue(url.protocol === 'https:' && !url.username && !url.password && !url.port);
  return url;
}
function base64(value: unknown, size: number): Uint8Array<ArrayBuffer> {
  const raw = text(value, 100);
  requireValue(/^[A-Za-z0-9+/]+={0,2}$/.test(raw));
  const binary = atob(raw);
  requireValue(binary.length === size && btoa(binary) === raw);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** Same UTF-8 message, with no trailing newline, as the hub's scripts/security.mjs. */
export function packageMessage(id: string, releaseVersion: string, asset: CatalogAsset): string {
  return `OPENSTRUCT-PACKAGE-V1\n${id}\n${releaseVersion}\n${asset.platform}\n${asset.arch}\n${asset.kind}\n${asset.size}\n${asset.sha256}\n${asset.executable ?? ''}`;
}
async function verifyBytes(message: string, signature: unknown, key: unknown): Promise<void> {
  requireValue(
    await verifyEd25519(new TextEncoder().encode(message), base64(signature, 64), base64(key, 32)),
  );
}

async function readProduct(
  id: CatalogProductId,
  value: unknown,
  trust: CatalogTrust,
  channel: 'stable' | 'beta',
): Promise<CatalogProduct> {
  const app = record(value);
  const policy = PRODUCT_POLICIES[id];
  requireValue(app.repository === `https://github.com/${policy.sourceRepo}`);
  requireValue(text(app.name, 100).length > 0 && !/[\u0000-\u001f]/.test(String(app.name)));
  for (const key of ['tagline', 'summary', 'description', 'category', 'requirements', 'notice'])
    text(app[key]);
  requireValue(/^#[0-9a-fA-F]{6}$/.test(text(app.color, 7)));
  requireValue(
    [
      'consolostruct-atlas',
      'molastruct-gaia',
      'openstruct-mark',
      'armadurastruct-hephaestus',
    ].includes(String(app.icon)),
  );
  for (const key of ['website', 'documentation']) https(app[key]);
  requireValue(Array.isArray(app.features) && app.features.length <= 30);
  app.features.forEach((item) => text(item));
  requireValue(Array.isArray(app.releases) && app.releases.length <= 200);
  const versions = new Set<string>();
  const releases: CatalogRelease[] = [];
  for (const item of app.releases) {
    const release = record(item);
    const releaseVersion = version(release.version);
    requireValue(!versions.has(releaseVersion));
    versions.add(releaseVersion);
    requireValue(release.channel === 'stable' || release.channel === 'beta');
    requireValue(release.channel !== 'stable' || !releaseVersion.split('+')[0].includes('-'));
    const publishedAt = date(release.publishedAt);
    text(release.notes);
    requireValue(
      Array.isArray(release.assets) && release.assets.length > 0 && release.assets.length <= 8,
    );
    const targets = new Set<string>();
    const assets: CatalogAsset[] = [];
    const tag = policy.tagPrefix + releaseVersion;
    const releaseUrl = `https://github.com/${policy.releaseRepo}/releases/tag/${tag}`;
    for (const value of release.assets) {
      const asset = record(value);
      requireValue(
        (asset.platform === 'windows' && asset.kind === 'nsis') ||
          (asset.platform === 'linux' && asset.kind === 'appimage'),
      );
      requireValue(asset.arch === 'x86_64' || asset.arch === 'aarch64');
      const target = `${asset.platform}-${asset.arch}`;
      requireValue(!targets.has(target));
      targets.add(target);
      requireValue(
        Number.isSafeInteger(asset.size) &&
          Number(asset.size) > 0 &&
          Number(asset.size) <= 2_147_483_648,
      );
      requireValue(/^[a-f0-9]{64}$/.test(text(asset.sha256, 64)));
      version(asset.minLauncherVersion);
      requireValue(asset.keyId === policy.keyId);
      const extension = asset.kind === 'nsis' ? 'exe' : 'AppImage';
      // Validate the URL actually supplied by the signed feed; never offer a guessed asset.
      const expectedUrl = `https://github.com/${policy.releaseRepo}/releases/download/${tag}/${id}-${releaseVersion}-${asset.platform}-${asset.arch}.${extension}`;
      requireValue(https(asset.url).href === expectedUrl && asset.url === expectedUrl);
      if (asset.kind === 'nsis') {
        const executable = text(asset.executable, 200);
        requireValue(
          executable.endsWith('.exe') &&
            !/[\\:\u0000-\u001f]/.test(executable) &&
            executable.split('/').every((part) => part && part !== '.' && part !== '..'),
        );
      } else requireValue(asset.executable == null);
      const verified = asset as CatalogAsset;
      await verifyBytes(
        packageMessage(id, releaseVersion, verified),
        asset.signature,
        trust.keys[policy.keyId],
      );
      assets.push({ ...verified, executable: verified.executable ?? null });
    }
    releases.push({
      version: releaseVersion,
      channel: release.channel,
      publishedAt,
      releaseUrl,
      assets,
      notes: String(release.notes)
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
        .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email removido]')
        .slice(0, 2000),
      notesTruncated: String(release.notes).length > 2000,
    });
  }
  // Stable releases are ordered by SemVer, not API order or the hub's latest release.
  const candidates = releases.filter((release) => release.channel === channel);
  candidates.sort((a, b) => compareVersions(b.version, a.version));
  return candidates[0]
    ? { status: 'ready', release: candidates[0], history: releases }
    : { status: 'unavailable', history: releases };
}

export function compareVersions(a: string, b: string): number {
  const parts = (value: string) => value.split('+')[0].split('-');
  const [aCore, ...aPreParts] = parts(a);
  const [bCore, ...bPreParts] = parts(b);
  const aNumbers = aCore.split('.').map(Number);
  const bNumbers = bCore.split('.').map(Number);
  for (let i = 0; i < 3; i++)
    if (aNumbers[i] !== bNumbers[i]) return aNumbers[i] > bNumbers[i] ? 1 : -1;
  const aPre = aPreParts.join('-');
  const bPre = bPreParts.join('-');
  if (!aPre || !bPre) return aPre === bPre ? 0 : aPre ? -1 : 1;
  const aa = aPre.split('.');
  const bb = bPre.split('.');
  for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
    if (aa[i] === bb[i]) continue;
    if (aa[i] === undefined) return -1;
    if (bb[i] === undefined) return 1;
    const an = /^\d+$/.test(aa[i]);
    const bn = /^\d+$/.test(bb[i]);
    if (an && bn) return BigInt(aa[i]) > BigInt(bb[i]) ? 1 : -1;
    if (an !== bn) return an ? -1 : 1;
    return aa[i] > bb[i] ? 1 : -1;
  }
  return 0;
}

export async function verifySignedCatalog(
  value: unknown,
  origin = CATALOG_URL,
  trust: CatalogTrust = CATALOG_TRUST,
  channel: 'stable' | 'beta' = 'stable',
): Promise<VerifiedCatalog> {
  requireValue(origin === CATALOG_URL);
  const envelope = record(value);
  requireValue(envelope.keyId === trust.catalogKeyId);
  const payload = text(envelope.payload, CATALOG_MAX_BYTES);
  await verifyBytes(payload, envelope.signature, trust.keys[trust.catalogKeyId]);
  // Parse only after verifying the exact signed bytes.
  const catalog = record(JSON.parse(payload));
  requireValue(catalog.schemaVersion === 1);
  const publishedAt = date(catalog.publishedAt);
  requireValue(Array.isArray(catalog.apps) && catalog.apps.length <= 100);
  const products = {} as VerifiedCatalog['products'];
  for (const id of CATALOG_IDS) {
    const matches = catalog.apps.filter((app) => app && typeof app === 'object' && app.id === id);
    if (matches.length !== 1) {
      products[id] = { status: 'invalid', reason: matches.length ? 'invalid' : 'missing' };
      continue;
    }
    try {
      products[id] = await readProduct(id, matches[0], trust, channel);
    } catch (error) {
      if (error instanceof SignatureVerificationUnavailableError) throw error;
      products[id] = { status: 'invalid', reason: 'invalid' };
    }
  }
  return { publishedAt, products };
}

export class CatalogRequestError extends Error {
  retryAfterMs: number;
  constructor(retryAfterMs = 60_000) {
    super('Não foi possível consultar o catálogo público.');
    this.retryAfterMs = retryAfterMs;
  }
}
export async function loadPublicCatalog(request: typeof fetch = fetch): Promise<{
  envelope: SignedCatalog;
  catalog: VerifiedCatalog;
}> {
  const response = await request(CATALOG_URL, {
    signal: AbortSignal.timeout(10_000),
    cache: 'no-cache',
    credentials: 'omit',
    redirect: 'error',
  });
  if (!response.ok) {
    const retry = response.headers.get('retry-after');
    const seconds =
      retry && /^\d+$/.test(retry) ? Number(retry) * 1_000 : Date.parse(retry || '') - Date.now();
    throw new CatalogRequestError(Number.isFinite(seconds) ? Math.max(60_000, seconds) : 60_000);
  }
  requireValue(!response.url || response.url === CATALOG_URL);
  requireValue(Number(response.headers.get('content-length') || 0) <= CATALOG_MAX_BYTES);
  const raw = await response.text();
  requireValue(new TextEncoder().encode(raw).length <= CATALOG_MAX_BYTES);
  try {
    const envelope = JSON.parse(raw) as SignedCatalog;
    const catalog = await verifySignedCatalog(envelope);
    return { envelope, catalog };
  } catch (error) {
    if (error instanceof SignatureVerificationUnavailableError) throw error;
    throw new CatalogValidationError();
  }
}
