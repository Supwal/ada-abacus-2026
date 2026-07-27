-- Migração: ponte entre a conta Clerk e o usuário existente do app.
--
-- clerk_user_id guarda o ID do usuário na Clerk (ex.: "user_2abc..."), ligando
-- a conta nova ao registro que já existe na tabela `users` — assim a
-- profissional entra pelo login novo e continua vendo TODOS os dados dela
-- (agendamentos, packs, locais, despesas).
--
-- Aditivo e reversível: quem ainda usa NextAuth fica com a coluna NULL.

ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- UNIQUE parcial: impede duas contas do app apontarem para o mesmo usuário
-- Clerk, mas permite vários NULL (todos os que ainda não migraram).
CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_user_id_key
  ON users (clerk_user_id)
  WHERE clerk_user_id IS NOT NULL;
