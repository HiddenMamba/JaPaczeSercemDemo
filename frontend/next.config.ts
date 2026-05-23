import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone", // required for Docker multi-stage build
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.DIRECTUS_HOST ?? "localhost",
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

export default withNextIntl(nextConfig);
