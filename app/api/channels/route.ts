export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSession } from '@/lib/db'
import {
  CHANNEL_DEFS,
  channelErrorMessage,
  normalizeHandle,
  type ChannelType,
} from '@/lib/channels'

export const dynamic = 'force-dynamic'

const TIPOS_VALIDOS = CHANNEL_DEFS.map((c) => c.type) as string[]
const MAX_GREETING = 500

/** Resolve o dono da sessão. Devolve null quando não há usuário. */
async function resolverUserId(sql: ReturnType<typeof getDb>, email: string) {
  const users = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`
  return users.length ? (users[0].id as string) : null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const userId = await resolverUserId(sql, session.email as string)
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const rows = await sql`
      SELECT type, handle, greeting, active, sort_order as "sortOrder"
      FROM channels
      WHERE user_id = ${userId}
      ORDER BY sort_order, type
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Erro ao buscar canais:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Erro ao buscar canais' }, { status: 500 })
  }
}

/**
 * Salva os canais da tela de uma vez.
 *
 * Canal com identificador vazio é removido — é assim que a profissional
 * desconfigura um canal sem precisar de um botão de excluir.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const sql = getDb()
    const userId = await resolverUserId(sql, session.email as string)
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const body = await request.json()
    const recebidos = Array.isArray(body?.channels) ? body.channels : null
    if (!recebidos) {
      return NextResponse.json({ error: 'Formato inválido: esperado { channels: [...] }' }, { status: 400 })
    }
    if (recebidos.length > CHANNEL_DEFS.length) {
      return NextResponse.json({ error: 'Canais demais na requisição' }, { status: 400 })
    }

    // --- Valida tudo ANTES de gravar qualquer coisa.
    const paraGravar: {
      type: ChannelType
      handle: string
      greeting: string | null
      active: boolean
      sortOrder: number
    }[] = []
    const paraApagar: ChannelType[] = []
    const vistos = new Set<string>()

    for (const item of recebidos) {
      const type = String(item?.type || '')
      if (!TIPOS_VALIDOS.includes(type)) {
        return NextResponse.json({ error: `Canal desconhecido: ${type}` }, { status: 400 })
      }
      if (vistos.has(type)) {
        return NextResponse.json({ error: `Canal repetido: ${type}` }, { status: 400 })
      }
      vistos.add(type)

      const tipo = type as ChannelType
      const handle = normalizeHandle(tipo, String(item?.handle ?? ''))

      if (!handle) {
        paraApagar.push(tipo)
        continue
      }

      const erro = channelErrorMessage(tipo, handle)
      if (erro) {
        return NextResponse.json({ error: `${type}: ${erro}` }, { status: 400 })
      }

      const greeting = typeof item?.greeting === 'string' ? item.greeting.trim().slice(0, MAX_GREETING) : ''
      paraGravar.push({
        type: tipo,
        handle,
        greeting: greeting || null,
        active: item?.active !== false,
        sortOrder: Number.isInteger(item?.sortOrder) ? item.sortOrder : 0,
      })
    }

    // --- Grava. O índice único (user_id, type) permite atualizar em vez de duplicar.
    for (const c of paraGravar) {
      const id = `ch_${userId.slice(0, 8)}_${c.type}`
      await sql`
        INSERT INTO channels (id, user_id, type, handle, greeting, active, sort_order, created_at, updated_at)
        VALUES (${id}, ${userId}, ${c.type}, ${c.handle}, ${c.greeting}, ${c.active}, ${c.sortOrder}, NOW(), NOW())
        ON CONFLICT (user_id, type) DO UPDATE SET
          handle     = EXCLUDED.handle,
          greeting   = EXCLUDED.greeting,
          active     = EXCLUDED.active,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      `
    }

    for (const tipo of paraApagar) {
      await sql`DELETE FROM channels WHERE user_id = ${userId} AND type = ${tipo}`
    }

    const rows = await sql`
      SELECT type, handle, greeting, active, sort_order as "sortOrder"
      FROM channels
      WHERE user_id = ${userId}
      ORDER BY sort_order, type
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Erro ao salvar canais:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Erro ao salvar canais' }, { status: 500 })
  }
}
