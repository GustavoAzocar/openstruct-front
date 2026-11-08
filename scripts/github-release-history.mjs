import {
  releaseIdentity,
  RELEASE_PRODUCTS,
  validateReleaseHistory,
} from '../src/lib/release-history-contract.ts';
const clean = (value, max) =>
  String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email removido]')
    .slice(0, max);
export function normalizeReleaseHistory(body, repository) {
  if (!Array.isArray(body) || body.length > 30) throw new Error('Invalid releases');
  const items = [];
  for (const release of body) {
    // Drafts can be returned with runner credentials; never normalize or cache their text.
    if (release?.draft !== false) continue;
    const identity =
      typeof release.tag_name === 'string' ? releaseIdentity(repository, release.tag_name) : null;
    if (!identity) continue;
    const date = Date.parse(release.published_at ?? '');
    if (!Number.isFinite(date) || typeof release.prerelease !== 'boolean')
      throw new Error('Invalid published release');
    const source = RELEASE_PRODUCTS[identity.productId].sourceRepo;
    const sourceUrl = source ? `https://github.com/${source}/tree/v${identity.version}` : null;
    const rawNotes = String(release.body ?? '');
    const noteUrls = rawNotes.match(/https:\/\/github\.com\/[^\s<>"'\)\]]+/g) ?? [];
    const notes =
      identity.productId === 'launcher'
        ? rawNotes.replace(/^.*https:\/\/github\.com\/ricardocorsini\/launcher-struct\S*.*$/gm, '')
        : rawNotes;
    items.push({
      ...identity,
      tag: release.tag_name,
      name: clean(release.name || release.tag_name, 200).replace(/[\r\n\t]/g, ' '),
      url: release.html_url,
      publishedAt: new Date(date).toISOString(),
      prerelease: release.prerelease,
      notes: clean(notes, 2000).trim(),
      notesTruncated: notes.length > 2000,
      codeUrl:
        sourceUrl && (repository === source || noteUrls.includes(sourceUrl)) ? sourceUrl : null,
    });
  }
  validateReleaseHistory(
    { state: 'fresh', checkedAt: new Date(0).toISOString(), truncated: false, items },
    repository,
    true,
  );
  return items;
}
