export const runtime = 'edge'


import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const services = await prisma.service.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Erro ao buscar serviÃ§os:', error);
    return NextResponse.json({ error: 'Erro ao buscar serviÃ§os' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const { id, name, duration, price, description } = body;

    const service = await prisma.service.create({
      data: {
        id: id || `svc_${Date.now()}`,
        name,
        duration: parseInt(duration),
        price: parseFloat(price),
        description: description || '',
        userId: user.id,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviÃ§o:', error);
    return NextResponse.json({ error: 'Erro ao criar serviÃ§o' }, { status: 500 });
  }
}
