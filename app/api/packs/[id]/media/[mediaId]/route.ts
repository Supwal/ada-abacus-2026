export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSession } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    const session = await getSession(request);
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const sql = getDb();
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`;
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    const userId = users[0].id;

    // Query atômica: só apaga se o item pertencer a um pack do usuário logado.
    const rows = await sql`
      DELETE FROM pack_media
      USING packs
      WHERE pack_media.id = ${params.mediaId}
        AND pack_media.pack_id = ${params.id}
        AND pack_media.pack_id = packs.id
        AND packs.user_id = ${userId}
      RETURNING pack_media.id
    `;
    if (!rows.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao excluir arquivo do pack:', msg);
    return NextResponse.json({ error: 'Erro ao excluir arquivo do pack' }, { status: 500 });
  }
}
