export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Interpreta o cabeçalho Range (ex.: "bytes=0-1023", "bytes=1024-", "bytes=-500").
// Necessário para vídeo tocar/avançar no Safari do iPhone, que é onde o
// link do WhatsApp abre no iOS.
function parseRange(header: string | null, size: number): { offset: number; length: number } | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, startStr, endStr] = match;
  if (startStr === '' && endStr === '') return null;

  let start: number;
  let end: number;
  if (startStr === '') {
    const suffixLength = parseInt(endStr, 10);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = parseInt(startStr, 10);
    end = endStr === '' ? size - 1 : Math.min(parseInt(endStr, 10), size - 1);
  }
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) return null;
  return { offset: start, length: end - start + 1 };
}

// Decodifica base64 -> bytes.
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Rota PÚBLICA (sem sessão) — só entrega o arquivo se o mediaId pertencer
// a um pack cujo share_token bata com o da URL. O conteúdo fica em base64
// no banco; esta rota decodifica e devolve os bytes.
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string; mediaId: string } }
) {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT pm.data, pm.mime_type as "mimeType"
      FROM pack_media pm
      JOIN packs p ON p.id = pm.pack_id
      WHERE pm.id = ${params.mediaId} AND p.share_token = ${params.token}
      LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    const { data, mimeType } = rows[0] as { data: string | null; mimeType: string };
    if (!data) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });

    const fullBytes = base64ToBytes(data);
    const sizeBytes = fullBytes.length;

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'private, no-store');

    if (request.nextUrl.searchParams.get('download')) {
      const ext = mimeType.split('/')[1] || 'bin';
      headers.set('Content-Disposition', `attachment; filename="arquivo.${ext}"`);
    }

    const range = parseRange(request.headers.get('range'), sizeBytes);
    if (range) {
      const slice = fullBytes.slice(range.offset, range.offset + range.length);
      headers.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${sizeBytes}`);
      headers.set('Content-Length', String(range.length));
      return new Response(new Blob([slice.buffer as ArrayBuffer], { type: mimeType }), { status: 206, headers });
    }

    headers.set('Content-Length', String(sizeBytes));
    return new Response(new Blob([fullBytes.buffer as ArrayBuffer], { type: mimeType }), { status: 200, headers });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao servir arquivo público do pack:', msg);
    return NextResponse.json({ error: 'Erro ao carregar arquivo' }, { status: 500 });
  }
}
