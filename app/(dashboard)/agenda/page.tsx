'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Sun, 
  CalendarRange, 
  CalendarDays,
  ChevronDown,
  Filter,
  Trash2,
  AlertTriangle,
  Edit,
  Clock,
  MapPin,
  Users,
  DollarSign,
  MessageSquare,
  Plus,
  X as XIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ConsultaAgendaPage() {
  const [filtroAtivo, setFiltroAtivo] = useState<'dia' | 'semana' | 'mes' | 'personalizado'>('dia');
  const [formData, setFormData] = useState({
    dataInicial: '',
    dataFinal: '',
    status: 'todos'
  });
  
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [totalDia, setTotalDia] = useState('R$ 0,00');
  const [quantidadeAgendamentos, setQuantidadeAgendamentos] = useState(0);
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);

  // Estados para edição inline de valor
  const [editandoValorId, setEditandoValorId] = useState<string | null>(null);
  const [valorEditando, setValorEditando] = useState('');
  
  // Estados para controle dos calendários
  const [calendarDataInicialOpen, setCalendarDataInicialOpen] = useState(false);
  const [calendarDataFinalOpen, setCalendarDataFinalOpen] = useState(false);
  
  // Estados para controle do diálogo de exclusão
  const [dialogExclusaoAberto, setDialogExclusaoAberto] = useState(false);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState<any>(null);
  
  // Estados para controle do diálogo de edição de status
  const [dialogEditarStatusAberto, setDialogEditarStatusAberto] = useState(false);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<any>(null);
  const [novoStatus, setNovoStatus] = useState<string>('');
  const [novoValor, setNovoValor] = useState<string>('');
  
  // Estados para consulta rápida de horários ocupados/disponíveis
  const [dialogHorariosAberto, setDialogHorariosAberto] = useState(false);
  const [dataHorarios, setDataHorarios] = useState('');
  const [horariosOcupados, setHorariosOcupados] = useState<Map<string, string>>(new Map());
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  // Estados para disponibilidade
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  const [modalDisponibilidadeAberto, setModalDisponibilidadeAberto] = useState(false);
  const [carregandoDisponibilidades, setCarregandoDisponibilidades] = useState(false);
  const [locais, setLocais] = useState<any[]>([]);
  const [formDisponibilidade, setFormDisponibilidade] = useState({
    type: 'dia',
    date: '',
    startTime: '08:00',
    endTime: '18:00',
    locationId: '',
    hourlyRate: '',
    maxAppointments: '5',
    notes: '',
    notificationChannel: 'whatsapp'
  });

  // Blocos de horário exibidos na consulta rápida (07:00 às 21:00)
  const HORARIOS_CONSULTA = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

  // Busca os agendamentos de um dia e marca quais blocos de horário estão ocupados
  const carregarHorariosOcupados = async (data: string) => {
    if (!data) return;
    setCarregandoHorarios(true);
    try {
      const response = await fetch(`/api/appointments?startDate=${data}&endDate=${data}`);
      if (!response.ok) {
        setHorariosOcupados(new Map());
        return;
      }
      const agendamentosDoDia = await response.json();
      const ocupados = new Map<string, string>();
      for (const ag of agendamentosDoDia) {
        if (!ag.startTime || !ag.endTime) continue;
        const [hi, mi] = ag.startTime.split(':').map(Number);
        const [hf, mf] = ag.endTime.split(':').map(Number);
        const inicio = hi * 60 + mi;
        const fim = hf * 60 + mf;
        const nome = ag.clientName || ag.client?.name || 'Ocupado';
        for (const h of HORARIOS_CONSULTA) {
          const [hh, mm] = h.split(':').map(Number);
          const blocoInicio = hh * 60 + mm;
          const blocoFim = blocoInicio + 60;
          if (blocoInicio < fim && blocoFim > inicio) {
            ocupados.set(h, nome);
          }
        }
      }
      setHorariosOcupados(ocupados);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast.error('Erro ao carregar horários');
    } finally {
      setCarregandoHorarios(false);
    }
  };

  // Abre a consulta rápida já na data filtrada (ou hoje, se nenhuma estiver selecionada)
  const abrirDialogHorarios = () => {
    const hoje = new Date();
    const dataPadrao = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    const data = formData.dataInicial || dataPadrao;
    setDataHorarios(data);
    setDialogHorariosAberto(true);
    carregarHorariosOcupados(data);
  };

  const handleDataHorariosChange = (novaData: string) => {
    setDataHorarios(novaData);
    carregarHorariosOcupados(novaData);
  };

  // Função para carregar locais
  const carregarLocais = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
    }
  };

  // Função para carregar disponibilidades
  const carregarDisponibilidades = async () => {
    try {
      setCarregandoDisponibilidades(true);
      const response = await fetch('/api/availabilities');
      if (response.ok) {
        const data = await response.json();
        setDisponibilidades(data);
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidades:', error);
      toast.error('Erro ao carregar disponibilidades');
    } finally {
      setCarregandoDisponibilidades(false);
    }
  };

  // Função para salvar nova disponibilidade
  const salvarDisponibilidade = async () => {
    try {
      if (!formDisponibilidade.date || !formDisponibilidade.locationId || !formDisponibilidade.hourlyRate) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const response = await fetch('/api/availabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDisponibilidade)
      });

      if (response.ok) {
        const novaDisponibilidade = await response.json();
        setDisponibilidades([...disponibilidades, novaDisponibilidade]);
        setModalDisponibilidadeAberto(false);
        
        // Reset form
        setFormDisponibilidade({
          type: 'dia',
          date: '',
          startTime: '08:00',
          endTime: '18:00',
          locationId: '',
          hourlyRate: '',
          maxAppointments: '5',
          notes: '',
          notificationChannel: 'whatsapp'
        });
        
        toast.success('Disponibilidade salva com sucesso!');
      } else {
        toast.error('Erro ao salvar disponibilidade');
      }
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
      toast.error('Erro ao salvar disponibilidade');
    }
  };

  // Função para deletar disponibilidade
  const deletarDisponibilidade = async (id: string) => {
    try {
      const response = await fetch(`/api/availabilities/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDisponibilidades(disponibilidades.filter(d => d.id !== id));
        toast.success('Disponibilidade removida');
      } else {
        toast.error('Erro ao remover disponibilidade');
      }
    } catch (error) {
      console.error('Erro ao deletar disponibilidade:', error);
      toast.error('Erro ao remover disponibilidade');
    }
  };

  // Função para criar dados de exemplo (DESABILITADA - dados agora vêm apenas de agendamentos reais)
  const criarDadosExemplo = () => {
    // Função desabilitada para evitar recriar dados de teste após exclusões
    // Os agendamentos agora vêm apenas da tela "Agendar"
  };

  // Função para definir o período baseado no filtro selecionado
  const aplicarFiltroPeriodo = (tipo: 'dia' | 'semana' | 'mes') => {
    // Usar data local para evitar problemas com timezone
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataHojeLocal = `${ano}-${mes}-${dia}`;
    
    let dataInicial = '';
    let dataFinal = '';

    switch (tipo) {
      case 'dia':
        dataInicial = dataHojeLocal;
        dataFinal = dataHojeLocal;
        break;
      case 'semana':
        const inicioSemana = startOfWeek(hoje, { weekStartsOn: 0 }); // Domingo
        const fimSemana = endOfWeek(hoje, { weekStartsOn: 0 });
        dataInicial = `${inicioSemana.getFullYear()}-${String(inicioSemana.getMonth() + 1).padStart(2, '0')}-${String(inicioSemana.getDate()).padStart(2, '0')}`;
        dataFinal = `${fimSemana.getFullYear()}-${String(fimSemana.getMonth() + 1).padStart(2, '0')}-${String(fimSemana.getDate()).padStart(2, '0')}`;
        break;
      case 'mes':
        const inicioMes = startOfMonth(hoje);
        const fimMes = endOfMonth(hoje);
        dataInicial = `${inicioMes.getFullYear()}-${String(inicioMes.getMonth() + 1).padStart(2, '0')}-${String(inicioMes.getDate()).padStart(2, '0')}`;
        dataFinal = `${fimMes.getFullYear()}-${String(fimMes.getMonth() + 1).padStart(2, '0')}-${String(fimMes.getDate()).padStart(2, '0')}`;
        break;
    }

    setFiltroAtivo(tipo);
    setFormData(prev => ({
      ...prev,
      dataInicial,
      dataFinal
    }));
  };

  // Inicializar com o filtro do dia e carregar locais e disponibilidades
  useEffect(() => {
    criarDadosExemplo();
    aplicarFiltroPeriodo('dia');
    carregarLocais();
    carregarDisponibilidades();
  }, []);

  const buscarAgendamentos = async (dadosFiltro: typeof formData) => {
    // Filtro por período
    if (!dadosFiltro.dataInicial || !dadosFiltro.dataFinal) {
      setAgendamentos([]);
      setTotalDia('R$ 0,00');
      setQuantidadeAgendamentos(0);
      return;
    }

    try {
      // Buscar agendamentos da API
      const params = new URLSearchParams({
        startDate: dadosFiltro.dataInicial,
        endDate: dadosFiltro.dataFinal,
        status: dadosFiltro.status
      });
      
      const response = await fetch(`/api/appointments?${params}`);
      
      if (!response.ok) {
        console.error('Erro ao buscar agendamentos:', response.status);
        setAgendamentos([]);
        setTotalDia('R$ 0,00');
        setQuantidadeAgendamentos(0);
        return;
      }
      
      const agendamentosAPI = await response.json();
      
      // Transformar dados da API para o formato usado na interface
      const agendamentosFormatados = agendamentosAPI.map((a: any) => {
        // Formatar a data para YYYY-MM-DD (usar UTC para evitar problema de timezone)
        const dataObj = new Date(a.date);
        const dataFormatada = `${dataObj.getUTCFullYear()}-${String(dataObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dataObj.getUTCDate()).padStart(2, '0')}`;
        
        // Formatar valor
        const valorFormatado = a.value 
          ? a.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : 'R$ 0,00';
        
        // Mapear status do banco para exibição
        let statusExibicao = a.status || 'pendente';
        if (statusExibicao === 'scheduled') statusExibicao = 'pendente';
        
        const nomeCliente = a.clientName || a.client?.name || 'Cliente não informado';
        return {
          id: a.id,
          codigo: nomeCliente,
          nomeCliente: nomeCliente,
          data: dataFormatada,
          horario: a.startTime,
          horarioFim: a.endTime,
          cliente: nomeCliente,
          servico: a.serviceName || a.service?.name || 'Serviço não informado',
          local: a.locationName || a.location?.name || 'Local não informado',
          valor: valorFormatado,
          status: statusExibicao,
          observacoes: a.notes || ''
        };
      });
      
      // Ordenar por data e horário (ordem crescente)
      agendamentosFormatados.sort((a: any, b: any) => {
        if (a.data === b.data) {
          return a.horario.localeCompare(b.horario);
        }
        return a.data.localeCompare(b.data);
      });
      
      setAgendamentos(agendamentosFormatados);
      setQuantidadeAgendamentos(agendamentosFormatados.length);
      
      // Calcular total do período
      const total = agendamentosFormatados.reduce((acc: number, agendamento: any) => {
        if (agendamento.valor) {
          const valorNumerico = parseFloat(
            agendamento.valor.replace('R$', '').replace('.', '').replace(',', '.').trim()
          );
          if (!isNaN(valorNumerico)) {
            return acc + valorNumerico;
          }
        }
        return acc;
      }, 0);
      
      setTotalDia(total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }));
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setAgendamentos([]);
      setTotalDia('R$ 0,00');
      setQuantidadeAgendamentos(0);
    }
  };

  const abrirDialogExclusao = (agendamento: any) => {
    setAgendamentoParaExcluir(agendamento);
    setDialogExclusaoAberto(true);
  };

  const confirmarExclusao = async () => {
    if (!agendamentoParaExcluir) return;

    try {
      const response = await fetch(`/api/appointments/${agendamentoParaExcluir.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error("Erro ao excluir agendamento");
        return;
      }

      // Fechar o diálogo
      setDialogExclusaoAberto(false);
      setAgendamentoParaExcluir(null);
      
      // Recarregar agendamentos
      buscarAgendamentos(formData);
      
      toast.success("Agendamento excluído com sucesso!", {
        duration: 2000,
      });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error("Erro ao excluir agendamento");
    }
  };
  
  const abrirDialogEditarStatus = (agendamento: any) => {
    setAgendamentoParaEditar(agendamento);
    setNovoStatus(agendamento.status || 'confirmado');
    // Extrair valor numérico do formato "R$ 200,00"
    const valorBruto = agendamento.valor || '';
    const valorNumerico = valorBruto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    setNovoValor(isNaN(parseFloat(valorNumerico)) ? '' : valorNumerico);
    setDialogEditarStatusAberto(true);
  };

  const confirmarEdicaoStatus = async () => {
    if (!agendamentoParaEditar) return;

    try {
      const body: any = { status: novoStatus };
      if (novoValor !== '') {
        const valorLimpo = novoValor.replace(',', '.');
        if (!isNaN(parseFloat(valorLimpo))) body.value = valorLimpo;
      }

      const response = await fetch(`/api/appointments/${agendamentoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        toast.error("Erro ao atualizar agendamento");
        return;
      }

      window.dispatchEvent(new Event('agendamentoSalvo'));

      setDialogEditarStatusAberto(false);
      setAgendamentoParaEditar(null);
      setNovoStatus('');
      setNovoValor('');

      buscarAgendamentos(formData);

      toast.success("Agendamento atualizado!", {
        description: `Status: ${novoStatus}${novoValor ? ` • Valor: R$ ${parseFloat(novoValor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error("Erro ao atualizar agendamento");
    }
  };

  const abrirEdicaoValor = (agendamento: any) => {
    const valorBruto = agendamento.valor || '';
    const valorNumerico = valorBruto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    setValorEditando(isNaN(parseFloat(valorNumerico)) ? '' : String(parseFloat(valorNumerico)));
    setEditandoValorId(agendamento.id);
  };

  const salvarValorInline = async (agendamento: any) => {
    const valorLimpo = valorEditando.replace(',', '.');
    if (valorLimpo === '' || isNaN(parseFloat(valorLimpo))) {
      setEditandoValorId(null);
      return;
    }
    try {
      const response = await fetch(`/api/appointments/${agendamento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: valorLimpo }),
      });
      if (!response.ok) {
        toast.error('Erro ao salvar valor');
        return;
      }
      setEditandoValorId(null);
      buscarAgendamentos(formData);
      toast.success(`Valor atualizado para R$ ${parseFloat(valorLimpo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, { duration: 2000 });
    } catch {
      toast.error('Erro ao salvar valor');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const novoFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(novoFormData);
    
    // Se mudou as datas manualmente, considerar como filtro personalizado
    if (field === 'dataInicial' || field === 'dataFinal') {
      setFiltroAtivo('personalizado');
    }
    
    // Buscar agendamentos imediatamente
    buscarAgendamentos(novoFormData);
  };

  // Efeito para buscar quando formData mudar
  useEffect(() => {
    if (formData.dataInicial && formData.dataFinal) {
      buscarAgendamentos(formData);
    }
  }, [formData.dataInicial, formData.dataFinal, formData.status]);

  const formatarDataExibicao = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Função auxiliar para criar Date local a partir de string yyyy-mm-dd
  const criarDataLocal = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  };

  const obterTextoPeriodo = () => {
    if (!formData.dataInicial || !formData.dataFinal) return 'Selecione um período';
    
    switch (filtroAtivo) {
      case 'dia':
        return `Hoje - ${format(criarDataLocal(formData.dataInicial), "dd/MM/yyyy")}`;
      case 'semana':
        return `Semana Atual - ${format(criarDataLocal(formData.dataInicial), "dd/MM")} a ${format(criarDataLocal(formData.dataFinal), "dd/MM")}`;
      case 'mes':
        return `Mês Atual - ${format(criarDataLocal(formData.dataInicial), "MMMM/yyyy", { locale: ptBR })}`;
      case 'personalizado':
        return `Personalizado - ${format(criarDataLocal(formData.dataInicial), "dd/MM")} a ${format(criarDataLocal(formData.dataFinal), "dd/MM")}`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Voltar ao Menu</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            📋 Consulta de Agendamentos
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie seus agendamentos por período
          </p>
        </div>

        {/* Botões Definir Disponibilidade e Ver Horários */}
        <div className="mb-6 flex justify-center gap-3 flex-wrap">
          <Button
            onClick={() => setModalDisponibilidadeAberto(true)}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            📅 Definir Disponibilidade
          </Button>
          <Button
            onClick={abrirDialogHorarios}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Clock className="h-5 w-5" />
            🕐 Ver Horários do Dia
          </Button>
        </div>

        {/* Cartões de Disponibilidades */}
        {!carregandoDisponibilidades && disponibilidades.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disponibilidades.map((disp) => (
              <div
                key={disp.id}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-4 border-2 border-indigo-200 hover:shadow-xl transition-all duration-300 relative"
              >
                {/* Botão Fechar */}
                <button
                  onClick={() => deletarDisponibilidade(disp.id)}
                  className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                  title="Remover disponibilidade"
                >
                  <XIcon className="h-4 w-4" />
                </button>

                {/* Tipo e Data */}
                <div className="mb-3">
                  <span className="inline-block bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2">
                    {disp.type === 'dia' ? '📅 Dia' : disp.type === 'semana' ? '📆 Semana' : '⏰ Meio Período'}
                  </span>
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(disp.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Horário */}
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">{disp.startTime} - {disp.endTime}</span>
                </div>

                {/* Local */}
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{disp.location?.name || 'Local não informado'}</span>
                </div>

                {/* Valor/Hora */}
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">R$ {disp.hourlyRate.toFixed(2)}/h</span>
                </div>

                {/* Máx Agendamentos */}
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{disp.currentAppointments}/{disp.maxAppointments}</span>
                </div>

                {/* Canal de Aviso */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">
                    {disp.notificationChannel === 'whatsapp' ? '💬 WhatsApp' : '📱 Telegram'}
                  </span>
                </div>

                {/* Observações (se houver) */}
                {disp.notes && (
                  <div className="mt-3 pt-3 border-t border-indigo-200">
                    <p className="text-xs text-gray-600 italic">{disp.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Filtros Rápidos - 3 Ícones Compactos */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-4 md:p-6 mb-6 border-2 border-pink-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
            <Filter className="h-5 w-5 text-pink-500" />
            Filtrar por Período
          </h2>
          
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
            {/* Botão Dia */}
            <button
              onClick={() => aplicarFiltroPeriodo('dia')}
              className={cn(
                "flex flex-col items-center justify-center p-2 md:p-4 rounded-xl transition-all duration-300 transform hover:scale-105",
                filtroAtivo === 'dia'
                  ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-xl scale-105 ring-4 ring-pink-300"
                  : "bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 hover:from-pink-100 hover:to-pink-200 shadow-lg"
              )}
            >
              <Sun className={cn(
                "h-6 w-6 md:h-8 md:w-8 mb-1 md:mb-2",
                filtroAtivo === 'dia' ? "animate-pulse" : ""
              )} />
              <span className="text-xs md:text-sm font-bold">Agenda do Dia</span>
            </button>

            {/* Botão Semana */}
            <button
              onClick={() => aplicarFiltroPeriodo('semana')}
              className={cn(
                "flex flex-col items-center justify-center p-2 md:p-4 rounded-xl transition-all duration-300 transform hover:scale-105",
                filtroAtivo === 'semana'
                  ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl scale-105 ring-4 ring-purple-300"
                  : "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 shadow-lg"
              )}
            >
              <CalendarRange className={cn(
                "h-6 w-6 md:h-8 md:w-8 mb-1 md:mb-2",
                filtroAtivo === 'semana' ? "animate-pulse" : ""
              )} />
              <span className="text-xs md:text-sm font-bold">Agenda da Semana</span>
            </button>

            {/* Botão Mês */}
            <button
              onClick={() => aplicarFiltroPeriodo('mes')}
              className={cn(
                "flex flex-col items-center justify-center p-2 md:p-4 rounded-xl transition-all duration-300 transform hover:scale-105",
                filtroAtivo === 'mes'
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl scale-105 ring-4 ring-blue-300"
                  : "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 shadow-lg"
              )}
            >
              <CalendarDays className={cn(
                "h-6 w-6 md:h-8 md:w-8 mb-1 md:mb-2",
                filtroAtivo === 'mes' ? "animate-pulse" : ""
              )} />
              <span className="text-xs md:text-sm font-bold">Agenda do Mês</span>
            </button>
          </div>

          {/* Período Selecionado */}
          <div className={cn(
            "p-3 rounded-xl text-center font-semibold transition-all duration-300 text-sm md:text-base",
            filtroAtivo === 'dia' ? "bg-pink-100 text-pink-800 border-2 border-pink-400 shadow-lg" :
            filtroAtivo === 'semana' ? "bg-purple-100 text-purple-800 border-2 border-purple-400 shadow-lg" :
            filtroAtivo === 'mes' ? "bg-blue-100 text-blue-800 border-2 border-blue-400 shadow-lg" :
            "bg-gray-100 text-gray-800 border-2 border-gray-400 shadow-lg"
          )}>
            <div className="flex items-center justify-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{obterTextoPeriodo()}</span>
            </div>
          </div>

          {/* Botão para mostrar filtros avançados */}
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
              className="gap-2 border-2 border-pink-300 text-pink-700 hover:bg-pink-50 font-semibold"
            >
              <Filter className="h-4 w-4" />
              Filtros Avançados
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-300",
                mostrarFiltrosAvancados ? "rotate-180" : ""
              )} />
            </Button>
          </div>

          {/* Filtros Avançados (expansível) */}
          {mostrarFiltrosAvancados && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-6 animate-slide-down">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Período Personalizado
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Inicial */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    📅 Data Inicial
                  </Label>
                  <Popover open={calendarDataInicialOpen} onOpenChange={setCalendarDataInicialOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal shadow-sm",
                          !formData.dataInicial && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataInicial ? (
                          format(criarDataLocal(formData.dataInicial), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione a data inicial</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dataInicial ? criarDataLocal(formData.dataInicial) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const ano = date.getFullYear();
                            const mes = String(date.getMonth() + 1).padStart(2, '0');
                            const dia = String(date.getDate()).padStart(2, '0');
                            handleInputChange('dataInicial', `${ano}-${mes}-${dia}`);
                          }
                          setCalendarDataInicialOpen(false);
                        }}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Data Final */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    📅 Data Final
                  </Label>
                  <Popover open={calendarDataFinalOpen} onOpenChange={setCalendarDataFinalOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal shadow-sm",
                          !formData.dataFinal && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataFinal ? (
                          format(criarDataLocal(formData.dataFinal), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione a data final</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dataFinal ? criarDataLocal(formData.dataFinal) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const ano = date.getFullYear();
                            const mes = String(date.getMonth() + 1).padStart(2, '0');
                            const dia = String(date.getDate()).padStart(2, '0');
                            handleInputChange('dataFinal', `${ano}-${mes}-${dia}`);
                          }
                          setCalendarDataFinalOpen(false);
                        }}
                        disabled={(date) => {
                          const dataInicial = formData.dataInicial ? criarDataLocal(formData.dataInicial) : null;
                          return date < new Date("1900-01-01") ||
                                 (dataInicial ? date < dataInicial : false);
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Filtro de Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  🏷️ Filtrar por Status
                </Label>
                <Select onValueChange={(value) => handleInputChange('status', value)} value={formData.status}>
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">⏳ Pendente</SelectItem>
                    <SelectItem value="confirmado">✅ Confirmado</SelectItem>
                    <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Card de Resumo */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 md:p-8 mb-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total em Valor */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-3xl">💰</span>
                <span className="text-sm font-medium opacity-90">Total do Período</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold">
                {totalDia}
              </div>
            </div>

            {/* Quantidade */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl">📊</span>
                <span className="text-sm font-medium opacity-90">Quantidade</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold">
                {quantidadeAgendamentos}
              </div>
              <div className="text-sm opacity-80 mt-1">
                agendamento{quantidadeAgendamentos !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Status Ativo */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                <span className="text-3xl">🎯</span>
                <span className="text-sm font-medium opacity-90">Filtro Ativo</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold capitalize">
                {filtroAtivo === 'personalizado' ? 'Customizado' : filtroAtivo}
              </div>
              <div className="text-sm opacity-80 mt-1">
                {formData.status !== 'todos' ? `Status: ${formData.status}` : 'Todos os status'}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 md:h-6 md:w-6 text-pink-500" />
            Agendamentos Encontrados
          </h2>

          {agendamentos.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <CalendarIcon className="h-16 w-16 md:h-20 md:w-20 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-400 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-sm text-gray-500">
                Não há agendamentos para o período e filtros selecionados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {agendamentos.map((agendamento, index) => (
                <div 
                  key={agendamento.codigo || index} 
                  className="border-2 border-gray-100 rounded-xl p-3 md:p-4 hover:shadow-lg hover:border-pink-200 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 relative"
                >
                  {/* Botão de Excluir */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => abrirDialogExclusao(agendamento)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Nome e Código */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-pink-100 text-pink-700 rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm">
                      {agendamento.nomeCliente?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 pr-8">
                      <h3 className="font-bold text-base text-gray-900 truncate">
                        {agendamento.nomeCliente}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {agendamento.codigo}
                      </span>
                    </div>
                  </div>
                  
                  {/* Local em Destaque */}
                  <div className="mb-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200">
                    <div className="flex items-center gap-2 text-purple-700">
                      <span className="text-base">🏥</span>
                      <span className="font-semibold text-sm truncate">{agendamento.local}</span>
                    </div>
                  </div>

                  {/* Status Clicável em Destaque */}
                  <button
                    onClick={() => abrirDialogEditarStatus(agendamento)}
                    className={cn(
                      "w-full mb-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl flex items-center justify-between",
                      agendamento.status === 'confirmado' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' :
                      agendamento.status === 'pendente' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600' :
                      agendamento.status === 'cancelado' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' :
                      'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                    )}
                    title="Clique para alterar o status"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-normal opacity-90">Status:</span>
                      {agendamento.status === 'confirmado' ? '✅' :
                       agendamento.status === 'pendente' ? '⏳' :
                       agendamento.status === 'cancelado' ? '❌' :
                       '❓'}
                      <span className="uppercase tracking-wide">
                        {agendamento.status === 'confirmado' ? 'Confirmado' :
                         agendamento.status === 'pendente' ? 'Pendente' :
                         agendamento.status === 'cancelado' ? 'Cancelado' :
                         'Pendente'}
                      </span>
                    </span>
                    <Edit className="h-4 w-4 animate-pulse" />
                  </button>
                  
                  {/* Informações */}
                  <div className="space-y-1.5 text-xs md:text-sm mb-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarIcon className="h-3.5 w-3.5 text-pink-500" />
                      <span className="font-medium">{formatarDataExibicao(agendamento.data)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-pink-500">⏰</span>
                      <span className="font-medium">{agendamento.horario}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-pink-500">⏱️</span>
                      <span>{agendamento.periodo}</span>
                    </div>
                  </div>

                  {/* Valor em Destaque - editável inline */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-3 py-2 border-2 border-green-300 flex items-center gap-2">
                    <span className="text-xs font-medium text-green-700 shrink-0">💰 Valor:</span>
                    {editandoValorId === agendamento.id ? (
                      <>
                        <span className="text-green-700 font-semibold text-sm shrink-0">R$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          autoFocus
                          value={valorEditando}
                          onChange={(e) => {
                            const v = e.target.value.replace(',', '.');
                            if (/^\d*\.?\d{0,2}$/.test(v) || v === '') setValorEditando(v);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') salvarValorInline(agendamento);
                            if (e.key === 'Escape') setEditandoValorId(null);
                          }}
                          className="flex-1 min-w-0 bg-white border-2 border-green-400 rounded-lg px-2 py-1 text-base font-bold text-green-800 focus:outline-none focus:border-green-600"
                          placeholder="0.00"
                        />
                        <button
                          onClick={() => salvarValorInline(agendamento)}
                          className="shrink-0 bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
                          title="Salvar valor"
                        >
                          ▶
                        </button>
                        <button
                          onClick={() => setEditandoValorId(null)}
                          className="shrink-0 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-xs"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => abrirEdicaoValor(agendamento)}
                        className="flex-1 flex items-center justify-between group"
                        title="Toque para editar o valor"
                      >
                        <span className="text-lg md:text-xl font-bold text-green-700">
                          {agendamento.valor || 'R$ 0,00'}
                        </span>
                        <span className="bg-green-500 hover:bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow ml-2 opacity-80 group-hover:opacity-100">
                          ✏️
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={dialogExclusaoAberto} onOpenChange={setDialogExclusaoAberto}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Confirmar Exclusão
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-700 pt-2">
              {agendamentoParaExcluir && (
                <div className="space-y-3">
                  <p className="font-medium">
                    Deseja realmente excluir o agendamento de:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 border-2 border-gray-200">
                    <p className="font-bold text-gray-900 text-lg">
                      👤 {agendamentoParaExcluir.nomeCliente}
                    </p>
                    <p className="text-sm text-gray-600">
                      📅 {agendamentoParaExcluir.data ? formatarDataExibicao(agendamentoParaExcluir.data) : ''} às {agendamentoParaExcluir.horario}
                    </p>
                    <p className="text-sm text-gray-600">
                      🆔 Código: {agendamentoParaExcluir.codigo}
                    </p>
                  </div>
                  <p className="text-red-600 font-medium text-sm">
                    ⚠️ Esta ação não poderá ser desfeita!
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300"
            >
              ❌ Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg"
            >
              🗑️ Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Edição de Status */}
      <Dialog open={dialogEditarStatusAberto} onOpenChange={(open) => { if (!open) { setNovoValor(''); setNovoStatus(''); setAgendamentoParaEditar(null); } setDialogEditarStatusAberto(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-3 rounded-full">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Alterar Status do Agendamento
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700 pt-2">
              {agendamentoParaEditar && (
                <div className="space-y-4">
                  <p className="font-medium">
                    Alterar o status do agendamento:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 border-2 border-gray-200">
                    <p className="font-bold text-gray-900 text-lg">
                      👤 {agendamentoParaEditar.nomeCliente}
                    </p>
                    <p className="text-sm text-gray-600">
                      📅 {agendamentoParaEditar.data ? formatarDataExibicao(agendamentoParaEditar.data) : ''} às {agendamentoParaEditar.horario}
                    </p>
                    <p className="text-sm text-gray-600">
                      🆔 Código: {agendamentoParaEditar.codigo}
                    </p>
                  </div>
                  
                  {/* Seleção de Novo Status */}
                  <div className="space-y-2">
                    <Label htmlFor="novoStatus" className="text-sm font-medium text-gray-700">
                      🏷️ Novo Status
                    </Label>
                    <Select
                      value={novoStatus}
                      onValueChange={(value) => setNovoStatus(value)}
                    >
                      <SelectTrigger className="shadow-sm">
                        <SelectValue placeholder="Selecione o novo status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente" className="text-orange-600 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            ⏳ Pendente
                          </div>
                        </SelectItem>
                        <SelectItem value="confirmado" className="text-green-600 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            ✅ Confirmado
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelado" className="text-red-600 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            ❌ Cancelado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Campo de Valor - fora do DialogDescription para funcionar no mobile */}
          <div className="px-1 pb-2 space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              💰 Valor do Atendimento (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm select-none">R$</span>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={novoValor}
                onChange={(e) => {
                  const v = e.target.value.replace(',', '.');
                  if (/^\d*\.?\d{0,2}$/.test(v) || v === '') setNovoValor(v);
                }}
                className="pl-10 shadow-sm text-lg font-semibold border-2 border-green-300 focus:border-green-500"
              />
            </div>
            <p className="text-xs text-gray-400">Deixe em branco para manter o valor atual</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogEditarStatusAberto(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300"
            >
              ❌ Cancelar
            </Button>
            <Button
              onClick={confirmarEdicaoStatus}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg"
            >
              💾 Salvar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Consulta Rápida — horários ocupados e disponíveis do dia */}
      <Dialog open={dialogHorariosAberto} onOpenChange={setDialogHorariosAberto}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-teal-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                🕐 Horários do Dia
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700 pt-2">
              Veja rapidamente quais horários já estão ocupados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">📅 Data</Label>
              <Input
                type="date"
                value={dataHorarios}
                onChange={(e) => handleDataHorariosChange(e.target.value)}
                className="shadow-sm"
              />
            </div>

            {carregandoHorarios ? (
              <p className="text-sm text-gray-500 text-center py-6">Carregando...</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {HORARIOS_CONSULTA.map((h) => {
                  const ocupadoPor = horariosOcupados.get(h);
                  return (
                    <div
                      key={h}
                      className={cn(
                        "rounded-lg px-2 py-2 text-center border-2",
                        ocupadoPor
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-green-50 border-green-300 text-green-700"
                      )}
                      title={ocupadoPor || 'Disponível'}
                    >
                      <div className="text-xs md:text-sm font-bold">{h}</div>
                      <div className="text-[10px] md:text-xs font-medium truncate">
                        {ocupadoPor ? `🔴 ${ocupadoPor}` : '🟢 Livre'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogHorariosAberto(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Definir Disponibilidade */}
      <Dialog open={modalDisponibilidadeAberto} onOpenChange={setModalDisponibilidadeAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                📅 Definir Disponibilidade
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700 pt-2">
              Configure seus horários, locais e valores para agendamentos
            </DialogDescription>
          </DialogHeader>

          {/* Formulário de Disponibilidade */}
          <div className="space-y-6 py-4">
            {/* Tipo de Disponibilidade */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                📋 Tipo de Disponibilidade
              </Label>
              <Select
                value={formDisponibilidade.type}
                onValueChange={(value) => setFormDisponibilidade({...formDisponibilidade, type: value})}
              >
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">📅 Dia</SelectItem>
                  <SelectItem value="semana">📆 Semana</SelectItem>
                  <SelectItem value="meio_periodo">⏰ Meio Período</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                📌 Data
              </Label>
              <Input
                type="date"
                value={formDisponibilidade.date}
                onChange={(e) => setFormDisponibilidade({...formDisponibilidade, date: e.target.value})}
                className="shadow-sm"
              />
            </div>

            {/* Horário Início e Fim */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  🕐 Horário de Início
                </Label>
                <Input
                  type="time"
                  value={formDisponibilidade.startTime}
                  onChange={(e) => setFormDisponibilidade({...formDisponibilidade, startTime: e.target.value})}
                  className="shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  🕐 Horário de Término
                </Label>
                <Input
                  type="time"
                  value={formDisponibilidade.endTime}
                  onChange={(e) => setFormDisponibilidade({...formDisponibilidade, endTime: e.target.value})}
                  className="shadow-sm"
                />
              </div>
            </div>

            {/* Local */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                🏥 Local de Atendimento
              </Label>
              <Select
                value={formDisponibilidade.locationId}
                onValueChange={(value) => setFormDisponibilidade({...formDisponibilidade, locationId: value})}
              >
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Selecione um local" />
                </SelectTrigger>
                <SelectContent>
                  {locais.map((local) => (
                    <SelectItem key={local.id} value={local.id}>
                      {local.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valor por Hora */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                💰 Valor por Hora (R$)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 100.00"
                value={formDisponibilidade.hourlyRate}
                onChange={(e) => setFormDisponibilidade({...formDisponibilidade, hourlyRate: e.target.value})}
                className="shadow-sm"
              />
            </div>

            {/* Máximo de Agendamentos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                👥 Máximo de Agendamentos
              </Label>
              <Input
                type="number"
                min="1"
                value={formDisponibilidade.maxAppointments}
                onChange={(e) => setFormDisponibilidade({...formDisponibilidade, maxAppointments: e.target.value})}
                className="shadow-sm"
              />
            </div>

            {/* Canal de Aviso */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                📱 Canal de Aviso
              </Label>
              <Select
                value={formDisponibilidade.notificationChannel}
                onValueChange={(value) => setFormDisponibilidade({...formDisponibilidade, notificationChannel: value})}
              >
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="telegram">📱 Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                📝 Observações (Opcional)
              </Label>
              <Textarea
                placeholder="Ex: Apenas pacientes regulares, agendamento mínimo de 2 horas..."
                value={formDisponibilidade.notes}
                onChange={(e) => setFormDisponibilidade({...formDisponibilidade, notes: e.target.value})}
                className="shadow-sm min-h-[80px]"
              />
            </div>
          </div>

          {/* Botões */}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setModalDisponibilidadeAberto(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300"
            >
              ❌ Cancelar
            </Button>
            <Button
              onClick={salvarDisponibilidade}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
            >
              💾 Salvar Disponibilidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}