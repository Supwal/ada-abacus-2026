export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth-helper';
import { makePrisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const prisma = makePrisma()
  try {
    const token = await getAuthToken(request);

    if (!token?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const locations = await prisma.location.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    return NextResponse.json({ error: 'Erro ao buscar locais' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const prisma = makePrisma()
  try {
    const token = await getAuthToken(request);

    if (!token?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { id, name, address, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome do local é obrigatório' }, { status: 400 });
    }

    const location = await prisma.location.create({
      data: {
        id: id || `loc_${Date.now()}`,
        name,
        address: address || '',
        description: description || '',
        userId: user.id,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar local:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: `Erro ao criar local: ${msg}` }, { status: 500 });
  }
}
