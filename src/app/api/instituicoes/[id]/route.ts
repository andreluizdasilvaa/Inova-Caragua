import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: any = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.codigoInep !== undefined) updateData.codigoInep = data.codigoInep;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.endereco !== undefined) updateData.endereco = data.endereco;
    if (data.bairro !== undefined) updateData.bairro = data.bairro;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.latitude !== undefined) updateData.latitude = data.latitude ? parseFloat(data.latitude) : null;
    if (data.longitude !== undefined) updateData.longitude = data.longitude ? parseFloat(data.longitude) : null;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    const updatedInst = await prisma.instituicao.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedInst);
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json({ error: 'Failed to update institution' }, { status: 500 });
  }
}
