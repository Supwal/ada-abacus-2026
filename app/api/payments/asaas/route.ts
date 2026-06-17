import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = (session.user as any)?.name || session.user.email?.split('@')[0] || 'Usuário';

    const body = await request.json();
    const { planType, price, billingType, creditCard } = body;

    if (!planType || !price || !billingType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Criar cliente no Asaas
    const customerData: AsaasCustomer = {
      name: userName,
      email: userEmail,
      phone: (session.user as any)?.phone || '',
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
      description: `Assinatura ${planType === 'basico' ? 'Básica' : 'Completa'} - ADA APP`,
      externalReference: `subscription-${userId}-${Date.now()}`,
      notificationEnabled: true,
    };

    // Se for cartão de crédito, adicionar dados do cartão
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

    // Salvar referência do pagamento no banco
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const asaasPaymentId = searchParams.get('asaasPaymentId');

    if (!paymentId && !asaasPaymentId) {
      return NextResponse.json(
        { error: 'paymentId ou asaasPaymentId obrigatório' },
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

    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
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
          where: { userId: session.user.id },
          update: {
            planType: payment.planType,
            price: payment.price,
            status: 'ativo',
            voiceEnabled: payment.planType === 'completo',
            startDate: new Date(),
          },
          create: {
            userId: session.user.id,
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
