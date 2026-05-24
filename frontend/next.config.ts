import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // required for Docker multi-stage build
  images: {
    // Use unoptimized for Directus assets to avoid 502 errors from Vercel
    // trying to fetch protected assets through its optimizer
    unoptimized: process.env.NODE_ENV === "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.DIRECTUS_HOST ?? "ja-pacze-sercem-cms.onrender.com",
        port: "",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "ja-pacze-sercem-cms.onrender.com",
        port: "",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8055",
        pathname: "/assets/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
