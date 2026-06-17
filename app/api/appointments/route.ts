
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    let whereClause: any = { userId: user.id };

    if (startDate && endDate) {
      // Criar datas usando o mesmo padrão da criação (T12:00:00) para evitar problemas de timezone
      // startDate: início do dia (00:00 local)
      // endDate: fim do dia (23:59:59 local)
      const startOfDay = new Date(startDate + 'T00:00:00');
      const endOfDay = new Date(endDate + 'T23:59:59.999');
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (status && status !== 'todos') {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        location: true,
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      date, 
      startTime, 
      endTime, 
      status, 
      notes, 
      value, 
      paid,
      clientId,
      serviceId,
      locationId
    } = body;

    // Criar a data preservando o dia correto (evitar problema de timezone)
    // Adiciona T12:00:00 para garantir que o dia seja preservado em qualquer timezone
    const dateToSave = new Date(date + 'T12:00:00');
    
    const appointment = await prisma.appointment.create({
      data: {
        date: dateToSave,
        startTime,
        endTime,
        status: status || 'scheduled',
        notes: notes || null,
        value: value ? parseFloat(value) : null,
        paid: paid || false,
        userId: user.id,
        clientId,
        serviceId,
        locationId,
      },
      include: {
        client: true,
        service: true,
        location: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
