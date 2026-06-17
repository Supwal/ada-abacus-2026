
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Home, HelpCircle, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function SuportePage() {
  const handleWhatsAppContact = () => {
    const whatsappUrl = "https://wa.me/5511993130223?text=Olá!%20Preciso%20de%20ajuda%20com%20o%20ADA%20APP";
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Suporte
          </h1>
          <p className="text-gray-600 mt-1">
            Precisa de ajuda? Estamos aqui para você!
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Menu Principal
          </Button>
        </Link>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Card */}
        <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-800">
              WhatsApp
            </CardTitle>
            <CardDescription className="text-green-700">
              Fale conosco diretamente via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-700 mb-6">
              Resposta rápida para suas dúvidas e problemas técnicos
            </p>
            <Button 
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Entrar em Contato via WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* FAQ Card */}
        <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-blue-800">
              Central de Ajuda
            </CardTitle>
            <CardDescription className="text-blue-700">
              Perguntas frequentes e guias úteis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Como criar um novo agendamento?
                </h4>
                <p className="text-blue-700 text-sm">
                  Acesse o menu "Agenda" e clique em "Novo Agendamento". Preencha os dados do cliente e horário.
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Como registrar ganhos e despesas?
                </h4>
                <p className="text-blue-700 text-sm">
                  Use os menus "Gestão de Ganhos" e "Gestão de Despesas" para controlar suas finanças.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Como cadastrar locais e serviços?
                </h4>
                <p className="text-blue-700 text-sm">
                  Acesse "Locais/Clínicas" e "Serviços" no menu lateral para gerenciar essas informações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-purple-600" />
            Como usar o A.D.A.
          </CardTitle>
          <CardDescription>
            Principais funcionalidades da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">📅 Gestão de Agenda</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Visualização em calendário (mensal, semanal, diária)</li>
                <li>• Criação e edição de agendamentos</li>
                <li>• Controle de status dos atendimentos</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">💰 Controle Financeiro</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Registro de ganhos e despesas</li>
                <li>• Relatórios com filtros por período</li>
                <li>• Gráficos de evolução financeira</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">👥 Gestão de Clientes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cadastro completo de clientes</li>
                <li>• Histórico de atendimentos</li>
                <li>• Informações de contato organizadas</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">⚙️ Configurações</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gestão de locais/clínicas</li>
                <li>• Configuração de serviços e preços</li>
                <li>• Categorização de despesas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-center">
            Outras formas de contato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Phone className="h-5 w-5" />
              <span>(11) 99313-0223</span>
            </div>
            <p className="text-sm text-gray-500">
              Horário de atendimento: Segunda a Sexta, das 9h às 18h
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
