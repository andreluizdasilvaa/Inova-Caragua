import { 
  Papel, 
  CargoEscolar, 
  CategoriaItem, 
  EstadoConservacao, 
  StatusItem, 
  TipoSolicitacao, 
  Prioridade, 
  StatusOcorrencia, 
  TipoAnexo 
} from '../src/generated/client';

// Re-export generated enums so components can use them
export type { 
  Papel, 
  CargoEscolar, 
  CategoriaItem, 
  EstadoConservacao, 
  StatusItem, 
  TipoSolicitacao, 
  Prioridade, 
  StatusOcorrencia, 
  TipoAnexo 
};

export interface UserSession {
  user: {
    id: string;
    nome: string;
    email: string;
    papel: Papel;
    cargo?: CargoEscolar | null;
    instituicaoId?: string | null;
  };
}

export interface Occurrence {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  tipoSolicitacao: TipoSolicitacao;
  status: StatusOcorrencia;
  prioridade: Prioridade | null;
  localizacaoDescricao?: string | null;
  numeroPatrimonioTexto?: string | null;
  imagens?: string[] | null; // URLs das imagens anexadas (object URLs de previews)
  observacoesTriagem?: string | null;
  observacoesMestre?: string | null;
  motivoRecusa?: string | null;
  prestadorServico?: string | null;
  valorOrcamento?: number | null;
  dataVisitaAgendada?: Date | null;
  dataConclusao?: Date | null;
  dataTriagem?: Date | null;
  dataAprovacao?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  instituicaoId: string;
  setorId?: string | null;
  itemId?: string | null;
  criadoPorId: string;
  triagemPorId?: string | null;
  aprovadoPorId?: string | null;
}

export interface Asset {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  numeroPatrimonio?: string | null;
  numeroSerie?: string | null;
  marca?: string | null;
  modelo?: string | null;
  estadoConservacao: EstadoConservacao;
  status: StatusItem;
  dataAquisicao?: Date | null;
  valorAquisicao?: number | null;
  observacoes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  setorId: string;
  instituicaoId: string;
  cadastradoPorId?: string | null;
}

export interface AssetHistory {
  id: string;
  statusAnterior?: StatusOcorrencia | null;
  statusNovo: StatusOcorrencia;
  comentario?: string | null;
  createdAt: Date;
  ocorrenciaId: string;
  autorId: string;
}

export interface SchoolStats {
  instituicaoId: string;
  nomeInstituicao: string;
  openCount: number;
  similarCases30d: number;
}

