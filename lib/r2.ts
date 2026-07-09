import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

/**
 * Lê o binding R2 do contexto de requisição do Cloudflare Pages.
 * Diferente de secrets/env vars, um binding não tem representação em
 * string — por isso não existe fallback para process.env aqui. Em
 * `npm run dev` (Node puro) isso sempre lança: testar upload local exige
 * `wrangler pages dev` (ver DEPLOY_CLOUDFLARE.md).
 */
export function getPacksBucket(): R2Bucket {
  const ctx = getOptionalRequestContext()
  const cfGlobal = (globalThis as any).__cloudflareRequestContext
  const bucket = (ctx?.env as any)?.PACKS_BUCKET ?? cfGlobal?.env?.PACKS_BUCKET
  if (!bucket) {
    throw new Error(
      'Configuração ausente: binding R2 "PACKS_BUCKET" não está disponível neste ambiente'
    )
  }
  return bucket as R2Bucket
}
