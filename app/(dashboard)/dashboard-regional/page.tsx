
'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, DollarSign, Users, Filter } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface LocalData {
  nome: string;
  agendamentos: number;
  valor: number;
  cor: string;
  estado: string;
  cidade: string;
}

interface CidadeData {
  nome: string;
  agendamentos: number;
  valor: number;
  cor: string;
  estado: string;
}

export default function DashboardRegionalPage() {
  const [filtros, setFiltros] = useState({
    periodo: 'todo-periodo',
    estado: 'todos-estados',
    cidade: 'selecione-estado',
    local: 'todos-locais'
  });

  const [filtrosAtivos, setFiltrosAtivos] = useState({
    periodo: 'todo-periodo',
    estado: 'todos-estados',
    cidade: 'selecione-estado',
    local: 'todos-locais'
  });

  // Dados simulados completos com informações de localização
  const locaisDataCompletos: LocalData[] = [
    { nome: 'Clínica ABC', agendamentos: 16, valor: 3746.00, cor: 'bg-pink-500', estado: 'rs', cidade: 'porto-alegre' },
    { nome: 'Hotel Maderada', agendamentos: 12, valor: 2246.00, cor: 'bg-pink-400', estado: 'rj', cidade: 'rio-janeiro' },
    { nome: 'Hotel Miss Alagoas', agendamentos: 9, valor: 1380.00, cor: 'bg-pink-400', estado: 'sp', cidade: 'sao-paulo' },
    { nome: 'Clínica Lapa', agendamentos: 5, valor: 1010.00, cor: 'bg-pink-300', estado: 'rj', cidade: 'rio-janeiro' },
    { nome: 'Clínica Manaus', agendamentos: 2, valor: 750.00, cor: 'bg-pink-200', estado: 'am', cidade: 'manaus' },
    { nome: 'Hotel Mahatan', agendamentos: 4, valor: 730.00, cor: 'bg-pink-300', estado: 'sp', cidade: 'sao-paulo' },
    { nome: 'Havana Club', agendamentos: 2, valor: 600.00, cor: 'bg-pink-200', estado: 'mg', cidade: 'belo-horizonte' },
    { nome: 'Clínica Central', agendamentos: 2, valor: 530.00, cor: 'bg-pink-200', estado: 'rs', cidade: 'porto-alegre' },
    { nome: 'Paradise Club', agendamentos: 1, valor: 300.00, cor: 'bg-pink-100', estado: 'sp', cidade: 'sao-paulo' },
    { nome: 'Hotel Londrina', agendamentos: 1, valor: 300.00, cor: 'bg-pink-100', estado: 'pr', cidade: 'londrina' }
  ];

  const cidadesDataCompletas: CidadeData[] = [
    { nome: 'Porto Alegre', agendamentos: 18, valor: 4276.00, cor: 'bg-purple-500', estado: 'rs' },
    { nome: 'Rio de Janeiro', agendamentos: 17, valor: 3256.00, cor: 'bg-purple-400', estado: 'rj' },
    { nome: 'São Paulo', agendamentos: 14, valor: 2410.00, cor: 'bg-purple-400', estado: 'sp' },
    { nome: 'Manaus', agendamentos: 2, valor: 750.00, cor: 'bg-purple-200', estado: 'am' },
    { nome: 'Belo Horizonte', agendamentos: 2, valor: 600.00, cor: 'bg-purple-200', estado: 'mg' },
    { nome: 'Londrina', agendamentos: 1, valor: 300.00, cor: 'bg-purple-100', estado: 'pr' }
  ];

  // Aplicar filtros aos dados
  const dadosFiltrados = useMemo(() => {
    let locaisFiltrados = locaisDataCompletos;
    let cidadesFiltradas = cidadesDataCompletas;

    // Filtro por Estado
    if (filtrosAtivos.estado !== 'todos-estados') {
      locaisFiltrados = locaisFiltrados.filter(local => local.estado === filtrosAtivos.estado);
      cidadesFiltradas = cidadesFiltradas.filter(cidade => cidade.estado === filtrosAtivos.estado);
    }

    // Filtro por Cidade
    if (filtrosAtivos.cidade !== 'selecione-estado' && filtrosAtivos.cidade !== 'todos-estados') {
      locaisFiltrados = locaisFiltrados.filter(local => local.cidade === filtrosAtivos.cidade);
      cidadesFiltradas = cidadesFiltradas.filter(cidade => 
        cidade.nome.toLowerCase().replace(/\s/g, '-') === filtrosAtivos.cidade
      );
    }

    // Filtro por Local específico
    if (filtrosAtivos.local !== 'todos-locais') {
      locaisFiltrados = locaisFiltrados.filter(local => 
        local.nome.toLowerCase().replace(/\s/g, '-') === filtrosAtivos.local
      );
    }

    return { locaisFiltrados, cidadesFiltradas };
  }, [filtrosAtivos, locaisDataCompletos, cidadesDataCompletas]);

  // Calcular estatísticas baseadas nos dados filtrados
  const estatisticas = useMemo(() => {
    const totalAgendamentos = dadosFiltrados.locaisFiltrados.reduce((acc, local) => acc + local.agendamentos, 0);
    const receitaTotal = dadosFiltrados.locaisFiltrados.reduce((acc, local) => acc + local.valor, 0);
    const ticketMedio = totalAgendamentos > 0 ? receitaTotal / totalAgendamentos : 0;

    // Proporção mantida dos originais
    const confirmados = Math.round(totalAgendamentos * 0.5);
    const pendentes = Math.round(totalAgendamentos * 0.48);
    const cancelados = Math.max(1, totalAgendamentos - confirmados - pendentes);

    return { totalAgendamentos, receitaTotal, ticketMedio, confirmados, pendentes, cancelados };
  }, [dadosFiltrados]);

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = () => {
    setFiltrosAtivos(filtros);
    
    // Construir mensagem de filtros ativos
    const filtrosAplicados = [];
    if (filtros.periodo !== 'todo-periodo') filtrosAplicados.push('período');
    if (filtros.estado !== 'todos-estados') filtrosAplicados.push('estado');
    if (filtros.cidade !== 'selecione-estado') filtrosAplicados.push('cidade');
    if (filtros.local !== 'todos-locais') filtrosAplicados.push('local');

    toast.success("Filtros Aplicados!", {
      description: filtrosAplicados.length > 0 
        ? `Filtrando por: ${filtrosAplicados.join(', ')}.`
        : "Mostrando todos os dados.",
      duration: 3000,
    });
  };

  const limparFiltros = () => {
    setFiltros({
      periodo: 'todo-periodo',
      estado: 'todos-estados',
      cidade: 'selecione-estado',
      local: 'todos-locais'
    });
    setFiltrosAtivos({
      periodo: 'todo-periodo',
      estado: 'todos-estados',
      cidade: 'selecione-estado',
      local: 'todos-locais'
    });
    
    // Mostrar notificação de sucesso
    toast.success("Filtros Limpos!", {
      description: "Todos os filtros foram resetados para os valores padrão.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Menu
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Dash-Board Regional
          </h1>
        </div>

        {/* Filtros Regionais */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtros Regionais</h2>
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={aplicarFiltros}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={limparFiltros}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Período</label>
              <Select value={filtros.periodo} onValueChange={(value) => handleFiltroChange('periodo', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo-periodo">Todo o período</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="ano">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <Select value={filtros.estado} onValueChange={(value) => handleFiltroChange('estado', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos-estados">Todos os estados</SelectItem>
                  <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                  <SelectItem value="rj">Rio de Janeiro</SelectItem>
                  <SelectItem value="sp">São Paulo</SelectItem>
                  <SelectItem value="am">Amazonas</SelectItem>
                  <SelectItem value="mg">Minas Gerais</SelectItem>
                  <SelectItem value="pr">Paraná</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cidade</label>
              <Select value={filtros.cidade} onValueChange={(value) => handleFiltroChange('cidade', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="selecione-estado">Selecione um estado</SelectItem>
                  <SelectItem value="porto-alegre">Porto Alegre</SelectItem>
                  <SelectItem value="rio-janeiro">Rio de Janeiro</SelectItem>
                  <SelectItem value="sao-paulo">São Paulo</SelectItem>
                  <SelectItem value="manaus">Manaus</SelectItem>
                  <SelectItem value="belo-horizonte">Belo Horizonte</SelectItem>
                  <SelectItem value="londrina">Londrina</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Local */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Local</label>
              <Select value={filtros.local} onValueChange={(value) => handleFiltroChange('local', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos-locais">Todos os locais</SelectItem>
                  <SelectItem value="clinica-abc">Clínica ABC</SelectItem>
                  <SelectItem value="hotel-maderada">Hotel Maderada</SelectItem>
                  <SelectItem value="hotel-miss-alagoas">Hotel Miss Alagoas</SelectItem>
                  <SelectItem value="clinica-lapa">Clínica Lapa</SelectItem>
                  <SelectItem value="clinica-manaus">Clínica Manaus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total de Agendamentos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Total de Agendamentos</h3>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{estatisticas.totalAgendamentos}</div>
          </div>

          {/* Receita Total */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Receita Total</h3>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              R$ {estatisticas.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Ticket Médio</h3>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              R$ {estatisticas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Gráficos - Agendamentos por Local e Cidade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Agendamentos por Local */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📍 Agendamentos por Local
            </h3>
            {dadosFiltrados.locaisFiltrados.length > 0 ? (
              <div className="space-y-3">
                {dadosFiltrados.locaisFiltrados.map((local, index) => {
                  const maxAgendamentos = Math.max(...dadosFiltrados.locaisFiltrados.map(l => l.agendamentos));
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-4 h-4 rounded ${local.cor}`}></div>
                        <span className="text-sm text-gray-700">{local.nome}</span>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${local.cor}`}
                              style={{ width: `${(local.agendamentos / maxAgendamentos) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{local.agendamentos} agendamentos</div>
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {local.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum local encontrado com os filtros aplicados.
              </div>
            )}
          </div>

          {/* Agendamentos por Cidade */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏙️ Agendamentos por Cidade
            </h3>
            {dadosFiltrados.cidadesFiltradas.length > 0 ? (
              <div className="space-y-3">
                {dadosFiltrados.cidadesFiltradas.map((cidade, index) => {
                  const maxAgendamentos = Math.max(...dadosFiltrados.cidadesFiltradas.map(c => c.agendamentos));
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-4 h-4 rounded ${cidade.cor}`}></div>
                        <span className="text-sm text-gray-700">{cidade.nome}</span>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${cidade.cor}`}
                              style={{ width: `${(cidade.agendamentos / maxAgendamentos) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{cidade.agendamentos} agendamentos</div>
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {cidade.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma cidade encontrada com os filtros aplicados.
              </div>
            )}
          </div>
        </div>

        {/* Status dos Agendamentos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Status dos Agendamentos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Confirmados */}
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-700">{estatisticas.confirmados}</div>
              <div className="text-sm text-green-600">Confirmados</div>
            </div>

            {/* Pendentes */}
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-700">{estatisticas.pendentes}</div>
              <div className="text-sm text-yellow-600">Pendentes</div>
            </div>

            {/* Cancelados */}
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-700">{estatisticas.cancelados}</div>
              <div className="text-sm text-red-600">Cancelados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
