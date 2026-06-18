export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { encode, decode } from 'next-auth/jwt'
import { verifyPassword } from '@/lib/password'
import { makePrisma } from '@/lib/db'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

function getSecret(): string {
  const ctx = getOptionalRequestContext()
  return ((ctx?.env as any)?.NEXTAUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? '') as string
}

const COOKIE = 'next-auth.session-token'
const SECURE_COOKIE = '__Secure-next-auth.session-token'
const MAX_AGE = 30 * 24 * 60 * 60

function getSessionCookie(req: NextRequest) {
  return req.cookies.get(SECURE_COOKIE)?.value || req.cookies.get(COOKIE)?.value
}

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function GET(req: NextRequest, { params }: { params: { nextauth: string[] } }) {
  const prisma = makePrisma()
  const [action] = params.nextauth

  if (action === 'providers') {
    return NextResponse.json({
      credentials: {
        id: 'credentials',
        name: 'Credentials',
        type: 'credentials',
        signinUrl: '/api/auth/signin/credentials',
        callbackUrl: '/api/auth/callback/credentials',
      },
    })
  }

  if (action === 'csrf') {
    return NextResponse.json({ csrfToken: crypto.randomUUID() })
  }

  if (action === 'session') {
    const tokenStr = getSessionCookie(req)
    if (!tokenStr) return NextResponse.json({})

    const payload = await decode({
      token: tokenStr,
      secret: getSecret(),
    })
    if (!payload) return NextResponse.json({})

    const exp = (payload as any).exp
    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        firstName: (payload as any).firstName,
        lastName: (payload as any).lastName,
        phone: (payload as any).phone,
        profession: (payload as any).profession,
      },
      expires: exp ? new Date(exp * 1000).toISOString() : new Date(Date.now() + MAX_AGE * 1000).toISOString(),
    })
  }

  return NextResponse.json({})
}

export async function POST(req: NextRequest, { params }: { params: { nextauth: string[] } }) {
  const prisma = makePrisma()
  const segments = params.nextauth

  if (segments[0] === 'callback' && segments[1] === 'credentials') {
    let email = ''
    let password = ''
    let callbackUrl = '/'
    let isJson = false

    const ct = req.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const body = await req.json()
      email = body.email || ''
      password = body.password || ''
      callbackUrl = body.callbackUrl || '/'
      isJson = body.json === true
    } else {
      const body = await req.formData()
      email = (body.get('email') as string) || ''
      password = (body.get('password') as string) || ''
      callbackUrl = (body.get('callbackUrl') as string) || '/'
      isJson = body.get('json') === 'true'
    }

    const fail = () =>
      isJson
        ? NextResponse.json({ ok: false, error: 'CredentialsSignin', status: 401, url: null })
        : NextResponse.redirect(new URL('/auth/login?error=CredentialsSignin', req.url))

    if (!email || !password) return fail()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.hashedPassword) return fail()

    const valid = await verifyPassword(password, user.hashedPassword)
    if (!valid) return fail()

    const jwtToken = await encode({
      secret: getSecret(),
      maxAge: MAX_AGE,
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profession: user.profession,
      },
    })

    if (isJson) {
      const res = NextResponse.json({ ok: true, status: 200, url: callbackUrl, error: null })
      setSessionCookie(res, jwtToken)
      return res
    }

    const res = NextResponse.redirect(new URL(callbackUrl, req.url))
    setSessionCookie(res, jwtToken)
    return res
  }

  if (segments[0] === 'signout') {
    let callbackUrl = '/auth/login'
    let isJson = false
    try {
      const ct = req.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        const body = await req.json()
        callbackUrl = body.callbackUrl || callbackUrl
        isJson = body.json === true
      } else {
        const body = await req.formData()
        callbackUrl = (body.get('callbackUrl') as string) || callbackUrl
        isJson = body.get('json') === 'true'
      }
    } catch {}

    if (isJson) {
      const res = NextResponse.json({ url: callbackUrl })
      res.cookies.delete(COOKIE)
      res.cookies.delete(SECURE_COOKIE)
      return res
    }

    const res = NextResponse.redirect(new URL(callbackUrl, req.url))
    res.cookies.delete(COOKIE)
    res.cookies.delete(SECURE_COOKIE)
    return res
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
