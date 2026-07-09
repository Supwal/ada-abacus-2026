# Deploy ADA ABACUS 2026 — Cloudflare Pages + Prisma Accelerate

> **Status do código:** ✅ Já configurado para Edge Runtime.
> O que resta é: obter a URL do Prisma Accelerate, instalar dependências, resetar o banco e fazer o deploy.

---

## O que já está pronto no código

| Arquivo | O que foi feito |
|---|---|
| `lib/db.ts` | Usa `@prisma/client/edge` + `withAccelerate()` |
| `prisma/schema.prisma` | `previewFeatures = ["driverAdapters"]` habilitado |
| `next.config.js` | Limpo, sem `output` dinâmico |
| `wrangler.toml` | Configuração do Cloudflare Pages |
| `package.json` | Scripts `build:cloudflare` e `deploy:cloudflare` adicionados |
| `scripts/reset-db.sql` | SQL completo para recriar as 13 tabelas do zero |
| `.env.production.example` | Referência das variáveis de produção |
| `setup-cloudflare.sh` | Script que automatiza tudo |

---

## Passo a passo — O que você precisa fazer

### Passo 1 — Prisma Accelerate (5 min, gratuito)

O Prisma Accelerate é um proxy que permite usar o Prisma no Edge Runtime do Cloudflare.

