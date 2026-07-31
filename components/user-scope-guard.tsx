'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { setUserScope, purgeLegacyKeys } from "@/lib/user-storage";

/**
 * Amarra o armazenamento local à conta logada.
 *
 * Fica logo abaixo do AuthGuard, então quando os filhos montam a sessão já
 * existe e o escopo já está definido — nenhuma tela consegue ler dados do
 * usuário anterior nem começar a numeração de clientes a partir dele.
 */
export function UserScopeGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() || {};
  const usuario = session?.user as { id?: string; email?: string } | undefined;
  const escopo = usuario?.id || usuario?.email || null;

  const [pronto, setPronto] = useState(false);

  // Definido na render (e não no efeito) para que o primeiro useEffect dos
  // filhos já encontre o escopo correto.
  setUserScope(escopo);

  useEffect(() => {
    setUserScope(escopo);
    if (escopo) {
      // Limpa o resíduo da versão sem escopo, que era compartilhado entre contas.
      purgeLegacyKeys();
      setPronto(true);
    } else {
      setPronto(false);
    }
  }, [escopo]);

  if (!escopo || !pronto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
