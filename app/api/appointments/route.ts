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
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    let appointments
    if (startDate && endDate && status && status !== 'todos') {
      appointments = await sql`
        SELECT a.id, a.date, a.start_time as "startTime", a.end_time as "endTime",
               a.status, a.notes, a.value, a.paid, a.created_at as "createdAt",
               a.client_id as "clientId", a.service_id as "serviceId", a.location_id as "locationId",
               c.name as "clientName", c.phone as "clientPhone",
               s.name as "serviceName", s.duration as "serviceDuration",
               l.name as "locationName"
        FROM appointments a
        LEFT JOIN clients c ON c.id = a.client_id
        LEFT JOIN services s ON s.id = a.service_id
        LEFT JOIN locations l ON l.id = a.location_id
        WHERE a.user_id = ${userId}
          AND a.date >= ${startDate + 'T00:00:00'}::timestamp
          AND a.date <= ${endDate + 'T23:59:59.999'}::timestamp
          AND a.status = ${status}
        ORDER BY a.date DESC, a.start_time DESC
      `
    } else if (startDate && endDate) {
      appointments = await sql`
        SELECT a.id, a.date, a.start_time as "startTime", a.end_time as "endTime",
               a.status, a.notes, a.value, a.paid, a.created_at as "createdAt",
               a.client_id as "clientId", a.service_id as "serviceId", a.location_id as "locationId",
               c.name as "clientName", c.phone as "clientPhone",
               s.name as "serviceName", s.duration as "serviceDuration",
               l.name as "locationName"
        FROM appointments a
        LEFT JOIN clients c ON c.id = a.client_id
        LEFT JOIN services s ON s.id = a.service_id
        LEFT JOIN locations l ON l.id = a.location_id
        WHERE a.user_id = ${userId}
          AND a.date >= ${startDate + 'T00:00:00'}::timestamp
          AND a.date <= ${endDate + 'T23:59:59.999'}::timestamp
        ORDER BY a.date DESC, a.start_time DESC
      `
    } else if (status && status !== 'todos') {
      appointments = await sql`
        SELECT a.id, a.date, a.start_time as "startTime", a.end_time as "endTime",
               a.status, a.notes, a.value, a.paid, a.created_at as "createdAt",
               a.client_id as "clientId", a.service_id as "serviceId", a.location_id as "locationId",
               c.name as "clientName", c.phone as "clientPhone",
               s.name as "serviceName", s.duration as "serviceDuration",
               l.name as "locationName"
        FROM appointments a
        LEFT JOIN clients c ON c.id = a.client_id
        LEFT JOIN services s ON s.id = a.service_id
        LEFT JOIN locations l ON l.id = a.location_id
        WHERE a.user_id = ${userId} AND a.status = ${status}
        ORDER BY a.date DESC, a.start_time DESC
      `
    } else {
      appointments = await sql`
        SELECT a.id, a.date, a.start_time as "startTime", a.end_time as "endTime",
               a.status, a.notes, a.value, a.paid, a.created_at as "createdAt",
               a.client_id as "clientId", a.service_id as "serviceId", a.location_id as "locationId",
               c.name as "clientName", c.phone as "clientPhone",
               s.name as "serviceName", s.duration as "serviceDuration",
               l.name as "locationName"
        FROM appointments a
        LEFT JOIN clients c ON c.id = a.client_id
        LEFT JOIN services s ON s.id = a.service_id
        LEFT JOIN locations l ON l.id = a.location_id
        WHERE a.user_id = ${userId}
        ORDER BY a.date DESC, a.start_time DESC
      `
    }

    return NextResponse.json(appointments)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao buscar agendamentos: ${msg}` }, { status: 500 })
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
    const { date, startTime, endTime, status, notes, value, paid, clientId, serviceId, locationId } = body

    const dateToSave = date + 'T12:00:00'
    const id = `apt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    await sql`
      INSERT INTO appointments (
        id, date, start_time, end_time, status, notes, value, paid,
        user_id, client_id, service_id, location_id, created_at, updated_at
      ) VALUES (
        ${id},
        ${dateToSave}::timestamp,
        ${startTime || null},
        ${endTime || null},
        ${status || 'scheduled'},
        ${notes || null},
        ${value ? parseFloat(value) : null},
        ${paid || false},
        ${userId},
        ${clientId || null},
        ${serviceId || null},
        ${locationId || null},
        NOW(), NOW()
      )
    `

    const rows = await sql`
      SELECT a.id, a.date, a.start_time as "startTime", a.end_time as "endTime",
             a.status, a.notes, a.value, a.paid, a.created_at as "createdAt",
             a.client_id as "clientId", a.service_id as "serviceId", a.location_id as "locationId",
             c.name as "clientName", c.phone as "clientPhone",
             s.name as "serviceName", s.duration as "serviceDuration",
             l.name as "locationName"
      FROM appointments a
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN services s ON s.id = a.service_id
      LEFT JOIN locations l ON l.id = a.location_id
      WHERE a.id = ${id}
      LIMIT 1
    `

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao criar agendamento: ${msg}` }, { status: 500 })
  }
}
