import { neon } from '@neondatabase/serverless'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sigla = searchParams.get('sigla')
  const q     = searchParams.get('q')

  try {
    const sql = neon(process.env.NEON_URL!)

    // Autocomplete: busca sem acento via translate() — não precisa de extensão
    if (q && q.trim().length >= 2) {
      const termo = q.trim()
      const sugestoes = await sql`
        SELECT c.nome, e.sigla
        FROM brasil_cidades c
        JOIN brasil_estados e ON e.id = c.estado_id
        WHERE translate(lower(c.nome),
                'áàãâäéèêëíìîïóòõôöúùûüçñ',
                'aaaaaaeeeeiiiiooooouuuucn')
              LIKE translate(lower(${termo + '%'}),
                'áàãâäéèêëíìîïóòõôöúùûüçñ',
                'aaaaaaeeeeiiiiooooouuuucn')
        ORDER BY c.capital DESC, c.nome
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
