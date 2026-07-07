import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const NEON_URL = process.env.DATABASE_URL;
if (!NEON_URL) {
  console.error('DATABASE_URL não definida. Rode: DATABASE_URL="..." node scripts/run-ibge2.mjs');
  process.exit(1);
}

const client = new Client({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

function splitStatements(sql) {
  // Remove comentários e divide por ; fora de strings
  const lines = sql.split('\n').filter(l => !l.trim().startsWith('--')).join('\n');
  const stmts = [];
  let cur = '';
  let inStr = false;
  for (let i = 0; i < lines.length; i++) {
    const ch = lines[i];
    if (ch === "'" && lines[i-1] !== '\\') inStr = !inStr;
    if (ch === ';' && !inStr) {
      const s = cur.trim();
      if (s.length > 5) stmts.push(s);
      cur = '';
    } else {
      cur += ch;
    }
  }
  return stmts;
}

async function executarArquivo(arquivo) {
  console.log(`\n▶ ${arquivo}...`);
  const conteudo = readFileSync(join(__dirname, arquivo), 'utf-8');
  const stmts = splitStatements(conteudo);
  let ok = 0, skip = 0;
  for (const stmt of stmts) {
    try {
      // Para INSERTs, adiciona ON CONFLICT DO NOTHING
      let q = stmt;
      if (q.toUpperCase().startsWith('INSERT INTO BRASIL_CIDADES')) {
        q = q + ' ON CONFLICT (id) DO NOTHING';
      } else if (q.toUpperCase().startsWith('INSERT INTO BRASIL_ESTADOS')) {
        q = q + ' ON CONFLICT (id) DO NOTHING';
      }
      await client.query(q);
      ok++;
    } catch (e) {
      if (e.message.includes('duplicate key') || e.message.includes('already exists')) {
        skip++;
      } else {
        console.error(`\n  ERRO: ${e.message.slice(0, 150)}`);
        console.error(`  STMT: ${stmt.slice(0, 80)}...`);
      }
    }
  }
  console.log(`  ✓ ${ok} statements  ${skip > 0 ? `(${skip} já existiam)` : ''}`);
}

async function verificar() {
  console.log('\n=== VERIFICAÇÃO FINAL ===');
  const { rows: [e] } = await client.query('SELECT COUNT(*) as total FROM brasil_estados');
  const { rows: [c] } = await client.query('SELECT COUNT(*) as total FROM brasil_cidades');
  const { rows: [cap] } = await client.query("SELECT COUNT(*) as total FROM brasil_cidades WHERE capital = TRUE");

  console.log(`  Estados:  ${e.total}/27`);
  console.log(`  Cidades:  ${c.total}`);
  console.log(`  Capitais: ${cap.total}/27`);

  const { rows: capitais } = await client.query(`
    SELECT e.regiao, e.sigla, c.nome as capital
    FROM brasil_cidades c
    JOIN brasil_estados e ON e.id = c.estado_id
    WHERE c.capital = TRUE
    ORDER BY e.regiao, e.sigla
  `);
  const regioes = {};
  for (const r of capitais) {
    if (!regioes[r.regiao]) regioes[r.regiao] = [];
    regioes[r.regiao].push(`${r.sigla}:${r.capital}`);
  }
  for (const [reg, cids] of Object.entries(regioes)) {
    console.log(`\n  ${reg}:`);
    console.log(`    ${cids.join('  ')}`);
  }

  console.log('\n  Amostra SP:');
  const { rows: sp } = await client.query(`
    SELECT c.id, c.nome FROM brasil_cidades c
    WHERE c.estado_id = 35 LIMIT 6
  `);
  sp.forEach(c => console.log(`    ${c.id}  ${c.nome}`));
}

(async () => {
  await client.connect();
  console.log('Conectado ao Neon ✓');
  const arquivos = ['ibge-completo.sql','ibge-nordeste.sql','ibge-sul-sudeste-co.sql','ibge-ba-mg-sp-pr-sc-rs.sql'];
  try {
    for (const arq of arquivos) {
      await executarArquivo(arq);
    }
    await verificar();
    console.log('\n✅ Concluído!');
  } catch(e) {
    console.error('Falha:', e.message);
  } finally {
    await client.end();
  }
})();
