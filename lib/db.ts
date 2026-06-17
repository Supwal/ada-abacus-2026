/**
 * Cliente Prisma compatível com Edge Runtime (Cloudflare Pages / Workers)
 * Usa @prisma/client/edge + Prisma Accelerate para conexão ao PostgreSQL.
 *
 * Em produção, DATABASE_URL deve ser a URL do Prisma Accelerate:
 *   prisma://accelerate.prisma-data.net/?api_key=SEU_API_KEY
 *
 * Em desenvolvimento local, pode usar a URL direta do PostgreSQL:
 *   postgresql://...
 */

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof makePrismaClient> | undefined
}

function makePrismaClient() {
  return new PrismaClient().$extends(withAccelerate())
}

export const prisma = globalThis.prismaGlobal ?? makePrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
