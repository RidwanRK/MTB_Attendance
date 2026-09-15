import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "puppeteer"],
  outputFileTracingIncludes: {
    "/api/report": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
