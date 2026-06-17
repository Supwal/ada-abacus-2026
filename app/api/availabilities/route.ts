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

    // Buscar todas as disponibilidades do usuÃ¡rio, incluindo dados da localizaÃ§Ã£o
    const availabilities = await prisma.availability.findMany({
      where: { userId },
      include: {
        location: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('Erro ao buscar disponibilidades:', error);
    return NextResponse.json({ error: 'Erro ao buscar disponibilidades' }, { status: 500 });
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

    const { type, date, startTime, endTime, locationId, hourlyRate, maxAppointments, notes, notificationChannel } = body;

    // ValidaÃ§Ã£o bÃ¡sica
    if (!type || !date || !startTime || !endTime || !locationId || !hourlyRate || !maxAppointments || !notificationChannel) {
      return NextResponse.json(
        { error: 'Campos obrigatÃ³rios faltando' },
        { status: 400 }
      );
    }

    // Criar disponibilidade
    const availability = await prisma.availability.create({
      data: {
        userId,
        type,
        date: new Date(date),
        startTime,
        endTime,
        locationId,
        hourlyRate: parseFloat(hourlyRate as string),
        maxAppointments: parseInt(maxAppointments as string),
        notes: notes || '',
        notificationChannel,
        currentAppointments: 0
      },
      include: {
        location: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Erro ao criar disponibilidade:', error);
    return NextResponse.json({ error: 'Erro ao criar disponibilidade' }, { status: 500 });
  }
}
