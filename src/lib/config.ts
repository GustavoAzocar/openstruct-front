/** Endereços oficiais e integrações opcionais do ecossistema. */
export const site = {
  name: 'OpenStruct',
  repository: 'https://github.com/ricardocorsini/openstruct-front',
  organization: 'https://github.com/ricardocorsini',
  discord: import.meta.env.VITE_DISCORD_URL || '',
  appUrl: import.meta.env.VITE_CONSOLOSTRUCT_URL || '',
  appRepository:
    import.meta.env.VITE_CONSOLOSTRUCT_REPOSITORY ||
    'https://github.com/ricardocorsini/consolo-struct',
  downloadUrl: import.meta.env.VITE_CONSOLOSTRUCT_DOWNLOAD_URL || '',
  armRepository: 'https://github.com/ricardocorsini/armadura-struct',
  armReleaseUrl:
    'https://github.com/ricardocorsini/openstruct-catalog/releases/tag/armadurastruct-v0.1.1',
  armReleaseAssets:
    'https://github.com/ricardocorsini/openstruct-catalog/releases/download/armadurastruct-v0.1.1',
  molaAppUrl: import.meta.env.VITE_MOLASTRUCT_URL || '',
  molaAppRepository:
    import.meta.env.VITE_MOLASTRUCT_REPOSITORY || 'https://github.com/ricardocorsini/mola-struct',
  molaDownloadUrl:
    import.meta.env.VITE_MOLASTRUCT_DOWNLOAD_URL ||
    'https://github.com/ricardocorsini/mola-struct/releases/latest',
};

export type AppEntry = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Em desenvolvimento' | 'Em planejamento' | 'Disponível para desktop';
  color: string;
  symbol: string;
  number: string;
  route?: string;
  previewAnchor?: string;
  image?: string;
  imageAlt?: string;
  externalUrl?: string;
};

export const apps: AppEntry[] = [
  {
    id: 'consolostruct',
    name: 'ConsoloStruct',
    category: 'Concreto armado',
    description: 'Do modelo ao detalhe. Um espaço para trabalhar com consolos de concreto armado.',
    status: 'Em desenvolvimento',
    color: 'orange',
    symbol: 'corbel',
    number: '01',
    route: '/apps/consolostruct',
    previewAnchor: '#demonstracao',
    image: '/assets/consolostruct-atlas.webp',
    imageAlt: 'Atlas em gravura sustentando uma peça de pedra, ilustração do ConsoloStruct',
    externalUrl: site.appUrl,
  },
  {
    id: 'molastruct',
    name: 'MolaStruct',
    category: 'Fundações',
    description:
      'Do solo ao modelo estrutural. Uma ferramenta para estimar a rigidez do conjunto fundação + solo.',
    status: 'Disponível para desktop',
    color: 'cobalt',
    symbol: 'footing',
    number: '02',
    route: '/apps/molastruct',
    previewAnchor: '#visao-geral',
    image: '/assets/molastruct-gaia.webp',
    imageAlt:
      'Figura da Terra em gravura sustentando uma mola e uma base de fundação sobre fundo cobalto',
    externalUrl: site.molaAppUrl,
  },
  {
    id: 'armadurastruct',
    name: 'ArmaduraStruct',
    category: 'Detalhamento',
    description:
      'Da fôrma ao aço. Um ambiente CAD para desenhar armaduras e gerar o quadro de aço.',
    status: 'Disponível para desktop',
    color: 'amber',
    symbol: 'frame',
    number: '03',
    route: '/apps/armadurastruct',
    previewAnchor: '#editor',
    image: '/assets/armadurastruct-hephaestus.webp',
    imageAlt: 'Hefesto em gravura trabalhando uma armadura de aço sobre fundo âmbar',
  },
  {
    id: 'vigasstruct',
    name: 'VigasStruct',
    category: 'Concreto armado',
    description: 'Um novo olhar para o dimensionamento e o detalhamento de vigas.',
    status: 'Em planejamento',
    color: 'blue',
    symbol: 'beam',
    number: '04',
  },
  {
    id: 'pilarstruct',
    name: 'PilarStruct',
    category: 'Concreto armado',
    description: 'Geometria, materiais e interação para estudar seções de pilares.',
    status: 'Em planejamento',
    color: 'steel',
    symbol: 'column',
    number: '05',
  },
  {
    id: 'sapatastruct',
    name: 'SapataStruct',
    category: 'Fundações',
    description: 'O encontro entre solo, estrutura e ferramentas abertas.',
    status: 'Em planejamento',
    color: 'amber',
    symbol: 'footing',
    number: '06',
  },
  {
    id: '3dstruct',
    name: '3DStruct',
    category: 'Visualização',
    description: 'Uma forma mais clara de explorar e apresentar modelos estruturais.',
    status: 'Em planejamento',
    color: 'ink',
    symbol: 'frame',
    number: '07',
  },
];
