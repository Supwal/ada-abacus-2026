import { NextRequest } from 'next/server'
import { decode } from 'next-auth/jwt'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

const COOKIE = 'next-auth.session-token'
const SECURE_COOKIE = '__Secure-next-auth.session-token'
const FALLBACK_SECRET = '3fE76BVTaFYVdBDBviIZfZnYvm0AcQTp'

function getSecret(): string {
  try {
    const ctx = getOptionalRequestContext()
    return ((ctx?.env as any)?.NEXTAUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? FALLBACK_SECRET) as string
  } catch {
    return process.env.NEXTAUTH_SECRET ?? FALLBACK_SECRET
  }
}

export async function getAuthToken(req: NextRequest) {
  const tokenStr =
    req.cookies.get(SECURE_COOKIE)?.value ||
    req.cookies.get(COOKIE)?.value

  if (!tokenStr) return null

  try {
    const payload = await decode({ token: tokenStr, secret: getSecret() })
    return payload
  } catch {
    return null
  }
}
