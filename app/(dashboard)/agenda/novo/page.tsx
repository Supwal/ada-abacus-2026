'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VoiceRequestButton } from "@/components/voice-request-button";

// Tipos de pagamento padrão
const tiposPagamentoDefault = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_debito', label: 'Cartão Débito' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
  { value: 'pix', label: 'PIX' },
];

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    codigo: '',
    nomeCliente: '',
    celular: '',
    data: '',
    horario: '',
    periodo: '60',
    local: '',
    status: 'pendente',
    valor: 'R$ 0,00',
    tipoPagamento: ''
  });

  // Estados para tipos de pagamento
  const [tiposPagamento, setTiposPagamento] = useState(tiposPagamentoDefault);
  const [dialogTipoPagamentoAberto, setDialogTipoPagamentoAberto] = useState(false);
  const [novoTipoPagamento, setNovoTipoPagamento] = useState('');

  // Formatar celular no padrão brasileiro (XX) XXXXX-XXXX
  const formatarCelular = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
    }
  };

  const [locations, setLocations] = useState<any[]>([]);
  const [conflito, setConflito] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Função para obter a chave do localStorage baseada na data atual
  const getStorageKeyDia = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `ada_form_prefs_${ano}-${mes}-${dia}`;
  };

  // Função para salvar preferências do dia no localStorage
  const salvarPreferenciasDia = (campo: string, valor: string) => {
    const chave = getStorageKeyDia();
    const prefsExistentes = JSON.parse(localStorage.getItem(chave) || '{}');
    prefsExistentes[campo] = valor;
    localStorage.setItem(chave, JSON.stringify(prefsExistentes));
    
    // Limpar preferências de dias anteriores
    limparPreferenciasAntigas();
  };

  // Função para limpar preferências de dias anteriores
  const limparPreferenciasAntigas = () => {
    const chaveAtual = getStorageKeyDia();
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('ada_form_prefs_') && key !== chaveAtual) {
        localStorage.removeItem(key);
      }
    });
  };

  // Função para carregar preferências do dia
  const carregarPreferenciasDia = () => {
    const chave = getStorageKeyDia();
    return JSON.parse(localStorage.getItem(chave) || '{}');
  };

  // Buscar locais
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (error) {
        console.error('Erro ao buscar locais:', error);
      }
    };
    fetchLocations();
  }, []);

  // Carregar tipos de pagamento personalizados do localStorage
  useEffect(() => {
    const tiposPersonalizados = JSON.parse(localStorage.getItem('tiposPagamentoPersonalizados') || '[]');
    if (tiposPersonalizados.length > 0) {
      const tiposCompletos = [...tiposPagamentoDefault, ...tiposPersonalizados.map((tipo: string) => ({
        value: tipo.toLowerCase().replace(/\s+/g, '_'),
        label: tipo
      }))];
      setTiposPagamento(tiposCompletos);
    }
  }, []);

  // Função para adicionar novo tipo de pagamento
  const handleAdicionarTipoPagamento = () => {
    if (novoTipoPagamento.trim() === '') {
      toast.error('Por favor, digite o nome do tipo de pagamento.');
      return;
    }

    // Verificar se o tipo já existe
    const tipoExiste = tiposPagamento.some(tipo => 
      tipo.label.toLowerCase() === novoTipoPagamento.trim().toLowerCase()
    );
    
    if (tipoExiste) {
      toast.error('Este tipo de pagamento já existe!');
      return;
    }

    // Salvar no localStorage
    const tiposPersonalizados = JSON.parse(localStorage.getItem('tiposPagamentoPersonalizados') || '[]');
    tiposPersonalizados.push(novoTipoPagamento.trim());
    localStorage.setItem('tiposPagamentoPersonalizados', JSON.stringify(tiposPersonalizados));

    // Adicionar à lista
    const novoTipoObj = {
      value: novoTipoPagamento.trim().toLowerCase().replace(/\s+/g, '_'),
      label: novoTipoPagamento.trim()
    };
    setTiposPagamento([...tiposPagamento, novoTipoObj]);
    
    // Selecionar o novo tipo automaticamente
    handleInputChange('tipoPagamento', novoTipoObj.value);
    
    // Fechar o dialog e limpar o campo
    setNovoTipoPagamento('');
    setDialogTipoPagamentoAberto(false);
    toast.success('Tipo de pagamento cadastrado com sucesso!');
  };

  // Chave do contador local por data
  const getContadorKey = (data: string) => `ada_contador_${data}`;

  // Ler contador salvo no localStorage para a data
  const lerContadorLocal = (data: string): number => {
    try {
      return parseInt(localStorage.getItem(getContadorKey(data)) || '0');
    } catch { return 0; }
  };

  // Salvar contador no localStorage
  const salvarContadorLocal = (data: string, numero: number) => {
    try {
      localStorage.setItem(getContadorKey(data), String(numero));
      // Limpar contadores de outros dias (manter apenas últimos 7 dias)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ada_contador_') && key !== getContadorKey(data)) {
          const dataKey = key.replace('ada_contador_', '');
          const diff = new Date(data).getTime() - new Date(dataKey).getTime();
          if (diff > 7 * 24 * 60 * 60 * 1000) localStorage.removeItem(key);
        }
      });
    } catch {}
  };

  // PREVIEW: calcula o próximo código SEM salvar no localStorage
  // (salvar só acontece após salvar o agendamento com sucesso)
  const gerarCodigoSequencial = async (dataAgendamento: string) => {
    if (!dataAgendamento) return 'Cli001';
    try {
      const contadorLocal = lerContadorLocal(dataAgendamento);
      let maiorDaAPI = 0;
      try {
        const response = await fetch(`/api/appointments?startDate=${dataAgendamento}&endDate=${dataAgendamento}`);
        if (response.ok) {
          const agendamentos = await response.json();
          const nums = agendamentos
            .map((ag: any) => {
              const nome = ag.clientName || ag.client?.name || '';
              const match = nome.match(/Cli(\d+)/i);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter((n: number) => n > 0);
          if (nums.length > 0) maiorDaAPI = Math.max(...nums);
        }
      } catch {}
      const proximoNumero = Math.max(contadorLocal, maiorDaAPI) + 1;
      // NÃO salva aqui — salva apenas ao confirmar o agendamento
      return `Cli${proximoNumero.toString().padStart(3, '0')}`;
    } catch {
      return 'Cli001';
    }
  };

  // Inicializar dados automáticos e carregar preferências do dia
  useEffect(() => {
    const obterDataAtual = () => {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    };

    const obterHorarioAtual = () => {
      const agora = new Date();
      return agora.toTimeString().slice(0, 5);
    };

    const inicializar = async () => {
      const dataAtual = obterDataAtual();
      const codigoGerado = await gerarCodigoSequencial(dataAtual);
      
      // Carregar preferências salvas do dia (periodo, local, valor)
      const preferencias = carregarPreferenciasDia();
      
      setFormData(prev => ({
        ...prev,
        codigo: codigoGerado,
        nomeCliente: codigoGerado,
        data: dataAtual,
        horario: obterHorarioAtual(),
        periodo: preferencias.periodo || prev.periodo,
        local: preferencias.local || prev.local,
        valor: preferencias.valor || prev.valor,
      }));
      // Marca que a data foi inicializada — agora o useEffect de data pode agir
      setDataInicializada(true);
    };

    inicializar();
  }, []);

  // Verificar conflito de horário
  const verificarConflitoHorario = async (data: string, horario: string, periodoMinutos: number) => {
    if (!data || !horario || !periodoMinutos) return null;

    try {
      const response = await fetch(`/api/appointments?startDate=${data}&endDate=${data}`);
      if (!response.ok) return null;
      
      const agendamentosDoDia = await response.json();

      const [horaInicio, minutoInicio] = horario.split(':').map(Number);
      const inicioEmMinutos = horaInicio * 60 + minutoInicio;
      const fimEmMinutos = inicioEmMinutos + periodoMinutos;

      for (const agendamento of agendamentosDoDia) {
        const [horaExistente, minutoExistente] = agendamento.startTime.split(':').map(Number);
        const inicioExistenteEmMinutos = horaExistente * 60 + minutoExistente;
        
        const [horaFim, minutoFim] = agendamento.endTime.split(':').map(Number);
        const fimExistenteEmMinutos = horaFim * 60 + minutoFim;

        if (
          (inicioEmMinutos >= inicioExistenteEmMinutos && inicioEmMinutos < fimExistenteEmMinutos) ||
          (fimEmMinutos > inicioExistenteEmMinutos && fimEmMinutos <= fimExistenteEmMinutos) ||
          (inicioEmMinutos <= inicioExistenteEmMinutos && fimEmMinutos >= fimExistenteEmMinutos)
        ) {
          return {
            conflito: true,
            agendamento: {
              ...agendamento,
              client: { name: agendamento.clientName || agendamento.client?.name || '' },
            },
            horarioFinal: agendamento.endTime
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao verificar conflito:', error);
      return null;
    }
  };

  // Verificar conflitos em tempo real
  useEffect(() => {
    const verificar = async () => {
      if (formData.data && formData.horario && formData.periodo) {
        const periodoMinutos = parseInt(formData.periodo);
        const resultado = await verificarConflitoHorario(formData.data, formData.horario, periodoMinutos);
        setConflito(resultado);
      } else {
        setConflito(null);
      }
    };
    verificar();
  }, [formData.data, formData.horario, formData.periodo]);

  // Regenerar código quando o usuário mudar a DATA manualmente (não na inicialização)
  const [dataInicializada, setDataInicializada] = useState(false);
  useEffect(() => {
    if (!dataInicializada || !formData.data) return;
    const regenerar = async () => {
      const novoCodigo = await gerarCodigoSequencial(formData.data);
      setFormData(prev => ({ ...prev, codigo: novoCodigo, nomeCliente: novoCodigo }));
    };
    regenerar();
  }, [formData.data, dataInicializada]);

  // Processar comando de voz e preencher formulário
  const handleVoiceCommand = (parsedCommand: any) => {
    try {
      const { cliente, hora, minuto, data, local, valor, pagamento } = parsedCommand;

      // Atualizar cliente
      if (cliente) {
        setFormData(prev => ({
          ...prev,
          nomeCliente: cliente.charAt(0).toUpperCase() + cliente.slice(1)
        }));
      }

      // Atualizar hora
      if (hora) {
        const horaFormatada = String(hora).padStart(2, '0');
        const minutoFormatada = String(minuto || '00').padStart(2, '0');
        setFormData(prev => ({
          ...prev,
          horario: `${horaFormatada}:${minutoFormatada}`
        }));
      }

      // Atualizar data (hoje por padrão)
      if (data || !formData.data) {
        const hoje = new Date();
        const anoStr = hoje.getFullYear();
        const mesStr = String(hoje.getMonth() + 1).padStart(2, '0');
        const diaStr = String(hoje.getDate()).padStart(2, '0');
        setFormData(prev => ({
          ...prev,
          data: `${anoStr}-${mesStr}-${diaStr}`
        }));
      }

      // Atualizar local — busca pelo nome no array de locais carregados
      if (local) {
        const localEncontrado = locations.find(
          (l: any) => l.name.toLowerCase().includes(local.toLowerCase()) ||
                      local.toLowerCase().includes(l.name.toLowerCase())
        );
        setFormData(prev => ({
          ...prev,
          local: localEncontrado ? localEncontrado.id : prev.local
        }));
      }

      // Atualizar valor
      if (valor) {
        const valorFormatado = `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
        setFormData(prev => ({
          ...prev,
          valor: valorFormatado
        }));
      }

      // Atualizar tipo de pagamento
      if (pagamento) {
        const pagamentoMap: any = {
          'pix': 'pix',
          'dinheiro': 'dinheiro',
          'cartao': 'cartao_credito',
          'whatsapp': 'pix',
          'telegram': 'pix'
        };
        const tipoPagamento = pagamentoMap[pagamento.toLowerCase()] || pagamento;
        setFormData(prev => ({
          ...prev,
          tipoPagamento: tipoPagamento
        }));
      }

      toast.success('Comando de voz processado! Verifique e confirme os dados.');
    } catch (error) {
      console.error('Erro ao processar comando de voz:', error);
      toast.error('Erro ao processar comando de voz');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Bloqueia se o nome do cliente for o código auto-gerado (Cli001) sem preencher
    if (!formData.nomeCliente || !formData.data || !formData.horario || !formData.periodo) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (conflito) {
      toast.error('⚠️ Horário não disponível! Já existe um agendamento neste horário.');
      return;
    }

    setLoading(true);

    try {
      // Calcular horário de término
      const [horaInicio, minutoInicio] = formData.horario.split(':').map(Number);
      const periodoMinutos = parseInt(formData.periodo);
      const minutosTotais = horaInicio * 60 + minutoInicio + periodoMinutos;
      const horaFim = Math.floor(minutosTotais / 60) % 24;
      const minutoFim = minutosTotais % 60;
      const horarioFim = `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`;

      // Criar ou buscar cliente
      let clientId = formData.nomeCliente;
      
      const clientResponse = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.nomeCliente,
          phone: formData.celular || null,
          notes: null,
        }),
      });

      if (!clientResponse.ok) {
        const errData = await clientResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao registrar cliente');
      }
      const client = await clientResponse.json();
      clientId = client.id;

      // Criar agendamento
      const valorNumerico = formData.valor ?
        parseFloat(formData.valor.replace('R$', '').replace('.', '').replace(',', '.').trim()) :
        0;

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.data,
          startTime: formData.horario,
          endTime: horarioFim,
          status: formData.status,
          notes: null,
          value: valorNumerico,
          paid: false,
          clientId,
          serviceId: null,
          locationId: formData.local || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao salvar agendamento');
      }

      // Salva o contador SOMENTE após sucesso — evita pular números
      const matchCodigo = formData.codigo.match(/Cli(\d+)/i);
      if (matchCodigo) salvarContadorLocal(formData.data, parseInt(matchCodigo[1]));

      toast.success('✅ Agendamento criado com sucesso!');
      router.push('/agenda/confirmacao');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      const msg = error instanceof Error ? error.message : 'Erro ao salvar agendamento';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Salvar automaticamente as preferências do dia para periodo, local e valor
    if (field === 'periodo' || field === 'local' || field === 'valor') {
      salvarPreferenciasDia(field, value);
    }
  };

  const gerarNovoCodigo = async () => {
    const dataParaCodigo = formData.data || new Date().toISOString().split('T')[0];
    const novoCodigo = await gerarCodigoSequencial(dataParaCodigo);
    setFormData(prev => ({
      ...prev,
      codigo: novoCodigo,
      nomeCliente: novoCodigo
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Menu
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Novo Agendamento
          </h1>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data e Celular */}
              <div className="grid grid-cols-2 gap-4">
                {/* Data */}
                <div className="space-y-2">
                  <Label htmlFor="data" className="text-sm font-medium text-gray-700">
                    📅 Data *
                  </Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleInputChange('data', e.target.value)}
                    className="w-full shadow-sm"
                  />
                </div>

                {/* Celular */}
                <div className="space-y-2">
                  <Label htmlFor="celular" className="text-sm font-medium text-gray-700">
                    📱 Nr. Celular
                  </Label>
                  <Input
                    id="celular"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.celular}
                    onChange={(e) => handleInputChange('celular', formatarCelular(e.target.value))}
                    className="w-full shadow-sm"
                    maxLength={16}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Código */}
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="text-sm font-medium text-gray-700">
                    Código
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo"
                      type="text"
                      value={formData.codigo}
                      className="flex-1 bg-gray-100 shadow-sm"
                      readOnly
                    />
                    <Button
                      type="button"
                      onClick={gerarNovoCodigo}
                      variant="outline"
                      size="sm"
                      className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700"
                      title="Gerar novo código"
                    >
                      🔄
                    </Button>
                  </div>
                </div>

                {/* Nome do Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="nomeCliente" className="text-sm font-medium text-gray-700">
                    Nome do Cliente
                  </Label>
                  <Input
                    id="nomeCliente"
                    type="text"
                    value={formData.nomeCliente}
                    onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
                    className="w-full shadow-sm"
                  />
                </div>
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="horario" className="text-sm font-medium text-gray-700">
                  Horário
                </Label>
                <Input
                  id="horario"
                  type="time"
                  value={formData.horario}
                  onChange={(e) => handleInputChange('horario', e.target.value)}
                  className="w-full shadow-sm"
                />
              </div>

              {/* Período */}
              <div className="space-y-2">
                <Label htmlFor="periodo" className="text-sm font-medium text-gray-700">
                  Período (minutos)
                </Label>
                <Select 
                  value={formData.periodo}
                  onValueChange={(value) => handleInputChange('periodo', value)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="180">3 horas</SelectItem>
                  </SelectContent>
                </Select>

                {conflito && conflito.conflito && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">
                    <strong>⚠️ Horário não disponível!</strong><br />
                    Já agendado para: <strong>{conflito.agendamento.client?.name}</strong><br />
                    Horário: <strong>{conflito.agendamento.startTime} às {conflito.horarioFinal}</strong>
                  </div>
                )}
                
                {!conflito && formData.horario && formData.periodo && (
                  <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-md text-sm">
                    ✅ Horário disponível!
                  </div>
                )}
              </div>

              {/* Local */}
              <div className="space-y-2">
                <Label htmlFor="local" className="text-sm font-medium text-gray-700">
                  Local
                </Label>
                <Select 
                  value={formData.local}
                  onValueChange={(value) => handleInputChange('local', value)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="Selecione um local" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">⏳ Pendente</SelectItem>
                    <SelectItem value="confirmado">✅ Confirmado</SelectItem>
                    <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="valor" className="text-sm font-medium text-gray-700">
                  Valor
                </Label>
                <Input
                  id="valor"
                  type="text"
                  value={formData.valor}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value === '') {
                      handleInputChange('valor', 'R$ 0,00');
                    } else {
                      value = (parseInt(value) / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      });
                      handleInputChange('valor', value);
                    }
                  }}
                  className="w-full shadow-sm"
                  placeholder="R$ 0,00"
                />
              </div>

              {/* Tipo de Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="tipoPagamento" className="text-sm font-medium text-gray-700">
                  💳 Tipo de Pagamento
                </Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.tipoPagamento}
                    onValueChange={(value) => handleInputChange('tipoPagamento', value)}
                  >
                    <SelectTrigger className="shadow-sm flex-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposPagamento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setDialogTipoPagamentoAberto(true)}
                    className="shrink-0"
                    title="Cadastrar novo tipo de pagamento"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 font-medium rounded-lg"
              >
                {loading ? 'Salvando...' : 'Confirmar Agendamento'}
              </Button>
            </form>

            {/* Botão de Voz FORA do form — evita submit acidental no mobile */}
            <div className="mt-4">
              <VoiceRequestButton
                onRequestParsed={handleVoiceCommand}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dialog para cadastrar novo tipo de pagamento */}
        <Dialog open={dialogTipoPagamentoAberto} onOpenChange={setDialogTipoPagamentoAberto}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Tipo de Pagamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="novoTipoPagamento">Nome do Tipo de Pagamento</Label>
                <Input
                  id="novoTipoPagamento"
                  value={novoTipoPagamento}
                  onChange={(e) => setNovoTipoPagamento(e.target.value)}
                  placeholder="Ex: Transferência, Boleto..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdicionarTipoPagamento();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogTipoPagamentoAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdicionarTipoPagamento} className="bg-pink-500 hover:bg-pink-600">
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
