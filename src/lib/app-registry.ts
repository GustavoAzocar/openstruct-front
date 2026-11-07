/** Editorial product data. This module is deliberately independent of Vite and the network. */
export type SourceReference = { url: string; ref: string };
export type EditorialReview = {
  reviewedAt: string;
  sources: (SourceReference & { kind: 'description' | 'distribution' | 'planning' })[];
};
export type DesktopPackage = {
  os: 'windows' | 'linux';
  arch: 'x86_64';
  format: 'exe' | 'AppImage';
  url: string;
};
export type AppDistribution = {
  version: string;
  sourceTag: string;
  sourceCommit: string;
  channel: 'stable' | 'prerelease';
  publishedAt: string;
  releaseUrl: string;
  platforms: DesktopPackage[];
};
type AppIdentity = {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  symbol: string;
  number: string;
  editorial: EditorialReview;
};
export type CurrentApp = AppIdentity & {
  stage: 'current';
  maturity: 'development' | 'experimental' | 'stable';
  route: `/apps/${string}`;
  previewAnchor: `#${string}`;
  image: string;
  imageAlt: string;
  repository: { url: string; branch: string; visibility: 'public' };
  documentation: SourceReference;
  license: SourceReference & { spdx: 'MIT' | 'GPL-3.0-or-later' };
  code: SourceReference & { version: string };
  engine?: SourceReference & { version: string; policy: string };
  distribution?: AppDistribution;
};
export type PlannedApp = AppIdentity & {
  stage: 'planned';
  maturity: 'planned';
  route?: never;
  previewAnchor?: never;
  image?: never;
  imageAlt?: never;
  repository?: never;
  documentation?: never;
  license?: never;
  code?: never;
  engine?: never;
  distribution?: never;
};
export type AppEntry = CurrentApp | PlannedApp;

const commitPattern = /^[a-f0-9]{40}$/;
const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;

function requireValue(condition: unknown, field: string): asserts condition {
  if (!condition) throw new Error(`Registro de aplicativos inválido: ${field}.`);
}

function record(value: unknown, field: string): Record<string, unknown> {
  requireValue(value && typeof value === 'object' && !Array.isArray(value), field);
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string): string {
  requireValue(typeof value === 'string' && value.trim().length > 0, field);
  return value;
}

