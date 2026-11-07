import { isCurrentApp, validateAppRegistry } from './app-registry.ts';
import type { AppEntry, CurrentApp } from './app-registry.ts';

/** Reviewed public evidence, not a live feed. See docs/CATALOGO-EDITORIAL.md. */
export const apps: AppEntry[] = [
  {
    id: 'consolostruct',
    name: 'ConsoloStruct',
    category: 'Concreto armado',
    description:
      'Cálculo de consolos curtos e muito curtos, memória de ELU e detalhamento com quadro de aço.',
    color: 'orange',
    symbol: 'corbel',
    number: '01',
    route: '/apps/consolostruct',
    previewAnchor: '#demonstracao',
    image: '/assets/consolostruct-atlas.webp',
    imageAlt: 'Atlas em gravura sustentando uma peça de pedra, ilustração do ConsoloStruct',
    stage: 'current',
    maturity: 'development',
    repository: {
      url: 'https://github.com/ricardocorsini/consolo-struct',
      branch: 'master',
      visibility: 'public',
    },
    documentation: {
      url: 'https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/docs/GUIA-DE-USO.md',
      ref: '1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c',
    },
    license: {
      spdx: 'MIT',
      url: 'https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/LICENSE',
      ref: '1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c',
    },
    code: {
      version: '0.6.0',
      url: 'https://github.com/ricardocorsini/consolo-struct/blob/479fcadcce28e967df26a9defa6f32ea8924792f/package.json',
      ref: '479fcadcce28e967df26a9defa6f32ea8924792f',
    },
    engine: {
      version: '0.3.0',
      policy: 'LC-ELU-2026.1',
      url: 'https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/docs/CRITERIOS-DE-CALCULO.md',
      ref: '1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c',
    },
    distribution: {
      version: '0.6.0',
      sourceTag: 'v0.6.0',
      sourceCommit: '1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c',
      channel: 'stable',
      publishedAt: '2026-11-06T21:32:23Z',
      releaseUrl: 'https://github.com/ricardocorsini/consolo-struct/releases/tag/v0.6.0',
      platforms: [
        {
          os: 'windows',
          arch: 'x86_64',
          format: 'exe',
          url: 'https://github.com/ricardocorsini/consolo-struct/releases/download/v0.6.0/consolostruct-0.6.0-windows-x86_64.exe',
        },
        {
          os: 'linux',
          arch: 'x86_64',
          format: 'AppImage',
          url: 'https://github.com/ricardocorsini/consolo-struct/releases/download/v0.6.0/consolostruct-0.6.0-linux-x86_64.AppImage',
        },
      ],
    },
    editorial: {
      reviewedAt: '2026-11-07',
      sources: [
        {
          kind: 'description',
          url: 'https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/README.md',
          ref: '1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c',
        },
        {
          kind: 'distribution',
          url: 'https://github.com/ricardocorsini/openstruct-catalog/blob/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31/catalog.signed.json',
          ref: 'bbddcf9a37a1f63658a34dae24dd5afb1d56cf31',
        },
      ],
    },
  },
  {
    id: 'molastruct',
    name: 'MolaStruct',
    category: 'Fundações',
    description:
      'Rigidez de sapatas e blocos sobre estacas, com perfil SPT, matriz 6×6 e memória de cálculo.',
    color: 'cobalt',
    symbol: 'footing',
    number: '02',
    route: '/apps/molastruct',
    previewAnchor: '#visao-geral',
    image: '/assets/molastruct-gaia.webp',
    imageAlt:
      'Figura da Terra em gravura sustentando uma mola e uma base de fundação sobre fundo cobalto',
    stage: 'current',
    maturity: 'experimental',
    repository: {
      url: 'https://github.com/ricardocorsini/mola-struct',
      branch: 'master',
      visibility: 'public',
    },
    documentation: {
      url: 'https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/README.md',
      ref: '5d22f0626f8feb709a8b3b8301babd9985667d01',
    },
    license: {
      spdx: 'MIT',
      url: 'https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/LICENSE',
      ref: '5d22f0626f8feb709a8b3b8301babd9985667d01',
    },
    code: {
      version: '0.7.0',
      url: 'https://github.com/ricardocorsini/mola-struct/blob/aeda58309ddadcd53cac16aa1625473391d8efad/package.json',
      ref: 'aeda58309ddadcd53cac16aa1625473391d8efad',
    },
    distribution: {
      version: '0.5.1',
      sourceTag: 'v0.5.1',
      sourceCommit: '5d22f0626f8feb709a8b3b8301babd9985667d01',
      channel: 'stable',
      publishedAt: '2026-11-06T20:19:19Z',
      releaseUrl: 'https://github.com/ricardocorsini/mola-struct/releases/tag/v0.5.1',
      platforms: [
        {
          os: 'windows',
          arch: 'x86_64',
          format: 'exe',
          url: 'https://github.com/ricardocorsini/mola-struct/releases/download/v0.5.1/molastruct-0.5.1-windows-x86_64.exe',
        },
        {
          os: 'linux',
          arch: 'x86_64',
          format: 'AppImage',
          url: 'https://github.com/ricardocorsini/mola-struct/releases/download/v0.5.1/molastruct-0.5.1-linux-x86_64.AppImage',
        },
      ],
    },
    editorial: {
      reviewedAt: '2026-11-07',
      sources: [
        {
          kind: 'description',
          url: 'https://github.com/ricardocorsini/mola-struct/blob/5d22f0626f8feb709a8b3b8301babd9985667d01/README.md',
          ref: '5d22f0626f8feb709a8b3b8301babd9985667d01',
        },
        {
          kind: 'distribution',
          url: 'https://github.com/ricardocorsini/openstruct-catalog/blob/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31/catalog.signed.json',
          ref: 'bbddcf9a37a1f63658a34dae24dd5afb1d56cf31',
        },
      ],
    },
  },
  {
    id: 'armadurastruct',
    name: 'ArmaduraStruct',
    category: 'Detalhamento',
    description:
      'Da fôrma ao aço. Um ambiente CAD para desenhar armaduras e gerar o quadro de aço.',
    color: 'amber',
    symbol: 'frame',
    number: '03',
    route: '/apps/armadurastruct',
    previewAnchor: '#editor',
    image: '/assets/armadurastruct-hephaestus.webp',
    imageAlt: 'Hefesto em gravura trabalhando uma armadura de aço sobre fundo âmbar',
    stage: 'current',
    maturity: 'development',
    repository: {
      url: 'https://github.com/ricardocorsini/armadura-struct',
      branch: 'master',
      visibility: 'public',
    },
    documentation: {
      url: 'https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/docs/GUIA.md',
      ref: 'c25baa3b6b914670eccc58e40c87e06732d9019b',
    },
    license: {
      spdx: 'GPL-3.0-or-later',
      url: 'https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/LICENSE',
      ref: 'c25baa3b6b914670eccc58e40c87e06732d9019b',
    },
    code: {
      version: '0.2.0',
      url: 'https://github.com/ricardocorsini/armadura-struct/blob/2b19db198eba2ad4174b366df457521d3dc45808/package.json',
      ref: '2b19db198eba2ad4174b366df457521d3dc45808',
    },
    distribution: {
      version: '0.2.0',
      sourceTag: 'v0.2.0',
      sourceCommit: 'c25baa3b6b914670eccc58e40c87e06732d9019b',
      channel: 'stable',
      publishedAt: '2026-11-06T22:43:29Z',
      releaseUrl:
        'https://github.com/ricardocorsini/openstruct-catalog/releases/tag/armadurastruct-v0.2.0',
      platforms: [
        {
          os: 'windows',
          arch: 'x86_64',
          format: 'exe',
          url: 'https://github.com/ricardocorsini/openstruct-catalog/releases/download/armadurastruct-v0.2.0/armadurastruct-0.2.0-windows-x86_64.exe',
        },
        {
          os: 'linux',
          arch: 'x86_64',
          format: 'AppImage',
          url: 'https://github.com/ricardocorsini/openstruct-catalog/releases/download/armadurastruct-v0.2.0/armadurastruct-0.2.0-linux-x86_64.AppImage',
        },
      ],
    },
    editorial: {
      reviewedAt: '2026-11-07',
      sources: [
        {
          kind: 'description',
          url: 'https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/README.md',
          ref: 'c25baa3b6b914670eccc58e40c87e06732d9019b',
        },
        {
          kind: 'distribution',
          url: 'https://github.com/ricardocorsini/openstruct-catalog/blob/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31/catalog.signed.json',
          ref: 'bbddcf9a37a1f63658a34dae24dd5afb1d56cf31',
        },
      ],
    },
  },
  {
    id: 'vigasstruct',
    name: 'VigasStruct',
    category: 'Concreto armado',
    description: 'Um novo olhar para o dimensionamento e o detalhamento de vigas.',
    color: 'blue',
    symbol: 'beam',
    number: '04',
    stage: 'planned',
    maturity: 'planned',
    editorial: {
      reviewedAt: '2026-11-07',
      sources: [
        {
          kind: 'planning',
          url: 'https://github.com/ricardocorsini/openstruct-front/blob/7a4b3ce1f69625953e45db76861cea321df90a2d/src/lib/config.ts',
          ref: '7a4b3ce1f69625953e45db76861cea321df90a2d',
        },
      ],
    },
  },
  {
    id: 'pilarstruct',
    name: 'PilarStruct',
    category: 'Concreto armado',
    description: 'Geometria, materiais e interação para estudar seções de pilares.',
    color: 'steel',
    symbol: 'column',
    number: '05',
    stage: 'planned',
    maturity: 'planned',
    editorial: {
      reviewedAt: '2026-11-07',
      sources: [
        {
          kind: 'planning',
          url: 'https://github.com/ricardocorsini/openstruct-front/blob/7a4b3ce1f69625953e45db76861cea321df90a2d/src/lib/config.ts',
          ref: '7a4b3ce1f69625953e45db76861cea321df90a2d',
        },
      ],
    },
  },
  {
    id: 'sapatastruct',
    name: 'SapataStruct',
    category: 'Fundações',
    description: 'O encontro entre solo, estrutura e ferramentas abertas.',
    color: 'amber',
    symbol: 'footing',
    number: '06',
    stage: 'planned',
    maturity: 'planned',
    editorial: {
      reviewedAt: '2026-11-07',
      sources: [
        {
          kind: 'planning',
          url: 'https://github.com/ricardocorsini/openstruct-front/blob/7a4b3ce1f69625953e45db76861cea321df90a2d/src/lib/config.ts',
          ref: '7a4b3ce1f69625953e45db76861cea321df90a2d',
        },
      ],
    },
  },
  {
    id: '3dstruct',
    name: '3DStruct',
    category: 'Visualização',
    description: 'Uma forma mais clara de explorar e apresentar modelos estruturais.',
    color: 'ink',
    symbol: 'frame',
    number: '07',
    stage: 'planned',
    maturity: 'planned',
    editorial: {
      reviewedAt: '2026-11-07',
      sources: [
        {
          kind: 'planning',
          url: 'https://github.com/ricardocorsini/openstruct-front/blob/7a4b3ce1f69625953e45db76861cea321df90a2d/src/lib/config.ts',
          ref: '7a4b3ce1f69625953e45db76861cea321df90a2d',
        },
      ],
    },
  },
];

validateAppRegistry(apps);

export const currentApps = apps.filter(isCurrentApp);
export const currentAppNames = new Intl.ListFormat('pt-BR').format(
  currentApps.map((app) => app.name),
);

export function getCurrentApp(id: string): CurrentApp {
  const app = currentApps.find((entry) => entry.id === id);
  if (!app) throw new Error(`Aplicativo atual não cadastrado: ${id}.`);
  return app;
}
