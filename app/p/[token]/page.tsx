'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Download } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
}

export default function PackPublicPage() {
  const params = useParams();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/p/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        setNome(data.name);
        setMedia(data.media || []);
      })
      .catch(() => setErro('Link inválido ou não encontrado.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <p className="text-lg font-semibold text-gray-700">{erro}</p>
        </div>
      </div>
    );
  }

  const fotos = media.filter((m) => m.type === 'photo');
  const videos = media.filter((m) => m.type === 'video');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">✨ {nome} ✨</h1>
          <p className="text-gray-600 text-sm mt-1">Toque numa foto ou vídeo para ver, ou em Baixar para salvar</p>
        </div>

        {media.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
            Nenhum arquivo disponível ainda neste link.
          </div>
        )}

        {fotos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {fotos.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={`/api/p/${token}/media/${f.id}`}
                  alt=""
                  className="w-full h-40 object-cover"
                />
                <a
                  href={`/api/p/${token}/media/${f.id}?download=1`}
                  download
                  className="flex items-center justify-center gap-2 py-2 text-sm text-pink-600 font-medium hover:bg-pink-50"
                >
                  <Download className="h-4 w-4" /> Baixar
                </a>
              </div>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <div className="space-y-4">
            {videos.map((v) => (
              <div key={v.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video controls className="w-full" src={`/api/p/${token}/media/${v.id}`} />
                <a
                  href={`/api/p/${token}/media/${v.id}?download=1`}
                  download
                  className="flex items-center justify-center gap-2 py-2 text-sm text-pink-600 font-medium hover:bg-pink-50"
                >
                  <Download className="h-4 w-4" /> Baixar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
