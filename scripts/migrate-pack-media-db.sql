-- Migração: guardar as fotos/vídeos do pack no próprio banco (base64),
-- em vez do Cloudflare R2. Aditivo — não apaga nada.

-- Coluna que guarda o conteúdo do arquivo em base64.
ALTER TABLE pack_media ADD COLUMN IF NOT EXISTS data TEXT;

-- r2_key deixa de ser obrigatório (arquivos novos não usam mais R2).
ALTER TABLE pack_media ALTER COLUMN r2_key DROP NOT NULL;
