export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSession } from '@/lib/db';
import { getPacksBucket } from '@/lib/r2';

export const dynamic = 'force-dynamic';

async function resolveUserId(sql: ReturnType<typeof getDb>, email: string): Promise<string | null> {
  const users = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  return users.length ? (users[0].id as string) : null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const sql = getDb();
    const userId = await resolveUserId(sql, session.email as string);
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const rows = await sql`
      SELECT id, name, photos, videos, price, cover_image as "coverImage",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM packs
      WHERE id = ${params.id} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao buscar pack:', msg);
    return NextResponse.json({ error: 'Erro ao buscar pack' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const sql = getDb();
    const userId = await resolveUserId(sql, session.email as string);
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const body = await request.json();
    const { name, photos, videos, price, coverImage } = body;

    if (!name || photos === undefined || videos === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const photosInt = parseInt(photos as string);
    const videosInt = parseInt(videos as string);
    const priceFloat = parseFloat(price as string);
    if (Number.isNaN(photosInt) || Number.isNaN(videosInt) || Number.isNaN(priceFloat)) {
      return NextResponse.json({ error: 'Valores numéricos inválidos' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE packs SET
        name = ${name}, photos = ${photosInt}, videos = ${videosInt},
        price = ${priceFloat}, cover_image = ${coverImage || null}, updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${userId}
      RETURNING id, name, photos, videos, price, cover_image as "coverImage",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    if (!rows.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao atualizar pack:', msg);
    return NextResponse.json({ error: 'Erro ao atualizar pack' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const sql = getDb();
    const userId = await resolveUserId(sql, session.email as string);
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    // Busca as chaves do R2 antes de apagar (o cascade do Postgres apaga as
    // linhas de pack_media junto com o pack, então precisa ser antes).
    const media = await sql`
      SELECT pm.r2_key as "r2Key"
      FROM pack_media pm
      JOIN packs p ON p.id = pm.pack_id
      WHERE pm.pack_id = ${params.id} AND p.user_id = ${userId}
    `;

    const rows = await sql`
      DELETE FROM packs WHERE id = ${params.id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    if (media.length) {
      try {
        const bucket = getPacksBucket();
        await bucket.delete(media.map((m: any) => m.r2Key as string));
      } catch (r2Error) {
        // Pack já foi apagado do banco — um resíduo no R2 é só custo de
        // armazenamento, não deve impedir a resposta de sucesso ao usuário.
        console.error('Erro ao limpar arquivos do R2 (pack já excluído):', r2Error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao deletar pack:', msg);
    return NextResponse.json({ error: 'Erro ao deletar pack' }, { status: 500 });
  }
}
