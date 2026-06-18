import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

// Fallback garantido para Cloudflare Edge Runtime
// (Prisma recomenda fornecer a URL diretamente quando process.env não está disponível)
const ACCELERATE_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza193bXNYV3hRdXF0SWtNSWpnZEJHaDkiLCJhcGlfa2V5IjoiMDFLVjhHRUIzSlRQOFpaWTk0VEo1Rk5KNEEiLCJ0ZW5hbnRfaWQiOiIwODA0N2Q0ZDZmZTQ4YWFiMWUwY2YyMzYzNDJkMWM1NjZhOWQ4MTM2MDgwNTdlZmI4ZDM2MGY4ZDgxOTU5NDQ4IiwiaW50ZXJuYWxfc2VjcmV0IjoiYjVhMDhjZjktMzgzMy00ODg2LTg3ZjktM2MxNWJjZDI5MDk5In0.mjNNRSXKgLpAu7jDt1cTbt8ud6tFzh1S56Ybc0J1p-c'

export type PrismaEdge = ReturnType<typeof makePrisma>

export function makePrisma() {
  // Tenta todas as formas de obter a URL: contexto CF, global CF, process.env, fallback hardcoded
  const ctx = getOptionalRequestContext()
  const cfGlobal = (globalThis as any).__cloudflareRequestContext

  const url =
    (ctx?.env as any)?.DATABASE_URL ??
    cfGlobal?.env?.DATABASE_URL ??
    process.env.DATABASE_URL ??
    ACCELERATE_URL

  // Garante que o Prisma encontre DATABASE_URL internamente via process.env
  if (url && typeof process !== 'undefined' && process.env) {
    ;(process.env as any).DATABASE_URL = url
  }

  return new PrismaClient({ datasourceUrl: url }).$extends(withAccelerate())
}