function githubUrl(value: unknown, field: string): URL {
  const raw = text(value, field);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Registro de aplicativos inválido: ${field}.`);
  }
  requireValue(
    url.origin === 'https://github.com' &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash,
    field,
  );
  return url;
}

function source(value: unknown, field: string, repository?: string): void {
  const item = record(value, field);
  const ref = text(item.ref, `${field}.ref`);
  // Pin evidence to a commit or a release tag, never to a moving default branch.
  requireValue(
    commitPattern.test(ref) || /^v\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(ref),
    `${field}.ref`,
  );
  const url = githubUrl(item.url, `${field}.url`);
  requireValue(url.pathname.split('/')[3] === 'blob', `${field}.url`);
  requireValue(url.pathname.split('/')[4] === ref, `${field}.ref/url`);
  requireValue(url.pathname.split('/').length > 5, `${field}.url`);
  if (repository) requireValue(url.href.startsWith(`${repository}/blob/`), `${field}.repository`);
}

/** Runtime checks also protect JS callers and future JSON imports; TypeScript alone cannot. */
export function validateAppRegistry(value: unknown): asserts value is AppEntry[] {
  requireValue(Array.isArray(value) && value.length > 0, 'aplicativos');
  const ids = new Set<string>();
  const routes = new Set<string>();
  for (const item of value) {
    const app = record(item, 'aplicativo');
    const id = text(app.id, 'id');
    const allowed = [
      'id',
      'name',
      'category',
      'description',
      'color',
      'symbol',
      'number',
      'editorial',
      'stage',
      'maturity',
      ...(app.stage === 'planned'
        ? []
        : [
            'route',
            'previewAnchor',
            'image',
            'imageAlt',
            'repository',
            'documentation',
            'license',
            'code',
            'engine',
            'distribution',
          ]),
    ];
    requireValue(
      Object.keys(app).every((key) => allowed.includes(key)),
      `${id}: campo não previsto`,
    );
    requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && !ids.has(id), `${id}: id único`);
    ids.add(id);
    for (const key of ['name', 'category', 'description', 'color', 'symbol', 'number']) {
      text(app[key], `${id}.${key}`);
    }
    const editorial = record(app.editorial, `${id}.editorial`);
    const date = text(editorial.reviewedAt, `${id}.editorial.reviewedAt`);
    requireValue(
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isFinite(Date.parse(date)) &&
        new Date(date).toISOString().slice(0, 10) === date,
      `${id}.editorial.reviewedAt`,
    );
    requireValue(Array.isArray(editorial.sources) && editorial.sources.length > 0, `${id}.sources`);
    const kinds = new Set<string>();
    for (const evidence of editorial.sources) {
      const entry = record(evidence, `${id}.source`);
      requireValue(
        ['description', 'distribution', 'planning'].includes(String(entry.kind)),
        `${id}.source.kind`,
      );
      source(entry, `${id}.source`);
      kinds.add(String(entry.kind));
    }
    if (app.stage === 'planned') {
      requireValue(app.maturity === 'planned' && kinds.has('planning'), `${id}.planejamento`);
      for (const key of [
        'route',
        'previewAnchor',
        'image',
        'imageAlt',
        'repository',
        'documentation',
        'license',
        'code',
        'engine',
        'distribution',
      ]) {
        requireValue(app[key] === undefined, `${id}: planejamento sem ${key}`);
      }
      continue;
    }
    requireValue(app.stage === 'current', `${id}.stage`);
    requireValue(
      ['development', 'experimental', 'stable'].includes(String(app.maturity)),
      `${id}.maturity`,
    );
    const route = text(app.route, `${id}.route`);
    requireValue(route === `/apps/${id}` && !routes.has(route), `${id}.route`);
    routes.add(route);
    requireValue(
      /^#[\w-]+$/.test(text(app.previewAnchor, `${id}.previewAnchor`)),
      `${id}.previewAnchor`,
    );
    requireValue(/^\/assets\/[\w.-]+$/.test(text(app.image, `${id}.image`)), `${id}.image`);
    text(app.imageAlt, `${id}.imageAlt`);
    const repository = record(app.repository, `${id}.repository`);
    const repoUrl = githubUrl(repository.url, `${id}.repository.url`);
    requireValue(/^\/[\w.-]+\/[\w.-]+$/.test(repoUrl.pathname), `${id}.repository.url`);
    requireValue(repository.visibility === 'public', `${id}.repository.visibility`);
    text(repository.branch, `${id}.repository.branch`);
    source(app.documentation, `${id}.documentation`, repoUrl.href);
    source(app.license, `${id}.license`, repoUrl.href);
    const license = record(app.license, `${id}.license`);
    requireValue(['MIT', 'GPL-3.0-or-later'].includes(String(license.spdx)), `${id}.license.spdx`);
    source(app.code, `${id}.code`, repoUrl.href);
    const code = record(app.code, `${id}.code`);
    requireValue(
      versionPattern.test(text(code.version, `${id}.code.version`)),
      `${id}.code.version`,
    );
    requireValue(commitPattern.test(String(code.ref)), `${id}.code.ref`);
    if (app.engine !== undefined) {
      source(app.engine, `${id}.engine`, repoUrl.href);
      const engine = record(app.engine, `${id}.engine`);
      requireValue(
        versionPattern.test(text(engine.version, `${id}.engine.version`)),
        `${id}.engine.version`,
      );
      text(engine.policy, `${id}.engine.policy`);
    }
    requireValue(kinds.has('description'), `${id}.description source`);
    const description = editorial.sources.find((entry) => entry.kind === 'description');
    source(description, `${id}.description source`, repoUrl.href);
    if (app.distribution === undefined) continue;
    const release = record(app.distribution, `${id}.distribution`);
    const version = text(release.version, `${id}.distribution.version`);
    requireValue(versionPattern.test(version), `${id}.distribution.version`);
    requireValue(release.sourceTag === `v${version}`, `${id}.distribution.sourceTag`);
    requireValue(
      commitPattern.test(String(release.sourceCommit)),
      `${id}.distribution.sourceCommit`,
    );
    // A newer README (even with the same package version) does not describe an older binary.
    const releaseRefs = [release.sourceTag, release.sourceCommit];
    if (app.engine !== undefined) {
      requireValue(
        releaseRefs.includes(record(app.engine, `${id}.engine`).ref),
        `${id}.engine: fonte da versão distribuída`,
      );
    }
    requireValue(
      releaseRefs.includes(description.ref),
      `${id}.description: fonte da versão distribuída`,
    );
    requireValue(
      releaseRefs.includes(record(app.documentation, `${id}.documentation`).ref),
      `${id}.documentation: fonte da versão distribuída`,
    );
    requireValue(
      ['stable', 'prerelease'].includes(String(release.channel)),
      `${id}.distribution.channel`,
    );
    requireValue(
      Number.isFinite(Date.parse(text(release.publishedAt, `${id}.publishedAt`))),
      `${id}.publishedAt`,
    );
    const releaseUrl = githubUrl(release.releaseUrl, `${id}.releaseUrl`).href;
    const ownRelease = `${repoUrl.href}/releases/tag/v${version}`;
    const hubRelease = `https://github.com/ricardocorsini/openstruct-catalog/releases/tag/${id}-v${version}`;
    requireValue(releaseUrl === ownRelease || releaseUrl === hubRelease, `${id}.releaseUrl`);
    requireValue(kinds.has('distribution'), `${id}.distribution source`);
    requireValue(
      Array.isArray(release.platforms) && release.platforms.length > 0,
      `${id}.platforms`,
    );
    const platforms = new Set<string>();
    for (const entry of release.platforms) {
      const asset = record(entry, `${id}.package`);
      const os = text(asset.os, `${id}.package.os`);
      requireValue(
        ['windows', 'linux'].includes(os) && asset.arch === 'x86_64',
        `${id}.package.platform`,
      );
      requireValue(!platforms.has(os), `${id}.package: plataforma duplicada`);
      platforms.add(os);
      const format = os === 'windows' ? 'exe' : 'AppImage';
      requireValue(asset.format === format, `${id}.package.format`);
      const expected = `${releaseUrl.replace('/tag/', '/download/')}/${id}-${version}-${os}-x86_64.${format}`;
      requireValue(asset.url === expected, `${id}.package.url`);
    }
  }
}

export function isCurrentApp(app: AppEntry): app is CurrentApp {
  return app.stage === 'current';
}

/** Availability is independent of code version and engineering maturity. */
export function getAppStatus(app: AppEntry): string {
  if (app.stage === 'planned') return 'Em planejamento';
  return app.distribution?.platforms.length ? 'Disponível para desktop' : 'Em desenvolvimento';
}

export function getMaturityLabel(app: CurrentApp): string {
  return { development: 'Em desenvolvimento', experimental: 'Experimental', stable: 'Estável' }[
    app.maturity
  ];
}
