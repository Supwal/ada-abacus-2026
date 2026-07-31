const ITERATIONS = 100_000
const KEY_LEN = 32

async function getKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, keyMaterial, KEY_LEN * 8)
  return new Uint8Array(bits)
}

function toHex(buf: Uint8Array) {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string) {
  const arr = hex.match(/.{2}/g) || []
  return new Uint8Array(arr.map(h => parseInt(h, 16)))
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await getKey(password, salt)
  return `pbkdf2:${toHex(salt)}:${toHex(hash)}`
}

/**
 * Comparação em tempo constante: percorre sempre todos os bytes, para que o
 * tempo de resposta não revele quantos caracteres do hash foram acertados.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('pbkdf2:')) return false
  const [, saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = fromHex(saltHex)
  const hash = await getKey(password, salt)
  return timingSafeEqual(toHex(hash), hashHex)
}
