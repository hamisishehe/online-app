import type { NextConfig } from "next";

const allowedDevOrigins = (
  process.env.ALLOWED_DEV_ORIGINS ?? "localhost,127.0.0.1"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  experimental: {
    serverActions: {
      // Allow image uploads via Server Actions (default is 1MB)
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
