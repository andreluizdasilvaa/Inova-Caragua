import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const instituicao = await prisma.instituicao.findUnique({
        where: { id },
        include: {
          _count: { select: { ocorrencias: true, setores: true, itens: true } },
        },
      });
      if (!instituicao) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(formatInstituicao(instituicao));
    }

    const instituicoes = await prisma.instituicao.findMany({
      where: { ativo: true },
      include: {
        _count: { select: { ocorrencias: true, setores: true, itens: true } },
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(instituicoes.map(formatInstituicao));
  } catch (error) {
    console.error('Error fetching instituicoes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}

function formatInstituicao(inst: any) {
  return {
    id: inst.id,
    nome: inst.nome,
    tipo: inst.tipo,
    codigoInep: inst.codigoInep,
    endereco: inst.endereco,
    bairro: inst.bairro,
    telefone: inst.telefone,
    latitude: inst.latitude,
    longitude: inst.longitude,
    ativo: inst.ativo,
    createdAt: inst.createdAt,
    updatedAt: inst.updatedAt,
    openCount: inst._count?.ocorrencias || 0,
    setorCount: inst._count?.setores || 0,
    itemCount: inst._count?.itens || 0,
  };
}