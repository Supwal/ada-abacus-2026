/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  // Para Cloudflare Pages com @cloudflare/next-on-pages:
  // execute: npx @cloudflare/next-on-pages
  // depois: npx wrangler pages deploy .vercel/output/static
};

module.exports = nextConfig;
