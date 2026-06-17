export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import {
  createOrGetAsaasCustomer,
  createAsaasPayment,
  getAsaasPayment,
  getPixQrCode,
  AsaasCustomer,
  AsaasPayment,
  ASAAS_API_URL,
  ASAAS_API_KEY,
} from '@/lib/asaas';

export const dynamic = 'force-dynamic';

/**
 * POST - Criar pagamento de assinatura via Asaas
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub || !token?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token!.sub as string);
    const userEmail = (token!.email as string);
    const userName = (token?.name as string) || (token!.email as string)?.split('@')[0] || 'UsuÃ¡rio';

    const body = await request.json();
    const { planType, price, billingType, creditCard } = body;

    if (!planType || !price || !billingType) {
      return NextResponse.json(
        { error: 'Campos obrigatÃ³rios faltando' },
        { status: 400 }
      );
    }

    // Criar cliente no Asaas
    const customerData: AsaasCustomer = {
      name: userName,
      email: userEmail,
      phone: (token as any)?.phone || '',
    };

    const customerId = await createOrGetAsaasCustomer(customerData);

    // Definir data de vencimento (hoje + 3 dias para testes)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Criar pagamento no Asaas
    const paymentData: AsaasPayment = {
      customerId,
      billingType: billingType as 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD',
      dueDate: dueDateStr,
      value: parseFloat(price as string),
      description: `Assinatura ${planType === 'basico' ? 'BÃ¡sica' : 'Completa'} - ADA APP`,
      externalReference: `subscription-${userId}-${Date.now()}`,
      notificationEnabled: true,
    };

    // Se for cartÃ£o de crÃ©dito, adicionar dados do cartÃ£o
    if (billingType === 'CREDIT_CARD' && creditCard) {
      paymentData.creditCard = {
        holderName: creditCard.holderName,
        number: creditCard.number.replace(/\s/g, ''),
        expiryMonth: creditCard.expiryMonth,
        expiryYear: creditCard.expiryYear,
        ccv: creditCard.ccv,
      };
    }

    const paymentResponse = await createAsaasPayment(paymentData);

    // Salvar referÃªncia do pagamento no banco
    const payment = await prisma.payment.create({
      data: {
        userId,
        asaasPaymentId: paymentResponse.id,
        planType,
        price: parseFloat(price as string),
        status: 'pending',
        billingType,
        externalReference: paymentData.externalReference,
      },
    });

    // Se for PIX, obter QR Code
    let pixData = null;
    if (billingType === 'PIX') {
      try {
        pixData = await getPixQrCode(paymentResponse.id);
      } catch (error) {
        console.error('Erro ao obter QR Code PIX:', error);
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        asaasPaymentId: paymentResponse.id,
        status: paymentResponse.status,
        billingType,
        value: price,
        planType,
        bankSlipUrl: paymentResponse.bankSlipUrl,
        pixQrCode: pixData?.payload,
        pixQrCodeUrl: pixData?.url,
        invoiceUrl: paymentResponse.invoiceUrl,
      },
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao processar pagamento',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Obter status do pagamento
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const asaasPaymentId = searchParams.get('asaasPaymentId');

    if (!paymentId && !asaasPaymentId) {
      return NextResponse.json(
        { error: 'paymentId ou asaasPaymentId obrigatÃ³rio' },
        { status: 400 }
      );
    }

    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
    } else if (asaasPaymentId) {
      payment = await prisma.payment.findFirst({
        where: { asaasPaymentId },
      });
    }

    if (!payment || payment.userId !== (token!.sub as string)) {
      return NextResponse.json({ error: 'Pagamento nÃ£o encontrado' }, { status: 404 });
    }

    // Obter status do pagamento no Asaas
    const asaasPayment = await getAsaasPayment(payment.asaasPaymentId);

    // Atualizar status no banco se mudou
    if (asaasPayment.status !== payment.status) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: asaasPayment.status },
      });

      // Se pagamento foi confirmado, atualizar assinatura
      if (asaasPayment.status === 'CONFIRMED') {
        await prisma.subscription.upsert({
          where: { userId: (token!.sub as string) },
          update: {
            planType: payment.planType,
            price: payment.price,
            status: 'ativo',
            voiceEnabled: payment.planType === 'completo',
            startDate: new Date(),
          },
          create: {
            userId: (token!.sub as string),
            planType: payment.planType,
            price: payment.price,
            status: 'ativo',
            voiceEnabled: payment.planType === 'completo',
          },
        });
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        asaasPaymentId: payment.asaasPaymentId,
        status: asaasPayment.status,
        billingType: payment.billingType,
        planType: payment.planType,
        value: payment.price,
        bankSlipUrl: asaasPayment.bankSlipUrl,
        invoiceUrl: asaasPayment.invoiceUrl,
      },
    });
  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao obter pagamento',
      },
      { status: 500 }
    );
  }
}