1. Acesse [console.prisma.io](https://console.prisma.io) → crie uma conta gratuita
2. Crie um novo projeto → **Add a database**
3. Cole a connection string do seu banco PostgreSQL:
   ```
   postgresql://usuario:senha@host:5432/nome_do_banco
   ```
4. Copie a **Accelerate Connection String** gerada — começa com `prisma://`
5. Guarde essa URL: será o `DATABASE_URL` de produção

> Plano gratuito: 60.000 queries/mês. Suficiente para começar.

---

### Passo 2 — Instalar dependências

Na pasta `ada_app_codigo`:

```bash
yarn install
```

Isso instala `@prisma/extension-accelerate`, `@cloudflare/next-on-pages` e `wrangler` que já estão no `package.json`.

---

### Passo 3 — Resetar o banco de dados

> ⚠️ Apaga todos os dados existentes e recria as tabelas com o schema completo.

**Opção A — via Prisma (recomendado):**
```bash
npx prisma migrate reset --force
npx prisma db push
npx prisma generate
```

**Opção B — via SQL direto:**
```bash
psql "postgresql://usuario:senha@host:5432/nome_do_banco" \
  -f scripts/reset-db.sql
npx prisma generate
```

O arquivo `scripts/reset-db.sql` recria todas as tabelas e já inclui as categorias de despesa padrão.

---

### Passo 4 — Fazer login no Cloudflare via CLI

```bash
npx wrangler login
```

Isso abre o browser para autenticar com sua conta do Cloudflare.
Suas credenciais ficam no `.env` (não versionado) — nunca suba tokens para o repositório.

---

### Passo 5 — Build e deploy

**Script automático (recomendado):**
```bash
bash setup-cloudflare.sh
```

**Ou manualmente:**
```bash
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name ada-abacus-2026
```

---

### Passo 6 — Configurar variáveis de ambiente no Cloudflare Pages

Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → `ada-abacus-2026` → **Settings** → **Environment variables** → **Add variables (Production)**:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `prisma://accelerate.prisma-data.net/?api_key=...` ← do Passo 1 |
| `NEXTAUTH_SECRET` | `<gere um segredo aleatório: openssl rand -base64 32>` |
| `NEXTAUTH_URL` | `https://ada-abacus-2026.pages.dev` |
| `ASAAS_API_KEY` | `$aact_hmlg_000...` ← sua chave do Asaas |
| `ASAAS_SANDBOX` | `false` (produção) ou `true` (testes) |
| `NODE_ENV` | `production` |

> Após salvar as variáveis, faça um novo deploy para elas entrarem em vigor.

---

### Passo 7 — Domínio personalizado (opcional)

1. Cloudflare Pages → seu projeto → **Custom domains** → **Set up a custom domain**
2. Informe seu domínio
3. Atualize `NEXTAUTH_URL` para `https://seudominio.com`

---

## Checklist pré-produção

- [ ] URL do Prisma Accelerate obtida (começa com `prisma://`)
- [ ] `yarn install` executado
- [ ] Banco resetado (`prisma migrate reset --force` + `prisma db push`)
- [ ] `prisma generate` executado
- [ ] Login no Wrangler feito (`npx wrangler login`)
- [ ] Build gerado (`npx @cloudflare/next-on-pages`)
- [ ] Deploy feito (`npx wrangler pages deploy ...`)
- [ ] Variáveis de ambiente configuradas no painel do Cloudflare
- [ ] `NEXTAUTH_URL` atualizado para URL de produção
- [ ] `ASAAS_SANDBOX=false` para pagamentos reais
- [ ] Testar login e cadastro de usuário
- [ ] Testar criação de agendamento
- [ ] Testar fluxo de assinatura/pagamento

---

## Comandos de referência

```bash
# Desenvolvimento local
yarn dev

# Verificar erros TypeScript
yarn tsc --noEmit

# Prisma
npx prisma generate          # Regenerar cliente após mudar schema
npx prisma migrate reset --force   # Reset do banco (APAGA TUDO)
npx prisma db push           # Sincronizar schema sem migration
npx prisma studio            # Visualizar banco no browser

# Build e Deploy Cloudflare
yarn build:cloudflare        # Gera .vercel/output/static
yarn deploy:cloudflare       # Build + deploy direto

# Apenas deploy (se o build já existe)
npx wrangler pages deploy .vercel/output/static --project-name ada-abacus-2026

# Ver logs de produção
npx wrangler pages deployment tail --project-name ada-abacus-2026
```

---

## Estrutura do projeto

```
ada_app_codigo/
├── app/
│   ├── (dashboard)/
│   │   ├── agenda/           # Agendamentos (consulta + novo)
│   │   ├── assinatura/       # Planos + checkout Asaas
│   │   ├── clientes/         # Gestão de clientes
│   │   ├── dashboard/        # Menu principal
│   │   ├── despesas/         # Controle de despesas
│   │   ├── ganhos/           # Consulta de ganhos/receitas
│   │   ├── locais/           # Locais e clínicas
│   │   ├── packs/            # Packs de fotos/vídeos
│   │   ├── painel-controle/  # Painel administrativo
│   │   └── servicos/         # Serviços oferecidos
│   ├── api/                  # 23 rotas de API
│   └── auth/                 # Login e cadastro
├── lib/
│   ├── auth.ts               # NextAuth (JWT strategy)
│   ├── db.ts                 # Prisma Edge Client + Accelerate ✅
│   ├── db.edge.ts            # Alias do db.ts para Edge routes
│   └── asaas.ts              # Gateway de pagamento
├── prisma/
│   └── schema.prisma         # 13 modelos, driverAdapters ativado ✅
├── scripts/
│   ├── reset-db.sql          # Recria todas as tabelas ✅
│   └── safe-seed.ts          # Seed com categorias de despesa
├── .env                      # Desenvolvimento local
├── .env.production.example   # Referência de variáveis de produção ✅
├── next.config.js            # Config limpa para Edge ✅
├── wrangler.toml             # Cloudflare Pages config ✅
├── setup-cloudflare.sh       # Script de setup automatizado ✅
└── DEPLOY_CLOUDFLARE.md      # Este arquivo
```

---

## Troubleshooting

**`PrismaClient is unable to run in this browser environment`**
→ Verifique se `lib/db.ts` importa de `@prisma/client/edge` (não de `@prisma/client`).

**`NEXTAUTH_URL must be set` / falha de autenticação**
→ Defina `NEXTAUTH_URL` corretamente nas variáveis de ambiente do Cloudflare Pages.

**Erro 500 nas APIs após deploy**
→ Verifique os logs: Cloudflare Pages → seu projeto → **Functions** → **Real-time Logs**.

**`Cannot find module '@prisma/extension-accelerate'`**
→ Execute `yarn install` e depois `npx prisma generate`.

**Pagamento Asaas não processa**
→ Confirme que `ASAAS_API_KEY` está correto e `ASAAS_SANDBOX` tem o valor esperado (`true`/`false`).

**Deploy falha com "project not found"**
→ Primeiro acesso: crie o projeto manualmente em dash.cloudflare.com → Pages → Create project → Direct upload.
