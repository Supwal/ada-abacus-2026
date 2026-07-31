export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSession } from '@/lib/db'
import { TERMS_VERSION } from '@/lib/legal'

export const dynamic = 'force-dynamic'

/**
 * Aceite dos Termos de Uso e da Política de Privacidade.
 *
 * Contas criadas antes destes documentos (e contas de antes de uma nova versão)
 * ficam com o aceite pendente — o app pede a confirmação no próximo acesso e
 * registra data e versão, que é a prova exigida pela LGPD.
 */

/** GET: informa se o usuário logado já aceitou a versão atual. */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sql = getDb()
    const rows = await sql`
      SELECT terms_accepted_at AS "termsAcceptedAt", terms_version AS "termsVersion"
      FROM users WHERE LOWER(email) = ${(session.email as string).toLowerCase()} LIMIT 1
    `
    if (!rows.length) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const aceito = !!rows[0].termsAcceptedAt && rows[0].termsVersion === TERMS_VERSION

    return NextResponse.json({
      accepted: aceito,
      currentVersion: TERMS_VERSION,
      acceptedVersion: rows[0].termsVersion ?? null,
      acceptedAt: rows[0].termsAcceptedAt ?? null,
    })
  } catch (error) {
    console.error('Consent GET error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Erro ao verificar o aceite.' }, { status: 500 })
  }
}

/** POST: registra o aceite da versão atual. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    if (body?.accepted !== true) {
      return NextResponse.json(
        { error: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.' },
        { status: 400 }
      )
    }

    const sql = getDb()
    const rows = await sql`
      UPDATE users
      SET terms_accepted_at = NOW(),
          terms_version = ${TERMS_VERSION},
          privacy_accepted_at = NOW(),
          updated_at = NOW()
      WHERE LOWER(email) = ${(session.email as string).toLowerCase()}
      RETURNING id
    `
    if (!rows.length) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ accepted: true, version: TERMS_VERSION })
  } catch (error) {
    console.error('Consent POST error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Erro ao registrar o aceite.' }, { status: 500 })
  }
}
