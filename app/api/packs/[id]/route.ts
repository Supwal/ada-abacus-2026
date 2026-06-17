export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    const pack = await prisma.pack.findUnique({
      where: { id }
    });

    if (!pack || pack.userId !== userId) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    return NextResponse.json(pack);
  } catch (error) {
    console.error('Erro ao buscar pack:', error);
    return NextResponse.json({ error: 'Erro ao buscar pack' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;
    const body = await request.json();

    // Verificar se o pack pertence ao usuário
    const existingPack = await prisma.pack.findUnique({
      where: { id }
    });

    if (!existingPack || existingPack.userId !== userId) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    const { name, photos, videos, price, coverImage } = body;

    // Validar campos
    if (!name || photos === undefined || videos === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Atualizar pack
    const updatedPack = await prisma.pack.update({
      where: { id },
      data: {
        name,
        photos: parseInt(photos as string),
        videos: parseInt(videos as string),
        price: parseFloat(price as string),
        coverImage: coverImage || null
      }
    });

    return NextResponse.json(updatedPack);
  } catch (error) {
    console.error('Erro ao atualizar pack:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pack' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    // Verificar se o pack pertence ao usuário
    const pack = await prisma.pack.findUnique({
      where: { id }
    });

    if (!pack || pack.userId !== userId) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    // Deletar pack
    await prisma.pack.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar pack:', error);
    return NextResponse.json({ error: 'Erro ao deletar pack' }, { status: 500 });
  }
}
