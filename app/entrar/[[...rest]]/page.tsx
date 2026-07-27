export const runtime = 'edge';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Tela de login via Clerk (com verificação por e-mail).
 *
 * Coexiste com a tela antiga (/auth/login, NextAuth) durante a migração.
 * Se as chaves da Clerk não estiverem no ambiente (ex.: produção antes de
 * cadastrar os segredos), mostra um aviso em vez de quebrar a página.
 */
export default function EntrarPage() {
  const clerkConfigurado = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">A.D.A.</h1>
        <p className="text-gray-600 text-sm mt-1">Entre na sua conta</p>
      </div>

      {clerkConfigurado ? (
        <SignIn signUpUrl="/cadastrar" fallbackRedirectUrl="/pos-login" />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <p className="text-gray-700 font-medium">
            O login por e-mail ainda não está ativo neste ambiente.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block text-pink-600 font-semibold hover:underline"
          >
            Entrar pelo login atual
          </Link>
        </div>
      )}

      <Link href="/auth/login" className="mt-6 text-sm text-gray-500 hover:text-gray-700">
        ← Usar o login antigo
      </Link>
    </div>
  );
}
