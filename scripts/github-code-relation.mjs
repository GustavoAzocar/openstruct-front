import { blankRelation, validateCodeRelation, SHA, validRef } from '../src/lib/code-relation.ts';
import { PRODUCT_POLICIES } from '../src/lib/catalog-trust.ts';
import { normalizeReleaseHistory } from './github-release-history.mjs';

/** Only normalized metadata enters ETag cache. Never export git messages, files or emails. */
export async function collectCodeRelation({
  id,
  product,
  catalogPublishedAt,
  repository,
  distributor,
  request,
  cache,
  previous,
  at,
  fixedSource,
  channel = 'stable',
}) {
  let row = { ...blankRelation(id), channel };
  const policy = PRODUCT_POLICIES[id];
  const same =
    previous &&
    product?.status === 'ready' &&
    previous.version === product.release.version &&
    previous.channel === product.release.channel &&
    previous.releaseUrl === product.release.releaseUrl;
  if (product?.status === 'ready')
    Object.assign(row, {
      version: product.release.version,
      channel: product.release.channel,
      catalogPublishedAt,
      packageHashes: product.release.assets.map((a) => a.sha256).sort(),
      pinnedBaseSha: same ? previous.pinnedBaseSha : null,
      releaseUrl: product.release.releaseUrl,
      tag: 'v' + product.release.version,
      branch: repository.summary?.defaultBranch ?? null,
    });
  if (product?.status === 'unavailable')
    return { ...row, state: 'no-distribution', reason: null, checkedAt: at, catalogPublishedAt };
  if (!product || product.status === 'invalid')
    return previous
      ? {
          ...previous,
          state: previous.relation ? 'stale' : 'unavailable',
          reason: previous.relation ? null : 'catalog',
        }
      : row;
  if (!repository.summary || distributor?.visibility !== 'public')
    return { ...row, state: 'unconfirmed', reason: 'source-link', checkedAt: at };
  const prefix = 'https://api.github.com/repos/' + policy.sourceRepo;
  const used = [];
  const fail = (reason) => {
    throw Object.assign(Error(reason), { relationReason: reason });
  };
  async function read(url, normalize) {
    used.push(url);
    const response = await request(url, cache[url], true);
    const value = response.body === undefined ? response.items?.[0] : normalize(response.body);
    if (!value) fail('inconsistent');
    // Revalidate normalized cached values, too.
    const result = response.body === undefined ? normalize(value, true) : value;
    cache[url] = { items: [result], etag: response.etag, next: null };
    return result;
  }
  function gitObject(body, cached = false) {
    const object = cached ? body : body?.object;
    if (!object || !['tag', 'commit'].includes(object.type) || !SHA.test(object.sha))
      fail('inconsistent');
    return { type: object.type, sha: object.sha };
  }
  try {
    let release =
      distributor.releaseHistory.state === 'fresh'
        ? distributor.releaseHistory.items.find(
            (r) => r.productId === id && r.version === row.version,
          )
        : null;
    if (!release) {
      const url =
        'https://api.github.com/repos/' +
        policy.releaseRepo +
        '/releases/tags/' +
        encodeURIComponent(policy.tagPrefix + row.version);
      release = await read(url, (body, cached) => {
        const r = cached ? body : normalizeReleaseHistory([body], policy.releaseRepo)[0];
        if (
          !r ||
          r.productId !== id ||
          r.version !== row.version ||
          r.url !== row.releaseUrl ||
          typeof r.prerelease !== 'boolean'
        )
          fail('source-link');
        return r;
      });
    }
    if (release.codeUrl !== `https://github.com/${policy.sourceRepo}/tree/${row.tag}`)
      fail('source-link');
    row.releasePrerelease = release.prerelease;
    row.evidence = policy.releaseRepo === policy.sourceRepo ? 'source-release' : 'hub-note';
    if (!validRef(row.tag) || !validRef(row.branch)) fail('inconsistent');
    const tagUrl = prefix + '/git/ref/tags/' + encodeURIComponent(row.tag);
    let object = await read(tagUrl, (body, cached) => {
      if (!cached && body?.ref !== 'refs/tags/' + row.tag) fail('inconsistent');
      return gitObject(body, cached);
    });
    const seen = new Set();
    for (let depth = 0; object.type === 'tag'; depth++) {
      if (depth >= 3 || seen.has(object.sha)) fail('inconsistent');
      seen.add(object.sha);
      object = await read(prefix + '/git/tags/' + object.sha, gitObject);
    }
    row.baseSha = object.sha;
    row.pinnedBaseSha =
      (same ? previous.pinnedBaseSha : null) ||
      (fixedSource?.version === row.version ? fixedSource.sourceCommit : null) ||
      row.baseSha;
    if (row.baseSha !== row.pinnedBaseSha) fail('tag-moved');
    const branch = await read(
      prefix + '/git/ref/heads/' + encodeURIComponent(row.branch),
      (body, cached) => {
        if (!cached && body?.ref !== 'refs/heads/' + row.branch) fail('inconsistent');
        const o = gitObject(body, cached);
        if (o.type !== 'commit') fail('inconsistent');
        return o;
      },
    );
    row.headSha = branch.sha;
    const comparison = await read(
      prefix + '/compare/' + row.baseSha + '...' + row.headSha + '?per_page=1',
      (body, cached) => {
        const c = cached
          ? body
          : {
              status: body?.status,
              ahead: body?.ahead_by,
              behind: body?.behind_by,
              base: body?.base_commit?.sha,
              mergeBase: body?.merge_base_commit?.sha,
            };
        if (
          !c ||
          !['identical', 'ahead', 'behind', 'diverged'].includes(c.status) ||
          ![c.ahead, c.behind].every((n) => Number.isSafeInteger(n) && n >= 0) ||
          c.base !== row.baseSha ||
          !SHA.test(c.mergeBase)
        )
          fail('inconsistent');
        const expected =
          c.ahead === 0
            ? c.behind === 0
              ? 'identical'
              : 'behind'
            : c.behind === 0
              ? 'ahead'
              : 'diverged';
        if (
          c.status !== expected ||
          (row.baseSha === row.headSha) !== (expected === 'identical') ||
          (expected === 'ahead' && c.mergeBase !== row.baseSha) ||
          (expected === 'behind' && c.mergeBase !== row.headSha)
        )
          fail('inconsistent');
        return {
          status: c.status,
          ahead: c.ahead,
          behind: c.behind,
          base: c.base,
          mergeBase: c.mergeBase,
        };
      },
    );
    Object.assign(row, {
      state: 'fresh',
      reason: null,
      checkedAt: at,
      relation: comparison.status,
      aheadBy: comparison.ahead,
      behindBy: comparison.behind,
      compareUrl: `https://github.com/${policy.sourceRepo}/compare/${row.baseSha}...${row.headSha}`,
    });
    validateCodeRelation(row, policy.sourceRepo, true);
    return row;
  } catch (error) {
    Object.assign(row, { relation: null, aheadBy: null, behindBy: null, compareUrl: null });
    for (const url of used) delete cache[url];
    if (error.code === 'not-found')
      return { ...row, state: 'unconfirmed', checkedAt: at, reason: 'tag-missing' };
    if (error.relationReason)
      return { ...row, state: 'unconfirmed', checkedAt: at, reason: error.relationReason };
    if (same && previous.relation) return { ...previous, state: 'stale' };
    return { ...row, state: 'unavailable', checkedAt: at, reason: 'request' };
  }
}
