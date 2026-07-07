export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSession } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const services = await sql`
      SELECT id, name, duration, price, description, created_at as "createdAt", updated_at as "updatedAt"
      FROM services WHERE user_id = ${users[0].id} ORDER BY created_at DESC
    `
    return NextResponse.json(services)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao buscar serviços: ${msg}` }, { status: 500 })
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
    const { id, name, duration, price, description } = body

    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

    const serviceId = id || `svc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const rows = await sql`
      INSERT INTO services (id, name, duration, price, description, user_id, created_at, updated_at)
      VALUES (
        ${serviceId}, ${name}, ${parseInt(duration) || 60},
        ${parseFloat(price) || 0}, ${description || ''}, ${userId}, NOW(), NOW()
      )
      RETURNING id, name, duration, price, description, created_at as "createdAt", updated_at as "updatedAt"
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao criar serviço: ${msg}` }, { status: 500 })
  }
}
