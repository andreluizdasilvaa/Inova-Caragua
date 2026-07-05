import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { StatusItem } from '@/generated/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instituicaoId = searchParams.get('instituicaoId');

    const where: any = {};
    if (instituicaoId) {
      where.setor = { instituicaoId };
    }

    const [total, ativo, manutencao, baixado] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.count({ where: { ...where, status: StatusItem.ATIVO } }),
      prisma.item.count({ where: { ...where, status: StatusItem.EM_MANUTENCAO } }),
      prisma.item.count({ where: { ...where, status: StatusItem.BAIXADO } }),
    ]);

    return NextResponse.json({ total, ativo, manutencao, baixado });
  } catch (error) {
    console.error('Error fetching item stats:', error);
    return NextResponse.json({ error: 'Failed to fetch item stats' }, { status: 500 });
  }
}
