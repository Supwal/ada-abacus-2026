export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { makePrisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Buscar assinatura do usuÃ¡rio
export async function GET(request: NextRequest) {
  const prisma = makePrisma()
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token!.sub as string);

    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      // Retornar assinatura padrÃ£o (gratuita)
      return NextResponse.json({
        id: null,
        userId,
        planType: 'gratuito',
        price: 0,
        status: 'ativo',
        voiceEnabled: false,
        startDate: new Date(),
        endDate: null
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return NextResponse.json({ error: 'Erro ao buscar assinatura' }, { status: 500 });
  }
}

// POST - Criar/Atualizar assinatura
export async function POST(request: NextRequest) {
  const prisma = makePrisma()
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token!.sub as string);
    const body = await request.json();

    const { planType, price } = body;

    if (!planType || price === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatÃ³rios faltando' },
        { status: 400 }
      );
    }

    // Verificar se jÃ¡ existe assinatura
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (existingSubscription) {
      // Atualizar assinatura existente
      const updated = await prisma.subscription.update({
        where: { userId },
        data: {
          planType,
          price: parseFloat(price as string),
          status: 'ativo',
          startDate: new Date(),
          endDate: null,
          voiceEnabled: planType === 'completo'
        }
      });
      return NextResponse.json(updated);
    } else {
      // Criar nova assinatura
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          planType,
          price: parseFloat(price as string),
          status: 'ativo',
          voiceEnabled: planType === 'completo'
        }
      });
      return NextResponse.json(subscription);
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar assinatura:', error);
    return NextResponse.json({ error: 'Erro ao processar assinatura' }, { status: 500 });
  }
}
