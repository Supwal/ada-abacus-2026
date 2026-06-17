#!/usr/bin/env bash
# ============================================================
# ADA ABACUS 2026 — Setup completo para Cloudflare Pages
# Execute: bash setup-cloudflare.sh
# ============================================================

set -e

echo ""
echo "=================================================="
echo "  ADA ABACUS 2026 — Setup Cloudflare Pages (A)"
echo "=================================================="
echo ""

# 1. Instalar dependências
echo "📦 [1/6] Instalando dependências..."
yarn install
echo "✅ Dependências instaladas"
echo ""

# 2. Gerar cliente Prisma
echo "🔧 [2/6] Gerando cliente Prisma (Edge)..."
npx prisma generate
echo "✅ Prisma client gerado"
echo ""

# 3. Reset do banco e aplicar schema
echo "🗄️  [3/6] Aplicando schema no banco de dados..."
echo "   ⚠️  Isso vai APAGAR todos os dados existentes."
read -p "   Confirma? (s/N): " confirm
if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
  npx prisma migrate reset --force --skip-seed
  npx prisma db push
  echo "✅ Banco de dados atualizado"
else
  echo "   ⏭️  Reset do banco pulado"
fi
echo ""

# 4. Verificar variáveis de ambiente
echo "🔑 [4/6] Verificando variáveis de ambiente..."
if [ -z "$DATABASE_URL" ]; then
  echo "   ⚠️  DATABASE_URL não definido!"
  echo "   Configure no Cloudflare Pages → Settings → Environment variables"
  echo "   Use a URL do Prisma Accelerate: prisma://accelerate.prisma-data.net/?api_key=..."
else
  echo "✅ DATABASE_URL configurado"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "   ⚠️  NEXTAUTH_SECRET não definido!"
else
  echo "✅ NEXTAUTH_SECRET configurado"
fi
echo ""

# 5. Build para Cloudflare Pages
echo "🏗️  [5/6] Gerando build para Cloudflare Pages..."
npx @cloudflare/next-on-pages
echo "✅ Build gerado em .vercel/output/static"
echo ""

# 6. Deploy
echo "🚀 [6/6] Fazendo deploy no Cloudflare Pages..."
npx wrangler pages deploy .vercel/output/static --project-name ada-abacus-2026
echo ""
echo "=================================================="
echo "  ✅ Deploy concluído!"
echo "=================================================="
echo ""
echo "Próximos passos:"
echo "  1. Acesse https://dash.cloudflare.com → Pages → ada-abacus-2026"
echo "  2. Configure as variáveis de ambiente de produção"
echo "  3. Configure NEXTAUTH_URL com a URL do seu projeto"
echo "  4. Se tiver domínio personalizado, adicione em Custom Domains"
echo ""
