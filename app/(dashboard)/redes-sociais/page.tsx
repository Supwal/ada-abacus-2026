
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Instagram, Facebook, Twitter, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const redesSociais = [
  {
    nome: "Instagram",
    icon: Instagram,
    descricao: "Gerencie suas postagens e anúncios no Instagram para alcançar mais clientes.",
    corIcone: "text-pink-600",
    botaoEstilo: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
  },
  {
    nome: "Facebook",
    icon: Facebook,
    descricao: "Gerencie sua página e anúncios no Facebook para expandir seu alcance.",
    corIcone: "text-blue-600",
    botaoEstilo: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
  },
  {
    nome: "Twitter",
    icon: Twitter,
    descricao: "Compartilhe atualizações rápidas e conecte-se com clientes no Twitter.",
    corIcone: "text-blue-400",
    botaoEstilo: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
  },
  {
    nome: "Site/Blog",
    icon: Globe,
    descricao: "Gerencie seu site ou blog para divulgar seus serviços e experiência.",
    corIcone: "text-green-600",
    botaoEstilo: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
  }
];

export default function RedesSociaisPage() {
  const [conectando, setConectando] = useState<string | null>(null);

  const handleConectar = (rede: string) => {
    setConectando(rede);
    setTimeout(() => {
      toast.info(`Conectando com ${rede}... Em breve essa funcionalidade estará disponível!`);
      setConectando(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header com botão voltar */}
        <div className="mb-6">
          <Link href="/painel-controle">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Menu
            </Button>
          </Link>
        </div>

        {/* Título da Página */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Redes Sociais e Anúncios
          </h1>
        </div>

        {/* Grid de Redes Sociais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {redesSociais.map((rede, index) => (
            <Card 
              key={index}
              className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 bg-white"
            >
              <CardContent className="p-6 space-y-4">
                {/* Ícone e Título */}
                <div className="flex items-center gap-3">
                  <div className={`${rede.corIcone}`}>
                    <rede.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {rede.nome}
                  </h3>
                </div>

                {/* Descrição */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {rede.descricao}
                </p>

                {/* Botão de Conexão */}
                <Button
                  onClick={() => handleConectar(rede.nome)}
                  disabled={conectando === rede.nome}
                  className={`w-full font-semibold ${rede.botaoEstilo}`}
                  size="lg"
                >
                  {conectando === rede.nome 
                    ? 'Conectando...' 
                    : `Conectar ${rede.nome}`
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção de Campanhas de Marketing */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Campanhas de Marketing
              </h2>
              <p className="text-gray-600 text-base">
                Agende e monitore suas campanhas de marketing em todas as plataformas.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => toast.info('Em breve: Sistema de campanhas de marketing!')}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold px-6 py-5 shadow-md hover:shadow-lg transition-all duration-300"
                  size="lg"
                >
                  Criar Nova Campanha
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
