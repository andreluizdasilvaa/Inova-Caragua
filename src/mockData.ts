/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'Alta' | 'Média' | 'Baixa';
export type OccurrenceStatus = 'Aberto' | 'Em Andamento' | 'Resolvido';
export type AssetStatus = 'Operacional' | 'Em Manutenção' | 'Danificado';

export interface UserSession {
  user: {
    name: string;
    email: string;
    id: string;
    role: string;
  };
}

export interface Occurrence {
  id: string; // e.g. "#OCC-0921"
  school: string;
  category: string;
  priority: Priority;
  status: OccurrenceStatus;
  date: string;
  description: string;
  reportedBy: string;
  reportedAtTime: string;
  assetName?: string;
  assetPatrimony?: string;
  attachments?: string[];
}

export interface Asset {
  patrimony: string; // e.g. "PAT-2023-001"
  name: string;
  category: string;
  location: string;
  status: AssetStatus;
  model: string;
  brand: string;
  serialNumber: string;
  purchaseDate: string;
  supplier: string;
  invoice: string;
  warrantyStatus: string;
}

export interface AssetHistory {
  date: string;
  occurrence: string;
  resolution: string;
  technician: string;
}

export interface SchoolStats {
  school: string;
  openCount: number;
  similarCases30d: number;
}


export const mockOccurrences: Occurrence[] = [
  {
    id: '#OCC-0921',
    school: 'Central High',
    category: 'Encanamento',
    priority: 'Alta',
    status: 'Aberto',
    date: '24 Out, 2023',
    reportedBy: 'Ana Paula (Diretora)',
    reportedAtTime: '12/05/2026 às 08:30',
    description: 'Vazamento contínuo de água limpa no banheiro masculino do segundo andar. A água está começando a infiltrar no teto da sala de artes abaixo.',
    assetName: 'Encanamento Hidráulico',
    assetPatrimony: '#PAT-HID-204',
    attachments: ['foto_vazamento.jpg']
  },
  {
    id: '#OCC-0920',
    school: 'North Elementary',
    category: 'Elétrica',
    priority: 'Média',
    status: 'Em Andamento',
    date: '23 Out, 2023',
    reportedBy: 'Carlos Silva (Vice-Diretor)',
    reportedAtTime: '23 Out, 2023 às 10:15',
    description: 'Três tomadas da parede dos fundos da sala de informática pararam de funcionar repentinamente durante o uso dos computadores.',
    assetName: 'Rede Elétrica - Tomadas',
    assetPatrimony: '#PAT-EL-090',
    attachments: ['quadro_eletrico.png']
  },
  {
    id: '#OCC-0915',
    school: 'Westside Middle',
    category: 'Estrutural',
    priority: 'Alta',
    status: 'Aberto',
    date: '20 Out, 2023',
    reportedBy: 'Marcos de Souza (Coordenador)',
    reportedAtTime: '20 Out, 2023 às 14:20',
    description: 'Rachadura visível na coluna de sustentação externa perto da entrada do refeitório. Solicitamos uma vistoria urgente do engenheiro civil.',
    assetName: 'Estrutura Externa',
    assetPatrimony: '#PAT-EST-121'
  },
  {
    id: '#OCC-0899',
    school: 'Central High',
    category: 'Climatização',
    priority: 'Baixa',
    status: 'Resolvido',
    date: '15 Out, 2023',
    reportedBy: 'Ana Paula (Diretora)',
    reportedAtTime: '15 Out, 2023 às 09:00',
    description: 'O ar condicionado da biblioteca (Sala 4) está expelindo água em excesso pela carenagem interna, molhando as mesas próximas.',
    assetName: 'Ar Condicionado 12000 BTUs',
    assetPatrimony: 'PAT-2023-001',
    attachments: ['filtro_sujo.jpg']
  },
  {
    id: '#REQ-2049',
    school: 'E.M. Machado de Assis',
    category: 'Audiovisual',
    priority: 'Média',
    status: 'Aberto',
    date: '04 Jul, 2026',
    reportedBy: 'Sandra Helena (Professora)',
    reportedAtTime: '04 Jul, 2026 às 08:30',
    description: 'Chegamos na sala 04 para a aula de biologia e o projetor não dá nenhum sinal de vida. A luz de standby está apagada. Já testamos a tomada com outro aparelho e a energia está funcionando normal.',
    assetName: 'Projetor Epson X39',
    assetPatrimony: 'PAT-2022-402',
    attachments: ['foto_painel.jpg']
  },
  {
    id: '#REQ-2050',
    school: 'C.E. Cora Coralina',
    category: 'Hidráulica',
    priority: 'Alta',
    status: 'Aberto',
    date: '04 Jul, 2026',
    reportedBy: 'Roberto Dias (Diretor)',
    reportedAtTime: '04 Jul, 2026 às 09:42',
    description: 'Vazamento volumoso no bebedouro principal do pátio central. A área está interditada devido ao risco de quedas.',
    assetName: 'Bebedouro Industrial Inox',
    assetPatrimony: 'PAT-2024-118'
  },
  {
    id: '#REQ-2045',
    school: 'E.M. Monteiro Lobato',
    category: 'Segurança',
    priority: 'Média',
    status: 'Aberto',
    date: '04 Jul, 2026',
    reportedBy: 'Marília Costa (Diretora)',
    reportedAtTime: '04 Jul, 2026 às 11:20',
    description: 'A câmera de segurança do pátio interno (CAM-02) está offline no sistema central. Não há sinal de vídeo.',
    assetName: 'Câmera Dome Hikvision',
    assetPatrimony: 'PAT-2021-992'
  },
  {
    id: '#REQ-2041',
    school: 'E.M. Machado de Assis',
    category: 'Climatização',
    priority: 'Baixa',
    status: 'Aberto',
    date: '04 Jul, 2026',
    reportedBy: 'Sandra Helena (Professora)',
    reportedAtTime: '04 Jul, 2026 às 12:10',
    description: 'Ar condicionado Split 12000 BTUs (Sala 12) está vazando água constantemente pela parte frontal, impossibilitando o uso da carteira logo abaixo.',
    assetName: 'Split 12000 BTUs',
    assetPatrimony: 'PAT-2023-001'
  }
];

