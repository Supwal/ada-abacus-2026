export const runtime = 'edge'


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'UsuÃ¡rio nÃ£o encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = { userId: user.id };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const earnings = await prisma.earning.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        location: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(earnings);
  } catch (error) {
    console.error('Erro ao buscar ganhos:', error);
    return NextResponse.json({ error: 'Erro ao buscar ganhos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'UsuÃ¡rio nÃ£o encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { description, amount, date, clientId, serviceId, locationId, appointmentId } = body;

    const earning = await prisma.earning.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        userId: user.id,
        clientId: clientId || null,
        serviceId: serviceId || null,
        locationId: locationId || null,
        appointmentId: appointmentId || null,
      },
      include: {
        client: true,
        service: true,
        location: true,
      },
    });

    return NextResponse.json(earning, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar ganho:', error);
    return NextResponse.json({ error: 'Erro ao criar ganho' }, { status: 500 });
  }
}
