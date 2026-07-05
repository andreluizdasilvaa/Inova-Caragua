/**
 * GET /api/mapa?metrica=ocorrencias&periodo=30&status=ABERTA&tipos=EMEF,EMEI
 *
 * Retorna pontos para o HeatmapLayer do Google Maps.
 * Cada ponto tem: lat, lng, peso (calculado pela métrica escolhida), nome.
 *
 * Parâmetros de query (todos opcionais):
 *   metrica  → "ocorrencias" | "urgentes" | "sem_resposta" | "itens_ruins"
 *   periodo  → número de dias para janela de tempo (default: 30)
 *   status   → status das ocorrências (default: todos)
 *   tipos    → tipos de instituição separados por vírgula (default: todos)
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prioridade, StatusOcorrencia, TipoInstituicao } from '@/generated/client'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const metrica = searchParams.get('metrica') ?? 'ocorrencias'
  const periodo = parseInt(searchParams.get('periodo') ?? '30', 10)
  const statusParam = searchParams.get('status')
  const tiposParam = searchParams.get('tipos')

  // Janela de tempo
  const desde = new Date()
  desde.setDate(desde.getDate() - periodo)

  // Filtro de tipos de instituição
  const tipoFiltro = tiposParam
    ? (tiposParam.split(',').filter(t =>
        Object.values(TipoInstituicao).includes(t as TipoInstituicao)
      ) as TipoInstituicao[])
    : undefined

  // Busca todas as instituições ativas com coordenadas
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
      _count: false,
    },
  })

  // Para cada instituição, calcula o peso conforme a métrica
  const pontos = await Promise.all(
    instituicoes.map(async (inst) => {
      let peso = 0

      if (metrica === 'ocorrencias') {
        // Total de ocorrências no período (com filtro de status opcional)
        peso = await prisma.ocorrencia.count({
          where: {
            instituicaoId: inst.id,
            createdAt: { gte: desde },
            ...(statusParam && Object.values(StatusOcorrencia).includes(statusParam as StatusOcorrencia)
              ? { status: statusParam as StatusOcorrencia }
              : {}),
          },
        })
      } else if (metrica === 'urgentes') {
        // Ocorrências com prioridade URGENTE ou ALTA no período
        peso = await prisma.ocorrencia.count({
          where: {
            instituicaoId: inst.id,
            createdAt: { gte: desde },
            prioridade: { in: [Prioridade.URGENTE, Prioridade.ALTA] },
          },
        })
      } else if (metrica === 'sem_resposta') {
        // Ocorrências abertas há mais de "periodo" dias sem movimentação
        peso = await prisma.ocorrencia.count({
          where: {
            instituicaoId: inst.id,
            status: StatusOcorrencia.ABERTA,
            updatedAt: { lte: desde },
          },
        })
      } else if (metrica === 'itens_ruins') {
        // Itens em estado RUIM ou INSERVIVEL nos setores desta instituição
        peso = await prisma.item.count({
          where: {
            setor: { instituicaoId: inst.id },
            estadoConservacao: { in: ['RUIM', 'INSERVIVEL'] },
          },
        })
      }

      return {
        id: inst.id,
        nome: inst.nome,
        tipo: inst.tipo,
        lat: inst.latitude!,
        lng: inst.longitude!,
        peso,
      }
    })
  )

  return NextResponse.json({ pontos })
}