export const mockOccurrences: Occurrence[] = [
  {
    id: 'cm1234567890occ1',
    numero: 921,
    titulo: 'Vazamento no banheiro masculino',
    descricao: 'Vazamento contínuo de água limpa no banheiro masculino do segundo andar. A água está começando a infiltrar no teto da sala de artes abaixo.',
    tipoSolicitacao: 'REPARO',
    status: 'ABERTA',
    prioridade: 'ALTA',
    localizacaoDescricao: 'Segundo andar',
    numeroPatrimonioTexto: '#PAT-HID-204',
    imagens: [
      'https://placehold.co/800x600/1e293b/e2f1fd?text=Vazamento+1',
      'https://placehold.co/800x600/334155/e2f1fd?text=Vazamento+2'
    ],
    createdAt: new Date('2023-10-24T08:30:00.000Z'),
    updatedAt: new Date('2023-10-24T08:30:00.000Z'),
    instituicaoId: 'inst_central_high',
    setorId: 'setor_banheiros',
    itemId: null,
    criadoPorId: 'user_ana_diretora',
    triagemPorId: null,
    aprovadoPorId: null
  },
  {
    id: 'cm1234567890occ2',
    numero: 920,
    titulo: 'Tomadas queimadas na informática',
    descricao: 'Três tomadas da parede dos fundos da sala de informática pararam de funcionar repentinamente durante o uso dos computadores.',
    tipoSolicitacao: 'REPARO',
    status: 'EM_EXECUCAO',
    prioridade: 'MEDIA',
    localizacaoDescricao: null,
    numeroPatrimonioTexto: '#PAT-EL-090',
    createdAt: new Date('2023-10-23T10:15:00.000Z'),
    updatedAt: new Date('2023-10-23T10:15:00.000Z'),
    instituicaoId: 'inst_north_elementary',
    setorId: 'setor_informatica',
    itemId: null,
    criadoPorId: 'user_carlos_vice',
    triagemPorId: 'user_ana_triagem',
    aprovadoPorId: null
  },
  {
    id: 'cm1234567890occ3',
    numero: 915,
    titulo: 'Rachadura em coluna externa',
    descricao: 'Rachadura visível na coluna de sustentação externa perto da entrada do refeitório. Solicitamos uma vistoria urgente do engenheiro civil.',
    tipoSolicitacao: 'SERVICO',
    status: 'ABERTA',
    prioridade: 'ALTA',
    localizacaoDescricao: 'Muro externo perto do refeitório',
    numeroPatrimonioTexto: '#PAT-EST-121',
    createdAt: new Date('2023-10-20T14:20:00.000Z'),
    updatedAt: new Date('2023-10-20T14:20:00.000Z'),
    instituicaoId: 'inst_westside_middle',
    setorId: null,
    itemId: null,
    criadoPorId: 'user_marcos_escola',
    triagemPorId: null,
    aprovadoPorId: null
  },
  {
    id: 'cm1234567890occ4',
    numero: 899,
    titulo: 'Ar condicionado vazando água',
    descricao: 'O ar condicionado da biblioteca (Sala 4) está expelindo água em excesso pela carenagem interna, molhando as mesas próximas.',
    tipoSolicitacao: 'REPARO',
    status: 'CONCLUIDA',
    prioridade: 'BAIXA',
    localizacaoDescricao: null,
    numeroPatrimonioTexto: null,
    dataConclusao: new Date('2023-10-16T15:00:00.000Z'),
    createdAt: new Date('2023-10-15T09:00:00.000Z'),
    updatedAt: new Date('2023-10-16T15:00:00.000Z'),
    instituicaoId: 'inst_central_high',
    setorId: 'setor_biblioteca',
    itemId: 'PAT-2023-001',
    criadoPorId: 'user_ana_diretora',
    triagemPorId: 'user_ana_triagem',
    aprovadoPorId: 'user_mestre'
  },
  {
    id: 'cm1234567890occ5',
    numero: 2049,
    titulo: 'Projetor não liga',
    descricao: 'Chegamos na sala 04 para a aula de biologia e o projetor não dá nenhum sinal de vida. A luz de standby está apagada. Já testamos a tomada com outro aparelho e a energia está funcionando normal.',
    tipoSolicitacao: 'REPARO',
    status: 'ABERTA',
    prioridade: 'MEDIA',
    localizacaoDescricao: 'Sala 04',
    numeroPatrimonioTexto: null,
    createdAt: new Date('2026-07-04T08:30:00.000Z'),
    updatedAt: new Date('2026-07-04T08:30:00.000Z'),
    instituicaoId: 'cmr6vwyqj0002w8vpvnzxa02s',
    setorId: 'setor_laboratorio',
    itemId: 'PAT-2022-402',
    criadoPorId: 'user_sandra_escola',
    triagemPorId: null,
    aprovadoPorId: null
  },
  {
    id: 'cm1234567890occ6',
    numero: 2050,
    titulo: 'Vazamento volumoso no bebedouro',
    descricao: 'Vazamento volumoso no bebedouro principal do pátio central. A área está interditada devido ao risco de quedas.',
    tipoSolicitacao: 'REPARO',
    status: 'ABERTA',
    prioridade: 'ALTA',
    localizacaoDescricao: null,
    numeroPatrimonioTexto: null,
    createdAt: new Date('2026-07-04T09:42:00.000Z'),
    updatedAt: new Date('2026-07-04T09:42:00.000Z'),
    instituicaoId: 'inst_cora_coralina',
    setorId: 'setor_patio',
    itemId: 'PAT-2024-118',
    criadoPorId: 'user_roberto_diretor',
    triagemPorId: null,
    aprovadoPorId: null
  },
  {
    id: 'cm1234567890occ7',
    numero: 2045,
    titulo: 'Câmera de segurança offline',
    descricao: 'A câmera de segurança do pátio interno (CAM-02) está offline no sistema central. Não há sinal de vídeo.',
    tipoSolicitacao: 'REPARO',
    status: 'ABERTA',
    prioridade: 'MEDIA',
    localizacaoDescricao: null,
    numeroPatrimonioTexto: null,
    createdAt: new Date('2026-07-04T11:20:00.000Z'),
    updatedAt: new Date('2026-07-04T11:20:00.000Z'),
    instituicaoId: 'inst_monteiro_lobato',
    setorId: 'setor_corredor_a',
    itemId: 'PAT-2021-992',
    criadoPorId: 'user_marilia_diretora',
    triagemPorId: null,
    aprovadoPorId: null
  },
  {
    id: 'cm1234567890occ8',
    numero: 2041,
    titulo: 'Split Sala 12 vazando água',
    descricao: 'Ar condicionado Split 12000 BTUs (Sala 12) está vazando água constantemente pela parte frontal, impossibilitando o uso da carteira logo abaixo.',
    tipoSolicitacao: 'REPARO',
    status: 'ABERTA',
    prioridade: 'BAIXA',
    localizacaoDescricao: 'Sala 12',
    numeroPatrimonioTexto: null,
    createdAt: new Date('2026-07-04T12:10:00.000Z'),
    updatedAt: new Date('2026-07-04T12:10:00.000Z'),
    instituicaoId: 'cmr6vwyqj0002w8vpvnzxa02s',
    setorId: 'setor_sala12',
    itemId: 'PAT-2023-001',
    criadoPorId: 'user_sandra_escola',
    triagemPorId: null,
    aprovadoPorId: null
  }
];

