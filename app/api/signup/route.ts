export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/password'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

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
