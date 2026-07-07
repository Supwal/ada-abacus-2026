export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSession } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const rows = await sql`
      SELECT id, name, address, city, state, phone,
             contact_person as "contactPerson", working_days as "workingDays",
             open_time as "openTime", close_time as "closeTime", notes,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM locations
      WHERE id = ${params.id} AND user_id = ${users[0].id}
      LIMIT 1
    `
    if (!rows.length) return NextResponse.json({ error: 'Local não encontrado' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao buscar local: ${msg}` }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const userId = users[0].id
    const body = await request.json()
    const { name, address, city, state, phone, contactPerson, workingDays, openTime, closeTime, notes } = body

    await sql`
      UPDATE locations SET
        name = ${name},
        address = ${address || ''},
        city = ${city || null},
        state = ${state || null},
        phone = ${phone || null},
        contact_person = ${contactPerson || null},
        working_days = ${workingDays || null},
        open_time = ${openTime || null},
        close_time = ${closeTime || null},
        notes = ${notes || null},
        updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${userId}
    `

    const rows = await sql`
      SELECT id, name, address, city, state, phone,
             contact_person as "contactPerson", working_days as "workingDays",
             open_time as "openTime", close_time as "closeTime", notes,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM locations WHERE id = ${params.id} LIMIT 1
    `
    return NextResponse.json(rows[0] ?? { error: 'Local não encontrado' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao atualizar local: ${msg}` }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    await sql`DELETE FROM locations WHERE id = ${params.id} AND user_id = ${users[0].id}`
    return NextResponse.json({ message: 'Local excluído com sucesso' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao excluir local: ${msg}` }, { status: 500 })
  }
}
