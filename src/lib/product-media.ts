import type { SourceReference } from './app-registry';

type ProductScreenshot = {
  appId: string;
  src: `/assets/${string}`;
  alt: string;
  width: number;
  height: number;
  version: string;
  sourceTag: string;
  source: SourceReference;
  guideUrl: string;
  reviewedAt: string;
};

/** Screenshot evidence is fixed independently of the live installation catalog. */
export const armaduraScreenshot: ProductScreenshot = {
  appId: 'armadurastruct',
  src: '/assets/armadurastruct-editor.webp',
  alt: 'Captura real do ArmaduraStruct 0.2.0: viga V01 com barras longitudinais, estribo N3, cotas e painel de propriedades no editor CAD.',
  width: 1600,
  height: 1000,
  version: '0.2.0',
  sourceTag: 'v0.2.0',
  source: {
    url: 'https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/docs/preview.png',
    ref: 'c25baa3b6b914670eccc58e40c87e06732d9019b',
  },
  guideUrl:
    'https://github.com/ricardocorsini/armadura-struct/blob/c25baa3b6b914670eccc58e40c87e06732d9019b/docs/GUIA.md',
  reviewedAt: '2026-11-07',
};

/** Owner-supplied home image; its visible version does not define installation availability. */
export const armaduraHomeScreenshot = {
  appId: 'armadurastruct',
  src: '/assets/armadurastruct-home-0.4.0.webp',
  alt: 'Tela real do ArmaduraStruct 0.4.0 com a prancha de pilares do projeto Exemplo ArmaduraStruct: seções, barras, estribos e cotas, com o gerenciador de pranchas à direita.',
  width: 1859,
  height: 997,
  version: '0.4.0',
  source: {
    url: 'https://github.com/ricardocorsini/openstruct-front/blob/master/docs/ARMADURASTRUCT-HOME-040.md',
    ref: 'sha256:0169e6175ee37ac3dcbf1ce021626c89391e9cab43865825c6cc720965c59596',
  },
  reviewedAt: '2026-11-09',
};
