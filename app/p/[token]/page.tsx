export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { Download } from 'lucide-react';
import { getDb } from '@/lib/db';
import { CountdownAmostra } from './countdown';

// Página PÚBLICA do pack, montada 100% no SERVIDOR (exceção consciente à
// convenção de páginas client deste projeto): ela é aberta em qualquer
// celular do cliente final — Android antigo, navegador do WhatsApp etc. —
// onde o JavaScript pode falhar. Antes era client-side e ficava presa no
// spinner para sempre nesses aparelhos. Renderizada no servidor, funciona
// até sem JS; o cronômetro é só um aprimoramento (ver countdown.tsx).

interface MediaItem {
  id: string;
  type: string;
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">{children}</div>
    </div>
  );
}

export default async function PackPublicPage({ params }: { params: { token: string } }) {
  const token = params.token;

  let pack: any = null;
  let media: MediaItem[] = [];
  let expiresInMs: number | null = null;

  try {
    const sql = getDb();

    // Tempo restante calculado no SQL (UTC). preview_started_at NULL = ainda
    // não aberto → tempo cheio.
    const packs = await sql`
      SELECT id, name, preview_minutes as "previewMinutes",
             CASE
               WHEN preview_minutes IS NULL THEN NULL
               WHEN preview_started_at IS NULL THEN preview_minutes * 60000
               ELSE CEIL(EXTRACT(EPOCH FROM (
                      preview_started_at + preview_minutes * interval '1 minute' - NOW()
                    )) * 1000)
             END as "remainingMs"
      FROM packs WHERE share_token = ${token} LIMIT 1
    `;

    if (!packs.length) {
      return (
        <Moldura>
          <p className="text-lg font-semibold text-gray-700">Link inválido ou não encontrado.</p>
        </Moldura>
      );
    }
    pack = packs[0];

    if (pack.previewMinutes) {
      // Marca a 1ª visualização (só efetiva se ainda não tinha começado).
      await sql`UPDATE packs SET preview_started_at = NOW() WHERE id = ${pack.id} AND preview_started_at IS NULL`;
      expiresInMs = Number(pack.remainingMs);

      if (expiresInMs <= 0) {
        return (
          <Moldura>
            <div className="text-5xl mb-3">⏳</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Amostra encerrada</h1>
            <p className="text-gray-600 text-sm">O tempo de visualização desta amostra terminou.</p>
            <p className="text-gray-800 font-medium mt-4">
              Gostou? 💖 Fale com a profissional para adquirir o pack completo!
            </p>
          </Moldura>
        );
      }
    }

    media = (await sql`
      SELECT id, type FROM pack_media
      WHERE pack_id = ${pack.id}
      ORDER BY order_index ASC, created_at ASC
    `) as unknown as MediaItem[];
  } catch (error) {
    console.error('Erro ao carregar pack público:', error);
    return (
      <Moldura>
        <p className="text-lg font-semibold text-gray-700">
          Não foi possível carregar agora. Tente abrir o link novamente.
        </p>
      </Moldura>
    );
  }

  const isAmostra = !!pack.previewMinutes;
  const fotos = media.filter((m) => m.type === 'photo');
  const videos = media.filter((m) => m.type === 'video');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">✨ {pack.name} ✨</h1>
          {isAmostra ? (
            <p className="text-gray-600 text-sm mt-1">
              Esta é uma <strong>amostra</strong> — aproveite enquanto está disponível 😉
            </p>
          ) : (
            <p className="text-gray-600 text-sm mt-1">
              Toque numa foto ou vídeo para ver, ou em Baixar para salvar
            </p>
          )}
        </div>

        {isAmostra && expiresInMs !== null && <CountdownAmostra expiresInMs={expiresInMs} />}

        {media.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
            Nenhum arquivo disponível ainda neste link.
          </div>
        )}

        {fotos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {fotos.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/p/${token}/media/${f.id}`}
                  alt=""
                  className="w-full h-40 object-cover"
                />
                {/* Amostra não tem botão de baixar — é só prévia */}
                {!isAmostra && (
                  <a
                    href={`/api/p/${token}/media/${f.id}?download=1`}
                    download
                    className="flex items-center justify-center gap-2 py-2 text-sm text-pink-600 font-medium hover:bg-pink-50"
                  >
                    <Download className="h-4 w-4" /> Baixar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <div className="space-y-4">
            {videos.map((v) => (
              <div key={v.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  controls
                  controlsList={isAmostra ? 'nodownload' : undefined}
                  className="w-full"
                  src={`/api/p/${token}/media/${v.id}`}
                />
                {!isAmostra && (
                  <a
                    href={`/api/p/${token}/media/${v.id}?download=1`}
                    download
                    className="flex items-center justify-center gap-2 py-2 text-sm text-pink-600 font-medium hover:bg-pink-50"
                  >
                    <Download className="h-4 w-4" /> Baixar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
