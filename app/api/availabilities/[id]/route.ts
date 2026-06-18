export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { makePrisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = makePrisma()
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token!.sub as string);
    const { id } = params;

    const availability = await prisma.availability.findUnique({
      where: { id },
      include: {
        location: {
          select: { id: true, name: true }
        }
      }
    });

    if (!availability || availability.userId !== userId) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    return NextResponse.json({ error: 'Erro ao buscar disponibilidade' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = makePrisma()
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token!.sub as string);
    const { id } = params;

    // Verificar se a disponibilidade pertence ao usuário
    const availability = await prisma.availability.findUnique({
      where: { id }
    });

    if (!availability || availability.userId !== userId) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    // Deletar disponibilidade
    await prisma.availability.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar disponibilidade:', error);
    return NextResponse.json({ error: 'Erro ao deletar disponibilidade' }, { status: 500 });
  }
}
