export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { decode } from 'next-auth/jwt'
import { neon } from '@neondatabase/serverless'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

const NEON_URL = 'postgresql://neondb_owner:npg_7VF3ZIiwaLWv@ep-cold-king-ac3p3xlf.sa-east-1.aws.neon.tech/neondb?sslmode=require'

function getDb() {
  try {
    const ctx = getOptionalRequestContext()
    const cfGlobal = (globalThis as any).__cloudflareRequestContext
    const url = (ctx?.env as any)?.DATABASE_URL ?? cfGlobal?.env?.DATABASE_URL ?? process.env.DATABASE_URL ?? NEON_URL
    return neon(url)
  } catch { return neon(NEON_URL) }
}

function getSecret(): string {
  try {
    const ctx = getOptionalRequestContext()
    return (ctx?.env as any)?.NEXTAUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? '3fE76BVTaFYVdBDBviIZfZnYvm0AcQTp'
  } catch { return process.env.NEXTAUTH_SECRET ?? '3fE76BVTaFYVdBDBviIZfZnYvm0AcQTp' }
}

const COOKIE = 'next-auth.session-token'
const SECURE_COOKIE = '__Secure-next-auth.session-token'
const ADMIN_EMAILS = ['adaadm@ada.local']

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SECURE_COOKIE)?.value || req.cookies.get(COOKIE)?.value
  if (!token) return null
  try { return await decode({ token, secret: getSecret() }) } catch { return null }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const email = session.email as string

    // Admin tem acesso total à voz sem precisar de assinatura
    if (ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({
        id: 'admin',
        planType: 'completo',
        price: 0,
        status: 'ativo',
        voiceEnabled: true,
        startDate: new Date().toISOString(),
        endDate: null,
      })
    }

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const userId = users[0].id
    const subs = await sql`
      SELECT id, plan_type as "planType", price, status, voice_enabled as "voiceEnabled",
             start_date as "startDate", end_date as "endDate"
      FROM subscriptions WHERE user_id = ${userId} LIMIT 1
    `

    if (!subs.length) {
      return NextResponse.json({
        id: null,
        planType: 'gratuito',
        price: 0,
        status: 'ativo',
        voiceEnabled: false,
        startDate: new Date().toISOString(),
        endDate: null,
      })
    }

    return NextResponse.json(subs[0])
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao buscar assinatura: ${msg}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const userId = users[0].id
    const body = await request.json()
    const { planType, price } = body

    if (!planType || price === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const voiceEnabled = planType === 'completo'
    const existing = await sql`SELECT id FROM subscriptions WHERE user_id = ${userId} LIMIT 1`

    if (existing.length) {
      await sql`
        UPDATE subscriptions SET
          plan_type = ${planType}, price = ${parseFloat(price)},
          status = 'ativo', voice_enabled = ${voiceEnabled},
          start_date = NOW(), end_date = NULL, updated_at = NOW()
        WHERE user_id = ${userId}
      `
    } else {
      const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      await sql`
        INSERT INTO subscriptions (id, user_id, plan_type, price, status, voice_enabled, start_date, created_at, updated_at)
        VALUES (${id}, ${userId}, ${planType}, ${parseFloat(price)}, 'ativo', ${voiceEnabled}, NOW(), NOW(), NOW())
      `
    }

    const rows = await sql`
      SELECT id, plan_type as "planType", price, status, voice_enabled as "voiceEnabled",
             start_date as "startDate", end_date as "endDate"
      FROM subscriptions WHERE user_id = ${userId} LIMIT 1
    `
    return NextResponse.json(rows[0])
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao processar assinatura: ${msg}` }, { status: 500 })
  }
}
