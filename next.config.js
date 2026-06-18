/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  // Injeta variáveis de ambiente em tempo de build para o Edge Runtime do Cloudflare
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ASAAS_API_KEY: process.env.ASAAS_API_KEY,
    ASAAS_SANDBOX: process.env.ASAAS_SANDBOX,
  },
};

module.exports = nextConfig;
