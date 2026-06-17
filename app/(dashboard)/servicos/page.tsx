
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Home, Plus } from "lucide-react";
import Link from "next/link";

export default function ServicosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Serviços
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os serviços oferecidos
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Menu Principal
            </Button>
          </Link>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Gestão de Serviços
          </CardTitle>
          <CardDescription>
            Funcionalidade em desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gestão de Serviços em Desenvolvimento
            </h3>
            <p className="text-gray-500">
              Em breve você poderá cadastrar serviços com preços, duração e descrições detalhadas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
