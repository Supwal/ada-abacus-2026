
'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg ${
            isOnline 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-800 text-white'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5" />
                <span className="font-medium">Conexão restaurada</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5" />
                <span className="font-medium">Você está offline</span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {!isOnline && !showNotification && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full shadow-lg">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Offline</span>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
