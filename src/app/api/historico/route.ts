import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ocorrenciaId = searchParams.get('ocorrenciaId');
    const itemId = searchParams.get('itemId');

    const where: any = {};
    if (ocorrenciaId) where.ocorrenciaId = ocorrenciaId;
    if (itemId) {
      // Find history for all occurrences linked to this item
      const ocorrencias = await prisma.ocorrencia.findMany({
        where: { itemId },
        select: { id: true },
      });
      where.ocorrenciaId = { in: ocorrencias.map(o => o.id) };
    }

    const historico = await prisma.historicoOcorrencia.findMany({
      where,
      include: {
        autor: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      historico.map(h => ({
        id: h.id,
        statusAnterior: h.statusAnterior,
        statusNovo: h.statusNovo,
        comentario: h.comentario,
        createdAt: h.createdAt,
        ocorrenciaId: h.ocorrenciaId,
        autorId: h.autorId,
        nomeAutor: h.autor.nome,
      }))
    );
  } catch (error) {
    console.error('Error fetching historico:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { statusAnterior, statusNovo, comentario, ocorrenciaId, autorId } = body;

    if (!statusNovo || !ocorrenciaId || !autorId) {
      return NextResponse.json(
        { error: 'statusNovo, ocorrenciaId, and autorId are required' },
        { status: 400 }
      );
    }

    const historico = await prisma.historicoOcorrencia.create({
      data: {
        statusAnterior: statusAnterior || null,
        statusNovo,
        comentario: comentario || null,
        ocorrenciaId,
        autorId,
      },
      include: {
        autor: { select: { id: true, nome: true } },
      },
    });

    return NextResponse.json({
      id: historico.id,
      statusAnterior: historico.statusAnterior,
      statusNovo: historico.statusNovo,
      comentario: historico.comentario,
      createdAt: historico.createdAt,
      ocorrenciaId: historico.ocorrenciaId,
      autorId: historico.autorId,
      nomeAutor: historico.autor.nome,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating historico:', error);
    return NextResponse.json(
      { error: 'Failed to create history entry' },
      { status: 500 }
    );
  }
}