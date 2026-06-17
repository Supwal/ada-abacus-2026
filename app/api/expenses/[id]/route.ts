export const runtime = 'edge'


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    await prisma.expense.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Despesa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    return NextResponse.json({ error: 'Erro ao excluir despesa' }, { status: 500 });
  }
}
