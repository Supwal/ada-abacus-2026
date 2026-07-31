import type { getDb } from './db'

type SqlClient = ReturnType<typeof getDb>

/** Tabelas cujos ids chegam pelo corpo da requisição e precisam ser conferidos. */
export type OwnedTable = 'clients' | 'services' | 'locations'

/**
 * Confirma que o registro pertence ao usuário logado.
 *
 * Ids de cliente, serviço e local vêm do navegador. Sem esta checagem, trocar
 * um id na requisição amarraria o agendamento ao cadastro de outra conta —
 * e o nome do cliente alheio apareceria na agenda.
 *
 * O nome da tabela nunca é interpolado: cada caso usa a sua própria query
 * parametrizada.
 */
export async function ownsRecord(
  sql: SqlClient,
  table: OwnedTable,
  id: string,
  userId: string
): Promise<boolean> {
  if (!id || !userId) return false

  const rows =
    table === 'clients'
      ? await sql`SELECT id FROM clients   WHERE id = ${id} AND user_id = ${userId} LIMIT 1`
      : table === 'services'
      ? await sql`SELECT id FROM services  WHERE id = ${id} AND user_id = ${userId} LIMIT 1`
      : await sql`SELECT id FROM locations WHERE id = ${id} AND user_id = ${userId} LIMIT 1`

  return rows.length > 0
}

/** Rótulo em português usado nas mensagens de erro. */
export const LABEL_TABELA: Record<OwnedTable, string> = {
  clients: 'Cliente',
  services: 'Serviço',
  locations: 'Local',
}
