import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [55, 82, 88],
    minimumCacheTTL: 604800
  }
};

export default nextConfig;
