import { PrismaClient } from '@prisma/client/edge'
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

// Cliente SQL do Neon (HTTP) — usado pelas rotas que fazem SQL direto
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
 * Resolve a sessão do usuário a partir do cookie de sessão NextAuth,
 * decodificando o JWT com o secret do ambiente. Retorna o payload
 * (sub, email, name, ...) ou null se não autenticado/ inválido.
 *
 * Usa a mesma resolução de secret do login, garantindo consistência
 * entre a emissão e a validação do token no Edge Runtime.
 */
export async function getSession(req: NextRequest) {
  const token = req.cookies.get(SECURE_COOKIE)?.value || req.cookies.get(COOKIE)?.value
  if (!token) return null
  try {
    return await decode({ token, secret: getSecret() })
  } catch {
    return null
  }
}
