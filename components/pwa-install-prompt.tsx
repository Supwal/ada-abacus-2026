
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = () =>
      (window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode());

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Handle PWA install prompt (Chrome/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show prompt immediately, wait for user interaction
      const installPromptShown = localStorage.getItem('pwa-install-prompt-shown');
      if (!installPromptShown) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS install prompt if on iOS and not installed
    if (iOS && !isInStandaloneMode()) {
      const iosPromptShown = localStorage.getItem('ios-install-prompt-shown');
      if (!iosPromptShown) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-prompt-shown', 'true');
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    if (isIOS) {
      localStorage.setItem('ios-install-prompt-shown', 'true');
    } else {
      localStorage.setItem('pwa-install-prompt-shown', 'true');
    }
  };

  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xl animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg p-2">
            <img src="/icon-96x96.png" alt="ADA APP Logo" className="w-full h-full" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">Instale o ADA APP</h3>
            
            {isIOS ? (
              <div className="text-sm space-y-2">
                <p>Para instalar o aplicativo no seu iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Toque no botão <Share className="inline h-4 w-4" /> (Compartilhar) na barra inferior</li>
                  <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                  <li>Toque em "Adicionar" no canto superior direito</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm mb-3">
                Instale nosso aplicativo para acesso rápido, trabalhar offline e receber notificações!
              </p>
            )}

            {!isIOS && deferredPrompt && (
              <Button
                onClick={handleInstallClick}
                className="bg-white text-pink-600 hover:bg-pink-50 font-semibold mt-2"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Instalar Agora
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
