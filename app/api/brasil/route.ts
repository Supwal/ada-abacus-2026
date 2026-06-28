import { neon } from '@neondatabase/serverless'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sigla = searchParams.get('sigla') // filtra cidades por UF

  try {
    const sql = neon(process.env.NEON_URL!)

    if (sigla) {
      // Retorna cidades de um estado específico
      const cidades = await sql`
        SELECT c.id, c.nome, c.capital, e.sigla, e.nome AS estado
        FROM brasil_cidades c
        JOIN brasil_estados e ON e.id = c.estado_id
        WHERE e.sigla = ${sigla.toUpperCase()}
        ORDER BY c.capital DESC, c.nome
      `
      return Response.json({ cidades })
    }

    // Retorna todos os estados
    const estados = await sql`
      SELECT id, sigla, nome, regiao
      FROM brasil_estados
      ORDER BY nome
    `
    return Response.json({ estados })

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
