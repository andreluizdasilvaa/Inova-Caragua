import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        ativo: true,
        instituicaoId: true,
        instituicao: { select: { nome: true } },
        createdAt: true,
      },
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.nome || !data.email || !data.senha || !data.papel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const newUser = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senhaHash: senhaHash,
        papel: data.papel,
        ativo: data.ativo ?? true,
        instituicaoId: data.instituicaoId || null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        ativo: true,
        instituicaoId: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
