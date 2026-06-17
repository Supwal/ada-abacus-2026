
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, WifiOff, Zap, Smartphone } from 'lucide-react';

export function PWAFeatures() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if running as installed PWA
    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
    };

    setIsStandalone(checkStandalone());

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        new Notification('Notificações Ativadas! 🎉', {
          body: 'Você receberá lembretes sobre seus agendamentos.',
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
        });
      }
    }
  };

  const features = [
    {
      icon: WifiOff,
      title: 'Funciona Offline',
      description: 'Continue trabalhando mesmo sem internet. Seus dados serão sincronizados automaticamente.',
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    {
      icon: Zap,
      title: 'Carregamento Rápido',
      description: 'Abra o app instantaneamente, mesmo em conexões lentas.',
      color: 'text-yellow-500',
      bg: 'bg-yellow-100',
    },
    {
      icon: Smartphone,
      title: 'Instalável',
      description: 'Adicione à tela inicial para acesso rápido como um app nativo.',
      color: 'text-green-500',
      bg: 'bg-green-100',
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Receba lembretes sobre agendamentos e compromissos importantes.',
      color: 'text-purple-500',
      bg: 'bg-purple-100',
      action: notificationPermission === 'default' ? requestNotifications : undefined,
      actionLabel: 'Ativar Notificações',
    },
  ];

  if (!isStandalone) {
    return null; // Only show for installed PWA
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        🎉 Recursos do ADA APP
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                
                {feature.action && (
                  <Button
                    onClick={feature.action}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    {feature.actionLabel}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
        <p className="text-sm text-gray-700">
          <strong>💡 Dica:</strong> Você está usando o ADA APP como um aplicativo instalado! 
          Aproveite todos os recursos offline e notificações para uma experiência completa.
        </p>
      </div>
    </div>
  );
}
