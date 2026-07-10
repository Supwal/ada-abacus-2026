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

### ⚠️ Commit ≠ Deploy — sempre confira se o push chegou

Um `git commit` só existe na sua máquina. **Só conta como publicado depois
do `git push` terminar com sucesso.** Depois de qualquer commit, confirme
antes de considerar a tarefa concluída:

```bash
git log --oneline -1                 # último commit local
git log --oneline -1 origin/main     # último commit que o GitHub já tem
```

Se os dois hashes forem diferentes, o push não chegou — rode `git push`
de novo. Em alguns ambientes o Git Credential Manager pede login de novo
depois de um tempo (o cache expira); nesse caso o `git push` abre o
navegador pedindo para entrar no GitHub de novo — é normal, só repetir o
login resolve.

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

## Armazenamento de arquivos (R2) — entrega de Packs

Os arquivos reais (fotos/vídeos) de cada Pack ficam num bucket R2 privado
(`ada-abacus-packs`), acessado pelo binding `PACKS_BUCKET` (ver `lib/r2.ts`).

> ⚠️ **Ordem importa**: crie o bucket ANTES de declarar o binding em
> qualquer lugar (dashboard ou `wrangler.toml`). Referenciar um bucket R2
> que ainda não existe derruba o deploy inteiro (aparece como "Nenhuma
> implantação disponível", sem log de build claro) — foi o que aconteceu
> quando esse binding foi commitado no `wrangler.toml` antes do bucket
> existir. Por isso o `wrangler.toml` deste repositório **não** declara
> `[[r2_buckets]]` — só tem o exemplo comentado.

**Passo a passo, nessa ordem:**
1. Cloudflare dashboard → **R2** → **Create bucket** → nome
   `ada-abacus-packs`.
2. Só depois do bucket existir: Workers & Pages → `ada-abacus-2026` →
   **Settings** → **Bindings** → **Add** → R2 bucket → variável
   `PACKS_BUCKET` → bucket `ada-abacus-packs`. (Produção usa **só** o
   binding do painel — o `wrangler.toml` não é lido para bindings em
   deploy via integração Git.)
3. Se o deploy mais recente tiver falhado por causa disso, dispare um novo
   deploy depois (ex.: `git push` de um commit vazio, ou "Retry
   deployment" no painel).

- **Local**: `npm run dev` (Node puro) **não tem acesso a bindings R2** —
  upload de arquivo vai falhar com "binding não disponível". Pra testar de
  verdade localmente, depois de criar o bucket: descomente o bloco
  `[[r2_buckets]]` no `wrangler.toml` e rode `next build && npx
  @cloudflare/next-on-pages && npx wrangler pages dev
  .vercel/output/static`.

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

**`Prisma Client was configured to use the 'adapter' option but it was imported via its '/edge' endpoint`**
→ `lib/db.ts` deve importar `PrismaClient` de `@prisma/client` (o pacote normal),
**nunca** de `@prisma/client/edge`. O import `/edge` é só para quando se usa
Prisma Accelerate (Data Proxy, `prisma://`) — é incompatível com passar um
`adapter` (como `PrismaNeonHTTP`) no construtor, que é o que este projeto
usa. Isso já foi corrigido uma vez (era a causa de todas as rotas com
`makePrisma()` derrubarem com 500) — se voltar a acontecer, é sinal de que
alguém reintroduziu o import `/edge`.

**`Transactions are not supported in HTTP mode`**
→ O adapter `PrismaNeonHTTP` (usado em `makePrisma()`) fala com o Neon via
HTTP puro — sem conexão persistente, então não dá pra abrir uma transação.
Qualquer `prisma.<model>.create()` (ou `update`/`upsert`) que também tenha
um `include:` de relação dispara uma transação implícita internamente (o
motor de query mais novo do Prisma faz isso para garantir consistência) e
quebra com esse erro. **Correção**: separar em duas chamadas — `create()`
sem `include`, depois um `findUnique({ where: { id }, include: {...} })`
à parte. Veja `app/api/availabilities/route.ts`, `app/api/expenses/route.ts`
e `app/api/earnings/route.ts` como referência do padrão já corrigido.

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
