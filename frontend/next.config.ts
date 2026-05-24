import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // required for Docker multi-stage build
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.DIRECTUS_HOST ?? "ja-pacze-sercem-cms.onrender.com",
        port: "",
        pathname: "/assets/**",
      },
      {
        // Always allow Render CMS hostname for images
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
