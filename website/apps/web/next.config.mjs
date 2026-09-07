/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: workspaceRoot,
  transpilePackages: [
    "@baqueano/config",
    "@baqueano/design-system",
    "@baqueano/firebase",
    "@baqueano/types",
    "@baqueano/ui",
    "@baqueano/validators"
  ],
  images: {
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
