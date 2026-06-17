export const runtime = 'edge'


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        client: true,
        service: true,
        location: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamento' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updateData: any = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;
    if (value !== undefined) updateData.value = value ? parseFloat(value) : null;
    if (paid !== undefined) updateData.paid = paid;
    if (clientId !== undefined) updateData.clientId = clientId;
    if (serviceId !== undefined) updateData.serviceId = serviceId;
    if (locationId !== undefined) updateData.locationId = locationId;

    const appointment = await prisma.appointment.updateMany({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: updateData,
    });

    if (appointment.count === 0) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        service: true,
        location: true,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await prisma.appointment.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir agendamento' }, { status: 500 });
  }
}
