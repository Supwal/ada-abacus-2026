-- ============================================================
-- ADA ABACUS 2026 — Reset Completo do Banco de Dados
-- Execute este script para recriar TODAS as tabelas do zero.
-- ATENÇÃO: apaga todos os dados existentes!
-- ============================================================

-- Dropar tabelas na ordem correta (respeitando FK)
DROP TABLE IF EXISTS "verificationtokens" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "packs" CASCADE;
DROP TABLE IF EXISTS "availabilities" CASCADE;
DROP TABLE IF EXISTS "agenda_status" CASCADE;
DROP TABLE IF EXISTS "expenses" CASCADE;
DROP TABLE IF EXISTS "expense_categories" CASCADE;
DROP TABLE IF EXISTS "earnings" CASCADE;
DROP TABLE IF EXISTS "appointments" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "locations" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE "users" (
  "id"               TEXT        NOT NULL PRIMARY KEY,
  "email"            TEXT        NOT NULL UNIQUE,
  "name"             TEXT,
  "first_name"       TEXT,
  "last_name"        TEXT,
  "phone"            TEXT,
  "profession"       TEXT,
  "email_verified"   TIMESTAMP,
  "image"            TEXT,
  "hashed_password"  TEXT,
  "created_at"       TIMESTAMP   NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACCOUNTS (NextAuth)
-- ============================================================
CREATE TABLE "accounts" (
  "id"                  TEXT NOT NULL PRIMARY KEY,
  "user_id"             TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"                TEXT NOT NULL,
  "provider"            TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token"       TEXT,
  "access_token"        TEXT,
  "expires_at"          INTEGER,
  "token_type"          TEXT,
  "scope"               TEXT,
  "id_token"            TEXT,
  "session_state"       TEXT,
  UNIQUE ("provider", "provider_account_id")
);

-- ============================================================
-- SESSIONS (NextAuth)
-- ============================================================
CREATE TABLE "sessions" (
  "id"            TEXT      NOT NULL PRIMARY KEY,
  "session_token" TEXT      NOT NULL UNIQUE,
  "user_id"       TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires"       TIMESTAMP NOT NULL
);

-- ============================================================
-- VERIFICATION TOKENS (NextAuth)
-- ============================================================
CREATE TABLE "verificationtokens" (
  "identifier" TEXT      NOT NULL,
  "token"      TEXT      NOT NULL UNIQUE,
  "expires"    TIMESTAMP NOT NULL,
  UNIQUE ("identifier", "token")
);

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE "locations" (
  "id"          TEXT      NOT NULL PRIMARY KEY,
  "name"        TEXT      NOT NULL,
  "address"     TEXT,
  "description" TEXT,
  "user_id"     TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE "services" (
  "id"          TEXT      NOT NULL PRIMARY KEY,
  "name"        TEXT      NOT NULL,
  "duration"    INTEGER   NOT NULL,
  "price"       FLOAT     NOT NULL,
  "description" TEXT,
  "user_id"     TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE "clients" (
  "id"         TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"       TEXT      NOT NULL,
  "email"      TEXT,
  "phone"      TEXT,
  "notes"      TEXT,
  "user_id"    TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE "appointments" (
  "id"          TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "date"        TIMESTAMP NOT NULL,
  "start_time"  TEXT      NOT NULL,
  "end_time"    TEXT      NOT NULL,
  "status"      TEXT      NOT NULL DEFAULT 'scheduled',
  "notes"       TEXT,
  "value"       FLOAT,
  "paid"        BOOLEAN   NOT NULL DEFAULT false,
  "user_id"     TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id"   TEXT      NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "service_id"  TEXT      NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
  "location_id" TEXT      NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EARNINGS
-- ============================================================
CREATE TABLE "earnings" (
  "id"             TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "description"    TEXT      NOT NULL,
  "amount"         FLOAT     NOT NULL,
  "date"           TIMESTAMP NOT NULL,
  "user_id"        TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id"      TEXT      REFERENCES "clients"("id") ON DELETE SET NULL,
  "service_id"     TEXT      REFERENCES "services"("id") ON DELETE SET NULL,
  "location_id"    TEXT      REFERENCES "locations"("id") ON DELETE SET NULL,
  "appointment_id" TEXT      UNIQUE,
  "created_at"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPENSE CATEGORIES
-- ============================================================
CREATE TABLE "expense_categories" (
  "id"         TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"       TEXT      NOT NULL UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categorias padrão
INSERT INTO "expense_categories" ("id", "name") VALUES
  (gen_random_uuid()::text, 'Alimentação'),
  (gen_random_uuid()::text, 'Transporte'),
  (gen_random_uuid()::text, 'Equipamentos'),
  (gen_random_uuid()::text, 'Marketing'),
  (gen_random_uuid()::text, 'Software'),
  (gen_random_uuid()::text, 'Aluguel de Espaço'),
  (gen_random_uuid()::text, 'Saúde'),
  (gen_random_uuid()::text, 'Educação'),
  (gen_random_uuid()::text, 'Outros');

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE "expenses" (
  "id"          TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "description" TEXT      NOT NULL,
  "amount"      FLOAT     NOT NULL,
  "date"        TIMESTAMP NOT NULL,
  "user_id"     TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category_id" TEXT      NOT NULL REFERENCES "expense_categories"("id") ON DELETE RESTRICT,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AGENDA STATUS
-- ============================================================
CREATE TABLE "agenda_status" (
  "id"         TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id"    TEXT      NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "is_open"    BOOLEAN   NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AVAILABILITIES
-- ============================================================
CREATE TABLE "availabilities" (
  "id"                    TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id"               TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"                  TEXT      NOT NULL,
  "date"                  TIMESTAMP NOT NULL,
  "start_time"            TEXT      NOT NULL,
  "end_time"              TEXT      NOT NULL,
  "location_id"           TEXT      NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
  "hourly_rate"           FLOAT     NOT NULL,
  "max_appointments"      INTEGER   NOT NULL,
  "notes"                 TEXT,
  "notification_channel"  TEXT      NOT NULL,
  "current_appointments"  INTEGER   NOT NULL DEFAULT 0,
  "created_at"            TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PACKS
-- ============================================================
CREATE TABLE "packs" (
  "id"          TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id"     TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name"        TEXT      NOT NULL,
  "photos"      INTEGER   NOT NULL,
  "videos"      INTEGER   NOT NULL,
  "price"       FLOAT     NOT NULL,
  "cover_image" TEXT,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE "subscriptions" (
  "id"            TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id"       TEXT      NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "plan_type"     TEXT      NOT NULL,
  "price"         FLOAT     NOT NULL,
  "status"        TEXT      NOT NULL DEFAULT 'ativo',
  "start_date"    TIMESTAMP NOT NULL DEFAULT NOW(),
  "end_date"      TIMESTAMP,
  "voice_enabled" BOOLEAN   NOT NULL DEFAULT true,
  "created_at"    TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE "payments" (
  "id"                  TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id"             TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "asaas_payment_id"    TEXT      NOT NULL,
  "plan_type"           TEXT      NOT NULL,
  "price"               FLOAT     NOT NULL,
  "status"              TEXT      NOT NULL DEFAULT 'pending',
  "billing_type"        TEXT      NOT NULL,
  "external_reference"  TEXT,
  "bank_slip_url"       TEXT,
  "pix_qr_code"         TEXT,
  "invoice_url"         TEXT,
  "created_at"          TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Índices úteis
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON "appointments"("user_id", "date");
CREATE INDEX IF NOT EXISTS idx_earnings_user_date ON "earnings"("user_id", "date");
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON "expenses"("user_id", "date");
CREATE INDEX IF NOT EXISTS idx_appointments_client ON "appointments"("client_id");
CREATE INDEX IF NOT EXISTS idx_payments_user ON "payments"("user_id");

-- ============================================================
-- Trigger para atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','locations','services','clients','appointments','earnings','expenses','agenda_status','availabilities','packs','subscriptions','payments']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at_%I ON %I;
      CREATE TRIGGER trg_updated_at_%I
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

SELECT 'Banco recriado com sucesso!' AS status;
