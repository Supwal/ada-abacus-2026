import { PrismaClient } from '@prisma/client/edge'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

// URL direta do Neon (funciona em Cloudflare via HTTP/WebSocket sem TCP)
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

  const pool = new Pool({ connectionString: url })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}
