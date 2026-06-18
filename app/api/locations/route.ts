export const runtime = 'edge'


import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { makePrisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const prisma = makePrisma()
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: (token!.email as string) },
    });

    if (!user) {
      return NextResponse.json({ error: 'UsuÃ¡rio nÃ£o encontrado' }, { status: 404 });
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
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: (token!.email as string) },
    });

    if (!user) {
      return NextResponse.json({ error: 'UsuÃ¡rio nÃ£o encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { id, name, address, description } = body;

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
    return NextResponse.json({ error: 'Erro ao criar local' }, { status: 500 });
  }
}
