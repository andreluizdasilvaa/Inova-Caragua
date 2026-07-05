import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  EstadoConservacao,
  Prioridade,
  StatusOcorrencia,
  TipoInstituicao,
} from '@/generated/client'

const METRICAS_VALIDAS = ['ocorrencias', 'urgentes', 'sem_resposta', 'itens_ruins'] as const
type Metrica = (typeof METRICAS_VALIDAS)[number]

const STATUS_FECHADOS: StatusOcorrencia[] = [
  StatusOcorrencia.CONCLUIDA,
  StatusOcorrencia.RECUSADA,
  StatusOcorrencia.CANCELADA,
]

const STATUS_EM_ABERTO = Object.values(StatusOcorrencia).filter(
  status => !STATUS_FECHADOS.includes(status)
)

const PRIORIDADE_PESO: Record<Prioridade | 'NAO_TRIADA', number> = {
  BAIXA: 1,
  MEDIA: 2,
  ALTA: 4,
  URGENTE: 8,
  NAO_TRIADA: 1,
}

const pesoPorPrioridade = (prioridade: Prioridade | null) => {
  if (!prioridade) return PRIORIDADE_PESO.NAO_TRIADA
  return PRIORIDADE_PESO[prioridade]
}

const parseMetrica = (value: string | null): Metrica => {
  if (!value) return 'ocorrencias'
  return METRICAS_VALIDAS.includes(value as Metrica) ? (value as Metrica) : 'ocorrencias'
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const metrica = parseMetrica(searchParams.get('metrica'))
  const periodoRaw = Number.parseInt(searchParams.get('periodo') ?? '30', 10)
  const periodo = Number.isNaN(periodoRaw) ? 30 : Math.min(Math.max(periodoRaw, 1), 365)
  const statusParam = searchParams.get('status')
  const tiposParam = searchParams.get('tipos')

  const desde = new Date()
  desde.setDate(desde.getDate() - periodo)

  const tipoFiltro = tiposParam
    ? (tiposParam.split(',').filter(t =>
        Object.values(TipoInstituicao).includes(t as TipoInstituicao)
      ) as TipoInstituicao[])
    : undefined

  const instituicoes = await prisma.instituicao.findMany({
    where: {
      ativo: true,
      latitude: { not: null },
      longitude: { not: null },
      ...(tipoFiltro && tipoFiltro.length > 0 ? { tipo: { in: tipoFiltro } } : {}),
    },
    select: {
      id: true,
      nome: true,
      tipo: true,
      latitude: true,
      longitude: true,
    },
  })

  if (instituicoes.length === 0) {
    return NextResponse.json({ pontos: [] })
  }

  const instituicaoIds = instituicoes.map(inst => inst.id)

  const statusFiltradoValido =
    statusParam && Object.values(StatusOcorrencia).includes(statusParam as StatusOcorrencia)
      ? (statusParam as StatusOcorrencia)
      : undefined

  const pesoPorInstituicao = new Map<string, number>()

  if (metrica === 'ocorrencias' || metrica === 'urgentes') {
    const whereOcorrencias: {
      instituicaoId: { in: string[] }
      createdAt: { gte: Date }
      status?: StatusOcorrencia | { in: StatusOcorrencia[] }
      prioridade?: { in: Prioridade[] }
    } = {
      instituicaoId: { in: instituicaoIds },
      createdAt: { gte: desde },
    }

    if (statusFiltradoValido) {
      whereOcorrencias.status = statusFiltradoValido
    } else {
      whereOcorrencias.status = { in: STATUS_EM_ABERTO }
    }

    if (metrica === 'urgentes') {
      whereOcorrencias.prioridade = { in: [Prioridade.ALTA, Prioridade.URGENTE] }
    }

    const ocorrenciasAgrupadas = await prisma.ocorrencia.groupBy({
      by: ['instituicaoId', 'prioridade'],
      where: whereOcorrencias,
      _count: { _all: true },
    })

    for (const registro of ocorrenciasAgrupadas) {
      const acumulado = pesoPorInstituicao.get(registro.instituicaoId) ?? 0
      const incremento = registro._count._all * pesoPorPrioridade(registro.prioridade)
      pesoPorInstituicao.set(registro.instituicaoId, acumulado + incremento)
    }
  }

  if (metrica === 'sem_resposta') {
    const semResposta = await prisma.ocorrencia.groupBy({
      by: ['instituicaoId'],
      where: {
        instituicaoId: { in: instituicaoIds },
        status: StatusOcorrencia.ABERTA,
        updatedAt: { lte: desde },
      },
      _count: { _all: true },
    })

    for (const registro of semResposta) {
      pesoPorInstituicao.set(registro.instituicaoId, registro._count._all)
    }
  }

  if (metrica === 'itens_ruins') {
    const setores = await prisma.setor.findMany({
      where: { instituicaoId: { in: instituicaoIds } },
      select: { id: true, instituicaoId: true },
    })

    const setorParaInstituicao = new Map(setores.map(setor => [setor.id, setor.instituicaoId]))

    if (setores.length > 0) {
      const itensAgrupados = await prisma.item.groupBy({
        by: ['setorId'],
        where: {
          setorId: { in: setores.map(setor => setor.id) },
          estadoConservacao: { in: [EstadoConservacao.RUIM, EstadoConservacao.INSERVIVEL] },
        },
        _count: { _all: true },
      })

      for (const registro of itensAgrupados) {
        const instituicaoId = setorParaInstituicao.get(registro.setorId)
        if (!instituicaoId) continue
        const acumulado = pesoPorInstituicao.get(instituicaoId) ?? 0
        pesoPorInstituicao.set(instituicaoId, acumulado + registro._count._all)
      }
    }
  }

  const pontos = instituicoes.map(inst => ({
    id: inst.id,
    nome: inst.nome,
    tipo: inst.tipo,
    lat: inst.latitude as number,
    lng: inst.longitude as number,
    peso: pesoPorInstituicao.get(inst.id) ?? 0,
  }))

  return NextResponse.json({ pontos })
}
