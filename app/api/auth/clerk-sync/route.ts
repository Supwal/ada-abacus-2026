export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { vincularUsuarioClerk } from '@/lib/clerk-bridge'

export const dynamic = 'force-dynamic'

/**
 * FASE 3 — sincroniza a conta Clerk logada com a tabela `users` do app.
 *
 * Chamada logo após o login/cadastro pela Clerk (ver /pos-login). É ela que
 * garante que a profissional continue enxergando os dados dela ao migrar.
 *
 * A identidade vem SEMPRE do servidor (`currentUser()` valida o token da
 * Clerk) — nada de confiar em e-mail enviado pelo cliente, que seria
 * trivial de forjar.
 */
export async function POST(_request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: 'Login por e-mail não está ativo neste ambiente' },
        { status: 503 }
      )
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Usa o e-mail principal da conta e checa se a Clerk o confirmou.
    const principal = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )
    const email = principal?.emailAddress
    const verificado = principal?.verification?.status === 'verified'

    if (!email) {
      return NextResponse.json(
        { error: 'Conta sem e-mail principal' },
        { status: 400 }
      )
    }
    if (!verificado) {
      return NextResponse.json(
        { error: 'Confirme seu e-mail para continuar' },
        { status: 403 }
      )
    }

    const nome =
      [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || null

    const { userId, acao } = await vincularUsuarioClerk(
      getDb(),
      user.id,
      email,
      verificado,
      nome
    )

    return NextResponse.json({ ok: true, userId, acao })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Erro ao sincronizar usuário Clerk:', msg)
    return NextResponse.json({ error: 'Erro ao sincronizar conta' }, { status: 500 })
  }
}
