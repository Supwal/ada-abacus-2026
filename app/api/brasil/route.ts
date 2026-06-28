import { neon } from '@neondatabase/serverless'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sigla = searchParams.get('sigla')
  const q     = searchParams.get('q')

  try {
    const sql = neon(process.env.NEON_URL!)

    // Autocomplete: busca por nome de cidade com UF
    if (q && q.trim().length >= 2) {
      const termo = q.trim().toLowerCase()
      const sugestoes = await sql`
        SELECT c.nome, e.sigla,
               c.nome || ' - ' || e.sigla AS label
        FROM brasil_cidades c
        JOIN brasil_estados e ON e.id = c.estado_id
        WHERE lower(c.nome) LIKE lower(${termo + '%'})
           OR lower(c.nome) LIKE lower(${'%' + termo + '%'})
        ORDER BY
          CASE WHEN lower(c.nome) LIKE lower(${termo + '%'}) THEN 0 ELSE 1 END,
          c.capital DESC,
          c.nome
        LIMIT 10
      `
      return Response.json({ sugestoes })
    }

    if (sigla) {
      const cidades = await sql`
        SELECT c.id, c.nome, c.capital, e.sigla, e.nome AS estado
        FROM brasil_cidades c
        JOIN brasil_estados e ON e.id = c.estado_id
        WHERE e.sigla = ${sigla.toUpperCase()}
        ORDER BY c.capital DESC, c.nome
      `
      return Response.json({ cidades })
    }

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
