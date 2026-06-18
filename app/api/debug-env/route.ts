export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

export async function GET(req: NextRequest) {
  const ctx = getOptionalRequestContext()
  const cfGlobal = (globalThis as any).__cloudflareRequestContext

  const ctxEnvKeys = ctx?.env ? Object.keys(ctx.env as Record<string, unknown>) : []
  const globalEnvKeys = cfGlobal?.env ? Object.keys(cfGlobal.env as Record<string, unknown>) : []

  const info = {
    ctx_exists: !!ctx,
    ctx_env_keys: ctxEnvKeys,
    ctx_has_DATABASE_URL: !!(ctx?.env as any)?.DATABASE_URL,
    ctx_DATABASE_URL_prefix: ((ctx?.env as any)?.DATABASE_URL as string)?.slice(0, 30) ?? null,
    global_ctx_exists: !!cfGlobal,
    global_env_keys: globalEnvKeys,
    global_has_DATABASE_URL: !!cfGlobal?.env?.DATABASE_URL,
    process_env_DATABASE_URL_prefix: process.env.DATABASE_URL?.slice(0, 30) ?? null,
    process_env_NEXTAUTH_SECRET_exists: !!process.env.NEXTAUTH_SECRET,
  }

  return NextResponse.json(info)
}
