export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSession } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()

    // Buscar usuário
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    const userId = users[0].id

    // Parâmetros de filtro
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'todo-periodo'
    const estado = searchParams.get('estado') || ''
    const cidade = searchParams.get('cidade') || ''
    const localId = searchParams.get('local') || ''

    // Montar filtro de data
    let dataInicio: string | null = null
    const now = new Date()
    if (periodo === 'hoje') {
      dataInicio = now.toISOString().split('T')[0]
    } else if (periodo === 'semana') {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      dataInicio = d.toISOString().split('T')[0]
    } else if (periodo === 'mes') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1)
      dataInicio = d.toISOString().split('T')[0]
    } else if (periodo === 'ano') {
      dataInicio = `${now.getFullYear()}-01-01`
    }

    // Buscar agendamentos com joins para local
    const rows = await sql`
      SELECT
        a.id,
        a.status,
        a.price,
        a.date,
        a.location_id,
        l.name AS location_name,
        l.city AS location_city,
        l.state AS location_state
      FROM appointments a
      LEFT JOIN locations l ON a.location_id = l.id
      WHERE a.user_id = ${userId}
        ${dataInicio ? sql`AND a.date >= ${dataInicio}` : sql``}
        ${estado ? sql`AND LOWER(l.state) = LOWER(${estado})` : sql``}
        ${cidade ? sql`AND LOWER(l.city) = LOWER(${cidade})` : sql``}
        ${localId ? sql`AND a.location_id = ${localId}` : sql``}
      ORDER BY a.date DESC
    `

    // Buscar todos os locais do usuário (para o dropdown de filtro)
    const locaisRows = await sql`
      SELECT id, name, city, state
      FROM locations
      WHERE user_id = ${userId}
      ORDER BY name ASC
    `

    // Agrupar por local
    const locaisMap: Record<string, { id: string; nome: string; cidade: string; estado: string; agendamentos: number; valor: number }> = {}
    const cidadesMap: Record<string, { nome: string; estado: string; agendamentos: number; valor: number }> = {}
    const estadosMap: Record<string, { nome: string; agendamentos: number; valor: number }> = {}

    let totalAgendamentos = 0
    let receitaTotal = 0
    let confirmados = 0
    let pendentes = 0
    let cancelados = 0

    for (const row of rows) {
      totalAgendamentos++
      const preco = parseFloat(row.price || '0')
      receitaTotal += preco

      if (row.status === 'confirmado' || row.status === 'confirmed') confirmados++
      else if (row.status === 'cancelado' || row.status === 'cancelled') cancelados++
      else pendentes++

      const locNome = row.location_name || 'Sem Local'
      const locCidade = row.location_city || 'Sem Cidade'
      const locEstado = row.location_state || ''
      const locId = row.location_id || 'sem-local'

      // Por local
      if (!locaisMap[locId]) {
        locaisMap[locId] = { id: locId, nome: locNome, cidade: locCidade, estado: locEstado, agendamentos: 0, valor: 0 }
      }
      locaisMap[locId].agendamentos++
      locaisMap[locId].valor += preco

      // Por cidade
      if (locCidade) {
        if (!cidadesMap[locCidade]) {
          cidadesMap[locCidade] = { nome: locCidade, estado: locEstado, agendamentos: 0, valor: 0 }
        }
        cidadesMap[locCidade].agendamentos++
        cidadesMap[locCidade].valor += preco
      }

      // Por estado
      if (locEstado) {
        if (!estadosMap[locEstado]) {
          estadosMap[locEstado] = { nome: locEstado, agendamentos: 0, valor: 0 }
        }
        estadosMap[locEstado].agendamentos++
        estadosMap[locEstado].valor += preco
      }
    }

    const locaisData = Object.values(locaisMap).sort((a, b) => b.agendamentos - a.agendamentos)
    const cidadesData = Object.values(cidadesMap).sort((a, b) => b.agendamentos - a.agendamentos)
    const estadosData = Object.values(estadosMap).sort((a, b) => b.agendamentos - a.agendamentos)

    return NextResponse.json({
      totalAgendamentos,
      receitaTotal,
      ticketMedio: totalAgendamentos > 0 ? receitaTotal / totalAgendamentos : 0,
      confirmados,
      pendentes,
      cancelados,
      locaisData,
      cidadesData,
      estadosData,
      locaisDisponiveis: locaisRows,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro: ${msg}` }, { status: 500 })
  }
}
