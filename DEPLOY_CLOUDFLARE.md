# Deploy ADA ABACUS 2026 — Cloudflare Pages

> **O deploy é automático.** O Cloudflare Pages está conectado ao repositório
> GitHub `Supwal/ada-abacus-2026`, branch `main`, com "Implantações automáticas"
> ativadas. **Todo `git push origin main` gera um novo build e publica em
> produção sozinho — não existe passo manual de deploy a fazer.**

---

## Como funciona o deploy (leia isto primeiro)

1. Você commita e dá `git push origin main`.
2. O GitHub avisa o Cloudflare Pages do novo commit.
3. O Cloudflare builda (`next build` + `@cloudflare/next-on-pages`) e publica
   automaticamente em `https://ada-abacus-2026.pages.dev` (e no domínio
   personalizado, se houver).
4. Acompanhe o progresso em: **dash.cloudflare.com → Workers & Pages →
   ada-abacus-2026 → Deployments**.

**Nunca pule o `git push`** — sem ele, nada muda em produção, mesmo que o
código local esteja correto. Se uma correção parece "não ter feito efeito",
o primeiro passo é verificar se o commit foi de fato enviado ao GitHub
(`git log origin/main -1`) e se o deploy correspondente aparece como
concluído no painel.

> O cache do Service Worker do PWA no celular do usuário também pode fazer
> uma versão antiga parecer "travada" mesmo com o deploy novo já no ar —
> nesse caso, reinstalar o PWA ou limpar o cache do site resolve.

---

## Variáveis de ambiente (já configuradas)

As variáveis de produção já estão cadastradas em **Cloudflare Pages →
ada-abacus-2026 → Settings → Variáveis e segredos**, todas como "Segredo"
(criptografadas), exceto `NODE_ENV`:

| Variável | Tipo |
|---|---|
| `DATABASE_URL` | Segredo — connection string do Neon Postgres |
| `NEXTAUTH_SECRET` | Segredo |
| `NEXTAUTH_URL` | Segredo |
| `ASAAS_API_KEY` | Segredo |
| `ASAAS_SANDBOX` | Segredo (`"true"` ou `"false"`) |
| `NODE_ENV` | Texto simples — `"produção"` |

Só mexa aqui se precisar **trocar** um valor (ex.: rotacionar uma chave
vazada). Depois de editar uma variável, é preciso disparar um novo deploy
para ela entrar em vigor — um `git push` vazio ou "Retry deployment" no
painel resolvem.

> ⚠️ Nunca coloque o valor real dessas variáveis em arquivos versionados
> (`.md`, `.example`, etc.) — use sempre placeholders na documentação.

---

## Banco de dados

O projeto usa **Neon Postgres** direto, via `@neondatabase/serverless` +
adapter `PrismaNeonHTTP` (compatível com o Edge Runtime do Cloudflare) —
**não** usa Prisma Accelerate. Veja `lib/db.ts`.

Não há uma pasta `prisma/migrations` formal: mudanças de schema são feitas
com scripts SQL em `scripts/*.sql` (`ALTER TABLE ... ADD COLUMN IF NOT
EXISTS ...`, sempre aditivo/não-destrutivo) rodados uma vez contra o banco,
e `prisma/schema.prisma` é atualizado manualmente para refletir a mudança.

```bash
# Rodar um script de migração pontual
npx tsx --require dotenv/config scripts/nome-do-script.ts
# ou, para SQL puro:
psql "$DATABASE_URL" -f scripts/nome-do-script.sql
```

---

## Deploy manual (só em caso de emergência)

Só use isto se o GitHub → Cloudflare estiver fora do ar. Precisa de login
prévio (`npx wrangler login`) e das variáveis de ambiente presentes no
`.env` local:

```bash
yarn build:cloudflare        # gera .vercel/output/static
yarn deploy:cloudflare       # build + deploy direto
# ou, se o build já existe:
npx wrangler pages deploy .vercel/output/static --project-name ada-abacus-2026
```

---

## Domínio personalizado (opcional)

1. Cloudflare Pages → `ada-abacus-2026` → **Custom domains** → **Set up a
   custom domain**.
2. Informe seu domínio.
3. Atualize a variável `NEXTAUTH_URL` para `https://seudominio.com`.

---

## Comandos de referência

```bash
# Desenvolvimento local
npm run dev

# Verificar erros TypeScript
npx tsc --noEmit

# Prisma
npx prisma generate          # regenerar cliente após mudar schema.prisma

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
│   ├── api/                  # Rotas de API (Edge Runtime)
│   └── auth/                 # Login e cadastro
├── lib/
│   ├── auth.ts                # NextAuth (JWT strategy)
│   ├── db.ts                  # Neon + PrismaNeonHTTP (Edge)
│   ├── db.edge.ts             # Alias do db.ts para rotas Edge
│   ├── estados-brasil.ts      # Mapa sigla → nome dos estados
│   └── asaas.ts                # Gateway de pagamento
├── prisma/
│   └── schema.prisma          # Modelos (sem pasta migrations formal)
├── scripts/                   # Scripts SQL/ts de migração pontual
├── .env                       # Desenvolvimento local (não versionado)
├── next.config.js             # Config para Edge
├── wrangler.toml               # Config do Cloudflare Pages
└── DEPLOY_CLOUDFLARE.md       # Este arquivo
```

---

## Troubleshooting

**`PrismaClient is unable to run in this browser environment`**
→ Verifique se `lib/db.ts` importa de `@prisma/client/edge` (não de `@prisma/client`).

**`NEXTAUTH_URL must be set` / falha de autenticação**
→ Confirme o valor de `NEXTAUTH_URL` em Settings → Variáveis e segredos.

**Erro 500 nas APIs após deploy**
→ Veja os logs: Cloudflare Pages → projeto → **Functions** → **Real-time Logs**.

**Pagamento Asaas não processa**
→ Confirme `ASAAS_API_KEY` e se `ASAAS_SANDBOX` tem o valor esperado (`true`/`false`).

**Corrigi o código mas o app continua com o comportamento antigo**
→ Primeiro confirme que o commit chegou no GitHub (`git log origin/main -1`)
e que o deploy aparece concluído no painel. Se sim, é cache do Service
Worker no dispositivo — reinstale o PWA ou limpe o cache do site.

**Deploy falha com "project not found"**
→ Só no primeiro setup: crie o projeto manualmente em dash.cloudflare.com → Pages → Create project.
