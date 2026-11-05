/** Endereços futuros ficam aqui; deixe vazios para manter a experiência de prévia. */
export const site = {
  name: 'OpenStruct',
  repository: 'https://github.com/ricardocorsini/openstruct-front',
  organization: 'https://github.com/ricardocorsini',
  discord: import.meta.env.VITE_DISCORD_URL || '',
  appUrl: import.meta.env.VITE_CONSOLOSTRUCT_URL || '',
  appRepository: import.meta.env.VITE_CONSOLOSTRUCT_REPOSITORY || '',
  downloadUrl: import.meta.env.VITE_CONSOLOSTRUCT_DOWNLOAD_URL || '',
};

export type AppEntry = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Em desenvolvimento' | 'Em planejamento';
  color: string;
  symbol: string;
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
  },
  {
    id: 'vigasstruct',
    name: 'VigasStruct',
    category: 'Concreto armado',
    description: 'Um novo olhar para o dimensionamento e o detalhamento de vigas.',
    status: 'Em planejamento',
    color: 'blue',
    symbol: 'beam',
  },
  {
    id: 'pilarstruct',
    name: 'PilarStruct',
    category: 'Concreto armado',
    description: 'Geometria, materiais e interação para estudar seções de pilares.',
    status: 'Em planejamento',
    color: 'steel',
    symbol: 'column',
  },
  {
    id: 'sapatastruct',
    name: 'SapataStruct',
    category: 'Fundações',
    description: 'O encontro entre solo, estrutura e ferramentas abertas.',
    status: 'Em planejamento',
    color: 'amber',
    symbol: 'footing',
  },
  {
    id: '3dstruct',
    name: '3DStruct',
    category: 'Visualização',
    description: 'Uma forma mais clara de explorar e apresentar modelos estruturais.',
    status: 'Em planejamento',
    color: 'ink',
    symbol: 'frame',
  },
];
