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

    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
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
    const { name, email, phone, notes } = body;

    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        userId: user.id,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
