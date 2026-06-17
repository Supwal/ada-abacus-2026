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

    // Buscar ou criar o status da agenda
    let agendaStatus = await prisma.agendaStatus.findUnique({
      where: { userId }
    });

    // Se não existir, criar com status padrão "aberta"
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
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
