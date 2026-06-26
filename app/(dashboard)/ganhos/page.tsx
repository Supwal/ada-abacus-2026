
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ConsultaGanhosPage() {
  const [formData, setFormData] = useState({
    dataInicial: '',
    dataFinal: ''
  });
  
  const [totalPeriodo, setTotalPeriodo] = useState('R$ 0,00');
  const [agendamentosConfirmados, setAgendamentosConfirmados] = useState<any[]>([]);
  const [calculado, setCalculado] = useState(false);

  // Inicializar com datas padrão (primeiro dia do mês atual até hoje)
  useEffect(() => {
    const hoje = new Date();
    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const formatarData = (data: Date) => {
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    };
    
    setFormData({
      dataInicial: formatarData(primeiroDiaDoMes),
      dataFinal: formatarData(hoje)
    });
  }, []);

  // Função para formatar data como "11 de julho"
  const formatarDataExibicao = (dataString: string) => {
    const [ano, mes, dia] = dataString.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    return `${dia} de ${meses[data.getMonth()]}`;
  };

  // Função para formatar horário como "10h00"
  const formatarHorario = (horario: string) => {
    return horario.replace(':', 'h');
  };

  const calcularGanhos = async () => {
    if (!formData.dataInicial || !formData.dataFinal) {
      toast.error('Por favor, selecione as datas inicial e final.');
      return;
    }

    try {
      // Buscar todos os agendamentos do período (sem filtro de status na API)
      const params = new URLSearchParams({
        startDate: formData.dataInicial,
        endDate: formData.dataFinal,
        status: 'todos'
      });
      
      const response = await fetch(`/api/appointments?${params}`);
      
      if (!response.ok) {
        console.error('Erro ao buscar agendamentos');
        setAgendamentosConfirmados([]);
        setTotalPeriodo('R$ 0,00');
        setCalculado(true);
        return;
      }
      
      const agendamentosAPI = await response.json();
      
      // Transformar dados da API
      const agendamentosEncontrados: any[] = [];
      let totalCalculado = 0;
      
      agendamentosAPI.forEach((a: any) => {
        // Incluir todos os agendamentos não cancelados para cálculo de ganhos
        // (pendente, confirmado, scheduled - todos exceto cancelado)
        if (a.status === 'cancelado') return;
        
        // Formatar a data para YYYY-MM-DD (usar UTC para evitar problema de timezone)
        const dataObj = new Date(a.date);
        const dataString = `${dataObj.getUTCFullYear()}-${String(dataObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dataObj.getUTCDate()).padStart(2, '0')}`;
        
        // Verificar se tem valor
        const valorNumerico = a.value || 0;
        
        // Mapear status para exibição
        const statusExibicao = a.status === 'scheduled' ? 'pendente' : a.status;
        const statusIcon = statusExibicao === 'confirmado' ? '✅' : statusExibicao === 'pendente' ? '⏳' : '📋';
        
        const nomeCliente = a.clientName || a.client?.name || 'Cliente não informado';
        agendamentosEncontrados.push({
          id: a.id,
          codigo: nomeCliente,
          dataOriginal: dataString,
          dataFormatada: formatarDataExibicao(dataString),
          horario: a.startTime,
          horarioFormatado: formatarHorario(a.startTime),
          cliente: nomeCliente,
          servico: a.serviceName || a.service?.name || 'Serviço não informado',
          local: a.locationName || a.location?.name || 'Local não informado',
          valor: valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          valorNumerico: valorNumerico,
          status: statusExibicao,
          statusIcon: statusIcon
        });
        totalCalculado += valorNumerico;
      });

      // Ordenar por data e horário
      agendamentosEncontrados.sort((a, b) => {
        if (a.dataOriginal !== b.dataOriginal) {
          return a.dataOriginal.localeCompare(b.dataOriginal);
        }
        return a.horario.localeCompare(b.horario);
      });

      setAgendamentosConfirmados(agendamentosEncontrados);
      setTotalPeriodo(totalCalculado.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }));
      setCalculado(true);
    } catch (error) {
      console.error('Erro ao calcular ganhos:', error);
      setAgendamentosConfirmados([]);
      setTotalPeriodo('R$ 0,00');
      setCalculado(true);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Menu
          </Link>
        </div>

        {/* Filtrar Ganhos */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Filtrar Ganhos
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Selecione o período para ver os ganhos dos agendamentos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Data Inicial */}
            <div>
              <Label htmlFor="dataInicial" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Data Inicial
              </Label>
              <Input
                id="dataInicial"
                type="date"
                value={formData.dataInicial}
                onChange={(e) => handleInputChange('dataInicial', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Data Final */}
            <div>
              <Label htmlFor="dataFinal" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Data Final
              </Label>
              <Input
                id="dataFinal"
                type="date"
                value={formData.dataFinal}
                onChange={(e) => handleInputChange('dataFinal', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Calcular Ganhos Button */}
          <Button 
            onClick={calcularGanhos}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 font-semibold rounded-lg"
          >
            Calcular Ganhos
          </Button>
        </div>

        {calculado && (
          <>
            {/* Total no Período */}
            <div className="bg-green-50 rounded-lg shadow-sm p-6 mb-6 border border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total no Período</span>
                <span className="text-3xl font-bold text-green-600">
                  {totalPeriodo}
                </span>
              </div>
            </div>

            {/* Agendamentos do Período */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Agendamentos do Período ({agendamentosConfirmados.length})
              </h2>

              {agendamentosConfirmados.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Nenhum agendamento encontrado para o período selecionado.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agendamentosConfirmados.map((agendamento, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Código e Status */}
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-gray-900">
                              {agendamento.codigo}
                            </h3>
                            <span className="text-sm">
                              {agendamento.statusIcon} {agendamento.status}
                            </span>
                          </div>
                          {/* Cliente */}
                          <p className="text-sm text-gray-700 mb-1">
                            {agendamento.cliente}
                          </p>
                          {/* Data e Horário */}
                          <p className="text-sm text-blue-600">
                            {agendamento.dataFormatada} - {agendamento.horarioFormatado}
                          </p>
                        </div>
                        {/* Valor */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {agendamento.valor}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!calculado && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-400">
              Clique em "Calcular Ganhos" para ver os resultados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
