export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSession } from '@/lib/db';
import { getPacksBucket } from '@/lib/r2';

export const dynamic = 'force-dynamic';

// Limites bem abaixo do limite de corpo de requisição da Cloudflare
// (100MB no plano atual) — margem de sobra para não estourar em uploads
// concorrentes que dividem o mesmo limite de memória do isolate.
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 45 * 1024 * 1024; // 45MB

async function resolveUserId(sql: ReturnType<typeof getDb>, email: string): Promise<string | null> {
  const users = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  return users.length ? (users[0].id as string) : null;
}

async function assertOwnsPack(sql: ReturnType<typeof getDb>, packId: string, userId: string) {
  const rows = await sql`SELECT id FROM packs WHERE id = ${packId} AND user_id = ${userId} LIMIT 1`;
  return rows.length > 0;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const sql = getDb();
    const userId = await resolveUserId(sql, session.email as string);
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    if (!(await assertOwnsPack(sql, params.id, userId))) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    const media = await sql`
      SELECT id, type, mime_type as "mimeType", size_bytes as "sizeBytes",
             order_index as "orderIndex", created_at as "createdAt"
      FROM pack_media
      WHERE pack_id = ${params.id}
      ORDER BY order_index ASC, created_at ASC
    `;

    return NextResponse.json(media);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao listar arquivos do pack:', msg);
    return NextResponse.json({ error: 'Erro ao listar arquivos do pack' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const sql = getDb();
    const userId = await resolveUserId(sql, session.email as string);
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    // Confere dono antes de ler o corpo (arquivo pode ser grande).
    if (!(await assertOwnsPack(sql, params.id, userId))) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });
    }
    if (type !== 'photo' && type !== 'video') {
      return NextResponse.json({ error: 'Tipo inválido (use photo ou video)' }, { status: 400 });
    }

    const maxBytes = type === 'photo' ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
    if (file.size > maxBytes) {
      const maxMb = Math.round(maxBytes / (1024 * 1024));
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo ${maxMb}MB para ${type === 'photo' ? 'fotos' : 'vídeos'}.` },
        { status: 400 }
      );
    }
    if (type === 'photo' && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Selecione apenas arquivos de imagem' }, { status: 400 });
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Selecione apenas arquivos de vídeo' }, { status: 400 });
    }

    const mediaId = `pmedia_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const r2Key = `packs/${userId}/${params.id}/${mediaId}`;

    const bucket = getPacksBucket();
    await bucket.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    try {
      const rows = await sql`
        INSERT INTO pack_media (id, pack_id, type, r2_key, mime_type, size_bytes, order_index, created_at)
        VALUES (${mediaId}, ${params.id}, ${type}, ${r2Key}, ${file.type}, ${file.size}, 0, NOW())
        RETURNING id, type, mime_type as "mimeType", size_bytes as "sizeBytes",
                  order_index as "orderIndex", created_at as "createdAt"
      `;
      return NextResponse.json(rows[0], { status: 201 });
    } catch (dbError) {
      // Insert falhou — tenta não deixar objeto órfão no bucket.
      try { await bucket.delete(r2Key); } catch {}
      throw dbError;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao enviar arquivo do pack:', msg);
    return NextResponse.json({ error: 'Erro ao enviar arquivo do pack' }, { status: 500 });
  }
}
