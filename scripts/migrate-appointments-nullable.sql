-- Migração: tornar service_id e location_id opcionais em appointments
-- Executar uma vez no banco Neon

ALTER TABLE appointments
  ALTER COLUMN service_id DROP NOT NULL,
  ALTER COLUMN location_id DROP NOT NULL;
