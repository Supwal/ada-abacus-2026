'use client';

import { useEffect, useState } from 'react';
import { Mic, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'ada_mic_guide_dismissed';

export function MicPermissionGuide() {
  const [visible, setVisible] = useState(false);
  const [micStatus, setMicStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  useEffect(() => {
    // Só mostra se ainda não foi dispensado
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    // Verifica se o navegador suporta voz
    const hasVoice = !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    if (!hasVoice) return;

    // Verifica o estado da permissão do microfone
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setMicStatus(result.state as any);
        // Mostra aviso se não foi ainda concedida
        if (result.state !== 'granted') {
          setTimeout(() => setVisible(true), 2000); // Delay de 2s após abrir
        }
      }).catch(() => {
        // Fallback: mostra de qualquer forma se não conseguir checar
        setTimeout(() => setVisible(true), 2000);
      });
    } else {
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleAllowMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('granted');
      localStorage.setItem(STORAGE_KEY, '1');
      setVisible(false);
    } catch {
      setMicStatus('denied');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border-2 border-blue-200 pointer-events-auto animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">🎙️ Libere o Microfone</p>
              <p className="text-white/80 text-xs">Para agendar por voz</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-3">
          {micStatus === 'granted' ? (
            <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-green-700 text-sm font-medium">Microfone já está liberado! ✅</p>
            </div>
          ) : micStatus === 'denied' ? (
            <div className="space-y-2">
              <p className="text-gray-700 text-sm font-semibold">Microfone bloqueado. Para liberar:</p>
              <ol className="text-sm text-gray-600 space-y-1.5 list-none">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span>Toque no ícone <strong>🔒</strong> na barra de endereço</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span>Toque em <strong>Permissões do site</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span>Toque em <strong>Microfone → Permitir</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                  <span>Recarregue a página</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">
                O app usa o <strong>microfone</strong> para agendar por voz.
                Clique abaixo para liberar o acesso agora:
              </p>
              <Button
                onClick={handleAllowMic}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl py-3"
              >
                <Mic className="h-4 w-4 mr-2" />
                Permitir Microfone
              </Button>
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
          >
            Não mostrar novamente
          </button>
        </div>
      </div>
    </div>
  );
}
