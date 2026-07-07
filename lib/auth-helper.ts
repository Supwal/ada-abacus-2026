import { NextRequest } from 'next/server'
import { decode } from 'next-auth/jwt'
import { getSecret } from '@/lib/db'

const COOKIE = 'next-auth.session-token'
const SECURE_COOKIE = '__Secure-next-auth.session-token'

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
