/**
 * Testes da ponte Clerk ↔ usuários do app (lib/clerk-bridge.ts).
 *
 * Rodar:  npx tsx --require dotenv/config scripts/test-clerk-bridge.ts
 *
 * Cobre o comportamento sensível para a SEGURANÇA: não aceitar e-mail sem
 * verificação e não deixar uma identidade Clerk tomar a conta de outra —
 * ambos levariam a sequestro de conta. Também garante que, ao migrar, a
 * profissional continua com os dados dela.
 *
 * ⚠️ Usa o banco real, mas só com e-mails *.claude@example.com e um pack
 * "Pack Ponte Teste"; limpa tudo o que cria, inclusive em caso de falha.
 */
import { vincularUsuarioClerk } from '../lib/clerk-bridge';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const EMAIL = 'ponte.teste.claude@example.com';
const EMAIL_NOVO = 'ponte.novo.claude@example.com';
const CLERK_A = 'user_teste_A';
const CLERK_B = 'user_teste_B';

let falhas = 0;
function checar(nome: string, condicao: boolean, detalhe = '') {
  console.log(`${condicao ? '✅' : '❌'} ${nome}${detalhe ? ' — ' + detalhe : ''}`);
  if (!condicao) falhas++;
}

async function limpar() {
  await sql`DELETE FROM packs WHERE name = 'Pack Ponte Teste'`;
  await sql`DELETE FROM users WHERE email IN (${EMAIL}, ${EMAIL_NOVO})`;
}

async function main() {
  await limpar();

  // Usuário "antigo" com dados, como a profissional real teria.
  const idAntigo = crypto.randomUUID();
  await sql`
    INSERT INTO users (id, email, name, hashed_password, created_at, updated_at)
    VALUES (${idAntigo}, ${EMAIL}, 'Profissional Teste', 'hash_falso', NOW(), NOW())
  `;
  const packId = `pack_ponte_${Date.now()}`;
  await sql`
    INSERT INTO packs (id, user_id, name, photos, videos, price, created_at, updated_at)
    VALUES (${packId}, ${idAntigo}, 'Pack Ponte Teste', 3, 1, 50, NOW(), NOW())
  `;

  // 1) E-mail NÃO verificado deve ser recusado (anti-sequestro de conta).
  let recusou = false;
  try {
    await vincularUsuarioClerk(sql as any, CLERK_A, EMAIL, false, 'Invasor');
  } catch {
    recusou = true;
  }
  checar('recusa e-mail não verificado', recusou);

  // 2) E-mail verificado vincula à conta existente, preservando o id.
  const r1 = await vincularUsuarioClerk(sql as any, CLERK_A, EMAIL, true, 'Profissional Teste');
  checar('vincula conta existente', r1.acao === 'vinculado', `ação=${r1.acao}`);
  checar('preserva o MESMO usuário (dados intactos)', r1.userId === idAntigo);

  const packs = await sql`SELECT id FROM packs WHERE user_id = ${r1.userId} AND name = 'Pack Ponte Teste'`;
  checar('pack do usuário continua acessível após vínculo', packs.length === 1);

  // 3) Segunda chamada é idempotente.
  const r2 = await vincularUsuarioClerk(sql as any, CLERK_A, EMAIL, true, null);
  checar('idempotente no 2º login', r2.acao === 'ja-vinculado' && r2.userId === idAntigo, `ação=${r2.acao}`);

  // 4) Outra identidade Clerk NÃO pode tomar a conta já vinculada —
  //    deve recusar com mensagem clara, sem erro de banco.
  let recusouRoubo = false;
  let msgRecusa = '';
  try {
    await vincularUsuarioClerk(sql as any, CLERK_B, EMAIL, true, 'Outro');
  } catch (e: any) {
    recusouRoubo = true;
    msgRecusa = e.message;
  }
  checar('não deixa outra identidade tomar a conta', recusouRoubo, msgRecusa.slice(0, 60));
  checar('recusa é amigável (não é erro de banco)', !/duplicate key|constraint/i.test(msgRecusa));

  const donoIntacto = await sql`SELECT clerk_user_id FROM users WHERE id = ${idAntigo}`;
  checar('dono original permanece vinculado', donoIntacto[0]?.clerk_user_id === CLERK_A);

  // 5) E-mail inédito cria usuário novo.
  const r4 = await vincularUsuarioClerk(sql as any, 'user_teste_C', EMAIL_NOVO, true, 'Cliente Novo');
  checar('cria usuário para e-mail inédito', r4.acao === 'criado');

  // 6) Maiúsculas/minúsculas não criam conta duplicada.
  const r5 = await vincularUsuarioClerk(sql as any, 'user_teste_C', EMAIL_NOVO.toUpperCase(), true, null);
  checar('e-mail é case-insensitive', r5.userId === r4.userId, `ação=${r5.acao}`);

  await sql`DELETE FROM users WHERE clerk_user_id IN (${CLERK_B}, 'user_teste_C')`;
  await limpar();

  console.log(falhas === 0 ? '\nTODOS OS TESTES PASSARAM' : `\n${falhas} TESTE(S) FALHARAM`);
  process.exit(falhas === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error('ERRO:', e.message);
  await limpar().catch(() => {});
  process.exit(1);
});
