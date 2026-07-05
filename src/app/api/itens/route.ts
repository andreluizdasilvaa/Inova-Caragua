import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instituicaoId = searchParams.get('instituicaoId');
    const categoria = searchParams.get('categoria');
    const id = searchParams.get('id');
    const pageRaw = searchParams.get('page');
    const limitRaw = searchParams.get('limit');

    // Single item fetch
    if (id) {
      const item = await prisma.item.findUnique({
        where: { id },
        include: {
          setor: { select: { id: true, nome: true, instituicaoId: true } },
          cadastradoPor: { select: { id: true, nome: true } },
        },
      });
      if (!item) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(formatItem(item));
    }

    // List with filters
    const where: any = {};
    if (instituicaoId) {
      where.setor = { instituicaoId };
    }
    if (categoria) {
      where.categoria = categoria;
    }

    const page = pageRaw ? Math.max(1, parseInt(pageRaw)) : 1;
    const limit = limitRaw ? Math.max(1, Math.min(100, parseInt(limitRaw))) : 50;
    const skip = (page - 1) * limit;

    const [itens, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          setor: { select: { id: true, nome: true, instituicaoId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      data: itens.map(formatItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nome, categoria, numeroPatrimonio, numeroSerie,
      marca, modelo, estadoConservacao, status,
      dataAquisicao, valorAquisicao, observacoes,
      setorId, instituicaoId, cadastradoPorId,
    } = body;

    if (!nome) {
      return NextResponse.json({ error: 'Nome is required' }, { status: 400 });
    }

    // If setorId is provided, validate it exists. Otherwise, find or create a default sector
    let resolvedSetorId = setorId;
    if (resolvedSetorId && instituicaoId) {
      // Validate that the provided setorId exists and belongs to the institution
      const validSetor = await prisma.setor.findFirst({
        where: { id: resolvedSetorId, instituicaoId },
      });
      if (!validSetor) {
        // Invalid setorId, find or create a default one
        resolvedSetorId = null;
      }
    }
    if (!resolvedSetorId && instituicaoId) {
      // Try to find an existing "Geral" sector for this institution
      const existingSetor = await prisma.setor.findFirst({
        where: { instituicaoId, nome: 'Geral' },
      });
      if (existingSetor) {
        resolvedSetorId = existingSetor.id;
      } else {
        // Create a default sector
        const newSetor = await prisma.setor.create({
          data: { nome: 'Geral', instituicaoId },
        });
        resolvedSetorId = newSetor.id;
      }
    }

    const item = await prisma.item.create({
      data: {
        nome,
        categoria: categoria || 'OUTRO',
        numeroPatrimonio: numeroPatrimonio || null,
        numeroSerie: numeroSerie || null,
        marca: marca || null,
        modelo: modelo || null,
        estadoConservacao: estadoConservacao || 'NOVO',
        status: status || 'ATIVO',
        dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
        valorAquisicao: valorAquisicao ? parseFloat(valorAquisicao) : null,
        observacoes: observacoes || null,
        setorId: resolvedSetorId || null,
        cadastradoPorId: cadastradoPorId || null,
      },
      include: {
        setor: { select: { id: true, nome: true, instituicaoId: true } },
      },
    });

    return NextResponse.json(formatItem(item), { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const allowedFields = [
      'nome', 'categoria', 'numeroPatrimonio', 'numeroSerie',
      'marca', 'modelo', 'estadoConservacao', 'status',
      'dataAquisicao', 'valorAquisicao', 'observacoes', 'setorId',
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }
    if (data.dataAquisicao) data.dataAquisicao = new Date(data.dataAquisicao);
    if (data.valorAquisicao) data.valorAquisicao = parseFloat(data.valorAquisicao);

    const updated = await prisma.item.update({
      where: { id },
      data,
      include: {
        setor: { select: { id: true, nome: true, instituicaoId: true } },
      },
    });

    return NextResponse.json(formatItem(updated));
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Unlink occurrences first
    await prisma.ocorrencia.updateMany({
      where: { itemId: id },
      data: { itemId: null },
    });

    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatItem(item: any) {
  return {
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
    instituicaoId: item.setor?.instituicaoId || null,
    cadastradoPorId: item.cadastradoPorId,
    nomeSetor: item.setor?.nome,
  };
}