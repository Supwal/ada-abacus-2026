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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = makePrisma()
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.email as string } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const location = await prisma.location.findFirst({ where: { id: params.id, userId: user.id } })
    if (!location) return NextResponse.json({ error: 'Local não encontrado' }, { status: 404 })

    return NextResponse.json(location)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao buscar local: ${msg}` }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = makePrisma()
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.email as string } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const body = await request.json()
    const {
      name, address, city, state, phone,
      contactPerson, workingDays, openTime, closeTime, notes,
    } = body

    const result = await prisma.location.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        name,
        address: address || '',
        city: city ?? null,
        state: state ?? null,
        phone: phone ?? null,
        contactPerson: contactPerson ?? null,
        workingDays: workingDays ?? null,
        openTime: openTime ?? null,
        closeTime: closeTime ?? null,
        notes: notes ?? null,
      },
    })

    if (result.count === 0) return NextResponse.json({ error: 'Local não encontrado' }, { status: 404 })

    const updated = await prisma.location.findUnique({ where: { id: params.id } })
    return NextResponse.json(updated)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao atualizar local: ${msg}` }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = makePrisma()
  try {
    const session = await getSession(request)
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.email as string } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    await prisma.location.deleteMany({ where: { id: params.id, userId: user.id } })
    return NextResponse.json({ message: 'Local excluído com sucesso' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Erro ao excluir local: ${msg}` }, { status: 500 })
  }
}
