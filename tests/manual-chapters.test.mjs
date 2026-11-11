import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apps, currentApps } from '../src/lib/apps.ts';
import {
  MANUAL_CHAPTER_ROUTE,
  MANUAL_EDITION_ROUTE,
  MANUAL_SYSTEM_ROUTE,
  getManualSystem,
  manualChapterPath,
  manualEditionPath,
  manualSystemPath,
  manualSystems,
  publicManualChapters,
  publicManualPaths,
  validateManualSystems,
} from '../src/lib/manual-chapters.ts';

const EDITORIAL = 'recursos-editoriais';
const sampleEdition = getManualSystem(EDITORIAL).editions.find(({ id }) => id === 'edicao-1');
const sample = sampleEdition.chapters.find(({ slug }) => slug === 'area-retangular');

function fixtureEditorial() {
  const system = getManualSystem(EDITORIAL);
  return structuredClone({
    ...system,
    currentEditionId: sampleEdition.id,
    editions: [{ ...sampleEdition, chapters: [sample] }],
  });
}

function fixtureApp() {
  const system = structuredClone(getManualSystem('consolostruct'));
  const { documentation, distribution } = system.app;
  system.currentEditionId = 'edicao-1';
  system.editions = [
    {
      id: 'edicao-1',
      title: 'Edição 1',
      status: 'reviewed',
      reviewedAt: '2026-11-11',
      coverage: { version: distribution.version, sources: [{ ...documentation }] },
      chapters: [
        {
          ...structuredClone(sample),
          slug: 'introducao',
          source: 'consolostruct/introducao.md',
          status: 'published',
          sources: [{ ...documentation }],
        },
      ],
    },
  ];
  return system;
}

test('derives entries from current applications and retains the editorial sample path', () => {
  const systems = manualSystems.filter((system) => system.kind === 'app');
  assert.deepEqual(
    systems.map(({ id, name }) => ({ id, name })),
    currentApps.map(({ id, name }) => ({ id, name })),
  );
  const plannedApps = apps.filter(({ stage }) => stage === 'planned');
  for (const { id } of plannedApps) {
    assert.equal(getManualSystem(id), undefined);
    assert.throws(() => validateManualSystems([{ ...fixtureEditorial(), id }]), /\.kind/);
  }

  assert.equal(sampleEdition.coverage, null);
  assert.equal(sample.status, 'sample');
  assert.equal(sample.source, 'area-retangular.md');
  assert.equal(manualSystemPath(EDITORIAL), '/docs/recursos-editoriais');
  assert.equal(manualEditionPath(EDITORIAL, 'edicao-1'), '/docs/recursos-editoriais/edicao-1');
  assert.equal(
    manualChapterPath(EDITORIAL, 'edicao-1', 'area-retangular'),
    '/docs/recursos-editoriais/edicao-1/area-retangular',
  );
  assert.equal(MANUAL_SYSTEM_ROUTE, ':systemId');
  assert.equal(MANUAL_EDITION_ROUTE, ':systemId/:editionId');
  assert.equal(MANUAL_CHAPTER_ROUTE, ':systemId/:editionId/:chapterSlug');
});

test('retains historical paths while leaving draft editions and chapters unpublished', () => {
  const system = fixtureEditorial();
  const original = system.editions[0];
  const current = {
    ...structuredClone(original),
    id: 'edicao-2',
    chapters: [
      { ...structuredClone(sample), source: 'edicao-2/area-retangular.md' },
      {
        ...structuredClone(sample),
        slug: 'exemplo-futuro',
        source: 'exemplo-futuro.md',
        order: 2,
        status: 'draft',
        reviewedAt: null,
      },
    ],
  };
  system.editions.push(current, {
    ...original,
    id: 'edicao-3',
    status: 'draft',
    reviewedAt: null,
    chapters: [],
  });
  system.currentEditionId = current.id;

  validateManualSystems([system]);
  assert.deepEqual(publicManualPaths([system]), [
    '/docs',
    '/docs/recursos-editoriais',
    '/docs/recursos-editoriais/edicao-1',
    '/docs/recursos-editoriais/edicao-1/area-retangular',
    '/docs/recursos-editoriais/edicao-2',
    '/docs/recursos-editoriais/edicao-2/area-retangular',
  ]);
  for (const missingOrDraft of ['edicao-3', 'edicao-4']) {
    system.currentEditionId = missingOrDraft;
    assert.throws(() => validateManualSystems([system]), /currentEditionId/);
  }
});

