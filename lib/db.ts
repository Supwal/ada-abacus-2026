import { PrismaClient } from '@prisma/client'
import { PrismaNeonHTTP } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'
import { decode } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

/**
 * Lê uma variável de ambiente de forma compatível com Node e com o
 * Edge Runtime do Cloudflare (onde as vars ficam no request context,
 * não em process.env). NUNCA retorna valor hardcoded — segredos vêm
 * exclusivamente do ambiente.
 */
function readEnv(key: string): string | undefined {
  try {
    const ctx = getOptionalRequestContext()
    const cfGlobal = (globalThis as any).__cloudflareRequestContext
    return (ctx?.env as any)?.[key] ?? cfGlobal?.env?.[key] ?? process.env[key]
  } catch {
    return process.env[key]
  }
}

export function getDatabaseUrl(): string {
  const url = readEnv('DATABASE_URL')
  if (!url) {
    throw new Error('Configuração ausente: DATABASE_URL não está definida no ambiente')
  }
  return url
}

export function getSecret(): string {
  const secret = readEnv('NEXTAUTH_SECRET')
  if (!secret) {
    throw new Error('Configuração ausente: NEXTAUTH_SECRET não está definida no ambiente')
  }
  return secret
}

// Cliente SQL do Neon (HTTP) — usado pelas rotas que fazem SQL direto.
//
// ⚠️ NÃO passar `fetchOptions: { cache: ... }` aqui. O runtime do Cloudflare
// Workers não implementa o campo `cache` do fetch e derruba TODA query com
// "The 'cache' field on 'RequestInitializerDict' is not implemented" — só em
// produção, porque em Node (dev) o campo é aceito normalmente. Isso já
// quebrou o login/cadastro uma vez.
//
// Para evitar respostas cacheadas, use `export const dynamic = 'force-dynamic'`
// na rota/página (é o que as rotas deste projeto fazem) — que é o mecanismo
// do próprio Next e funciona nos dois runtimes.
export function getDb() {
  return neon(getDatabaseUrl())
}

export type PrismaEdge = ReturnType<typeof makePrisma>

// Cliente Prisma sobre Neon HTTP — compatível com Cloudflare Edge Runtime.
// PrismaNeonHTTP recebe a connection string (não o cliente neon) + options.
export function makePrisma() {
  const adapter = new PrismaNeonHTTP(getDatabaseUrl(), {})
  return new PrismaClient({ adapter })
}

const COOKIE = 'next-auth.session-token'
const SECURE_COOKIE = '__Secure-next-auth.session-token'

/**
 * Resolve a sessão do usuário — aceita AS DUAS autenticações (FASE 4).
 *
 * Tenta primeiro a Clerk (login novo, com verificação por e-mail) e, se não
 * houver, cai no NextAuth (login atual). Isso permite migrar sem reescrever
 * as ~25 rotas de API que dependem desta função.
 *
 * ⚠️ CONTRATO QUE NÃO PODE MUDAR: `sub` é sempre o **id do usuário na tabela
 * `users`**, nunca o id da Clerk. Quatro rotas (agenda-status, availabilities,
 * availabilities/[id], dashboard/stats) usam `sub` direto como `user_id` nas
 * queries — devolver o id da Clerk ali faria essas telas não acharem nada.
 * Por isso, no caminho Clerk, traduzimos clerk_user_id -> users.id antes de
 * responder.
 */
export async function getSession(req: NextRequest) {
  // 1) Sessão Clerk (só se o ambiente estiver configurado).
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      const { auth } = await import('@clerk/nextjs/server')
      const { userId: clerkUserId } = await auth()

      if (clerkUserId) {
        const sql = getDb()
        const rows = await sql`
          SELECT id, email, name FROM users WHERE clerk_user_id = ${clerkUserId} LIMIT 1
        `
        // Sem vínculo ainda (usuário nem passou pelo /pos-login): trata como
        // não autenticado em vez de inventar identidade.
        if (rows.length) {
          return {
            sub: rows[0].id as string,
            email: rows[0].email as string,
            name: (rows[0].name as string | null) ?? undefined,
          }
        }
      }
    } catch {
      // Clerk indisponível/fora de contexto — segue para o NextAuth.
    }
  }

  // 2) Sessão NextAuth (login atual) — comportamento original.
  const token = req.cookies.get(SECURE_COOKIE)?.value || req.cookies.get(COOKIE)?.value
  if (!token) return null
  try {
    return await decode({ token, secret: getSecret() })
  } catch {
    return null
  }
}
