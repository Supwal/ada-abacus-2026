---
name: clerk-auth
description: Instala e migra a autenticação do ADA para Clerk (login com verificação por e-mail). Usar quando o pedido envolver autenticação, login por e-mail, verificação de e-mail, cadastro de usuários ou migração do NextAuth. Baseado no guia oficial clerk.com/SKILL.md, adaptado à stack deste projeto.
---

# Autenticação com Clerk no ADA (login com verificação por e-mail)

## Por que Clerk neste projeto

O objetivo pedido é **"homologação de login via e-mail"**: o usuário só entra
depois de provar que o e-mail é dele (código de verificação enviado por
e-mail). O app hoje usa NextAuth com senha simples e **não tem nenhuma
infraestrutura de envio de e-mail**. A Clerk resolve os dois de uma vez:
telas prontas de login/cadastro, verificação por e-mail com código (a Clerk
envia os e-mails — sem configurar SMTP), e recuperação de senha.

## Stack deste projeto (contexto obrigatório antes de mexer)

- Next.js 14 App Router + `@cloudflare/next-on-pages`, **tudo em Edge runtime**
  no Cloudflare Pages (deploy automático a cada push na `main`).
- Auth atual: **NextAuth (JWT em cookie)**. TODAS as rotas de API chamam
  `getSession(req)` de `lib/db.ts`, que decodifica o JWT do cookie. A maioria
  resolve o usuário por `session.email` → `SELECT id FROM users WHERE email=...`.
- Banco: Neon Postgres com tabela `users` própria (id UUID, email, senha hash).
- **Não existe `middleware.ts`** hoje (a proteção é client-side + checagem por
  rota de API).

## Passos do guia oficial (clerk.com/SKILL.md), adaptados

1. **CLI**: `npm install -g clerk` (o pacote npm chama-se `clerk`;
   dá pra usar `npx clerk` sem instalar).
2. **Login (opcional no início)**: `clerk auth login` abre o navegador para
   entrar na conta Clerk. ⚠️ Passo manual do dono do projeto. **Alternativa
   sem conta**: `clerk init` funciona com *temporary development keys* —
   permite desenvolver e testar localmente antes de criar a conta.
3. **Init**: `clerk init -y` (não-interativo) detecta Next.js e instala
   `@clerk/nextjs`, cria `middleware.ts` com `clerkMiddleware()`, envolve o
   layout com `<ClerkProvider>` e grava as chaves em `.env.local`.
4. **Fallback**: se o init falhar, seguir o quickstart manual
   https://clerk.com/docs/quickstarts/nextjs
5. **Controles de UI**: `<SignIn />`, `<SignUp />`, `<UserButton />` nas
   páginas de auth.
6. **Verificação**: `clerk doctor` + testar login/cadastro.
7. **Tema shadcn (opcional)**: `@clerk/ui` — este projeto usa Radix+Tailwind,
   avaliar depois.

## Variáveis de ambiente

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — pública, vai no cliente.
- `CLERK_SECRET_KEY` — **NUNCA no cliente nem commitada**. Local: `.env.local`
  (git-ignorado). Produção: Cloudflare Pages → Configurações → Variáveis e
  segredos (tipo Segredo), igual às outras.
- Depois de criar a conta Clerk: pegar as chaves em dashboard.clerk.com →
  API Keys, e ativar **Email verification code** em User & Authentication →
  Email, Phone, Username.

## Plano de migração incremental (NÃO fazer big-bang)

O app está em produção com usuários reais — a migração deve ser em fases,
cada uma deployável sem quebrar o login atual:

1. **Fase 1 — coexistência**: instalar `@clerk/nextjs`, `middleware.ts` com
   `clerkMiddleware()` SEM proteger rota nenhuma (por padrão tudo fica
   público), `<ClerkProvider>` no layout. NextAuth continua mandando.
   Deploy seguro: nada muda para o usuário.
2. **Fase 2 — telas novas**: novas rotas `/entrar` e `/cadastrar` com os
   componentes da Clerk (com verificação por e-mail ativada). As telas
   antigas continuam existindo.
3. **Fase 3 — ponte de usuários**: no primeiro login Clerk, casar por
   e-mail com a tabela `users` existente (mesma coluna email) e guardar o
   `clerk_user_id` numa coluna nova. Migração SQL aditiva.
4. **Fase 4 — troca do getSession**: `lib/db.ts#getSession` passa a validar
   a sessão Clerk (via `@clerk/nextjs/server`) e devolver o mesmo formato
   `{ email, sub }` que as rotas já esperam — assim as ~20 rotas de API não
   precisam mudar.
5. **Fase 5 — desligar NextAuth**: remover telas antigas, rota
   `[...nextauth]`, `NEXTAUTH_SECRET`. Só depois de dias de convivência ok.

## Cuidados específicos desta stack

- **Edge/Cloudflare**: usar sempre `@clerk/nextjs/server` (compatível com
  edge). Clerk tem guia próprio para Cloudflare Pages.
- **Idle logout**: o app tem logout por inatividade (2 min) via
  `IdleLogoutProvider` — reimplementar com `signOut()` da Clerk na fase 4.
- **PWA/Service worker**: as rotas da Clerk (`/entrar`, `__clerk*`) nunca
  devem ser cacheadas — conferir `public/service-worker.js` (API já não
  cacheia; manter navegação network-first).
- **Não ler/expor `.env` existente** ao rodar a CLI (regra do guia oficial).
- Textos de UI em pt-BR (localization `ptBR` do pacote `@clerk/localizations`).
