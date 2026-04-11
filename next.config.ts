import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  experimental: {
    optimizeCss: true,
  },
  /* config options here */
};

export default nextConfig;
