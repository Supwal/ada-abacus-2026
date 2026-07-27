import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * FASE 1 da migração para Clerk — modo CONVIVÊNCIA.
 *
 * Este middleware NÃO protege rota nenhuma: ele só disponibiliza o contexto
 * de auth da Clerk para quem quiser usar. Quem manda no login continua sendo
 * o NextAuth (ver `getSession` em lib/db.ts). Nada muda para o usuário.
 *
 * Se as chaves da Clerk não estiverem no ambiente (ex.: produção antes de
 * cadastrar os segredos), o middleware vira um passa-tudo — assim o deploy
 * nunca quebra por falta de configuração.
 */
const clerkConfigurado = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const semClerk = (_req: NextRequest) => NextResponse.next()

export default clerkConfigurado ? clerkMiddleware() : semClerk

export const config = {
  matcher: [
    // Pula arquivos estáticos e internos do Next, a não ser que estejam na query
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Sempre roda nas rotas de API
    '/(api|trpc)(.*)',
  ],
}
