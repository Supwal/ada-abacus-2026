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

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SECURE_COOKIE)?.value || req.cookies.get(COOKIE)?.value
  if (!token) return null
  try { return await decode({ token, secret: getSecret() }) } catch { return null }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

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
      WHERE a.id = ${params.id} AND a.user_id = ${users[0].id}
      LIMIT 1
    `
    if (!rows.length) return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao buscar agendamento: ${msg}` }, { status: 500 })
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
    const { date, startTime, endTime, status, notes, value, paid, clientId, serviceId, locationId } = body

    await sql`
      UPDATE appointments SET
        date = COALESCE(${date ? (date + 'T12:00:00') : null}::timestamp, date),
        start_time = COALESCE(${startTime ?? null}, start_time),
        end_time = COALESCE(${endTime ?? null}, end_time),
        status = COALESCE(${status ?? null}, status),
        notes = COALESCE(${notes ?? null}, notes),
        value = COALESCE(${value != null ? parseFloat(value) : null}, value),
        paid = COALESCE(${paid != null ? paid : null}, paid),
        client_id = COALESCE(${clientId ?? null}, client_id),
        service_id = COALESCE(${serviceId ?? null}, service_id),
        location_id = COALESCE(${locationId ?? null}, location_id),
        updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${userId}
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
      WHERE a.id = ${params.id}
      LIMIT 1
    `
    if (!rows.length) return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao atualizar agendamento: ${msg}` }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    await sql`DELETE FROM appointments WHERE id = ${params.id} AND user_id = ${users[0].id}`
    return NextResponse.json({ message: 'Agendamento excluído com sucesso' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao excluir agendamento: ${msg}` }, { status: 500 })
  }
}
