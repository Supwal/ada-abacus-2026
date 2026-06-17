export const runtime = 'edge'


import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: (token!.email as string) },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return NextResponse.json({ error: 'Erro ao buscar serviço' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: (token!.email as string) },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { name, duration, price, description } = body;

    const service = await prisma.service.updateMany({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        name,
        duration: parseInt(duration),
        price: parseFloat(price),
        description: description || '',
      },
    });

    if (service.count === 0) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    const updatedService = await prisma.service.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json({ error: 'Erro ao atualizar serviço' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: (token!.email as string) },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    await prisma.service.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return NextResponse.json({ error: 'Erro ao excluir serviço' }, { status: 500 });
  }
}
