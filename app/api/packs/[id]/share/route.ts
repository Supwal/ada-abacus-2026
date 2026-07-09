export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSession } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Gera (ou reaproveita) o token do link público de entrega do pack.
// Idempotente: chamadas repetidas devolvem sempre o mesmo token, então o
// mesmo link pode ser reenviado para vários clientes que comprem o pack.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const sql = getDb();
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`;
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    const userId = users[0].id;

    const existing = await sql`
      SELECT share_token as "shareToken" FROM packs WHERE id = ${params.id} AND user_id = ${userId} LIMIT 1
    `;
    if (!existing.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    if (existing[0].shareToken) {
      return NextResponse.json({ shareToken: existing[0].shareToken });
    }

    const token = crypto.randomUUID().replace(/-/g, '');
    await sql`UPDATE packs SET share_token = ${token} WHERE id = ${params.id} AND user_id = ${userId}`;

    return NextResponse.json({ shareToken: token });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao gerar link de compartilhamento:', msg);
    return NextResponse.json({ error: 'Erro ao gerar link de compartilhamento' }, { status: 500 });
  }
}
