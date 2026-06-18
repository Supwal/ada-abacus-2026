-- Migração: adicionar campos completos à tabela locations
-- Executar uma vez no banco Neon (não apaga dados existentes)

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS city           TEXT,
  ADD COLUMN IF NOT EXISTS state          TEXT,
  ADD COLUMN IF NOT EXISTS phone          TEXT,
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS working_days   TEXT,
  ADD COLUMN IF NOT EXISTS open_time      TEXT,
  ADD COLUMN IF NOT EXISTS close_time     TEXT,
  ADD COLUMN IF NOT EXISTS notes          TEXT;
