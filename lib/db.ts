import { PrismaClient } from '@prisma/client/edge'
import { PrismaNeonHTTP } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

// HTTP estático do Neon — sem WebSocket/Pool, 100% compatível com Cloudflare Edge Runtime
const NEON_URL = 'postgresql://neondb_owner:npg_7VF3ZIiwaLWv@ep-cold-king-ac3p3xlf.sa-east-1.aws.neon.tech/neondb?sslmode=require'

export type PrismaEdge = ReturnType<typeof makePrisma>

export function makePrisma() {
  const ctx = getOptionalRequestContext()
  const cfGlobal = (globalThis as any).__cloudflareRequestContext

  const url =
    (ctx?.env as any)?.DATABASE_URL ??
    cfGlobal?.env?.DATABASE_URL ??
    process.env.DATABASE_URL ??
    NEON_URL

  const sql = neon(url)
  const adapter = new PrismaNeonHTTP(sql)
  return new PrismaClient({ adapter })
}
