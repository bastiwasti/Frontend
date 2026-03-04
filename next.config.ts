import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    optimizeCss: true,
  },
  /* config options here */
};

export default nextConfig;
