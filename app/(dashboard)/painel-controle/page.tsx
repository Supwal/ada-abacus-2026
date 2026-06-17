
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Users, 
  MapPin, 
  ShoppingBag,
  DollarSign,
  Calendar,
  BarChart3,
  Home,
  Database,
  Wifi,
  Shield,
  Crown,
  Sparkles
} from "lucide-react";
import Link from "next/link";

const controlPanelSections = [
  {
    title: "Gestão de Dados",
    description: "Gerencie as informações do sistema",
    items: [
      { label: "Clientes", href: "/clientes", icon: Users, color: "text-blue-600" },
      { label: "Serviços", href: "/servicos", icon: ShoppingBag, color: "text-purple-600" },
      { label: "Locais", href: "/locais", icon: MapPin, color: "text-green-600" }
    ]
  },
  {
    title: "Relatórios e Análises",
    description: "Visualize dados e estatísticas",
    items: [
      { label: "Ganhos", href: "/ganhos", icon: DollarSign, color: "text-yellow-600" },
      { label: "Agenda", href: "/agenda", icon: Calendar, color: "text-indigo-600" },
      { label: "Dashboard Regional", href: "/dashboard-regional", icon: BarChart3, color: "text-teal-600" }
    ]
  },
  {
    title: "Sistema",
    description: "Configurações e administração",
    items: [
      { label: "Configurações", href: "/configuracoes", icon: Settings, color: "text-gray-600" },
      { label: "Backup de Dados", href: "/backup", icon: Database, color: "text-orange-600" },
      { label: "Conexão", href: "/conexao", icon: Wifi, color: "text-cyan-600" }
    ]
  }
];

export default function PainelControlePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
          <p className="text-gray-600 mt-1">
            Acesso central a todas as funcionalidades do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="dark:border-gray-600">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Menu Principal
            </Button>
          </Link>
        </div>
      </div>

      {/* Card de Assinatura Destacado */}
      <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="text-white text-center sm:text-left">
                <h3 className="text-xl font-bold flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles className="h-5 w-5" />
                  Assinatura Premium
                </h3>
                <p className="text-pink-100 text-sm mt-1">
                  Desbloqueie todos os recursos e potencialize seu negócio
                </p>
              </div>
            </div>
            <Link href="/assinatura">
              <Button 
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50 font-bold text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Assinar Plano
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Painel Principal */}
      <div className="grid gap-8">
        {controlPanelSections.map((section, index) => (
          <Card key={index} className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">{section.title}</CardTitle>
              <CardDescription className="dark:text-gray-400">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, itemIndex) => (
                  <Link key={itemIndex} href={item.href}>
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
                    >
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas do Sistema */}
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Status do Sistema</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Informações sobre o funcionamento atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-green-600">Online</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Banco de Dados</p>
                <p className="font-semibold text-blue-600">Conectado</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Usuário Ativo</p>
                <p className="font-semibold text-purple-600">Sim</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
              <Wifi className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Conexão</p>
                <p className="font-semibold text-orange-600">Estável</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