export const mockAssets: Asset[] = [
  {
    id: 'PAT-2023-001',
    nome: 'Ar Condicionado 12000 BTUs',
    categoria: 'INFORMATICA',
    numeroPatrimonio: 'PAT-2023-001',
    numeroSerie: 'CSL-9982-XYZ-44',
    marca: 'Consul',
    modelo: 'Split Hi-Wall Eco',
    estadoConservacao: 'BOM',
    status: 'ATIVO',
    dataAquisicao: new Date('2023-03-15T00:00:00.000Z'),
    valorAquisicao: 2500.00,
    observacoes: 'Fornecedor: Refrigeração Total Ltda, NF: 000.145.889, Garantia Ativa Até Março 2027',
    createdAt: new Date('2023-03-15T08:00:00.000Z'),
    updatedAt: new Date('2023-03-15T08:00:00.000Z'),
    setorId: 'setor_biblioteca',
    instituicaoId: 'inst_central_high',
    cadastradoPorId: 'user_mestre'
  },
  {
    id: 'PAT-2023-089',
    nome: 'Cadeira Universitária',
    categoria: 'MOBILIARIO',
    numeroPatrimonio: 'PAT-2023-089',
    numeroSerie: 'FF-8812-MOB',
    marca: 'FLEXFORM',
    modelo: 'Ergonômica Estofada',
    estadoConservacao: 'REGULAR',
    status: 'BAIXADO',
    dataAquisicao: new Date('2023-05-10T00:00:00.000Z'),
    valorAquisicao: 350.00,
    observacoes: 'Fornecedor: Móveis Escolares Brasil, NF: 000.112.551',
    createdAt: new Date('2023-05-10T08:00:00.000Z'),
    updatedAt: new Date('2023-05-10T08:00:00.000Z'),
    setorId: 'setor_sala12',
    instituicaoId: 'cmr6vwyqj0002w8vpvnzxa02s',
    cadastradoPorId: 'user_mestre'
  },
  {
    id: 'PAT-2022-402',
    nome: 'Projetor Multimídia',
    categoria: 'INFORMATICA',
    numeroPatrimonio: 'PAT-2022-402',
    numeroSerie: 'EPS-99128-PRJ',
    marca: 'Epson',
    modelo: 'PowerLite X39',
    estadoConservacao: 'REGULAR',
    status: 'EM_MANUTENCAO',
    dataAquisicao: new Date('2022-10-12T00:00:00.000Z'),
    valorAquisicao: 3200.00,
    observacoes: 'Fornecedor: TecnoCorp Soluções, NF: 000.098.441',
    createdAt: new Date('2022-10-12T08:00:00.000Z'),
    updatedAt: new Date('2022-10-12T08:00:00.000Z'),
    setorId: 'setor_laboratorio',
    instituicaoId: 'cmr6vwyqj0002w8vpvnzxa02s',
    cadastradoPorId: 'user_mestre'
  },
  {
    id: 'PAT-2024-118',
    nome: 'Bebedouro Industrial Inox',
    categoria: 'ELETRODOMESTICO',
    numeroPatrimonio: 'PAT-2024-118',
    numeroSerie: 'IBBL-50L-9901',
    marca: 'IBBL',
    modelo: '50 Litros Coluna',
    estadoConservacao: 'BOM',
    status: 'ATIVO',
    dataAquisicao: new Date('2024-01-22T00:00:00.000Z'),
    valorAquisicao: 1800.00,
    observacoes: 'Fornecedor: Purificadores S.A., NF: 000.198.223',
    createdAt: new Date('2024-01-22T08:00:00.000Z'),
    updatedAt: new Date('2024-01-22T08:00:00.000Z'),
    setorId: 'setor_patio',
    instituicaoId: 'inst_cora_coralina',
    cadastradoPorId: 'user_mestre'
  },
  {
    id: 'PAT-2021-992',
    nome: 'Câmera Dome Hikvision',
    categoria: 'CONECTIVIDADE',
    numeroPatrimonio: 'PAT-2021-992',
    numeroSerie: 'HK-DOME-99221',
    marca: 'Hikvision',
    modelo: 'DS-2CD1123G0-I',
    estadoConservacao: 'BOM',
    status: 'ATIVO',
    dataAquisicao: new Date('2021-06-14T00:00:00.000Z'),
    valorAquisicao: 450.00,
    observacoes: 'Fornecedor: SecureTech Sistemas, NF: 000.045.112',
    createdAt: new Date('2021-06-14T08:00:00.000Z'),
    updatedAt: new Date('2021-06-14T08:00:00.000Z'),
    setorId: 'setor_corredor_a',
    instituicaoId: 'inst_monteiro_lobato',
    cadastradoPorId: 'user_mestre'
  }
];

