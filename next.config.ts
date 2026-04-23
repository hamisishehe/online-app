import type { NextConfig } from "next";

function parseCsvEnv(name: string, fallback: string) {
  return (process.env[name] ?? fallback)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const allowedDevOrigins = parseCsvEnv(
  "ALLOWED_DEV_ORIGINS",
  "localhost,127.0.0.1,41.59.57.5"
);

const serverActionAllowedOrigins = parseCsvEnv(
  "SERVER_ACTIONS_ALLOWED_ORIGINS",
  "localhost:3005,127.0.0.1:3005,41.59.57.5:3005"
);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "/media/:path*",
        },
      ],
    };
  },
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins,
      // Allow image uploads via Server Actions (default is 1MB)
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
