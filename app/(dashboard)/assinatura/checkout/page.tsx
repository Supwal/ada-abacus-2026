'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  FileText,
  Loader,
  Check,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planType = searchParams.get('plan') || 'basico';
  const planName = planType === 'basico' ? 'Plano Básico' : 'Plano Completo';
  const planPrice = planType === 'basico' ? 29.90 : 79.90;

  const [billingType, setBillingType] = useState<'PIX' | 'BOLETO' | 'CREDIT_CARD'>('PIX');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [creditCardData, setCreditCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });

  // Formatar número do cartão
  const handleCardNumberChange = (value: string) => {
    const formatted = value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
    setCreditCardData({ ...creditCardData, number: formatted });
  };

  // Processar pagamento
  const handleProcessPayment = async () => {
    try {
      if (billingType === 'CREDIT_CARD') {
        if (
          !creditCardData.holderName ||
          !creditCardData.number ||
          !creditCardData.expiryMonth ||
          !creditCardData.expiryYear ||
          !creditCardData.ccv
        ) {
          toast.error('Preencha todos os dados do cartão');
          return;
        }

        if (creditCardData.number.replace(/\s/g, '').length !== 16) {
          toast.error('Número do cartão inválido');
          return;
        }
      }

      setLoading(true);

      const response = await fetch('/api/payments/asaas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          price: planPrice,
          billingType,
          creditCard:
            billingType === 'CREDIT_CARD' ? creditCardData : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao processar pagamento');
        return;
      }

      setPayment(data.payment);
      toast.success('Pagamento iniciado com sucesso!');
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  // Verificar status do pagamento
  const checkPaymentStatus = async () => {
    if (!payment?.id) return;

    try {
      const response = await fetch(`/api/payments/asaas?paymentId=${payment.id}`);
      if (response.ok) {
        const data = await response.json();
        setPayment(data.payment);

        if (data.payment.status === 'CONFIRMED') {
          toast.success('Pagamento confirmado! Redirecionando...');
          setTimeout(() => router.push('/assinatura'), 2000);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Polling de status
  useEffect(() => {
    if (payment?.status === 'PENDING') {
      const interval = setInterval(checkPaymentStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [payment]);

  if (payment?.status === 'CONFIRMED' || payment?.status === 'RECEIVED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl border-2 border-green-200">
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <Check className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">Pagamento Confirmado!</h1>
            <p className="text-gray-600 mb-4">
              Sua assinatura no {planName} foi ativada com sucesso.
            </p>
            <p className="text-gray-600 mb-6">
              Valor: <strong>R$ {planPrice.toFixed(2)}</strong>
            </p>
            <Button
              onClick={() => router.push('/assinatura')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
            >
              Voltar para Assinatura
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (payment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/assinatura"
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dados do Pagamento</h1>

          {payment.status === 'PENDING' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {payment.billingType === 'PIX' && payment.pixQrCode && (
                <Card className="p-6 shadow-lg border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <QrCode className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">Código PIX</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Escaneie o QR Code abaixo ou copie o código para pagar:
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="text-xs break-all text-gray-700 font-mono">
                      {payment.pixQrCode}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(payment.pixQrCode);
                      toast.success('Código copiado!');
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    Copiar Código
                  </Button>
                </Card>
              )}

              {payment.billingType === 'BOLETO' && payment.bankSlipUrl && (
                <Card className="p-6 shadow-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Boleto</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Clique no botão abaixo para acessar seu boleto:
                  </p>
                  <Button
                    onClick={() => window.open(payment.bankSlipUrl, '_blank')}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    Acessar Boleto
                  </Button>
                </Card>
              )}

              {payment.billingType === 'CREDIT_CARD' && (
                <Card className="p-6 shadow-lg border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-900">Cartão Processado</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Seu pagamento foi enviado para processamento.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      Pagamento em processamento
                    </p>
                  </div>
                </Card>
              )}

              <Card className="p-6 shadow-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informações</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Plano</p>
                    <p className="font-semibold text-gray-900">{planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="text-2xl font-bold text-green-600">R$ {planPrice.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {payment.status === 'PENDING' && (
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Aguardando Confirmação</p>
                  <p className="text-sm text-blue-800">
                    A página será atualizada automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/assinatura"
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Escolha a forma de pagamento</p>

        <Card className="p-6 mb-8 shadow-lg border-2 border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Plano:</span>
              <span className="font-semibold text-gray-900">{planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Valor:</span>
              <span className="font-bold text-lg text-green-600">R$ {planPrice.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-xl text-green-600">R$ {planPrice.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Forma de Pagamento</h2>

          <div className="space-y-4 mb-8">
            <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              billingType === 'PIX'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="billing"
                  value="PIX"
                  checked={billingType === 'PIX'}
                  onChange={(e) => setBillingType(e.target.value as any)}
                  className="w-4 h-4"
                />
                <QrCode className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-bold text-gray-900">PIX Instantâneo</p>
                  <p className="text-sm text-gray-600">Pague com QR Code ou código</p>
                </div>
              </div>
            </label>

            <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              billingType === 'BOLETO'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="billing"
                  value="BOLETO"
                  checked={billingType === 'BOLETO'}
                  onChange={(e) => setBillingType(e.target.value as any)}
                  className="w-4 h-4"
                />
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-bold text-gray-900">Boleto Bancário</p>
                  <p className="text-sm text-gray-600">Pague via transferência</p>
                </div>
              </div>
            </label>

            <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              billingType === 'CREDIT_CARD'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="billing"
                  value="CREDIT_CARD"
                  checked={billingType === 'CREDIT_CARD'}
                  onChange={(e) => setBillingType(e.target.value as any)}
                  className="w-4 h-4"
                />
                <CreditCard className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-bold text-gray-900">Cartão de Crédito</p>
                  <p className="text-sm text-gray-600">Pague com seu cartão</p>
                </div>
              </div>
            </label>
          </div>

          {billingType === 'CREDIT_CARD' && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Titular</Label>
                <Input
                  placeholder="João Silva"
                  value={creditCardData.holderName}
                  onChange={(e) =>
                    setCreditCardData({ ...creditCardData, holderName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Número</Label>
                <Input
                  placeholder="4111 1111 1111 1111"
                  value={creditCardData.number}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  maxLength={19}
                  className="mt-1 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Mês</Label>
                  <Input
                    placeholder="MM"
                    maxLength={2}
                    value={creditCardData.expiryMonth}
                    onChange={(e) =>
                      setCreditCardData({
                        ...creditCardData,
                        expiryMonth: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Ano</Label>
                  <Input
                    placeholder="YY"
                    maxLength={2}
                    value={creditCardData.expiryYear}
                    onChange={(e) =>
                      setCreditCardData({
                        ...creditCardData,
                        expiryYear: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">CVV</Label>
                  <Input
                    placeholder="000"
                    maxLength={4}
                    value={creditCardData.ccv}
                    onChange={(e) =>
                      setCreditCardData({ ...creditCardData, ccv: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleProcessPayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Confirmar Pagamento - R$ {planPrice.toFixed(2)}
              </>
            )}
          </Button>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Seus dados de cartão são processados com segurança pelo Asaas</p>
        </div>
      </div>
    </div>
  );
}
