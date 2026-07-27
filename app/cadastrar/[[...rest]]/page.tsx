export const runtime = 'edge';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Tela de cadastro via Clerk — é aqui que acontece a "homologação" pedida:
 * a Clerk envia um código para o e-mail informado e a conta só é criada
 * depois que o usuário confirma esse código.
 *
 * Se as chaves não estiverem no ambiente, mostra um aviso em vez de quebrar.
 */
export default function CadastrarPage() {
  const clerkConfigurado = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">A.D.A.</h1>
        <p className="text-gray-600 text-sm mt-1">
          Crie sua conta — confirmamos seu e-mail por código
        </p>
      </div>

      {clerkConfigurado ? (
        <SignUp signInUrl="/entrar" fallbackRedirectUrl="/dashboard" />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <p className="text-gray-700 font-medium">
            O cadastro por e-mail ainda não está ativo neste ambiente.
          </p>
          <Link
            href="/auth/signup"
            className="mt-4 inline-block text-pink-600 font-semibold hover:underline"
          >
            Usar o cadastro atual
          </Link>
        </div>
      )}

      <Link href="/entrar" className="mt-6 text-sm text-gray-500 hover:text-gray-700">
        Já tenho conta
      </Link>
    </div>
  );
}
