export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { decode } from 'next-auth/jwt'
import { makePrisma } from '@/lib/db'

const COOKIE = 'next-auth.session-token'
const SECURE_COOKIE = '__Secure-next-auth.session-token'
const SECRET = process.env.NEXTAUTH_SECRET ?? '3fE76BVTaFYVdBDBviIZfZnYvm0AcQTp'

async function getSession(req: NextRequest) {
  const token =
    req.cookies.get(SECURE_COOKIE)?.value ||
    req.cookies.get(COOKIE)?.value
  if (!token) return null
  try {
    return await decode({ token, secret: SECRET })
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const prisma = makePrisma()
  try {
    const session = await getSession(request)
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.email as string } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const locations = await prisma.location.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(locations)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao buscar locais: ${msg}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const prisma = makePrisma()
  try {
    const session = await getSession(request)
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.email as string } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const body = await request.json()
    const {
      name,
      address,
      city,
      state,
      phone,
      contactPerson,
      workingDays,
      openTime,
      closeTime,
      notes,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome do local é obrigatório' }, { status: 400 })
    }

    const location = await prisma.location.create({
      data: {
        id: `loc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name,
        address: address || '',
        city: city || null,
        state: state || null,
        phone: phone || null,
        contactPerson: contactPerson || null,
        workingDays: workingDays || null,
        openTime: openTime || null,
        closeTime: closeTime || null,
        notes: notes || null,
        userId: user.id,
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao criar local: ${msg}` }, { status: 500 })
  }
}
