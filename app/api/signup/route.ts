export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/password'
import { getDb } from '@/lib/db'
import { normalizeEmail, isValidEmail, passwordErrorMessage } from '@/lib/validation'
import { TERMS_VERSION } from '@/lib/legal'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password, firstName, lastName, phone, profession, acceptedTerms } = body

    // --- E-mail: formato válido e sempre normalizado (minúsculas, sem espaços).
    const email = normalizeEmail(body.email)
    if (!email) {
      return NextResponse.json({ error: 'Informe o e-mail.' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'E-mail inválido. Confira o endereço digitado (ex.: nome@provedor.com).' },
        { status: 400 }
      )
    }

    // --- Senha
    const erroSenha = passwordErrorMessage(password)
    if (erroSenha) {
      return NextResponse.json({ error: erroSenha }, { status: 400 })
    }

    // --- Aceite dos termos e da política de privacidade (LGPD)
    if (acceptedTerms !== true) {
      return NextResponse.json(
        { error: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.' },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Comparação sem diferenciar maiúsculas: evita duas contas para o mesmo e-mail.
    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${email} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Já existe uma conta com este e-mail.' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const name = `${firstName ?? ''} ${lastName ?? ''}`.trim()
    const id = crypto.randomUUID()

    const result = await sql`
      INSERT INTO users (
        id, email, hashed_password, first_name, last_name, phone, profession, name,
        terms_accepted_at, terms_version, privacy_accepted_at,
        created_at, updated_at
      )
      VALUES (
        ${id}, ${email}, ${hashedPassword}, ${firstName ?? null}, ${lastName ?? null},
        ${phone ?? null}, ${profession ?? null}, ${name || null},
        NOW(), ${TERMS_VERSION}, NOW(),
        NOW(), NOW()
      )
      RETURNING id, email, name
    `

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: result[0],
    })
  } catch (error) {
    // Detalhe técnico fica no log; o cliente recebe mensagem genérica.
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Signup error:', msg)
    return NextResponse.json(
      { error: 'Não foi possível criar a conta agora. Tente novamente em instantes.' },
      { status: 500 }
    )
  }
}
