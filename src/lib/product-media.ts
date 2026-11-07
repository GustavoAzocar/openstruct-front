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
