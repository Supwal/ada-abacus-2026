export const runtime = 'edge'


import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { makePrisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = makePrisma()
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

    const location = await prisma.location.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Local não encontrado' }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Erro ao buscar local:', error);
    return NextResponse.json({ error: 'Erro ao buscar local' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = makePrisma()
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
    const { name, address, description } = body;

    const location = await prisma.location.updateMany({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        name,
        address: address || '',
        description: description || '',
      },
    });

    if (location.count === 0) {
      return NextResponse.json({ error: 'Local não encontrado' }, { status: 404 });
    }

    const updatedLocation = await prisma.location.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error('Erro ao atualizar local:', error);
    return NextResponse.json({ error: 'Erro ao atualizar local' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = makePrisma()
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

    await prisma.location.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Local excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir local:', error);
    return NextResponse.json({ error: 'Erro ao excluir local' }, { status: 500 });
  }
}
