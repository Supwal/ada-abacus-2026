export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Rota PÚBLICA (sem sessão) — o token longo e aleatório é a própria
// autorização de acesso. Só devolve o necessário para renderizar a galeria.
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const sql = getDb();

    // Tempo restante calculado no SQL (tudo em UTC). Quando a amostra ainda
    // não foi aberta (preview_started_at NULL), devolve o tempo cheio.
    const packs = await sql`
      SELECT id, name, preview_minutes as "previewMinutes",
             CASE
               WHEN preview_minutes IS NULL THEN NULL
               WHEN preview_started_at IS NULL THEN preview_minutes * 60000
               ELSE CEIL(EXTRACT(EPOCH FROM (
                      preview_started_at + preview_minutes * interval '1 minute' - NOW()
                    )) * 1000)
             END as "remainingMs"
      FROM packs WHERE share_token = ${params.token} LIMIT 1
    `;
    if (!packs.length) {
      return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 });
    }
    const pack = packs[0];

    // Modo amostra: se tem preview_minutes, controla o tempo de acesso.
    const previewMinutes: number | null = pack.previewMinutes ?? null;
    let expiresInMs: number | null = null;
    if (previewMinutes) {
      // Marca a 1ª visualização (só efetiva se ainda não tinha começado).
      await sql`UPDATE packs SET preview_started_at = NOW() WHERE id = ${pack.id} AND preview_started_at IS NULL`;
      expiresInMs = Number(pack.remainingMs);
      if (expiresInMs <= 0) {
        // Amostra expirou — não devolve a mídia.
        return NextResponse.json({ name: pack.name, expired: true, previewMinutes });
      }
    }

    const media = await sql`
      SELECT id, type FROM pack_media
      WHERE pack_id = ${pack.id}
      ORDER BY order_index ASC, created_at ASC
    `;

    // no-store: o tempo restante da amostra muda a cada segundo — nunca cachear.
    return NextResponse.json(
      { name: pack.name, media, previewMinutes, expiresInMs },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao buscar pack público:', msg);
    return NextResponse.json({ error: 'Erro ao carregar o pack' }, { status: 500 });
  }
}
