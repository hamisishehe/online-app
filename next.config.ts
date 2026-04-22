import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      // Allow image uploads via Server Actions (default is 1MB)
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
