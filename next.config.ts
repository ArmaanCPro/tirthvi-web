import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  // Ensure server bundler handles pdf-parse correctly
  serverExternalPackages: ["pdf-parse"],

  eslint: {
      ignoreDuringBuilds: true,
  },
  typescript: {
      ignoreBuildErrors: true,
  },
};

export default nextConfig;
