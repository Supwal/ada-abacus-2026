'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, DollarSign, TrendingUp, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const CORES_PINK = ['bg-pink-600', 'bg-pink-500', 'bg-pink-400', 'bg-pink-300', 'bg-pink-200', 'bg-pink-100'];
const CORES_PURPLE = ['bg-purple-600', 'bg-purple-500', 'bg-purple-400', 'bg-purple-300', 'bg-purple-200', 'bg-purple-100'];

interface LocalData {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  agendamentos: number;
  valor: number;
}

interface CidadeData {
  nome: string;
  estado: string;
  agendamentos: number;
  valor: number;
}

interface DashboardData {
  totalAgendamentos: number;
  receitaTotal: number;
  ticketMedio: number;
  confirmados: number;
  pendentes: number;
  cancelados: number;
  locaisData: LocalData[];
  cidadesData: CidadeData[];
  estadosData: { nome: string; agendamentos: number; valor: number }[];
  locaisDisponiveis: { id: string; name: string; city: string; state: string }[];
}

export default function DashboardRegionalPage() {
  const [filtros, setFiltros] = useState({
    periodo: 'todo-periodo',
    estado: 'todos',
    local: 'todos',
  });

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const buscarDados = useCallback(async (f = filtros) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.periodo !== 'todo-periodo') params.set('periodo', f.periodo);
      if (f.estado !== 'todos') params.set('estado', f.estado);
      if (f.local !== 'todos') params.set('local', f.local);

      const res = await fetch(`/api/dashboard/regional?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
    } catch (err) {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    buscarDados();
  }, []);

  const aplicarFiltros = () => {
    buscarDados(filtros);
    toast.success('Filtros aplicados!', { duration: 2000 });
  };

  const limparFiltros = () => {
    const limpos = { periodo: 'todo-periodo', estado: 'todos', local: 'todos' };
    setFiltros(limpos);
    buscarDados(limpos);
    toast.success('Filtros limpos!', { duration: 2000 });
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  // Estados únicos dos locais disponíveis
  const estadosDisponiveis = data
    ? [...new Set(data.locaisDisponiveis.map(l => l.state).filter(Boolean))].sort()
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Menu
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Dash-Board Regional</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtros Regionais</h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={aplicarFiltros} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button size="sm" onClick={limparFiltros} className="bg-pink-500 hover:bg-pink-600 text-white">
                Limpar Filtros
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Período</label>
              <Select value={filtros.periodo} onValueChange={v => setFiltros(p => ({ ...p, periodo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo-periodo">Todo o período</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Últimos 7 dias</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="ano">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <Select value={filtros.estado} onValueChange={v => setFiltros(p => ({ ...p, estado: v, local: 'todos' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="todos">Todos os estados</SelectItem>
                  {estadosDisponiveis.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Local */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Local</label>
              <Select value={filtros.local} onValueChange={v => setFiltros(p => ({ ...p, local: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="todos">Todos os locais</SelectItem>
                  {data?.locaisDisponiveis
                    .filter(l => filtros.estado === 'todos' || l.state === filtros.estado)
                    .map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-3 text-gray-600">Carregando dados...</span>
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-gray-500">Nenhum dado encontrado.</div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Total de Agendamentos</h3>
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{data.totalAgendamentos}</div>
                <p className="text-xs text-gray-500 mt-1">{data.locaisData.length} locais com agendamentos</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Receita Total</h3>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600">R$ {fmt(data.receitaTotal)}</div>
                <p className="text-xs text-gray-500 mt-1">Soma de todos os agendamentos</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Ticket Médio</h3>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">R$ {fmt(data.ticketMedio)}</div>
                <p className="text-xs text-gray-500 mt-1">Por agendamento</p>
              </div>
            </div>

            {/* Gráficos por Local e Cidade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Por Local */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Agendamentos por Local</h3>
                {data.locaisData.length > 0 ? (
                  <div className="space-y-3">
                    {data.locaisData.map((local, i) => {
                      const max = data.locaisData[0].agendamentos;
                      const cor = CORES_PINK[Math.min(i, CORES_PINK.length - 1)];
                      return (
                        <div key={local.id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded ${cor}`} />
                              <span className="text-sm text-gray-700 font-medium">{local.nome}</span>
                              {local.cidade && (
                                <span className="text-xs text-gray-400">({local.cidade}{local.estado ? ` - ${local.estado}` : ''})</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-gray-600 mr-2">{local.agendamentos} ag.</span>
                              <span className="text-sm font-semibold text-gray-900">R$ {fmt(local.valor)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${cor}`} style={{ width: `${(local.agendamentos / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">Nenhum agendamento com local registrado.</div>
                )}
              </div>

              {/* Por Cidade */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏙️ Agendamentos por Cidade</h3>
                {data.cidadesData.length > 0 ? (
                  <div className="space-y-3">
                    {data.cidadesData.map((cidade, i) => {
                      const max = data.cidadesData[0].agendamentos;
                      const cor = CORES_PURPLE[Math.min(i, CORES_PURPLE.length - 1)];
                      return (
                        <div key={cidade.nome}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded ${cor}`} />
                              <span className="text-sm text-gray-700 font-medium">{cidade.nome}</span>
                              {cidade.estado && <span className="text-xs text-gray-400">({cidade.estado})</span>}
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-gray-600 mr-2">{cidade.agendamentos} ag.</span>
                              <span className="text-sm font-semibold text-gray-900">R$ {fmt(cidade.valor)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${cor}`} style={{ width: `${(cidade.agendamentos / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">Nenhum agendamento com cidade registrada.</div>
                )}
              </div>
            </div>

            {/* Status dos Agendamentos */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Status dos Agendamentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                  <div className="text-3xl font-bold text-green-700">{data.confirmados}</div>
                  <div className="text-sm text-green-600 mt-1">✅ Confirmados</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100">
                  <div className="text-3xl font-bold text-yellow-700">{data.pendentes}</div>
                  <div className="text-sm text-yellow-600 mt-1">⏳ Pendentes</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
                  <div className="text-3xl font-bold text-red-700">{data.cancelados}</div>
                  <div className="text-sm text-red-600 mt-1">❌ Cancelados</div>
                </div>
              </div>
            </div>

            {/* Por Estado */}
            {data.estadosData.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Agendamentos por Estado</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.estadosData.map((estado, i) => (
                    <div key={estado.nome} className="bg-pink-50 rounded-lg p-3 border border-pink-100 text-center">
                      <div className="text-xl font-bold text-pink-700">{estado.agendamentos}</div>
                      <div className="text-sm font-medium text-gray-700">{estado.nome}</div>
                      <div className="text-xs text-gray-500">R$ {fmt(estado.valor)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
