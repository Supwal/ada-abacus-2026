export const runtime = 'edge'


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    // Deletar todos os dados do usuÃ¡rio em ordem (respeitando foreign keys)
    await prisma.appointment.deleteMany({
      where: { userId: user.id },
    });

    await prisma.expense.deleteMany({
      where: { userId: user.id },
    });

    await prisma.earning.deleteMany({
      where: { userId: user.id },
    });

    await prisma.client.deleteMany({
      where: { userId: user.id },
    });

    await prisma.service.deleteMany({
      where: { userId: user.id },
    });

    await prisma.location.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Todos os dados foram removidos com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return NextResponse.json({ error: 'Erro ao limpar dados' }, { status: 500 });
  }
}