export const mockAssetHistory: Record<string, AssetHistory[]> = {
  'PAT-2023-001': [
    {
      id: 'hist_1',
      statusAnterior: 'EM_EXECUCAO',
      statusNovo: 'APROVADA',
      comentario: 'Lâmpada e filtros limpos, higienização completa por Carlos S.',
      createdAt: new Date('2023-11-10T00:00:00.000Z'),
      ocorrenciaId: 'cm1234567890occ4',
      autorId: 'user_mestre'
    },
    {
      id: 'hist_2',
      statusAnterior: 'ABERTA',
      statusNovo: 'EM_EXECUCAO',
      comentario: 'Desentupimento do dreno de água condensada.',
      createdAt: new Date('2023-10-15T00:00:00.000Z'),
      ocorrenciaId: 'cm1234567890occ4',
      autorId: 'user_ana_triagem'
    }
  ],
  'PAT-2022-402': [
    {
      id: 'hist_3',
      statusAnterior: 'ABERTA',
      statusNovo: 'AGENDADA',
      comentario: 'Lâmpada original Epson substituída por Carlos Silva.',
      createdAt: new Date('2024-02-10T00:00:00.000Z'),
      ocorrenciaId: 'cm1234567890occ5',
      autorId: 'user_mestre'
    }
  ]
};

export const mockSchoolStats: SchoolStats[] = [
  {
    instituicaoId: 'cmr6vwyqj0002w8vpvnzxa02s',
    nomeInstituicao: 'E.M. Machado de Assis',
    openCount: 12,
    similarCases30d: 3
  },
  {
    instituicaoId: 'inst_cora_coralina',
    nomeInstituicao: 'C.E. Cora Coralina',
    openCount: 8,
    similarCases30d: 2
  },
  {
    instituicaoId: 'inst_monteiro_lobato',
    nomeInstituicao: 'E.M. Monteiro Lobato',
    openCount: 5,
    similarCases30d: 1
  }
];