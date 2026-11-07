type Capture = {
  id: string;
  stage: 'model' | 'memory' | 'drawing' | 'schedule';
  src: `/assets/${string}.jpg`;
  title: string;
  caption: string;
  alt: string;
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  viewportCrop?: { x: number; y: number; width: number; height: number };
};

/** Frozen media evidence; installation availability belongs to the signed catalog. */
export const consoloMedia = {
  appId: 'consolostruct',
  version: '0.7.1',
  engine: { version: '0.4.0', policy: 'LC-ELU-2026.2' },
  source: {
    tag: 'v0.7.1',
    ref: 'f5267af015b77741b5e31b2a1900056bf43f7740',
    url: 'https://github.com/ricardocorsini/consolo-struct/tree/f5267af015b77741b5e31b2a1900056bf43f7740',
  },
  project: {
    name: 'Consolos - exemplo de detalhamento',
    piece: 'C01',
    fictional: true,
    url: 'https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/examples/detalhamento/consolos-detalhados.lume.json',
    sha256: 'b7f92b16916842adc0cb2bddb9db850529ebf1dba96cc521045bb14eaae2e8f4',
  },
  license: {
    spdx: 'MIT',
    copyright: 'Copyright (c) 2026 Ricardo Corsini and LumeConsolo contributors',
    url: 'https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/LICENSE',
    localNotice: '/assets/consolostruct/v0.7.1/LICENSE.txt',
    thirdPartyNotices:
      'https://github.com/ricardocorsini/consolo-struct/blob/f5267af015b77741b5e31b2a1900056bf43f7740/THIRD_PARTY_NOTICES.md',
  },
  capturedAt: '2026-11-07',
  reviewedAt: '2026-11-07',
  environment: {
    runtime: 'Interface web da tag executada com npm ci e Vite, sem alterar os fontes.',
    browser: 'Chromium',
    theme: 'light',
    viewport: { width: 1363, height: 936 },
    threeDimensionalView: 'Modo compatível do próprio aplicativo; concreto translúcido.',
    processing: 'JPEGs capturados no navegador, sem recomposição ou retoque técnico.',
  },
  captures: [
    {
      id: 'consolo-modelo',
      stage: 'model',
      src: '/assets/consolostruct/v0.7.1/modelo.jpg',
      title: 'Entradas e modelo 3D.',
      caption:
        'Confira a geometria de C01 nas propriedades e explore a vista isométrica com cotas, ações e armaduras esquemáticas. A captura usa o modo compatível do aplicativo, com concreto translúcido.',
      alt: 'Interface real do ConsoloStruct 0.7.1 com o exemplo C01: propriedades geométricas à direita e modelo isométrico translúcido com cotas, cargas e armaduras.',
      width: 1363,
      height: 936,
      bytes: 138930,
      sha256: '10060a570d586eb50f24ad564be5ca66393bf42a4a503d0c197da462bb00ba93',
    },
    {
      id: 'consolo-memoria',
      stage: 'memory',
      src: '/assets/consolostruct/v0.7.1/memoria.jpg',
      title: 'Resultado e memória.',
      caption:
        'Depois de Calcular, abra a Memória de C01 para conferir o resumo, as exigências e os valores disponíveis. O estado “Atende às verificações implementadas” não equivale à aprovação executiva da peça.',
      alt: 'Memória real de C01 no ConsoloStruct 0.7.1, motor 0.4.0: altura útil, relação a/d, tirante necessário e adotado, com a tabela de verificações.',
      width: 1363,
      height: 936,
      bytes: 106469,
      sha256: '6d0c47510d0886a53f3d8455a4c64a2208ee9261c70d0b8140367bb4f0f3c613',
    },
    {
      id: 'consolo-detalhamento',
      stage: 'drawing',
      src: '/assets/consolostruct/v0.7.1/detalhamento.jpg',
      title: 'Vistas para conferência.',
      caption:
        'No Detalhamento de C01, confira elevação, planta e cortes A–A e B–B. Este recorte da área de desenho conserva as cotas e a indicação de conferência do responsável técnico; o quadro está na próxima captura.',
      alt: 'Recorte real do detalhamento de C01 no ConsoloStruct 0.7.1: elevação e planta das armaduras, cortes A–A e B–B, cotas e aviso para conferência do responsável técnico.',
      width: 780,
      height: 644,
      bytes: 45119,
      sha256: '5c32526b4161ce7509ce7d8f68a61ca803a9e9f59aec59a3cff590fe19af369c',
      viewportCrop: { x: 100, y: 236, width: 780, height: 644 },
    },
    {
      id: 'consolo-quadro-aco',
      stage: 'schedule',
      src: '/assets/consolostruct/v0.7.1/quadro-aco.jpg',
      title: 'Posições e quadro de aço.',
      caption:
        'Leia as posições N1–N14, as quantidades para oito peças de C01 e o resumo por bitola. O recorte mostra todas as colunas e linhas do quadro, incluindo a ressalva de massa teórica, sem perdas de corte ou acréscimo de compra.',
      alt: 'Quadro de aço real de C01 no ConsoloStruct 0.7.1: posições N1 a N14, bitolas, quantidades por peça e totais, comprimentos, massas e resumo para oito peças.',
      width: 1030,
      height: 620,
      bytes: 69901,
      sha256: '36ae2161a442d21b36378e9474e0c2fc2f3a1d7b8c4b19c5e85e42c1a0a159ea',
      viewportCrop: { x: 145, y: 265, width: 1030, height: 620 },
    },
  ] satisfies Capture[],
} as const;
