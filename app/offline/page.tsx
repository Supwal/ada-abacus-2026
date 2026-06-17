
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check if online
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.back();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-pink-500" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Você está offline
          </h1>
          <p className="text-gray-600">
            {isOnline 
              ? 'Conexão restaurada! Você pode tentar novamente.'
              : 'Parece que você perdeu a conexão com a internet. Algumas funcionalidades podem estar limitadas.'
            }
          </p>
        </div>

        {/* Status Indicator */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-sm font-medium">
            {isOnline ? 'Conexão restaurada' : 'Sem conexão'}
          </span>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Dica
          </h3>
          <p className="text-sm text-blue-800">
            O ADA APP funciona offline! Você pode visualizar dados salvos anteriormente e suas alterações serão sincronizadas quando a conexão for restaurada.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRetry}
            className="w-full bg-pink-500 hover:bg-pink-600"
            size="lg"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Tentar Novamente
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Ir para o Dashboard
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            Esta página funciona completamente offline. O ADA APP é um Progressive Web App (PWA) e pode ser instalado no seu dispositivo para acesso rápido.
          </p>
        </div>
      </Card>
    </div>
  );
}
