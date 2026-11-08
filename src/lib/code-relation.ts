import { PRODUCT_POLICIES } from './catalog-trust.ts';
import type { CatalogProductId } from './catalog-trust.ts';
import type { CatalogRelease } from './catalog.ts';
import { releaseVersionPattern } from './release-history-contract.ts';

export type CodeRelation = {
  productId: CatalogProductId;
  version: string | null;
  channel: 'stable' | 'beta';
  catalogPublishedAt: string | null;
  packageHashes: string[];
  releaseUrl: string | null;
  sourceRepo: string;
  tag: string | null;
  baseSha: string | null;
  pinnedBaseSha: string | null;
  branch: string | null;
  headSha: string | null;
  state: 'fresh' | 'stale' | 'unavailable' | 'unconfirmed' | 'no-distribution';
  relation: 'identical' | 'ahead' | 'behind' | 'diverged' | null;
  aheadBy: number | null;
  behindBy: number | null;
  checkedAt: string | null;
  releasePrerelease: boolean | null;
  evidence: 'source-release' | 'hub-note' | null;
  compareUrl: string | null;
  reason:
    'catalog' | 'request' | 'tag-missing' | 'tag-moved' | 'source-link' | 'inconsistent' | null;
};
export const SHA = /^[a-f0-9]{40}$/;
export const validRef = (s: unknown): s is string =>
  typeof s === 'string' &&
  s.length > 0 &&
  s.length <= 100 &&
  !/[\s~^:?*\[\\\x00-\x1f]|\.\.|@\{|^\.|\.$|\/\//.test(s);
export function blankRelation(productId: CatalogProductId): CodeRelation {
  return {
    productId,
    sourceRepo: PRODUCT_POLICIES[productId].sourceRepo,
    channel: 'stable',
    version: null,
    catalogPublishedAt: null,
    packageHashes: [],
    releaseUrl: null,
    tag: null,
    baseSha: null,
    pinnedBaseSha: null,
    branch: null,
    headSha: null,
    state: 'unavailable',
    relation: null,
    aheadBy: null,
    behindBy: null,
    checkedAt: null,
    evidence: null,
    releasePrerelease: null,
    compareUrl: null,
    reason: 'catalog',
  };
}
const keys = Object.keys(blankRelation('molastruct'));
export function validateCodeRelation(
  value: unknown,
  repository: string,
  publicSource: boolean,
): asserts value is CodeRelation {
  const fail = () => {
    throw Error('Invalid public code relation');
  };
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  const r = value as CodeRelation;
  if (
    Object.keys(r).length !== keys.length ||
    Object.keys(r).some((k) => !keys.includes(k)) ||
    !Object.hasOwn(PRODUCT_POLICIES, r.productId)
  )
    fail();
  const p = PRODUCT_POLICIES[r.productId];
  if (
    !Array.isArray(r.packageHashes) ||
    r.packageHashes.length > 20 ||
    r.packageHashes.some((h) => typeof h !== 'string' || !/^[a-f0-9]{64}$/.test(h))
  )
    fail();
  if (
    !publicSource ||
    r.sourceRepo !== repository ||
    r.sourceRepo !== p.sourceRepo ||
    !['stable', 'beta'].includes(r.channel) ||
    !['fresh', 'stale', 'unavailable', 'unconfirmed', 'no-distribution'].includes(r.state)
  )
    fail();
  for (const v of [r.baseSha, r.pinnedBaseSha, r.headSha]) if (v !== null && !SHA.test(v)) fail();
  for (const v of [r.checkedAt, r.catalogPublishedAt])
    if (
      v !== null &&
      (typeof v !== 'string' || !/^\d{4}-\d\d-\d\dT/.test(v) || !Number.isFinite(Date.parse(v)))
    )
      fail();
  if (r.branch !== null && !validRef(r.branch)) fail();
  if (r.version !== null && (!releaseVersionPattern.test(r.version) || r.version.length > 100))
    fail();
  if (r.tag !== (r.version ? 'v' + r.version : null)) fail();
  if (
    r.releaseUrl !==
    (r.version
      ? `https://github.com/${p.releaseRepo}/releases/tag/${p.tagPrefix}${r.version}`
      : null)
  )
    fail();
  if (
    ![
      null,
      'catalog',
      'request',
      'tag-missing',
      'tag-moved',
      'source-link',
      'inconsistent',
    ].includes(r.reason)
  )
    fail();
  if (![null, 'source-release', 'hub-note'].includes(r.evidence)) fail();
  if (r.releasePrerelease !== null && typeof r.releasePrerelease !== 'boolean') fail();
  if (r.evidence && r.evidence !== (p.sourceRepo === p.releaseRepo ? 'source-release' : 'hub-note'))
    fail();
  const confirmed = ['fresh', 'stale'].includes(r.state);
  if (confirmed) {
    if (
      !r.version ||
      !r.catalogPublishedAt ||
      !r.baseSha ||
      r.baseSha !== r.pinnedBaseSha ||
      !r.headSha ||
      !r.branch ||
      !r.checkedAt ||
      !r.evidence ||
      typeof r.releasePrerelease !== 'boolean' ||
      r.reason !== null
    )
      fail();
    if (
      !Number.isSafeInteger(r.aheadBy) ||
      r.aheadBy! < 0 ||
      !Number.isSafeInteger(r.behindBy) ||
      r.behindBy! < 0
    )
      fail();
    const expected =
      r.aheadBy === 0
        ? r.behindBy === 0
          ? 'identical'
          : 'behind'
        : r.behindBy === 0
          ? 'ahead'
          : 'diverged';
    if (r.relation !== expected || (r.baseSha === r.headSha) !== (expected === 'identical')) fail();
    if (r.compareUrl !== `https://github.com/${p.sourceRepo}/compare/${r.baseSha}...${r.headSha}`)
      fail();
  } else if (
    r.relation !== null ||
    r.aheadBy !== null ||
    r.behindBy !== null ||
    r.compareUrl !== null
  )
    fail();
  if (r.state === 'no-distribution' && (r.version !== null || r.reason !== null)) fail();
}
export function relationView(
  row: CodeRelation | undefined,
  product: { status: string; release?: CatalogRelease; stale?: boolean } | undefined,
  now: number,
  offline = false,
) {
  if (product?.status === 'unavailable')
    return { text: 'Sem versão distribuída neste canal.', row: undefined, stale: false };
  if (product?.status !== 'ready' || !product.release)
    return {
      text: 'Relação com o código não confirmada: catálogo indisponível.',
      row: undefined,
      stale: false,
    };
  if (
    !row ||
    JSON.stringify(row.packageHashes) !==
      JSON.stringify(product.release.assets.map((a) => a.sha256).sort()) ||
    row.version !== product.release.version ||
    row.channel !== product.release.channel ||
    row.releaseUrl !== product.release.releaseUrl
  )
    return {
      text: 'Relação com o código não confirmada para esta versão.',
      row: undefined,
      stale: false,
    };
  const age = now - Date.parse(row.checkedAt ?? '');
  const stale =
    offline ||
    Boolean(product.stale) ||
    row.state === 'stale' ||
    !Number.isFinite(age) ||
    age < 0 ||
    age > 2 * 60 * 60_000;
  const text =
    row.state === 'unconfirmed'
      ? 'Relação com o código não confirmada' +
        (row.reason === 'tag-moved' ? ': a tag mudou de revisão.' : '.')
      : row.state === 'unavailable'
        ? 'Comparação com o código temporariamente indisponível.'
        : row.relation === 'identical'
          ? 'A tag e a branch apontam para o mesmo commit.'
          : row.relation === 'ahead'
            ? 'Há desenvolvimento posterior à tag desta versão.'
            : row.relation === 'behind'
              ? 'A branch está em um ancestral da tag.'
              : row.relation === 'diverged'
                ? 'A tag e a branch têm históricos diferentes. Consulte a comparação.'
                : 'Relação com o código não confirmada.';
  return { text, row, stale };
}
