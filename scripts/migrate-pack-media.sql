-- Migração: entrega real de fotos/vídeos do pack (link de download)
-- Executar uma vez no banco Neon (aditivo, não apaga dados existentes)

ALTER TABLE packs ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS pack_media (
  id          TEXT PRIMARY KEY,
  pack_id     TEXT NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  r2_key      TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pack_media_pack_id ON pack_media(pack_id);
