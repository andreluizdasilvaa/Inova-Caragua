import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instituicaoId = searchParams.get('instituicaoId');

    const where = instituicaoId ? { instituicaoId } : {};

    const ocorrencias = await prisma.ocorrencia.findMany({
      where,
      include: {
        instituicao: true,
        setor: true,
        item: true,
        criadoPor: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    // Format to match the Occurrence interface expected by the frontend
    const formattedOccurrences = ocorrencias.map(occ => ({
      id: occ.id,
      numero: occ.numero,
      titulo: occ.titulo,
      descricao: occ.descricao,
      tipoSolicitacao: occ.tipoSolicitacao,
      status: occ.status,
      prioridade: occ.prioridade,
      localizacaoDescricao: occ.localizacaoDescricao,
      numeroPatrimonioTexto: occ.numeroPatrimonioTexto,
      observacoesTriagem: occ.observacoesTriagem,
      observacoesMestre: occ.observacoesMestre,
      motivoRecusa: occ.motivoRecusa,
      prestadorServico: occ.prestadorServico,
      valorOrcamento: occ.valorOrcamento ? Number(occ.valorOrcamento) : null,
      dataVisitaAgendada: occ.dataVisitaAgendada,
      dataConclusao: occ.dataConclusao,
      dataTriagem: occ.dataTriagem,
      dataAprovacao: occ.dataAprovacao,
      createdAt: occ.createdAt,
      updatedAt: occ.updatedAt,
      instituicaoId: occ.instituicaoId,
      setorId: occ.setorId,
      itemId: occ.itemId,
      criadoPorId: occ.criadoPorId,
      triagemPorId: occ.triagemPorId,
      aprovadoPorId: occ.aprovadoPorId,
      
      // Extended properties for UI matching the mock data structure
      nomeInstituicao: occ.instituicao.nome,
      nomeSetor: occ.setor?.nome,
      nomeItem: occ.item?.nome,
      numeroPatrimonioItem: occ.item?.numeroPatrimonio,
      categoriaItem: occ.item?.categoria,
      nomeCriador: occ.criadoPor.nome,
    }));

    return NextResponse.json(formattedOccurrences);
  } catch (error) {
    console.error('Error fetching ocorrencias:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occurrences' },
      { status: 500 }
    );
  }
}
