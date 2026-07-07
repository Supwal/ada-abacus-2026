import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const NEON_URL = process.env.DATABASE_URL;
if (!NEON_URL) {
  console.error('DATABASE_URL não definida. Rode: DATABASE_URL="..." node scripts/run-ibge.mjs');
  process.exit(1);
}

const sql = neon(NEON_URL);

const arquivos = [
  'ibge-completo.sql',
  'ibge-nordeste.sql',
  'ibge-sul-sudeste-co.sql',
  'ibge-ba-mg-sp-pr-sc-rs.sql',
];

async function executarSQL(arquivo) {
  console.log(`\n▶ Executando ${arquivo}...`);
  const conteudo = readFileSync(join(__dirname, arquivo), 'utf-8');

  // Remove comentários de linha e divide em statements individuais
  const semComentarios = conteudo
    .split('\n')
    .filter(l => !l.trim().startsWith('--'))
    .join('\n');

  // Divide em statements pelo ;
  const statements = semComentarios
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10);

  let ok = 0, erros = 0;
  for (const stmt of statements) {
    try {
      await sql.apply(null, [stmt]);
      ok++;
      process.stdout.write('.');
    } catch (e) {
      // Ignora duplicados (ON CONFLICT) mas mostra outros erros
      if (!e.message.includes('duplicate key') && !e.message.includes('already exists')) {
        erros++;
        console.error(`\n  ERRO: ${e.message.slice(0, 120)}`);
      } else {
        ok++;
        process.stdout.write('s'); // skip
      }
    }
  }
  console.log(`\n  ✓ ${ok} ok  ${erros > 0 ? `✗ ${erros} erros` : ''}`);
}

async function verificar() {
  console.log('\n=== VERIFICAÇÃO ===');
  const estados = await sql`SELECT COUNT(*) as total FROM brasil_estados`;
  const cidades = await sql`SELECT COUNT(*) as total FROM brasil_cidades`;
  const capitais = await sql`SELECT COUNT(*) as total FROM brasil_cidades WHERE capital = TRUE`;

  console.log(`Estados: ${estados[0].total}`);
  console.log(`Cidades: ${cidades[0].total}`);
  console.log(`Capitais: ${capitais[0].total}`);

  console.log('\nCapitais por região:');
  const regioes = await sql`
    SELECT e.regiao, e.sigla, e.nome as estado, c.nome as capital
    FROM brasil_cidades c
    JOIN brasil_estados e ON e.id = c.estado_id
    WHERE c.capital = TRUE
    ORDER BY e.regiao, e.nome
  `;
  regioes.forEach(r => console.log(`  ${r.regiao.padEnd(15)} ${r.sigla}  ${r.capital}`));

  console.log('\nAmostra cidades SP:');
  const sp = await sql`
    SELECT c.id, c.nome FROM brasil_cidades c
    JOIN brasil_estados e ON e.id = c.estado_id
    WHERE e.sigla = 'SP' LIMIT 5
  `;
  sp.forEach(c => console.log(`  ${c.id}  ${c.nome}`));
}

(async () => {
  try {
    for (const arq of arquivos) {
      await executarSQL(arq);
    }
    await verificar();
    console.log('\n✅ Concluído!');
  } catch (err) {
    console.error('Erro fatal:', err.message);
    process.exit(1);
  }
})();
