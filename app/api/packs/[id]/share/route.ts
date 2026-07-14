export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSession } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Gera (ou reaproveita) o token do link público de entrega do pack.
// Além disso, REINICIA a contagem da amostra (preview_started_at = NULL):
// como esta rota é chamada ao abrir "Vender", cada envio começa uma amostra
// nova — o cliente terá os X minutos a partir de quando ELE abrir o link.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const sql = getDb();
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`;
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    const userId = users[0].id;

    const existing = await sql`
      SELECT share_token as "shareToken", preview_minutes as "previewMinutes"
      FROM packs WHERE id = ${params.id} AND user_id = ${userId} LIMIT 1
    `;
    if (!existing.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    let token = existing[0].shareToken as string | null;
    if (!token) {
      token = crypto.randomUUID().replace(/-/g, '');
    }

    // Grava o token (se novo) e zera o início da amostra em uma tacada só.
    await sql`
      UPDATE packs SET share_token = ${token}, preview_started_at = NULL
      WHERE id = ${params.id} AND user_id = ${userId}
    `;

    return NextResponse.json({ shareToken: token, previewMinutes: existing[0].previewMinutes });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao gerar link de compartilhamento:', msg);
    return NextResponse.json({ error: 'Erro ao gerar link de compartilhamento' }, { status: 500 });
  }
}
