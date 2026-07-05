import { 
  Papel, 
  CargoEscolar, 
  TipoInstituicao,
  CategoriaItem, 
  EstadoConservacao, 
  StatusItem, 
  TipoSolicitacao, 
  Prioridade, 
  StatusOcorrencia, 
  TipoAnexo
} from '../generated/client';

export { 
  Papel, 
  CargoEscolar, 
  TipoInstituicao,
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

export interface Attachment {
  id: string,
  tipo: TipoAnexo,
  url: string,
  nomeArquivo: string,
  mimeType: string,
  tamanhoBytes: number,
  createdAt: Date,
  ocorrenciaId?: string | null,
  enviadoPorId: string,
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
  anexos?: Attachment[];
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
  instituicaoId: string;
  setorId: string;
  cadastradoPorId?: string | null;
}

export interface OccurrenceHistory {
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