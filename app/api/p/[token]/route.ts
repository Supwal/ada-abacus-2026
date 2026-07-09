export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Rota PÚBLICA (sem sessão) — o token longo e aleatório é a própria
// autorização de acesso. Só devolve o necessário para renderizar a galeria.
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const sql = getDb();

    const packs = await sql`
      SELECT id, name FROM packs WHERE share_token = ${params.token} LIMIT 1
    `;
    if (!packs.length) {
      return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 });
    }
    const pack = packs[0];

    const media = await sql`
      SELECT id, type FROM pack_media
      WHERE pack_id = ${pack.id}
      ORDER BY order_index ASC, created_at ASC
    `;

    return NextResponse.json({ name: pack.name, media });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao buscar pack público:', msg);
    return NextResponse.json({ error: 'Erro ao carregar o pack' }, { status: 500 });
  }
}
