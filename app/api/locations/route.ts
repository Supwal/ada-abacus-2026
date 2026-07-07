export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSession } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const userId = users[0].id
    const locations = await sql`
      SELECT id, name, address, city, state, phone, contact_person as "contactPerson",
             working_days as "workingDays", open_time as "openTime", close_time as "closeTime",
             notes, created_at as "createdAt", updated_at as "updatedAt"
      FROM locations
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return NextResponse.json(locations)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao buscar locais: ${msg}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const userId = users[0].id
    const body = await request.json()
    const { name, address, city, state, phone, contactPerson, workingDays, openTime, closeTime, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome do local é obrigatório' }, { status: 400 })
    }

    const id = `loc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    const rows = await sql`
      INSERT INTO locations (
        id, name, address, city, state, phone,
        contact_person, working_days, open_time, close_time, notes, user_id,
        created_at, updated_at
      ) VALUES (
        ${id},
        ${name},
        ${address || ''},
        ${city || null},
        ${state || null},
        ${phone || null},
        ${contactPerson || null},
        ${workingDays || null},
        ${openTime || null},
        ${closeTime || null},
        ${notes || null},
        ${userId},
        NOW(), NOW()
      )
      RETURNING id, name, address, city, state, phone,
        contact_person as "contactPerson", working_days as "workingDays",
        open_time as "openTime", close_time as "closeTime", notes,
        created_at as "createdAt", updated_at as "updatedAt"
    `

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao criar local: ${msg}` }, { status: 500 })
  }
}
