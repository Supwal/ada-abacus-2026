-- Migração: canais de atendimento (WhatsApp, Instagram, Telegram, Privacy).
--
-- Guarda o identificador de cada canal da profissional para o app montar os
-- links que abrem a conversa. Antes disso a tela de Redes Sociais era
-- decorativa: os botões só mostravam "em breve" e nada era salvo.
--
-- Aditiva e isolada: tabela nova, nenhuma tabela existente é tocada.
-- Toda linha pertence a um usuário (user_id) e some junto com ele (CASCADE).

CREATE TABLE IF NOT EXISTS channels (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,               -- whatsapp | instagram | telegram | privacy
  handle     TEXT NOT NULL,               -- número ou nome de usuário
  greeting   TEXT,                        -- mensagem de abertura (só WhatsApp usa)
  active     BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Um canal de cada tipo por usuário: evita dois WhatsApp na mesma conta e
-- permite gravar com ON CONFLICT em vez de apagar e recriar.
CREATE UNIQUE INDEX IF NOT EXISTS channels_user_type_key
  ON channels (user_id, type);

-- A listagem sempre filtra por dono.
CREATE INDEX IF NOT EXISTS channels_user_id_idx ON channels (user_id);
