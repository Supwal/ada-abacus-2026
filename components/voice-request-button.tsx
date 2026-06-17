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
    // Exemplos:
    // "AGENDAR HJ AS 14:00 COM JOAO LOCAL PADRAO VALOR 200"
    // "AGENDAR HOJE AS 13:00 COM PEDRO HOTEL MESSALINA 200 PIX"

    const textLower = text.toLowerCase().trim();

    // Remover palavras-chave iniciais
    let cleaned = textLower.replace(/^(ada\s+|opa\s+)?/i, '');

    // Extrair palavras-chave
    const dataMatch = cleaned.match(/(\d{1,2})(?:[\/\-.](\d{1,2}))?/);
    const horaMatch = cleaned.match(/(\d{1,2}):?(\d{2})?/);
    const clienteMatch = cleaned.match(/com\s+([a-záéíóú\s]+?)(?:\s+(?:local|hotel|valor|pix|whatsapp|telegram)|$)/i);
    const localMatch = cleaned.match(/(?:local|em|na)\s+([a-záéíóú\s]+?)(?:\s+valor|\s*$)/i);
    const valorMatch = cleaned.match(/(?:valor|preço|r\$)\s*(\d+(?:[.,]\d{2})?)/i);
    const pagamentoMatch = cleaned.match(/(?:pix|whatsapp|telegram|dinheiro|cartao)/i);

    const parsed: any = {
      comando: 'agendar',
      data: dataMatch ? dataMatch[1] : null,
      hora: horaMatch ? horaMatch[1] : null,
      minuto: horaMatch ? (horaMatch[2] || '00') : '00',
      cliente: clienteMatch ? clienteMatch[1].trim() : null,
      local: localMatch ? localMatch[1].trim() : null,
      valor: valorMatch ? valorMatch[1].replace(',', '.') : null,
      pagamento: pagamentoMatch ? pagamentoMatch[0].toLowerCase() : null,
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
