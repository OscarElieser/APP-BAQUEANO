# ☁️ BAQUEANO — Auditoría Azure (Fase 1)

## 🎯 POR QUÉ

La rúbrica del Hackathon Nicaragua 2026 exige en **Sprint 2**: servidor Azure, SSH, IP pública, puertos, entorno, conexión a base de datos y "no localhost"; y en **Sprint 3**: acceso público, seguridad, puertos e integración completa con GitHub = código desplegado.

## ⚙️ CÓMO

Búsqueda en todo el repositorio (excluyendo `.snapshots`) de artefactos Azure, Docker, Nginx, Bicep, Terraform, systemd o scripts de despliegue.

## 📦 QUÉ

### Estado actual: ❌ inexistente

- Sin recursos, scripts, plantillas ni documentación operativa.
- "Azure" solo aparece en `docs/planning/BAQUEANO_3_SPRINT_EXECUTION_PLAN.md`, el CSV de Trello y lockfiles (dependencias transitivas).
- No existe `docs/AZURE_DEPLOYMENT.md`.

### Propuesta mínima, segura y defendible

| Recurso | Configuración |
| --- | --- |
| Resource Group | `rg-baqueano-hackathon` (región cercana: `eastus2` o `southcentralus`) |
| VM | Ubuntu Server 24.04 LTS, `Standard_B1s`/`B2s` (créditos estudiante) |
| IP pública | Estática, Standard SKU |
| NSG | 443 TCP `Any`; 80 TCP `Any` (solo redirección 301); 22 TCP **solo IP del equipo**; resto denegado. **5432 nunca** |
| Acceso | SSH con clave ed25519, `PasswordAuthentication no`, `PermitRootLogin no`, `fail2ban`, `ufw` espejo del NSG |
| Runtime | Node.js 20 LTS + PM2 (API), Nginx (estático + proxy `/api`) |
| TLS | Certbot (Let's Encrypt) para `baqueanonicaragua.com` y `www` |
| DNS (Hostinger) | `A @ → IP Azure`, `A www → IP Azure` (o CNAME). Retirar la página de aparcamiento |
| Secretos | `/etc/baqueano/api.env` (600, propietario del servicio): `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`. Nunca en Git |
| Base de datos | Supabase remoto por HTTPS (PostgREST) o `postgres://` con TLS desde la VM; Azure no aloja la base |
| Despliegue | GitHub Actions → SSH (`appleboy/ssh-action`) con clave de despliegue limitada → `git pull` del commit de `main` → `pnpm build:hostinger` → recarga Nginx/PM2 |
| Evidencia | `curl -I https://baqueanonicaragua.com`, `/api/health` mostrando commit SHA, captura NSG, `ssh -v`, `nmap` solo 22/80/443 |

### Riesgos

- Coste: apagar la VM fuera de demostraciones o usar B1s.
- El DNS lo controla Hostinger: un error deja el dominio sin servicio. Bajar TTL a 300 s antes del cambio.
- `app-baqueano.web.app` sigue funcionando como respaldo inmediato.

### Requiere acción del propietario

Crear la suscripción/recursos en el portal Azure y acceder al panel DNS de Hostinger: el asistente no tiene esas credenciales. Se entregarán los scripts (`azure/`) y la guía paso a paso.
