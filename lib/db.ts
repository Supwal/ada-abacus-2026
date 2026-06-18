import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

function getDatabaseUrl(): string {
  // Em Cloudflare Workers, env vars ficam no contexto da requisição, não em process.env
  const ctx = getOptionalRequestContext()
  const url = (ctx?.env as any)?.DATABASE_URL || process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL não configurada')
  return url
}

export function getPrisma() {
  return new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
  }).$extends(withAccelerate())
}

// Proxy para manter a API `prisma.xxx` em todos os routes
export const prisma = new Proxy({} as ReturnType<typeof getPrisma>, {
  get(_target, prop: string) {
    return (getPrisma() as any)[prop]
  },
})
