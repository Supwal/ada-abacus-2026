'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

// Cronômetro da amostra — SÓ um aprimoramento visual. A página é montada no
// servidor e funciona sem JS; se este componente não rodar (celular antigo),
// o cliente ainda vê as fotos, e a expiração continua garantida no servidor.
export function CountdownAmostra({ expiresInMs }: { expiresInMs: number }) {
  const [restanteMs, setRestanteMs] = useState(expiresInMs);

  useEffect(() => {
    const timer = setInterval(() => {
      setRestanteMs((ms) => {
        const novo = ms - 1000;
        if (novo <= 0) {
          clearInterval(timer);
          // Recarrega — o servidor renderiza a tela de "amostra encerrada".
          window.location.reload();
          return 0;
        }
        return novo;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const total = Math.max(0, Math.floor(restanteMs / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;

  return (
    <div className="sticky top-2 z-10 mx-auto mb-5 w-fit bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full px-5 py-2 shadow-lg flex items-center gap-2 font-bold">
      <Clock className="h-5 w-5" />
      <span>Amostra expira em {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>
    </div>
  );
}
