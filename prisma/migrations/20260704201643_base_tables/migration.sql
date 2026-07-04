-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('MESTRE', 'TRIAGEM', 'ESCOLA');

-- CreateEnum
CREATE TYPE "CargoEscolar" AS ENUM ('DIRETOR', 'VICE_DIRETOR');

-- CreateEnum
CREATE TYPE "TipoInstituicao" AS ENUM ('CRECHE', 'EMEI', 'EMEF', 'EMEIF', 'OUTRO');

-- CreateEnum
CREATE TYPE "CategoriaItem" AS ENUM ('INFORMATICA', 'MOBILIARIO', 'ELETRODOMESTICO', 'CONECTIVIDADE', 'PREDIAL', 'OUTRO');

-- CreateEnum
CREATE TYPE "EstadoConservacao" AS ENUM ('NOVO', 'BOM', 'REGULAR', 'RUIM', 'INSERVIVEL');

-- CreateEnum
CREATE TYPE "StatusItem" AS ENUM ('ATIVO', 'EM_MANUTENCAO', 'BAIXADO');

-- CreateEnum
CREATE TYPE "TipoSolicitacao" AS ENUM ('SERVICO', 'REPARO', 'TROCA', 'REABASTECIMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "StatusOcorrencia" AS ENUM ('ABERTA', 'AGUARDANDO_CORRECAO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'RECUSADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoAnexo" AS ENUM ('FOTO_OCORRENCIA', 'ORCAMENTO', 'NOTA_FISCAL', 'LAUDO_TECNICO', 'OUTRO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "cargo" "CargoEscolar",
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instituicaoId" TEXT,
    "criadoPorId" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instituicao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoInstituicao" NOT NULL DEFAULT 'OUTRO',
    "codigoInep" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "telefone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instituicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instituicaoId" TEXT NOT NULL,

    CONSTRAINT "Setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaItem" NOT NULL DEFAULT 'OUTRO',
    "numeroPatrimonio" TEXT,
    "numeroSerie" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "estadoConservacao" "EstadoConservacao" NOT NULL DEFAULT 'BOM',
    "status" "StatusItem" NOT NULL DEFAULT 'ATIVO',
    "dataAquisicao" DATE,
    "valorAquisicao" DECIMAL(10,2),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "setorId" TEXT NOT NULL,
    "cadastradoPorId" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ocorrencia" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipoSolicitacao" "TipoSolicitacao" NOT NULL,
    "status" "StatusOcorrencia" NOT NULL DEFAULT 'ABERTA',
    "prioridade" "Prioridade",
    "localizacaoDescricao" TEXT,
    "numeroPatrimonioTexto" TEXT,
    "observacoesTriagem" TEXT,
    "observacoesMestre" TEXT,
    "motivoRecusa" TEXT,
    "prestadorServico" TEXT,
    "valorOrcamento" DECIMAL(10,2),
    "dataVisitaAgendada" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "dataTriagem" TIMESTAMP(3),
    "dataAprovacao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instituicaoId" TEXT NOT NULL,
    "setorId" TEXT,
    "itemId" TEXT,
    "criadoPorId" TEXT NOT NULL,
    "triagemPorId" TEXT,
    "aprovadoPorId" TEXT,

    CONSTRAINT "Ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAnexo" NOT NULL,
    "url" TEXT NOT NULL,
    "nomeArquivo" TEXT,
    "mimeType" TEXT,
    "tamanhoBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ocorrenciaId" TEXT NOT NULL,
    "enviadoPorId" TEXT NOT NULL,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoOcorrencia" (
    "id" TEXT NOT NULL,
    "statusAnterior" "StatusOcorrencia",
    "statusNovo" "StatusOcorrencia" NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ocorrenciaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,

    CONSTRAINT "HistoricoOcorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "ocorrenciaId" TEXT,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_instituicaoId_idx" ON "Usuario"("instituicaoId");

-- CreateIndex
CREATE INDEX "Usuario_papel_idx" ON "Usuario"("papel");

-- CreateIndex
CREATE UNIQUE INDEX "Instituicao_codigoInep_key" ON "Instituicao"("codigoInep");

-- CreateIndex
CREATE INDEX "Instituicao_ativo_idx" ON "Instituicao"("ativo");

-- CreateIndex
CREATE INDEX "Setor_instituicaoId_idx" ON "Setor"("instituicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_numeroPatrimonio_key" ON "Item"("numeroPatrimonio");

-- CreateIndex
CREATE INDEX "Item_setorId_idx" ON "Item"("setorId");

-- CreateIndex
CREATE INDEX "Item_categoria_idx" ON "Item"("categoria");

-- CreateIndex
CREATE INDEX "Item_status_idx" ON "Item"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Ocorrencia_numero_key" ON "Ocorrencia"("numero");

-- CreateIndex
CREATE INDEX "Ocorrencia_instituicaoId_idx" ON "Ocorrencia"("instituicaoId");

-- CreateIndex
CREATE INDEX "Ocorrencia_status_idx" ON "Ocorrencia"("status");

-- CreateIndex
CREATE INDEX "Ocorrencia_prioridade_idx" ON "Ocorrencia"("prioridade");

-- CreateIndex
CREATE INDEX "Ocorrencia_tipoSolicitacao_idx" ON "Ocorrencia"("tipoSolicitacao");

-- CreateIndex
CREATE INDEX "Ocorrencia_createdAt_idx" ON "Ocorrencia"("createdAt");

-- CreateIndex
CREATE INDEX "Anexo_ocorrenciaId_idx" ON "Anexo"("ocorrenciaId");

-- CreateIndex
CREATE INDEX "Anexo_tipo_idx" ON "Anexo"("tipo");

-- CreateIndex
CREATE INDEX "HistoricoOcorrencia_ocorrenciaId_idx" ON "HistoricoOcorrencia"("ocorrenciaId");

-- CreateIndex
CREATE INDEX "Notificacao_usuarioId_lida_idx" ON "Notificacao"("usuarioId", "lida");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setor" ADD CONSTRAINT "Setor_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_cadastradoPorId_fkey" FOREIGN KEY ("cadastradoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_triagemPorId_fkey" FOREIGN KEY ("triagemPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_aprovadoPorId_fkey" FOREIGN KEY ("aprovadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "Ocorrencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoOcorrencia" ADD CONSTRAINT "HistoricoOcorrencia_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "Ocorrencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoOcorrencia" ADD CONSTRAINT "HistoricoOcorrencia_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "Ocorrencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
