// Gera hash PBKDF2 para a senha do admin e imprime o SQL para inserir no Neon
// Executar: node scripts/create-admin.mjs

const ITERATIONS = 100_000;
const KEY_LEN = 32;

function toHex(buf) {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, keyMaterial, KEY_LEN * 8);
  const hash = new Uint8Array(bits);
  return `pbkdf2:${toHex(salt)}:${toHex(hash)}`;
}

const password = 'Sw213058$';
const hashed = await hashPassword(password);

const id = `usr_adm_${Date.now()}`;
const email = 'adaadm@ada.local';
const name = 'ADA Administrador';

console.log('\n=== SQL para executar no Neon ===\n');
console.log(`INSERT INTO users (id, email, name, first_name, last_name, hashed_password, created_at, updated_at)`);
console.log(`VALUES (`);
console.log(`  '${id}',`);
console.log(`  '${email}',`);
console.log(`  '${name}',`);
console.log(`  'ADA',`);
console.log(`  'Admin',`);
console.log(`  '${hashed}',`);
console.log(`  NOW(),`);
console.log(`  NOW()`);
console.log(`) ON CONFLICT (email) DO UPDATE SET hashed_password = EXCLUDED.hashed_password;\n`);
console.log('=== Credenciais de acesso ===');
console.log(`Email/usuário: ${email}`);
console.log(`Senha: ${password}`);
