export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, profession } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe com este email' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        phone,
        profession,
        name: `${firstName} ${lastName}`.trim(),
      },
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Signup error:', msg)
    return NextResponse.json({ error: `Erro: ${msg}` }, { status: 500 })
  }
}
