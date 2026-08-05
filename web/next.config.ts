import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is for self-hosting; Vercel handles this natively.
  // Only use "standalone" if you're NOT deploying to Vercel.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;