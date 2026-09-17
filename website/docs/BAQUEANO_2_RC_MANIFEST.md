# 🧭 BAQUEANO 2.0 — RELEASE CANDIDATE MANIFEST

```yaml
release_candidate:
  version: "2.0.0-rc.1"
  codename: "Baqueano Territorio & Soberanía Digital"
  target_date: "2026-09-08"
  commit: "e534556"
  build_status: "SUCCESS"
  environment: "production-ready"

artifacts:
  android:
    engine: "Flutter 3.29.3"
    dart: "3.7.2"
    target_apk: "app-release.apk"
    target_aab: "app-release.aab"
    tests_passed: 31
    tests_failed: 0

  website:
    framework: "Next.js 15.5.25"
    node: "v22.16.0"
    pnpm: "9.15.4"
    web_routes: 60
    admin_routes: 37
    typecheck_errors: 0
    lint_warnings: 0

security:
  exposed_secrets: 0
  p0_blockers: 0
  p1_blockers: 0
  firestore_rules: "enforced"
  storage_rules: "enforced"

certification:
  verdict: "GO — BAQUEANO 2.0 RC APPROVED"
  lead_architect: "Baqueano Core Architecture Team"
```
