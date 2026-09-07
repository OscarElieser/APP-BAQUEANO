#!/usr/bin/env node
/**
 * WHY
 * Provides a fast local quality gate for production-hardening invariants.
 *
 * HOW
 * Reads source files and verifies security-sensitive contracts without requiring live credentials.
 *
 * WHAT
 * Smoke tests for env placeholders, health route, admin noindex, and known Firestore query regressions.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const envExample = read(".env.example");
const envStaging = read(".env.staging");
const envProduction = read(".env.production");
const firebaseSource = read("packages/firebase/src/index.ts");
const webHealthRoute = read("apps/web/src/app/api/health/route.ts");
const adminLayout = read("apps/admin/src/app/layout.tsx");
const webConfig = read("apps/web/next.config.mjs");
const adminConfig = read("apps/admin/next.config.mjs");

for (const [name, source] of [
  [".env.example", envExample],
  [".env.staging", envStaging],
  [".env.production", envProduction]
]) {
  assert(!source.includes("-----BEGIN"), `${name} must not contain private key material.`);
  assert(!source.includes("AIzaSy"), `${name} must not contain a real-looking Firebase API key.`);
  assert(source.includes("NEXT_PUBLIC_FIREBASE_PROJECT_ID"), `${name} must document Firebase project id.`);
}

assert(firebaseSource.includes('where("userId", "==", userId)'), "Favorites query must use the runtime userId.");
assert(webHealthRoute.includes("validatePublicEnvironment"), "Health route must validate public env.");
assert(adminLayout.includes("index: false") && adminLayout.includes("follow: false"), "Admin metadata must be noindex/nofollow.");
assert(webConfig.includes("Content-Security-Policy"), "Web app must define CSP headers.");
assert(adminConfig.includes("X-Robots-Tag"), "Admin app must emit noindex header.");

if (failures.length > 0) {
  console.error("Production smoke tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Production smoke tests passed.");
