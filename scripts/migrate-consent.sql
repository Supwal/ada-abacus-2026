-- Migração: registro do aceite dos Termos de Uso e da Política de Privacidade.
--
-- A LGPD exige poder demonstrar QUANDO e QUAL versão o titular aceitou. Sem
-- essas colunas o aceite existiria só na tela, sem prova nenhuma.
--
-- Aditivo e reversível: contas antigas ficam com NULL (não aceitaram ainda) e
-- o app pede o aceite no próximo login.

ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at   TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP;

-- ⚠️ ANTES de rodar o restante, confira se existem e-mails que só diferem por
-- maiúsculas/espaços — eles impedem a normalização e o índice único:
--
--   SELECT LOWER(TRIM(email)) AS email, COUNT(*)
--   FROM users GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1;
--
-- Havendo resultado, decida manualmente qual conta fica antes de continuar.

-- 1) Normaliza os e-mails já cadastrados.
UPDATE users
SET email = LOWER(TRIM(email))
WHERE email <> LOWER(TRIM(email));

-- 2) Índice único sem diferenciar maiúsculas: impede "Maria@Gmail.com" e
--    "maria@gmail.com" virarem duas contas.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (LOWER(email));
