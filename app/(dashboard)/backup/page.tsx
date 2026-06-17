
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Database, Home, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function BackupPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup de Dados</h1>
          <p className="text-gray-600 mt-1">
            Gerencie backups e restauração dos seus dados
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Menu Principal
            </Button>
          </Link>
        </div>
      </div>

      {/* Status do Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Último backup realizado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-green-600">Atualizado</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Último Backup</p>
              <p className="font-semibold text-blue-600">Hoje, 08:00</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Tamanho</p>
              <p className="font-semibold text-purple-600">2.5 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações de Backup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fazer Backup</CardTitle>
            <CardDescription>
              Crie uma cópia de segurança dos seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mb-4">
              <Download className="h-4 w-4 mr-2" />
              Fazer Download do Backup
            </Button>
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Backup Automático
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurar Dados</CardTitle>
            <CardDescription>
              Restaure seus dados a partir de um backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Arraste um arquivo de backup ou clique para selecionar
              </p>
              <Button variant="outline">
                Selecionar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aviso */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Importante
          </CardTitle>
        </CardHeader>
        <CardContent className="text-orange-700">
          <p>
            Sempre mantenha backups atualizados dos seus dados. 
            Recomendamos fazer backup pelo menos uma vez por semana.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
