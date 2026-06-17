'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Check,
  Mic,
  MessageSquare,
  BarChart3,
  Package,
  Users,
  Calendar,
  Crown,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AssinaturasPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarAssinatura();
  }, []);

  const carregarAssinatura = async () => {
    try {
      setCarregando(true);
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        toast.error('Erro ao carregar assinatura');
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
      toast.error('Erro ao carregar assinatura');
    } finally {
      setCarregando(false);
    }
  };

  const contratarPlano = (planType: string) => {
    // Redirecionar para página de checkout
    router.push(`/assinatura/checkout?plan=${planType}`);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  const planoAtual = subscription?.planType || 'gratuito';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Voltar ao Menu</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💎 Planos de Assinatura</h1>
          <p className="text-gray-600">Escolha o plano ideal para suas necessidades</p>
        </div>

        {/* Status Atual */}
        {subscription && (
          <div className={`bg-white rounded-xl shadow-lg p-6 mb-8 border-2 ${planoAtual === 'gratuito' ? 'border-orange-300' : 'border-purple-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Plano Atual</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {planoAtual === 'basico' && '📦 Plano Básico'}
                  {planoAtual === 'completo' && '⭐ Plano Completo'}
                  {planoAtual === 'gratuito' && '🆓 Plano Gratuito'}
                </h2>
                {planoAtual === 'gratuito' && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-orange-600 font-medium">Limitações do plano gratuito:</p>
                    <p className="text-sm text-gray-500">❌ Máximo de 20 agendamentos/mês</p>
                    <p className="text-sm text-gray-500">❌ Sem relatórios financeiros</p>
                    <p className="text-sm text-gray-500">❌ Sem agendamento por voz</p>
                    <p className="text-sm text-gray-500">❌ Sem gerenciamento de Packs</p>
                  </div>
                )}
              </div>
              <Crown className={`h-12 w-12 ${planoAtual === 'gratuito' ? 'text-gray-300' : 'text-yellow-500'}`} />
            </div>
            {subscription.price > 0 && (
              <p className="text-gray-600 mt-4">
                Próxima renovação:{' '}
                <span className="font-semibold text-purple-600">
                  {subscription.endDate
                    ? new Date(subscription.endDate).toLocaleDateString('pt-BR')
                    : new Date(new Date(subscription.startDate).setDate(new Date(subscription.startDate).getDate() + 30)).toLocaleDateString('pt-BR')}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* PLANO BÁSICO */}
          <div className={`relative rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
            planoAtual === 'basico' ? 'ring-4 ring-purple-500 scale-105' : 'hover:shadow-xl'
          }`}>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">📦 Plano Básico</h3>
                {planoAtual === 'basico' && (
                  <div className="bg-green-400 text-white px-4 py-1 rounded-full text-xs font-bold">
                    ✅ ATIVO
                  </div>
                )}
              </div>
              <p className="text-4xl font-bold mb-2">R$ 29,90</p>
              <p className="text-purple-100 mb-6">/mês</p>

              {/* Funcionalidades */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>✅ Gerenciamento básico de agenda</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>📅 Até 200 agendamentos/mês</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>📍 Locais ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>🎯 Serviços ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>💼 Relatórios básicos</span>
                </div>
                <div className="flex items-center gap-3 text-gray-200 opacity-60">
                  <Mic className="h-5 w-5" />
                  <span className="line-through">Solicitações por voz (não incluído)</span>
                </div>
                <div className="flex items-center gap-3 text-gray-200 opacity-60">
                  <Package className="h-5 w-5" />
                  <span className="line-through">Gerenciamento de Packs (não incluído)</span>
                </div>
              </div>

              {/* Botão */}
              {planoAtual !== 'basico' ? (
                <Button
                  onClick={() => contratarPlano('basico')}
                  className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold py-3"
                >
                  🛒 Contratar Plano Básico
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-green-500 text-white font-bold py-3 cursor-default"
                >
                  ✅ Plano Atual
                </Button>
              )}
            </div>
          </div>

          {/* PLANO COMPLETO */}
          <div className={`relative rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
            planoAtual === 'completo' ? 'ring-4 ring-yellow-500 scale-105' : 'hover:shadow-xl'
          }`}>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">⭐ Plano Completo</h3>
                {planoAtual === 'completo' && (
                  <div className="bg-green-400 text-white px-4 py-1 rounded-full text-xs font-bold">
                    ✅ ATIVO
                  </div>
                )}
              </div>
              <p className="text-4xl font-bold mb-2">R$ 79,90</p>
              <p className="text-yellow-100 mb-6">/mês</p>

              {/* Funcionalidades */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>✅ Gerenciamento ilimitado de agenda</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>📅 Agendamentos ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>📍 Locais ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>🎯 Serviços ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5" />
                  <span>📊 Relatórios avançados</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Mic className="h-5 w-5" />
                  <span>🎤 Solicitações por voz/áudio</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Package className="h-5 w-5" />
                  <span>📦 Gerenciamento completo de Packs</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Zap className="h-5 w-5" />
                  <span>⚡ Prioridade no suporte</span>
                </div>
              </div>

              {/* Botão */}
              {planoAtual !== 'completo' ? (
                <Button
                  onClick={() => contratarPlano('completo')}
                  className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold py-3"
                >
                  🛒 Contratar Plano Completo
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-green-500 text-white font-bold py-3 cursor-default"
                >
                  ✅ Plano Atual
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Comparação Completa */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Comparação Detalhada</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-4 font-bold text-gray-900">Funcionalidade</th>
                  <th className="pb-4 font-bold text-center text-purple-600">📦 Básico</th>
                  <th className="pb-4 font-bold text-center text-orange-600">⭐ Completo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">Gerenciamento de Agenda</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">Agendamentos</td>
                  <td className="text-center">Até 200/mês</td>
                  <td className="text-center">Ilimitados</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">Locais</td>
                  <td className="text-center">Ilimitados</td>
                  <td className="text-center">Ilimitados</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">Serviços</td>
                  <td className="text-center">Ilimitados</td>
                  <td className="text-center">Ilimitados</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">Relatórios</td>
                  <td className="text-center">Básicos</td>
                  <td className="text-center">Avançados</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">🎤 Solicitações por Voz</td>
                  <td className="text-center text-gray-400">❌</td>
                  <td className="text-center text-green-600">✅</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">📦 Packs</td>
                  <td className="text-center text-gray-400">❌</td>
                  <td className="text-center text-green-600">✅</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3">⚡ Suporte</td>
                  <td className="text-center">Padrão</td>
                  <td className="text-center">Prioridade</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
