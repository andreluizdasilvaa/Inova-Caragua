import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instituicaoId = searchParams.get('instituicaoId');

    const where = instituicaoId ? { setor: { instituicaoId } } : {};

    const itens = await prisma.item.findMany({
      where,
      include: {
        setor: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    // Format to match the Asset type expected by the frontend
    const formattedAssets = itens.map(item => ({
      id: item.id,
      nome: item.nome,
      categoria: item.categoria,
      numeroPatrimonio: item.numeroPatrimonio,
      numeroSerie: item.numeroSerie,
      marca: item.marca,
      modelo: item.modelo,
      estadoConservacao: item.estadoConservacao,
      status: item.status,
      dataAquisicao: item.dataAquisicao,
      valorAquisicao: item.valorAquisicao ? Number(item.valorAquisicao) : null,
      observacoes: item.observacoes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      setorId: item.setorId,
      instituicaoId: item.setor.instituicaoId,
      cadastradoPorId: item.cadastradoPorId,
    }));

    return NextResponse.json(formattedAssets);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