test('returns only visible chapters in editorial order', () => {
  const [edition] = fixtureEditorial().editions;
  edition.chapters.unshift(
    { ...structuredClone(sample), slug: 'posterior', order: 3 },
    { ...structuredClone(sample), slug: 'rascunho', order: 2, status: 'draft' },
  );
  assert.deepEqual(
    publicManualChapters(edition).map(({ slug }) => slug),
    ['area-retangular', 'posterior'],
  );
});

test('rejects duplicate IDs, order and chapter sources and validates required fields', () => {
  const duplicate = fixtureEditorial();
  assert.throws(() => validateManualSystems([duplicate, duplicate]), /sistema\.id/);
  const cases = [
    [(system) => system.editions.push(system.editions[0]), /edition\.id/],
    [
      (system, chapter) =>
        system.editions[0].chapters.push({ ...chapter, order: 2, source: 'outro.md' }),
      /chapter\.slug/,
    ],
    [
      (system, chapter) =>
        system.editions[0].chapters.push({ ...chapter, slug: 'outro', source: 'outro.md' }),
      /\.order/,
    ],
    [
      (system, chapter) =>
        system.editions[0].chapters.push({ ...chapter, slug: 'outro', order: 2 }),
      /\.source/,
    ],
    [
      (_system, chapter) => {
        chapter.source = '../fora.md';
      },
      /\.source/,
    ],
    [
      (_system, chapter) => {
        chapter.status = 'em-revisao';
      },
      /\.status/,
    ],
    [
      (_system, chapter) => {
        chapter.title = ' ';
      },
      /\.title/,
    ],
    [
      (_system, chapter) => {
        chapter.keywords = [];
      },
      /\.keywords/,
    ],
    [
      (_system, chapter) => {
        chapter.reviewedAt = '2026-02-30';
      },
      /\.reviewedAt/,
    ],
    [
      (_system, chapter) => {
        chapter.reviewedAt = null;
      },
      /\.reviewedAt/,
    ],
  ];

  for (const [mutate, expected] of cases) {
    const system = fixtureEditorial();
    mutate(system, system.editions[0].chapters[0]);
    assert.throws(() => validateManualSystems([system]), expected);
  }
});

test('validates explicit product coverage and references pinned to its official repository', () => {
  const system = fixtureApp();
  validateManualSystems([system]);

  const cases = [
    [
      (edition) => {
        edition.coverage = null;
      },
      /\.coverage/,
    ],
    [
      (edition) => {
        edition.coverage.version = 'v1.9';
      },
      /\.coverage\.version/,
    ],
    [
      (edition) => {
        edition.coverage.sources = [
          { ref: 'main', url: `${system.app.repository.url}/blob/main/README.md` },
        ];
      },
      /\.ref: use SHA ou tag/,
    ],
    [
      (edition) => {
        edition.coverage.sources = [
          { ref: 'v0.0.1', url: `${system.app.repository.url}/blob/v0.0.1/README.md` },
        ];
      },
      /\.ref: versão coberta/,
    ],
    [
      (edition) => {
        edition.coverage.sources[0].url = 'https://github.com/outro/repo/blob/v1.2.3/README.md';
      },
      /\.url: origem ou ref/,
    ],
    [
      (edition) => {
        edition.chapters[0].sources = [];
      },
      /\.sources/,
    ],
  ];

  for (const [mutate, expected] of cases) {
    const fixture = fixtureApp();
    mutate(fixture.editions[0]);
    assert.throws(() => validateManualSystems([fixture]), expected);
  }
});
