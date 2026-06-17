
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LimparDadosPage() {
  const [confirmacao, setConfirmacao] = useState('');
  const [dadosLimpos, setDadosLimpos] = useState(false);
  const [loading, setLoading] = useState(false);

  const limparTodosOsDados = async () => {
    if (confirmacao !== 'LIMPAR DADOS') {
      toast.error('Por favor, digite "LIMPAR DADOS" na confirmação para prosseguir.');
      return;
    }

    setLoading(true);
    
    try {
      // Limpar dados do banco de dados PostgreSQL via API
      const response = await fetch('/api/clear-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao limpar dados do banco de dados');
      }

      // Aguardar um pouco para simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDadosLimpos(true);
      setConfirmacao('');
      
      toast.success('Dados limpos com sucesso do banco de dados!');
      
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast.error('Erro ao limpar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetarConfirmacao = () => {
    setDadosLimpos(false);
    setConfirmacao('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Menu
          </Link>
          <h1 className="text-2xl font-bold text-red-900">
            🗑️ Limpar Base de Dados
          </h1>
          <p className="text-red-700 mt-2">
            Ferramenta para zerar completamente todos os dados do sistema
          </p>
        </div>

        {!dadosLimpos ? (
          <Card className="shadow-lg border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                ⚠️ ATENÇÃO: Operação Irreversível
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Aviso */}
                <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Esta ação irá remover TODOS os seguintes dados:
                  </h3>
                  <ul className="text-red-700 space-y-1">
                    <li>• 📅 Todos os agendamentos (de todas as datas)</li>
                    <li>• 👥 Todos os clientes cadastrados</li>
                    <li>• 🏢 Todos os locais/clínicas</li>
                    <li>• 💰 Todas as despesas registradas</li>
                    <li>• ⚙️ Todas as configurações personalizadas</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-red-200 rounded border-red-400 border">
                    <p className="text-red-900 font-medium text-center">
                      🚨 NÃO HAVERÁ COMO RECUPERAR OS DADOS APÓS ESTA AÇÃO! 🚨
                    </p>
                  </div>
                </div>

                {/* Campo de Confirmação */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-red-800">
                    Para confirmar, digite exatamente: <strong>LIMPAR DADOS</strong>
                  </label>
                  <input
                    type="text"
                    value={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.value)}
                    placeholder="Digite: LIMPAR DADOS"
                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    disabled={loading}
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button
                    onClick={limparTodosOsDados}
                    disabled={confirmacao !== 'LIMPAR DADOS' || loading}
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Limpando Dados...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        🗑️ LIMPAR TODOS OS DADOS
                      </>
                    )}
                  </Button>
                  
                  <Link href="/dashboard">
                    <Button variant="outline" disabled={loading}>
                      Cancelar
                    </Button>
                  </Link>
                </div>

                {/* Informações de Segurança */}
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    💡 Recomendações de Segurança:
                  </h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Certifique-se de que não há dados importantes no sistema</li>
                    <li>• Esta operação é ideal para reinicar os testes do zero</li>
                    <li>• Após a limpeza, você poderá cadastrar novos dados normalmente</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Confirmação de Sucesso
          <Card className="shadow-lg border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                ✅ Dados Limpos com Sucesso!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🎉</div>
                
                <h3 className="text-lg font-semibold text-green-800">
                  Base de Dados Completamente Limpa!
                </h3>
                
                <p className="text-green-700">
                  Todos os dados foram removidos com sucesso. O sistema está pronto para receber novos cadastros.
                </p>

                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    🎯 Próximos Passos:
                  </h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Cadastre novos clientes</li>
                    <li>• Registre locais/clínicas</li>
                    <li>• Agende novos atendimentos</li>
                    <li>• Configure despesas</li>
                  </ul>
                </div>

                <div className="flex gap-3 justify-center mt-6">
                  <Link href="/dashboard">
                    <Button className="bg-green-600 hover:bg-green-700">
                      🏠 Voltar ao Dashboard
                    </Button>
                  </Link>
                  
                  <Link href="/clientes/novo">
                    <Button variant="outline">
                      👥 Cadastrar Cliente
                    </Button>
                  </Link>
                  
                  <Button onClick={resetarConfirmacao} variant="outline">
                    🔄 Limpar Novamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Sistema */}
        <Card className="mt-6 shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>🔧 <strong>Ferramenta de Desenvolvimento</strong> - ADA APP v1.0</p>
              <p>Esta funcionalidade é específica para testes e desenvolvimento do sistema</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
