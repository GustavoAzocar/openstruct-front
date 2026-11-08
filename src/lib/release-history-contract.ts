import { PRODUCT_POLICIES } from './catalog-trust.ts';

export const RELEASE_PRODUCTS = {
  ...PRODUCT_POLICIES,
  launcher: {
    releaseRepo: 'ricardocorsini/openstruct-catalog',
    tagPrefix: 'launcher-v',
    sourceRepo: null,
  },
} as const;
export type ReleaseProductId = keyof typeof RELEASE_PRODUCTS;
export type HistoryRelease = {
  productId: ReleaseProductId;
  version: string;
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
  notes: string;
  notesTruncated: boolean;
  codeUrl: string | null;
};
export type ReleaseHistory = {
  state: 'fresh' | 'stale' | 'unavailable';
  checkedAt: string | null;
  truncated: boolean;
  items: HistoryRelease[];
};
export function emptyReleaseHistory(): ReleaseHistory {
  return { state: 'unavailable', checkedAt: null, truncated: false, items: [] };
}
export const releaseVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
export function releaseIdentity(repository: string, tag: string) {
  for (const productId of Object.keys(RELEASE_PRODUCTS) as ReleaseProductId[]) {
    const policy = RELEASE_PRODUCTS[productId];
    if (repository !== policy.releaseRepo || !tag.startsWith(policy.tagPrefix)) continue;
    const version = tag.slice(policy.tagPrefix.length);
    if (version.length <= 100 && releaseVersionPattern.test(version)) return { productId, version };
  }
  return null;
}
function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    Object.keys(value).some((k) => !keys.includes(k))
  )
    throw new Error('Invalid release history');
  return value as Record<string, unknown>;
}
function date(value: unknown, nullable = false) {
  if (nullable && value === null) return;
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    throw new Error('Invalid release date');
}
function text(value: unknown, max: number, multiline = false) {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value) ||
    (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(
      value,
    )
  )
    throw new Error('Invalid release text');
}
export function validateReleaseHistory(
  value: unknown,
  repository: string,
  isPublic: boolean,
): void {
  const list = record(value, ['state', 'checkedAt', 'truncated', 'items']);
  if (
    !['fresh', 'stale', 'unavailable'].includes(String(list.state)) ||
    typeof list.truncated !== 'boolean' ||
    !Array.isArray(list.items) ||
    list.items.length > 60
  )
    throw new Error('Invalid release list');
  date(list.checkedAt, true);
  if (
    (list.state === 'unavailable' && (list.checkedAt !== null || list.items.length)) ||
    (list.state !== 'unavailable' && (!isPublic || list.checkedAt === null))
  )
    throw new Error('Unconfirmed release history');
  const seen = new Set<string>();
  for (const raw of list.items) {
    const item = record(raw, [
      'productId',
      'version',
      'tag',
      'name',
      'url',
      'publishedAt',
      'prerelease',
      'notes',
      'notesTruncated',
      'codeUrl',
    ]);
    text(item.tag, 140);
    text(item.version, 100);
    text(item.name, 200);
    text(item.notes, 2000, true);
    const identity = releaseIdentity(repository, String(item.tag));
    if (
      !identity ||
      identity.productId !== item.productId ||
      identity.version !== item.version ||
      item.url !== `https://github.com/${repository}/releases/tag/${item.tag}` ||
      typeof item.prerelease !== 'boolean' ||
      typeof item.notesTruncated !== 'boolean' ||
      seen.has(String(item.url))
    )
      throw new Error('Invalid release source');
    seen.add(String(item.url));
    date(item.publishedAt);
    const source = RELEASE_PRODUCTS[identity.productId].sourceRepo;
    if (
      item.codeUrl !== null &&
      (!source || item.codeUrl !== `https://github.com/${source}/tree/v${item.version}`)
    )
      throw new Error('Invalid code source');
  }
}