export const mockAssets: Asset[] = [
  {
    patrimony: 'PAT-2023-001',
    name: 'Ar Condicionado 12000 BTUs',
    category: 'Climatização',
    location: 'Sala 4',
    status: 'Operacional',
    model: 'Split Hi-Wall Eco',
    brand: 'Consul',
    serialNumber: 'CSL-9982-XYZ-44',
    purchaseDate: '15/03/2023',
    supplier: 'Refrigeração Total Ltda',
    invoice: '000.145.889',
    warrantyStatus: 'Ativa (Até Março 2027)'
  },
  {
    patrimony: 'PAT-2023-089',
    name: 'Cadeira Universitária',
    category: 'Mobiliário',
    location: 'Bloco B - Sala 12',
    status: 'Danificado',
    model: 'Ergonômica Estofada',
    brand: 'FLEXFORM',
    serialNumber: 'FF-8812-MOB',
    purchaseDate: '10/05/2023',
    supplier: 'Móveis Escolares Brasil',
    invoice: '000.112.551',
    warrantyStatus: 'Ativa (Até Maio 2028)'
  },
  {
    patrimony: 'PAT-2022-402',
    name: 'Projetor Multimídia',
    category: 'Eletrônicos',
    location: 'Laboratório 1',
    status: 'Em Manutenção',
    model: 'PowerLite X39',
    brand: 'Epson',
    serialNumber: 'EPS-99128-PRJ',
    purchaseDate: '12/10/2022',
    supplier: 'TecnoCorp Soluções',
    invoice: '000.098.441',
    warrantyStatus: 'Expirada (Outubro 2025)'
  },
  {
    patrimony: 'PAT-2024-118',
    name: 'Bebedouro Industrial Inox',
    category: 'Hidráulica',
    location: 'Pátio Central',
    status: 'Operacional',
    model: '50 Litros Coluna',
    brand: 'IBBL',
    serialNumber: 'IBBL-50L-9901',
    purchaseDate: '22/01/2024',
    supplier: 'Purificadores S.A.',
    invoice: '000.198.223',
    warrantyStatus: 'Ativa (Até Janeiro 2026)'
  },
  {
    patrimony: 'PAT-2021-992',
    name: 'Câmera Dome Hikvision',
    category: 'Segurança',
    location: 'Corredor Bloco A',
    status: 'Operacional',
    model: 'DS-2CD1123G0-I',
    brand: 'Hikvision',
    serialNumber: 'HK-DOME-99221',
    purchaseDate: '14/06/2021',
    supplier: 'SecureTech Sistemas',
    invoice: '000.045.112',
    warrantyStatus: 'Expirada (Junho 2023)'
  }
];

export const mockAssetHistory: Record<string, AssetHistory[]> = {
  'PAT-2023-001': [
    {
      date: '10/11/2023',
      occurrence: 'Manutenção Preventiva',
      resolution: 'Lâmpada e filtros limpos, higienização completa.',
      technician: 'Carlos S.'
    },
    {
      date: '15/10/2023',
      occurrence: 'Vazamento de água pela carenagem',
      resolution: 'Desentupimento do dreno de água condensada.',
      technician: 'Carlos S.'
    },
    {
      date: '20/03/2023',
      occurrence: 'Instalação Inicial',
      resolution: 'Fixação em suporte externo e conexão tubulação.',
      technician: 'Equipe Interna'
    }
  ],
  'PAT-2022-402': [
    {
      date: '10/02/2024',
      occurrence: 'Troca de lâmpada solicitada',
      resolution: 'Lâmpada original Epson substituída (Vida útil anterior a 0%).',
      technician: 'Carlos Silva'
    },
    {
      date: '05/11/2023',
      occurrence: 'Imagem desfocada/distorcida',
      resolution: 'Ajuste interno das lentes e limpeza ótica completa.',
      technician: 'Marcos Paulo'
    },
    {
      date: '12/04/2023',
      occurrence: 'Instalação inicial',
      resolution: 'Fixação de suporte de teto articulado e cabeamento HDMI.',
      technician: 'Equipe Base'
    }
  ]
};

export const mockSchoolStats: SchoolStats[] = [
  {
    school: 'E.M. Machado de Assis',
    openCount: 12,
    similarCases30d: 3
  },
  {
    school: 'C.E. Cora Coralina',
    openCount: 8,
    similarCases30d: 2
  },
  {
    school: 'E.M. Monteiro Lobato',
    openCount: 5,
    similarCases30d: 1
  }
];
