export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSession } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const sql = getDb();
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`;
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const packs = await sql`
      SELECT p.id, p.name, p.photos, p.videos, p.price, p.cover_image as "coverImage",
             p.share_token as "shareToken", p.preview_minutes as "previewMinutes",
             COALESCE(m.count, 0)::int as "mediaCount",
             p.created_at as "createdAt", p.updated_at as "updatedAt"
      FROM packs p
      LEFT JOIN (
        SELECT pack_id, COUNT(*) as count FROM pack_media GROUP BY pack_id
      ) m ON m.pack_id = p.id
      WHERE p.user_id = ${users[0].id}
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json(packs);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao buscar packs:', msg);
    return NextResponse.json({ error: 'Erro ao buscar packs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const sql = getDb();
    const users = await sql`SELECT id FROM users WHERE email = ${session.email as string} LIMIT 1`;
    if (!users.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const userId = users[0].id;
    const body = await request.json();
    const { name, photos, videos, price, coverImage, previewMinutes } = body;

    // Validação básica
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

    // Duração da amostra: null = sem limite (pack completo). Só aceita 5/10/15.
    const pv = parseInt(previewMinutes as string);
    const previewInt = [5, 10, 15].includes(pv) ? pv : null;

    const id = `pack_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const rows = await sql`
      INSERT INTO packs (id, user_id, name, photos, videos, price, cover_image, preview_minutes, created_at, updated_at)
      VALUES (${id}, ${userId}, ${name}, ${photosInt}, ${videosInt}, ${priceFloat}, ${coverImage || null}, ${previewInt}, NOW(), NOW())
      RETURNING id, name, photos, videos, price, cover_image as "coverImage",
                preview_minutes as "previewMinutes",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao criar pack:', msg);
    return NextResponse.json({ error: 'Erro ao criar pack' }, { status: 500 });
  }
}
