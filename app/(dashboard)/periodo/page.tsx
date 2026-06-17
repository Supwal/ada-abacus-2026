
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PeriodoPage() {
  const [stats, setStats] = useState({
    emAndamento: 0,
    proximos: 0,
    finalizados: 0
  });

  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');

  const carregarDados = async () => {
    // Atualizar hora
    const now = new Date();
    const horas = now.getHours().toString().padStart(2, '0');
    const minutos = now.getMinutes().toString().padStart(2, '0');
    setUltimaAtualizacao(`${horas}:${minutos}`);

    try {
      // Buscar TODOS os agendamentos da API (sem filtro de data)
      // Vamos buscar um período amplo: 1 ano atrás até 1 ano à frente
      const hoje = new Date();
      const anoPassado = new Date(hoje);
      anoPassado.setFullYear(hoje.getFullYear() - 1);
      const anoQuevem = new Date(hoje);
      anoQuevem.setFullYear(hoje.getFullYear() + 1);
      
      const formatDate = (d: Date) => {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
      };

      const response = await fetch(`/api/appointments?startDate=${formatDate(anoPassado)}&endDate=${formatDate(anoQuevem)}`);
      
      if (!response.ok) {
        console.error('Erro ao buscar agendamentos');
        return;
      }

      const todosAgendamentos = await response.json();

      // Data de hoje (sem horas)
      const hojeStr = formatDate(hoje);

      let emAndamento = 0;
      let proximos = 0;
      let finalizados = 0;

      todosAgendamentos.forEach((agendamento: any) => {
        // Extrair a data do agendamento (formato YYYY-MM-DD)
        const dataAgendamento = new Date(agendamento.date);
        const dataAgendamentoStr = formatDate(dataAgendamento);
        
        const statusLower = (agendamento.status || '').toLowerCase();

        // Ignorar agendamentos cancelados
        if (statusLower === 'cancelado' || statusLower === 'cancelled') {
          return;
        }

        // Em andamento: agendamentos de hoje (confirmados ou pendentes)
        if (dataAgendamentoStr === hojeStr) {
          emAndamento++;
        }
        // Próximos: agendamentos futuros
        else if (dataAgendamentoStr > hojeStr) {
          proximos++;
        }
        // Finalizados: agendamentos passados (confirmados)
        else if (dataAgendamentoStr < hojeStr && (statusLower === 'confirmado' || statusLower === 'confirmed')) {
          finalizados++;
        }
      });

      setStats({ emAndamento, proximos, finalizados });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    // Carregar dados inicialmente
    carregarDados();

    // Listener para mudanças no localStorage (entre diferentes abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('agendamentos_')) {
        carregarDados();
      }
    };

    // Listener para evento customizado (mesma aba)
    const handleAgendamentoChange = () => {
      carregarDados();
    };

    // Listener para quando a página recebe foco novamente
    const handleFocus = () => {
      carregarDados();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('agendamentoSalvo', handleAgendamentoChange);
    window.addEventListener('focus', handleFocus);

    // Atualizar dados a cada 10 segundos
    const interval = setInterval(() => {
      carregarDados();
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('agendamentoSalvo', handleAgendamentoChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Menu
            </Button>
          </Link>
        </div>

        {/* Título com hora de atualização */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Período dos Agendamentos
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm text-gray-600">
              Atualizado em: <span className="font-semibold">{ultimaAtualizacao}</span>
            </div>
            <Button 
              onClick={() => {
                carregarDados();
                toast.success("Dados Atualizados!", {
                  description: "As informações foram recarregadas com sucesso.",
                  duration: 2000,
                });
              }}
              size="sm"
              variant="outline"
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Em andamento */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Em andamento</h3>
                  <p className="text-4xl font-bold text-gray-900">{stats.emAndamento}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Próximos */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Próximos</h3>
                  <p className="text-4xl font-bold text-gray-900">{stats.proximos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Finalizados */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-500 flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Finalizados</h3>
                  <p className="text-4xl font-bold text-gray-900">{stats.finalizados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Ações Rápidas */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/agenda">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-pink-50 hover:border-pink-300 transition-all">
                  <CalendarIcon className="h-6 w-6 mb-2 text-pink-500" />
                  <span className="font-medium">Ver Agenda</span>
                </Button>
              </Link>
              <Link href="/agenda/novo">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <Clock className="h-6 w-6 mb-2 text-blue-500" />
                  <span className="font-medium">Novo Agendamento</span>
                </Button>
              </Link>
              <Link href="/ganhos">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-300 transition-all">
                  <CheckCircle className="h-6 w-6 mb-2 text-green-500" />
                  <span className="font-medium">Ver Ganhos</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-purple-50 hover:border-purple-300 transition-all">
                  <CalendarIcon className="h-6 w-6 mb-2 text-purple-500" />
                  <span className="font-medium">Dashboard</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
