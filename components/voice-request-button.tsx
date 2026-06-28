'use client';

import { Button } from '@/components/ui/button';
import { Mic, StopCircle, X, CheckCircle, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VoiceRequestButtonProps {
  onRequestParsed?: (data: any) => void;
  disabled?: boolean;
}

// Telas do fluxo de voz
type Tela = 'escuta' | 'revisao';

export function VoiceRequestButton({ onRequestParsed, disabled = false }: VoiceRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [checkedVoice, setCheckedVoice] = useState(false);
  const [tela, setTela] = useState<Tela>('escuta');
  const [parsedPreview, setParsedPreview] = useState<any>(null);
  const [micBloqueado, setMicBloqueado] = useState(false);

  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    language: 'pt-BR',
    continuous: false,
    interimResults: true,
  });

  useEffect(() => {
    if (!checkedVoice) checkVoiceAccess();
  }, [checkedVoice]);

  const checkVoiceAccess = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setVoiceEnabled(data.voiceEnabled === true);
      }
    } catch {}
    setCheckedVoice(true);
  };

  const parseVoiceCommand = (text: string) => {
    const t = text.toLowerCase().trim();

    const horaMatch = t.match(/(?:às?|as)\s+(\d{1,2})(?::(\d{2}))?|(\d{1,2})h(?:(\d{2})?)?/i);
    let hora: string | null = null;
    let minuto = '00';
    if (horaMatch) {
      hora = horaMatch[1] || horaMatch[3] || null;
      minuto = horaMatch[2] || horaMatch[4] || '00';
    }

    const clienteMatch = t.match(/com\s+([a-záàâãéèêíïóôõöúüçñ\s]+?)(?=\s+(?:local|hotel|clínica|clinica|valor|r\$|\d+|pix|dinheiro|cartão|cartao|debito|débito|crédito|credito)|$)/i);
    const cliente = clienteMatch ? clienteMatch[1].trim() : null;

    const localMatch = t.match(/(?:local|clínica|clinica|hotel|em)\s+([a-záàâãéèêíïóôõöúüçñ\s]+?)(?=\s+(?:valor|r\$|\d{2,}|pix|dinheiro|cartão|cartao)|$)/i);
    const local = localMatch ? localMatch[1].trim() : null;

    const todosNumeros = [...t.matchAll(/\b(\d{2,}(?:[.,]\d{2})?)\b/g)];
    const valorNum = todosNumeros.length > 0 ? todosNumeros[todosNumeros.length - 1][1] : null;
    const valor = valorNum ? valorNum.replace(',', '.') : null;

    const pagamentoMatch = t.match(/\b(pix|dinheiro|cartão|cartao|débito|debito|crédito|credito)\b/i);
    const pagamento = pagamentoMatch ? pagamentoMatch[1].toLowerCase()
      .replace('cartão', 'cartao').replace('débito', 'debito').replace('crédito', 'credito') : null;

    return { comando: 'agendar', hora: hora ? parseInt(hora) : null, minuto, cliente, local, valor, pagamento, textoOriginal: text };
  };

  const handleOpenDialog = () => {
    if (!voiceEnabled) {
      toast.error('Apenas plano Completo tem acesso a solicitações por voz');
      return;
    }
    if (!isSupported) {
      toast.error('Seu navegador não suporta reconhecimento de voz');
      return;
    }
    setTela('escuta');
    setParsedPreview(null);
    setMicBloqueado(false);
    resetTranscript();
    setIsOpen(true);
  };

  const handleStartListening = async () => {
    resetTranscript();
    setMicBloqueado(false);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicBloqueado(true);
      return;
    }
    startListening();
  };

  // Após parar de escutar, vai para tela de revisão automaticamente
  useEffect(() => {
    if (!isListening && transcript.trim() && tela === 'escuta') {
      const parsed = parseVoiceCommand(transcript);
      setParsedPreview(parsed);
      setTela('revisao');
    }
  }, [isListening]);

  const handleConfirmar = () => {
    if (!parsedPreview) return;
    if (onRequestParsed) onRequestParsed(parsedPreview);
    // Fecha o diálogo com um pequeno delay para evitar que o clique
    // "caia" em botões do formulário por baixo (bug mobile Android)
    setTimeout(() => {
      setIsOpen(false);
      resetTranscript();
      setTela('escuta');
      setParsedPreview(null);
    }, 300);
    toast.success('Dados aplicados! Confira o formulário e confirme.');
  };

  const handleRefazer = () => {
    resetTranscript();
    setParsedPreview(null);
    setTela('escuta');
  };

  const handleFechar = () => {
    stopListening();
    resetTranscript();
    setTela('escuta');
    setParsedPreview(null);
    setIsOpen(false);
  };

  const labelPagamento: any = {
    pix: 'PIX', dinheiro: 'Dinheiro', cartao: 'Cartão', cartao_credito: 'Cartão Crédito',
    debito: 'Débito', credito: 'Crédito',
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenDialog}
        disabled={disabled || !voiceEnabled}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
      >
        <Mic className="h-5 w-5" />
        🎤 Solicitar por Voz
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleFechar(); }}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mic className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                {tela === 'escuta' ? '🎤 Solicitar por Voz' : '📋 Revisar Dados'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700">
              {tela === 'escuta'
                ? 'Diga seu comando de agendamento em português'
                : 'Confirme os dados detectados antes de aplicar ao formulário'}
            </DialogDescription>
          </DialogHeader>

          {/* ===== TELA 1: ESCUTA ===== */}
          {tela === 'escuta' && (
            <div className="space-y-4 py-4">

              {/* ===== GUIA DE PERMISSÃO (aparece quando mic está bloqueado) ===== */}
              {micBloqueado ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-red-100 rounded-full p-2 shrink-0">
                        <Mic className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-bold text-red-700 text-base">🎙️ Microfone Bloqueado</p>
                        <p className="text-xs text-red-500">Siga os passos abaixo para liberar</p>
                      </div>
                    </div>

                    <ol className="space-y-3">
                      {[
                        { n: '1', icon: '🔒', text: 'Toque no ícone de cadeado na barra de endereço do Chrome' },
                        { n: '2', icon: '⚙️', text: 'Toque em "Permissões do site"' },
                        { n: '3', icon: '🎤', text: 'Toque em "Microfone" e selecione "Permitir"' },
                        { n: '4', icon: '🔄', text: 'Recarregue a página e tente novamente' },
                      ].map(({ n, icon, text }) => (
                        <li key={n} className="flex items-start gap-3">
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                          <p className="text-sm text-red-800">{icon} {text}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setMicBloqueado(false)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>

                  <Button type="button" onClick={handleFechar} variant="outline" className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Fechar
                  </Button>
                </div>
              ) : (
                <>
                  <div className={`p-4 rounded-lg border-2 transition-colors ${isListening ? 'bg-blue-50 border-blue-400 animate-pulse' : 'bg-gray-50 border-gray-300'}`}>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {isListening ? '🔴 Escutando... fale agora!' : '⚪ Pronto para escutar'}
                    </p>
                    <div className="min-h-12 bg-white rounded p-3 border border-gray-200">
                      <p className="text-sm text-gray-900 font-medium">
                        {transcript || interimTranscript || 'Clique em "Iniciar Escuta" para começar...'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-purple-700 mb-2">📝 Exemplos:</p>
                    <ul className="space-y-1 text-xs text-purple-700">
                      <li>• "Agendar hoje às 14:00 com João, hotel messalina, valor 200 pix"</li>
                      <li>• "Agendar amanhã às 10:00 com Maria, 150 reais"</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    {!isListening ? (
                      <Button
                        type="button"
                        onClick={handleStartListening}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Iniciar Escuta
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => stopListening()}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold"
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Parar e Revisar
                      </Button>
                    )}
                  </div>

                  <Button type="button" onClick={handleFechar} variant="outline" className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ===== TELA 2: REVISÃO ===== */}
          {tela === 'revisao' && parsedPreview && (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium mb-1">🎙️ Você disse:</p>
                <p className="text-sm text-blue-800 italic">"{parsedPreview.textoOriginal}"</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700">📋 Dados detectados:</p>

                <div className="bg-white rounded-xl border-2 border-gray-200 divide-y divide-gray-100">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-500">👤 Cliente</span>
                    <span className={`text-sm font-bold ${parsedPreview.cliente ? 'text-gray-900' : 'text-red-400 italic'}`}>
                      {parsedPreview.cliente ? parsedPreview.cliente.charAt(0).toUpperCase() + parsedPreview.cliente.slice(1) : 'Não detectado'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-500">⏰ Horário</span>
                    <span className={`text-sm font-bold ${parsedPreview.hora ? 'text-gray-900' : 'text-red-400 italic'}`}>
                      {parsedPreview.hora ? `${String(parsedPreview.hora).padStart(2, '0')}:${String(parsedPreview.minuto || '00').padStart(2, '0')}` : 'Não detectado'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-500">📍 Local</span>
                    <span className={`text-sm font-bold ${parsedPreview.local ? 'text-gray-900' : 'text-orange-400 italic'}`}>
                      {parsedPreview.local || 'Manter atual'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-500">💰 Valor</span>
                    <span className={`text-sm font-bold ${parsedPreview.valor ? 'text-green-700' : 'text-orange-400 italic'}`}>
                      {parsedPreview.valor ? `R$ ${parseFloat(parsedPreview.valor).toFixed(2).replace('.', ',')}` : 'Manter atual'}
                    </span>
                  </div>
                  {parsedPreview.pagamento && (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-sm text-gray-500">💳 Pagamento</span>
                      <span className="text-sm font-bold text-gray-900">
                        {labelPagamento[parsedPreview.pagamento] || parsedPreview.pagamento}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!parsedPreview.cliente && !parsedPreview.hora && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 font-medium">⚠️ Poucos dados detectados. Recomendamos refazer o comando com mais detalhes.</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleRefazer}
                  variant="outline"
                  className="flex-1 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Refazer
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmar}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aplicar
                </Button>
              </div>

              <Button type="button" onClick={handleFechar} variant="outline" className="w-full">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
