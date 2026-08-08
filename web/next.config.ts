import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;