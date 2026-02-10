import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aicujp/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
  async headers() {
    const corsHeaders = [
      { key: "Access-Control-Allow-Origin", value: "https://aicu.jp" },
      { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
    ]
    return [
      { source: "/api/push/:path*", headers: corsHeaders },
      { source: "/api/profile/:path*", headers: corsHeaders },
    ]
  },
}

export default nextConfig
