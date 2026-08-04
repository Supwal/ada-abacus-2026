/**
 * Aplica a migração dos canais de atendimento (scripts/migrate-channels.sql).
 *
 * ⚠️ RODE ANTES DE PUBLICAR. Sem a tabela `channels`, a tela de Redes Sociais
 * não consegue salvar nem carregar os canais.
 *
 * Uso (a partir da pasta ada_app_codigo):
 *   node scripts/run-migrate-channels.mjs
 *
 * A DATABASE_URL é lida do ambiente ou do arquivo .env / .env.local.
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raizProjeto = join(__dirname, '..');

function lerDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  for (const arquivo of ['.env.local', '.env']) {
    const caminho = join(raizProjeto, arquivo);
    if (!existsSync(caminho)) continue;
    const linha = readFileSync(caminho, 'utf-8')
      .split('\n')
      .find((l) => l.trim().startsWith('DATABASE_URL='));
    if (linha) {
      return linha.slice(linha.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

const NEON_URL = lerDatabaseUrl();
if (!NEON_URL) {
  console.error('❌ DATABASE_URL não encontrada (nem no ambiente, nem em .env/.env.local).');
  process.exit(1);
}

const sql = neon(NEON_URL);

async function executar() {
  const conteudo = readFileSync(join(__dirname, 'migrate-channels.sql'), 'utf-8');

  const comandos = conteudo
    .split('\n')
    .filter((l) => !l.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  for (const comando of comandos) {
    const resumo = comando.replace(/\s+/g, ' ').slice(0, 70);
    try {
      // sql.query: DDL fixo do arquivo .sql, sem valor vindo do usuário.
      await sql.query(comando);
      console.log(`✓ ${resumo}...`);
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log(`· já aplicado: ${resumo}...`);
      } else {
        throw e;
      }
    }
  }
}

async function conferir() {
  const colunas = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'channels'
    ORDER BY ordinal_position
  `;
  const nomes = colunas.map((c) => c.column_name);
  console.log(`\n=== VERIFICAÇÃO ===\nColunas de channels: ${nomes.join(', ') || 'TABELA NÃO CRIADA'}`);

  // Confere que nenhuma tabela existente foi afetada.
  const outras = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('users','clients','appointments','locations','services','packs','expenses','earnings')
    ORDER BY table_name
  `;
  console.log(`Tabelas existentes intactas: ${outras.map((t) => t.table_name).join(', ')}`);

  const obrigatorias = ['id', 'user_id', 'type', 'handle', 'active'];
  return obrigatorias.every((c) => nomes.includes(c));
}

(async () => {
  try {
    await executar();
    const ok = await conferir();
    console.log(ok ? '\n✅ Migração concluída!' : '\n⚠️ Migração incompleta — confira os erros acima.');
    process.exit(ok ? 0 : 1);
  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    process.exit(1);
  }
})();
