export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const NEON_URL = 'postgresql://neondb_owner:npg_7VF3ZIiwaLWv@ep-cold-king-ac3p3xlf.sa-east-1.aws.neon.tech/neondb?sslmode=require'

export async function GET() {
  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(NEON_URL)
    const result = await sql`SELECT COUNT(*) as total FROM users`
    return Response.json({ ok: true, users: result[0] })
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
