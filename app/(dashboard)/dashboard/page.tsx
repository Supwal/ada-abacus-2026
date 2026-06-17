
'use client';

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  DollarSign, 
  TrendingDown,
  MapPin,
  Share2,
  Clock,
  Grid3X3,
  Plus,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

const menuCards = [
  {
    label: "Agendar",
    href: "/agenda/novo",
    icon: Plus,
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    label: "Consulta Agenda",
    href: "/agenda",
    icon: Calendar,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    label: "Consulta Ganhos",
    href: "/ganhos",
    icon: DollarSign,
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600"
  },
  {
    label: "Locais/Clínicas",
    href: "/locais",
    icon: MapPin,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    label: "Despesas",
    href: "/despesas",
    icon: TrendingDown,
    bgColor: "bg-red-100",
    iconColor: "text-red-600"
  },
  {
    label: "Redes Sociais",
    href: "/redes-sociais",
    icon: Share2,
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600"
  },
  {
    label: "Período",
    href: "/periodo",
    icon: Clock,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    label: "Dash-Board Regional",
    href: "/dashboard-regional",
    icon: Clock,
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  }
];

export default function DashboardPage() {
  const { data: session } = useSession() || {};
  const [agendamentosHoje, setAgendamentosHoje] = useState(0);

  // Buscar agendamentos do dia atual
  useEffect(() => {
    const obterAgendamentosHoje = async () => {
      try {
        // Obter data de hoje no formato YYYY-MM-DD
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        const dataHoje = `${ano}-${mes}-${dia}`;
        
        // Buscar agendamentos usando a API
        const response = await fetch(`/api/appointments?startDate=${dataHoje}&endDate=${dataHoje}`);
        if (response.ok) {
          const agendamentos = await response.json();
          setAgendamentosHoje(agendamentos.length);
        }
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      }
    };

    obterAgendamentosHoje();

    // Atualizar a cada 2 minutos — evita sobrecarga no banco
    const intervalo = setInterval(obterAgendamentosHoje, 120000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      {/* Main Content Area */}
      <div className="flex-1 p-3 md:p-8">
        {/* Header - Compacto para Mobile */}
        <div className="text-center mb-4 md:mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-2 md:mb-4">
            <div className="w-16 h-16 md:w-24 md:h-24 relative">
              <Image
                src="/logo-ada.png"
                alt="A.D.A Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
            Bem-vindo ao A.D.A
          </h1>
          <p className="text-gray-600 text-xs md:text-base hidden md:block">
            Assistente Digital de Agendamentos para Profissionais
          </p>
        </div>

        {/* Menu Cards Grid - Otimizado para Mobile */}
        <div className="max-w-6xl mx-auto mb-4 md:mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
            {menuCards.slice(0, 8).map((card, index) => (
              <Link key={card.href} href={card.href} className="focus:outline-none">
                <div className="bg-white rounded-[32px] p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-105 border-2 border-gray-100 hover:border-blue-200 focus:outline-none active:outline-none">
                  <div className={`w-12 h-12 md:w-16 md:h-16 ${card.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    <card.icon className={`h-6 w-6 md:h-8 md:w-8 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-center font-semibold text-gray-900 text-xs md:text-base leading-tight">
                    {card.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Contador de Agendamentos de Hoje - Compacto */}
          <div className="flex justify-center mb-3 md:mb-5">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl md:rounded-2xl px-4 py-2 md:px-8 md:py-4 shadow-lg">
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <CalendarDays className="h-5 w-5 md:h-7 md:w-7" />
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold">{agendamentosHoje}</div>
                  <div className="text-xs md:text-sm opacity-90">
                    Agendamento{agendamentosHoje !== 1 ? 's' : ''} hoje
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Painel de Controle Card - Compacto */}
          <div className="flex justify-center">
            <Link href="/painel-controle" className="w-full max-w-xs">
              <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Grid3X3 className="h-5 w-5 md:h-7 md:w-7 text-gray-600" />
                  </div>
                  <h3 className="text-center font-medium text-gray-900 text-sm md:text-base">
                    Painel de Controle
                  </h3>
                </div>
              </div>
            </Link>
          </div>
        </div>


        {/* Bottom Section - Oculto no Mobile */}
        <div className="text-center mt-4 md:mt-8 hidden md:block">
          <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-pink-100 rounded-xl mb-2 md:mb-4">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-pink-600" />
          </div>
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2">
            Aumente sua produtividade
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Organize seus agendamentos, locais e finanças em um só lugar
          </p>
        </div>
      </div>
    </div>
  );
}
