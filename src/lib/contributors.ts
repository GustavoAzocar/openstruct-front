import { developmentSources } from './development.ts';
import { SNAPSHOT_STALE_MS } from './github-snapshot.ts';
import type { GithubSnapshot, PublicRepository } from './github-snapshot.ts';

export type EditorialCredit = {
  login: string;
  repository: PublicRepository;
  contribution: string;
  sourceUrl: string;
  basis: 'public-credit' | 'recorded-permission';
  reviewedAt: string;
};
// Add only after reviewing public attribution or documented permission at the source.
export const editorialCredits: EditorialCredit[] = [];
const loginPattern = /^[a-z\d][a-z\d-]{0,38}$/i;
const knownBots = new Set(['dependabot', 'github-actions', 'renovate']);
export function isPersonLogin(login: string) {
  return loginPattern.test(login) && !knownBots.has(login.toLowerCase());
}
export function validateEditorialCredits(credits: EditorialCredit[]) {
  const seen = new Set<string>();
  if (credits.length > 100) throw new Error('Too many editorial credits');
  for (const credit of credits) {
    const source = developmentSources.find((s) => s.repository === credit.repository);
    const key = `${credit.login.toLowerCase()}:${credit.repository}:${credit.contribution}`;
    if (
      !source ||
      !isPersonLogin(credit.login) ||
      seen.has(key) ||
      !credit.contribution.trim() ||
      credit.contribution.length > 180 ||
      /[\u0000-\u001f]|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(credit.contribution) ||
      !['public-credit', 'recorded-permission'].includes(credit.basis) ||
      !/^\d{4}-\d\d-\d\d$/.test(credit.reviewedAt) ||
      !Number.isFinite(Date.parse(credit.reviewedAt)) ||
      new Date(credit.reviewedAt).toISOString().slice(0, 10) !== credit.reviewedAt ||
      !credit.sourceUrl.startsWith(source.url + '/') ||
      !/^\/(?:blob|issues|pull)\//.test(credit.sourceUrl.slice(source.url.length))
    )
      throw new Error('Unverified editorial credit');
    seen.add(key);
  }
  return credits;
}

export function contributorsView(
  snapshot: GithubSnapshot | null | undefined,
  now: number,
  offline = false,
  credits = editorialCredits,
) {
  validateEditorialCredits(credits);
  const people = new Map<
    string,
    {
      login: string;
      url: string;
      repositories: {
        source: (typeof developmentSources)[number];
        checkedAt: string | null;
        stale: boolean;
      }[];
      credits: EditorialCredit[];
    }
  >();
  function person(login: string) {
    const key = login.toLowerCase();
    if (!people.has(key))
      people.set(key, {
        login: key,
        url: 'https://github.com/' + key,
        repositories: [],
        credits: [],
      });
    return people.get(key)!;
  }
  const coverage = developmentSources.map((source) => {
    const repo = snapshot?.repositories.find(
      (r) => r.repository === source.repository && r.visibility === 'public',
    );
    const list = repo?.lists.contributors;
    const age = now - Date.parse(list?.checkedAt ?? '');
    const state =
      !list || list.state === 'unavailable'
        ? 'unavailable'
        : offline ||
            list.state === 'stale' ||
            !Number.isFinite(age) ||
            age < 0 ||
            age > SNAPSHOT_STALE_MS
          ? 'stale'
          : 'fresh';
    if (state !== 'unavailable')
      for (const entry of list!.items) {
        if (
          !isPersonLogin(entry.id) ||
          entry.url.toLowerCase() !== 'https://github.com/' + entry.id.toLowerCase()
        )
          continue;
        const row = person(entry.id);
        if (!row.repositories.some((r) => r.source.repository === source.repository))
          row.repositories.push({ source, checkedAt: list!.checkedAt, stale: state === 'stale' });
      }
    return { source, state, checkedAt: list?.checkedAt, truncated: list?.truncated ?? false };
  });
  for (const credit of credits) person(credit.login).credits.push(credit);
  return {
    people: [...people.values()].sort((a, b) => a.login.localeCompare(b.login, 'en')),
    coverage,
  };
}
