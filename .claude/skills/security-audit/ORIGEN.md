# Origen

> 🎯 POR QUÉ: el propietario pidió auditar BAQUEANO con la metodología de Cloudflare.
> ⚙️ CÓMO: copia sin cambios de `skills/security-audit/` del repositorio oficial, previa revisión.
> 📦 QUÉ: la skill `security-audit` (6 fases: reconocimiento, búsqueda guiada por cobertura, validación de candidatos, clasificación, verificación independiente e informe).

- Origen: https://github.com/cloudflare/security-audit-skill, commit c1c8a8c1471069fb0e188eeaff69b8e8db6564a8, revisado el 2026-10-06.
- Licencia: MIT (ver `LICENSE`).
- Revisión: `validate-findings.cjs` y `validate-coverage-ledger.cjs` solo usan `fs`, `path` y `util` para validar JSON. No hacen llamadas de red ni ejecutan procesos. El resto son instrucciones.
- Detalle en `docs/architecture/SKILLS_DE_TERCEROS.md`.
- Precedencia: si la skill contradice `AGENTS.md`, prevalece BAQUEANO.
