# Sprint 2 — Infraestructura Azure y seguridad de red

<!--
🎯 POR QUÉ: demostrar servidor, IP, SSH, runtime, base de datos y mínimo de puertos.
⚙️ CÓMO: combina configuración versionada con comprobaciones externas automatizadas.
📦 QUÉ: índice privado para capturas del portal, SSH, NSG y resultados JSON.
-->

## Evidencias automatizadas

```powershell
node tools/verify-sprints.mjs --commit=$(git rev-parse --short HEAD) --output=docs/evidencias/sprint-2/resultados/verificacion.json
```

## Capturas requeridas

1. `01-vm-overview.png`: VM, Ubuntu e IP pública.
2. `02-ssh.png`: sesión por clave, sin mostrar secretos.
3. `03-nsg.png`: 80/443 públicos, 22 restringido, sin 3000/5432.
4. `04-services.png`: Nginx, API y PostgreSQL activos.
5. `05-ip-browser.png`: IP redirigiendo al dominio canónico.

