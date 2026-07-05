import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, papel: true, ativo: true, instituicaoId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: any = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.papel !== undefined) updateData.papel = data.papel;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.instituicaoId !== undefined) updateData.instituicaoId = data.instituicaoId;

    if (data.senha) {
      updateData.senhaHash = await bcrypt.hash(data.senha, 10);
    }

    const updatedUser = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: { id: true, nome: true, email: true, papel: true, ativo: true, instituicaoId: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.usuario.update({
      where: { id },
      data: { ativo: false }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
  }
}
