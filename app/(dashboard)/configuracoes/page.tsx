
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Home, User, Bell, Shield, Smartphone } from "lucide-react";
import Link from "next/link";

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas configurações pessoais e do sistema
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="dark:border-gray-600">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Menu
            </Button>
          </Link>
        </div>

        {/* Notificações */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Bell className="h-5 w-5 mr-2 text-blue-500" />
              Notificações
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Configure suas preferências de notificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Configurações de notificação em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Conta */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Conta
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Gerencie suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Edição de perfil em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Shield className="h-5 w-5 mr-2 text-purple-500" />
              Segurança
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Configure opções de segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Configurações de segurança em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
