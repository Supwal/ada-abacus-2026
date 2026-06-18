import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

export type PrismaEdge = ReturnType<typeof makePrisma>

export function makePrisma() {
  const ctx = getOptionalRequestContext()
  const url = (ctx?.env as any)?.DATABASE_URL ?? process.env.DATABASE_URL
  return new PrismaClient({ datasourceUrl: url }).$extends(withAccelerate())
}
