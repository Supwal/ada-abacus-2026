/**
 * Cliente Prisma para Edge Runtime (Cloudflare Pages / Workers)
 *
 * Para usar este arquivo em produção no Cloudflare:
 * 1. yarn add @prisma/extension-accelerate
 * 2. Configure DATABASE_URL com a URL do Prisma Accelerate (prisma://...)
 * 3. Em cada API route que rodar no edge, importe de '@/lib/db.edge'
 *    ao invés de '@/lib/db'
 *
 * Exemplo de uso em uma route Edge:
 *   export const runtime = 'edge';
 *   import { prisma } from '@/lib/db.edge';
 */

import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prismaEdge: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  }).$extends(withAccelerate());
}

export const prisma =
  globalForPrisma.prismaEdge ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaEdge = prisma as any;
}
