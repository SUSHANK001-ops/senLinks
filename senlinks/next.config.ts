import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma and Neon out of webpack bundling so process.env is read
  // at real Node.js runtime, not inlined at compile time.
  serverExternalPackages: [
    "@prisma/client",
    "@neondatabase/serverless",
    "@prisma/adapter-neon",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
