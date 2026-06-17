
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Database, Server, Home, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function ConexaoPage() {
  const [connectionStatus, setConnectionStatus] = useState({
    internet: true,
    database: true,
    server: true
  });

  useEffect(() => {
    // Simular verificação de conexão
    const checkConnection = () => {
      setConnectionStatus({
        internet: navigator.onLine,
        database: Math.random() > 0.1, // 90% chance de estar conectado
        server: true
      });
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status de Conexão</h1>
          <p className="text-gray-600 mt-1">
            Monitore a conectividade do sistema
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={connectionStatus.internet ? "border-green-200" : "border-red-200"}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {connectionStatus.internet ? (
                <Wifi className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 mr-2 text-red-600" />
              )}
              Internet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {connectionStatus.internet ? (
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 mr-3" />
              )}
              <div>
                <p className={`font-semibold ${connectionStatus.internet ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionStatus.internet ? 'Conectado' : 'Desconectado'}
                </p>
                <p className="text-sm text-gray-600">
                  {connectionStatus.internet ? 'Conexão estável' : 'Verifique sua internet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={connectionStatus.database ? "border-green-200" : "border-red-200"}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className={`h-5 w-5 mr-2 ${connectionStatus.database ? 'text-green-600' : 'text-red-600'}`} />
              Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {connectionStatus.database ? (
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 mr-3" />
              )}
              <div>
                <p className={`font-semibold ${connectionStatus.database ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionStatus.database ? 'Conectado' : 'Erro de Conexão'}
                </p>
                <p className="text-sm text-gray-600">
                  {connectionStatus.database ? 'Funcionando normalmente' : 'Tentando reconectar...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={connectionStatus.server ? "border-green-200" : "border-red-200"}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className={`h-5 w-5 mr-2 ${connectionStatus.server ? 'text-green-600' : 'text-red-600'}`} />
              Servidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {connectionStatus.server ? (
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 mr-3" />
              )}
              <div>
                <p className={`font-semibold ${connectionStatus.server ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionStatus.server ? 'Online' : 'Offline'}
                </p>
                <p className="text-sm text-gray-600">
                  {connectionStatus.server ? 'Resposta rápida' : 'Servidor indisponível'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Conexão</CardTitle>
          <CardDescription>
            Informações técnicas sobre a conectividade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Latência:</span>
                <span className="font-medium text-green-600">45ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Velocidade:</span>
                <span className="font-medium text-blue-600">100 Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium text-purple-600">99.9%</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">IP Local:</span>
                <span className="font-medium">192.168.1.100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DNS:</span>
                <span className="font-medium text-green-600">Respondendo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última Verificação:</span>
                <span className="font-medium">Agora</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas de Diagnóstico</CardTitle>
          <CardDescription>
            Teste e diagnóstico da conexão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              Testar Conexão
            </Button>
            <Button variant="outline">
              Verificar DNS
            </Button>
            <Button variant="outline">
              Ping do Servidor
            </Button>
            <Button variant="outline">
              Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
