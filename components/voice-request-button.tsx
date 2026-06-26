'use client';

import { Button } from '@/components/ui/button';
import { Mic, StopCircle, X } from 'lucide-react';
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

export function VoiceRequestButton({ onRequestParsed, disabled = false }: VoiceRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [checkedVoice, setCheckedVoice] = useState(false);

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

  // Verificar se tem acesso a voz (plano completo)
  useEffect(() => {
    if (!checkedVoice) {
      checkVoiceAccess();
    }
  }, [checkedVoice]);

  const checkVoiceAccess = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setVoiceEnabled(data.voiceEnabled === true);
        setCheckedVoice(true);

        if (data.voiceEnabled === false && data.planType !== 'completo') {
          // Usuário não tem plano completo
        }
      }
    } catch (error) {
      console.error('Erro ao verificar acesso à voz:', error);
      setCheckedVoice(true);
    }
  };

  const parseVoiceCommand = (text: string) => {
    const t = text.toLowerCase().trim();

    // Hora: "às 14", "as 14:30", "14h", "14 horas"
    const horaMatch = t.match(/(?:às?|as)\s+(\d{1,2})(?::(\d{2}))?|(\d{1,2})h(?:(\d{2})?)?/i);
    let hora: string | null = null;
    let minuto = '00';
    if (horaMatch) {
      hora = horaMatch[1] || horaMatch[3] || null;
      minuto = horaMatch[2] || horaMatch[4] || '00';
    }

    // Cliente: "com [nome]"
    const clienteMatch = t.match(/com\s+([a-záàâãéèêíïóôõöúüçñ\s]+?)(?=\s+(?:local|hotel|clínica|clinica|valor|r\$|\d+|pix|dinheiro|cartão|cartao|debito|débito|crédito|credito)|$)/i);
    const cliente = clienteMatch ? clienteMatch[1].trim() : null;

    // Local: "local [nome]", "clínica [nome]", "hotel [nome]", "em [nome]"
    const localMatch = t.match(/(?:local|clínica|clinica|hotel|em)\s+([a-záàâãéèêíïóôõöúüçñ\s]+?)(?=\s+(?:valor|r\$|\d{2,}|pix|dinheiro|cartão|cartao)|$)/i);
    const local = localMatch ? localMatch[1].trim() : null;

    // Valor: "valor 200", "200 reais", "R$ 200", "duzentos reais"
    const valorMatch = t.match(/(?:valor|r\$|reais)?\s*(\d+(?:[.,]\d{2})?)(?:\s*reais)?/i);
    // Pegar ÚLTIMO número (mais provável ser o valor)
    const todosNumeros = [...t.matchAll(/\b(\d{2,}(?:[.,]\d{2})?)\b/g)];
    const valorNum = todosNumeros.length > 0 ? todosNumeros[todosNumeros.length - 1][1] : null;
    const valor = valorNum ? valorNum.replace(',', '.') : null;

    // Pagamento
    const pagamentoMatch = t.match(/\b(pix|dinheiro|cartão|cartao|débito|debito|crédito|credito|whatsapp|telegram)\b/i);
    const pagamento = pagamentoMatch ? pagamentoMatch[1].toLowerCase()
      .replace('cartão', 'cartao').replace('débito', 'debito').replace('crédito', 'credito') : null;

    const parsed: any = {
      comando: 'agendar',
      hora: hora ? parseInt(hora) : null,
      minuto: minuto,
      cliente,
      local,
      valor,
      pagamento,
      textoOriginal: text,
    };

    return parsed;
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

    setIsOpen(true);
    resetTranscript();
  };

  const handleStartListening = () => {
    resetTranscript();
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleProcessCommand = () => {
    if (!transcript.trim()) {
      toast.error('Nenhum comando de voz detectado');
      return;
    }

    const parsed = parseVoiceCommand(transcript);
    console.log('Comando parseado:', parsed);

    if (onRequestParsed) {
      onRequestParsed(parsed);
    }

    toast.success('Comando processado! Verifique os dados antes de confirmar.');
    setIsOpen(false);
    resetTranscript();
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        disabled={disabled || !voiceEnabled}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
      >
        <Mic className="h-5 w-5" />
        🎤 Solicitar por Voz
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mic className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl font-bold">🎤 Solicitar por Voz</DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700">
              Diga seu comando de agendamento em português
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Status de Escuta */}
            <div className={`p-4 rounded-lg border-2 transition-colors ${
              isListening
                ? 'bg-blue-50 border-blue-400 animate-pulse'
                : 'bg-gray-50 border-gray-300'
            }`}>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {isListening ? '🔴 Escutando...' : '⚪ Pronto para escutar'}
              </p>
              <div className="min-h-12 bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-900 font-medium">
                  {transcript || interimTranscript || 'Clique em "Iniciar" para começar...'}
                </p>
                {interimTranscript && (
                  <p className="text-xs text-gray-500 mt-1 italic">{interimTranscript}</p>
                )}
              </div>
            </div>

            {/* Exemplo de Comando */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <p className="text-xs font-bold text-purple-700 mb-2">📝 Exemplos de Comando:</p>
              <ul className="space-y-1 text-xs text-purple-700">
                <li>• "Agendar hoje às 14:00 com João, local padrão, valor 200"</li>
                <li>• "Agendar hoje às 13:00 com Pedro, hotel messalina, 200 pix"</li>
                <li>• "Agendar amanhã às 10:00 com Maria"</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              {!isListening ? (
                <Button
                  onClick={handleStartListening}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Iniciar Escuta
                </Button>
              ) : (
                <Button
                  onClick={handleStopListening}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Parar
                </Button>
              )}
            </div>

            {transcript && (
              <Button
                onClick={handleProcessCommand}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
              >
                ✅ Processar Comando
              </Button>
            )}

            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
