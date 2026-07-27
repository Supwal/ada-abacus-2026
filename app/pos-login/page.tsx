'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * FASE 3 — tela de passagem logo após o login/cadastro pela Clerk.
 *
 * Chama a sincronização (que liga a conta Clerk ao usuário do app) e só
 * então manda para o painel. É rápida: o usuário vê um "preparando..." por
 * um instante.
 */
export default function PosLoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const res = await fetch('/api/auth/clerk-sync', { method: 'POST' });
        if (cancelado) return;

        if (res.ok) {
          router.replace('/dashboard');
          return;
        }

        const dados = await res.json().catch(() => ({}));
        setErro(dados.error || 'Não foi possível concluir seu acesso.');
      } catch {
        if (!cancelado) setErro('Falha de conexão. Tente novamente.');
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
        {erro ? (
          <>
            <div className="text-4xl mb-3">😕</div>
            <p className="text-gray-800 font-medium">{erro}</p>
            <button
              onClick={() => router.replace('/entrar')}
              className="mt-4 text-pink-600 font-semibold hover:underline"
            >
              Voltar para o login
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Preparando sua conta...</p>
          </>
        )}
      </div>
    </div>
  );
}
