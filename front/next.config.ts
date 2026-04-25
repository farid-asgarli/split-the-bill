import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5062";
    return [
      {
        source: "/api/bill/:path*",
        destination: `${backendUrl}/api/bill/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/auth/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/api/admin/:path*`,
      },
      {
        source: "/api/qr/:path*",
        destination: `${backendUrl}/api/qr/:path*`,
      },
      {
        source: "/api/webhook/:path*",
        destination: `${backendUrl}/api/webhook/:path*`,
      },
    ];
  },
};

export default nextConfig;
