import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
