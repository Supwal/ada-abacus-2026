export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword } from '@/lib/password'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

export const dynamic = 'force-dynamic'

const NEON_URL = 'postgresql://neondb_owner:npg_7VF3ZIiwaLWv@ep-cold-king-ac3p3xlf.sa-east-1.aws.neon.tech/neondb?sslmode=require'

function getDb() {
  try {
    const ctx = getOptionalRequestContext()
    const cfGlobal = (globalThis as any).__cloudflareRequestContext
    const url =
      (ctx?.env as any)?.DATABASE_URL ??
      cfGlobal?.env?.DATABASE_URL ??
      process.env.DATABASE_URL ??
      NEON_URL
    return neon(url)
  } catch {
    return neon(NEON_URL)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, profession } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const sql = getDb()

    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Usuário já existe com este email' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const name = `${firstName ?? ''} ${lastName ?? ''}`.trim()
    const id = crypto.randomUUID()

    const result = await sql`
      INSERT INTO users (id, email, hashed_password, first_name, last_name, phone, profession, name, created_at, updated_at)
      VALUES (${id}, ${email}, ${hashedPassword}, ${firstName ?? null}, ${lastName ?? null}, ${phone ?? null}, ${profession ?? null}, ${name || null}, NOW(), NOW())
      RETURNING id, email, name
    `

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: result[0],
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Signup error:', msg)
    return NextResponse.json({ error: `Erro: ${msg}` }, { status: 500 })
  }
}
