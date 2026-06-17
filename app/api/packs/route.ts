export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar todos os packs do usuÃ¡rio
    const packs = await prisma.pack.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(packs);
  } catch (error) {
    console.error('Erro ao buscar packs:', error);
    return NextResponse.json({ error: 'Erro ao buscar packs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { name, photos, videos, price, coverImage } = body;

    // ValidaÃ§Ã£o bÃ¡sica
    if (!name || photos === undefined || videos === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatÃ³rios faltando' },
        { status: 400 }
      );
    }

    // Criar pack
    const pack = await prisma.pack.create({
      data: {
        userId,
        name,
        photos: parseInt(photos as string),
        videos: parseInt(videos as string),
        price: parseFloat(price as string),
        coverImage: coverImage || null
      }
    });

    return NextResponse.json(pack);
  } catch (error) {
    console.error('Erro ao criar pack:', error);
    return NextResponse.json({ error: 'Erro ao criar pack' }, { status: 500 });
  }
}
