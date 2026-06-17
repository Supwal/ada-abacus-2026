export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token!.sub as string);

    // Buscar ou criar o status da agenda
    let agendaStatus = await prisma.agendaStatus.findUnique({
      where: { userId }
    });

    // Se nÃ£o existir, criar com status padrÃ£o "aberta"
    if (!agendaStatus) {
      agendaStatus = await prisma.agendaStatus.create({
        data: {
          userId,
          isOpen: true
        }
      });
    }

    return NextResponse.json({
      isOpen: agendaStatus.isOpen,
      updatedAt: agendaStatus.updatedAt
    });
  } catch (error) {
    console.error('Erro ao buscar status da agenda:', error);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token!.sub as string);
    const { isOpen } = await request.json();

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json({ error: 'isOpen deve ser um boolean' }, { status: 400 });
    }

    // Atualizar ou criar o status da agenda
    const agendaStatus = await prisma.agendaStatus.upsert({
      where: { userId },
      update: { isOpen },
      create: { userId, isOpen }
    });

    return NextResponse.json({
      isOpen: agendaStatus.isOpen,
      updatedAt: agendaStatus.updatedAt
    });
  } catch (error) {
    console.error('Erro ao atualizar status da agenda:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
