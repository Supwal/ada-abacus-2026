-- Migração: modo "amostra" com tempo limitado nos packs.
-- preview_minutes: duração da amostra em minutos (NULL = sem limite / pack completo).
-- preview_started_at: quando o cliente abriu a amostra pela 1ª vez (início da contagem).
-- Aditivo — não apaga nada.

ALTER TABLE packs ADD COLUMN IF NOT EXISTS preview_minutes    INTEGER;
ALTER TABLE packs ADD COLUMN IF NOT EXISTS preview_started_at TIMESTAMP;
