/**
 * Aplica a migração do aceite de termos (scripts/migrate-consent.sql).
 *
 * ⚠️ RODE ANTES DE PUBLICAR. Sem estas colunas o cadastro de novos usuários
 * falha, porque a API de signup grava a data e a versão do aceite.
 *
 * Uso (a partir da pasta ada_app_codigo):
 *   node scripts/run-migrate-consent.mjs
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

async function verificarDuplicados() {
  const dup = await sql`
    SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS total
    FROM users GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1
  `;
  if (dup.length > 0) {
    console.error('\n❌ Existem e-mails duplicados que só diferem por maiúsculas/espaços:');
    dup.forEach((d) => console.error(`   ${d.email} (${d.total} contas)`));
    console.error('\nResolva manualmente qual conta fica e rode de novo.');
    process.exit(1);
  }
  console.log('✓ Nenhum e-mail duplicado.');
}

async function executar() {
  const conteudo = readFileSync(join(__dirname, 'migrate-consent.sql'), 'utf-8');

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
      // sql.query: os comandos são DDL fixos do arquivo .sql, sem valor do usuário.
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
    WHERE table_name = 'users'
      AND column_name IN ('terms_accepted_at', 'terms_version', 'privacy_accepted_at')
  `;
  const encontradas = colunas.map((c) => c.column_name).sort();
  console.log(`\n=== VERIFICAÇÃO ===\nColunas criadas: ${encontradas.join(', ') || 'NENHUMA'}`);

  const pendentes = await sql`SELECT COUNT(*) AS total FROM users WHERE terms_accepted_at IS NULL`;
  console.log(`Contas sem aceite registrado: ${pendentes[0].total} (o app pede no próximo acesso)`);

  return encontradas.length === 3;
}

(async () => {
  try {
    await verificarDuplicados();
    await executar();
    const ok = await conferir();
    console.log(ok ? '\n✅ Migração concluída!' : '\n⚠️ Migração incompleta — confira os erros acima.');
    process.exit(ok ? 0 : 1);
  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    process.exit(1);
  }
})();
