import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instituicaoId = searchParams.get('instituicaoId');

    if (!instituicaoId) {
      return NextResponse.json({ error: 'instituicaoId is required' }, { status: 400 });
    }

    const setores = await prisma.setor.findMany({
      where: { instituicaoId },
      include: {
        _count: { select: { itens: true, ocorrencias: true } },
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(
      setores.map(s => ({
        id: s.id,
        nome: s.nome,
        descricao: s.descricao,
        instituicaoId: s.instituicaoId,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        itemCount: s._count.itens,
        ocorrenciaCount: s._count.ocorrencias,
      }))
    );
  } catch (error) {
    console.error('Error fetching setores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sectors' },
      { status: 500 }
    );
  }
}