
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Plus, Calendar } from "lucide-react";
import Link from "next/link";

export default function ConfirmacaoAgendamentoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl border-0">
          <CardContent className="p-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Agendamento Confirmado!
            </h1>
            <p className="text-gray-600 mb-8">
              Seu agendamento foi registrado com sucesso na agenda.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/agenda/novo" className="block">
                <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Novo Agendamento
                </Button>
              </Link>
              
              <Link href="/agenda" className="block">
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Agenda Completa
                </Button>
              </Link>
              
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
