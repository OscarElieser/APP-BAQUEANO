# ☁️ BAQUEANO — Despliegue en Azure

## 🎯 POR QUÉ

El Hackathon Nicaragua 2026 exige en el Sprint 2 un servidor Azure con SSH, IP pública, puertos definidos, entorno de ejecución y conexión cloud ("no localhost"). En el Sprint 3 pide además acceso público, seguridad e integración con GitHub (lo desplegado = rama `main`).

Azure **no sustituye** la arquitectura BAQUEANO:

| Servicio | Rol |
| --- | --- |
| Firebase | Identidad (Auth, Google Login). `app-baqueano.web.app` se mantiene como respaldo técnico |
| Supabase | Información (PostgreSQL + RLS). Se consulta por HTTPS; su puerto nunca se abre en Azure |
| Hostinger | Dominio y DNS de `baqueanonicaragua.com` |
| **Azure** | Infraestructura: servidor público que sirve el Website del dominio principal |

## ⚙️ CÓMO — Arquitectura

```text
Visitante ──HTTPS──► baqueanonicaragua.com (DNS en Hostinger: A → IP pública Azure)
                          │
              ┌───────────▼─────────── Azure · rg-baqueano-prod · Central US ──┐
              │ NSG: 443 Any · 80 Any (301) · 22 solo IP admin · resto denegado │
              │ vm-baqueano-prod · Ubuntu 22.04 LTS · usuario baqueano          │
              │   ufw (espejo del NSG) · fail2ban · SSH solo clave              │
              │   Nginx :443 TLS Let's Encrypt   (www → 301 dominio principal)  │
              │     /             → /var/www/baqueano/current (release de main) │
              │     /health       → commit desplegado (evidencia jurado)        │
              │     /api/azure/*  → Node 127.0.0.1:3000 (systemd baqueano-api)  │
              │     /api/*        → proxy a Firebase Functions (temporal)       │
              │   PostgreSQL 14 solo localhost (evidencia rúbrica, sin datos)   │
              └───────────────┬──────────────────────────┬──────────────────────┘
                              │ HTTPS (API → Supabase)    │ HTTPS desde el navegador
                    Supabase PostgreSQL (base principal)   Firebase Auth · Firestore · Gemini
```

### Base de datos: rúbrica y arquitectura a la vez

La rúbrica del Sprint 2 pide comprobar una base de datos funcionando **dentro** del servidor Azure, pero la base productiva de BAQUEANO es Supabase. Se cumplen ambas cosas:

- **PostgreSQL local** (`setup-server.sh`): instalado y activo, escuchando solo en `localhost`, sin datos de BAQUEANO. Es evidencia técnica.
- **Supabase**: base principal. La API de Azure demuestra la conexión real en `GET /api/azure/db` (conteo de departamentos publicados, sin descargar filas).

Frase para el jurado: *"Azure tiene PostgreSQL instalado y funcionando, como pide la rúbrica; la arquitectura productiva usa Supabase PostgreSQL como fuente única de verdad, consumida desde Azure por HTTPS. Ningún puerto de base de datos está expuesto a Internet."*

### API de infraestructura (`azure/api/server.js`)

| Ruta pública | Respuesta |
| --- | --- |
| `GET /api/azure/health` | hostname de la VM, SO, versión de Node, uptime y commit desplegado |
| `GET /api/azure/db` | estado de Supabase (HTTP, `departments`, latencia) y de PostgreSQL local |

Node puro sin dependencias npm, solo en `127.0.0.1:3000`, ejecutado por systemd (`azure/systemd/baqueano-api.service`) como usuario sin privilegios, con reinicio automático. Se usa systemd en lugar de PM2 porque viene incluido en Ubuntu y no requiere paquetes npm globales; la función es la misma (reinicio y arranque con la VM). Probado en local: 200 en ambas rutas (Supabase devolvió 17 departamentos), 404 en rutas desconocidas, 405 en POST, caché de 30 s e inaccesible desde fuera de localhost.

### Conciliación con la guía de 36 pasos

| Paso de la guía | Decisión |
| --- | --- |
| 8–11, 22, 25, 32 (apt, Node, Nginx, PM2, Certbot, ufw) | Automatizados en `setup-server.sh` y `enable-https.sh` |
| 13 (clonar en `/var/www/baqueano-repo`) | Se clona en `/home/baqueano/APP-BAQUEANO`: el código fuente queda **fuera** del directorio que sirve Nginx |
| 14 (`rsync` de todo `website/`) | **No se usa**: publicaría `docs/`, `scripts/`, `apps/`, `packages/` y archivos `.md`. Se usa el build existente con lista permitida (`build-hostinger-static.mjs`) dentro de `deploy.sh` |
| 15 (configuración Nginx básica) | Sustituida por `azure/nginx/baqueano.conf`: misma idea, más redirecciones heredadas, cabeceras de seguridad equivalentes a `firebase.json` y bloqueo de archivos ocultos |
| 19 (PostgreSQL en la VM) | Incorporado, solo `localhost` |
| 20–21 (API Node → Supabase) | Incorporado (`/api/azure/*`); las escrituras con `service_role` llegan en el lote P1-10 |
| 27 (www → dominio principal) | Incorporado en Nginx |
| 29–30 (Firebase y Supabase) | Paso 7 de esta guía |
| 33 (apagado automático) | Ver "Costes" |
| 34 (evidencias) | `docs/evidencias/azure/README.md` |

## 📦 QUÉ — Procedimiento

### Recursos

| Recurso | Valor |
| --- | --- |
| Suscripción | Azure for Students |
| Grupo de recursos | `rg-baqueano-prod` |
| VM | `vm-baqueano-prod`, Central US, zona 1, inicio seguro (Secure Boot + vTPM) |
| Imagen | Ubuntu Server 22.04 LTS |
| Tamaño | Standard D2s_v3 (2 vCPU, 8 GiB) — ver "Costes" |
| Usuario | `baqueano` (solo clave pública SSH) |
| Red | `vnet-centralus-1` / `snet-centralus-1`, IP pública `vm-baqueano-prod-ip` |
| NSG | `vm-baqueano-prod-nsg` (lo crea o ajusta `azure/configure-nsg.sh`) |

### Paso 0 — Clave SSH nueva (obligatorio)

La clave `vm-baqueano-prod_key` se compartió fuera del equipo del administrador, así que se considera **comprometida**. Hay que reemplazarla:

1. En tu PC (PowerShell): `ssh-keygen -t ed25519 -f $HOME\.ssh\baqueano_azure -C "baqueano-azure"`. Protege la clave con una frase de paso.
2. Portal Azure → `vm-baqueano-prod` → **Ayuda → Restablecer contraseña** → modo "Restablecer clave pública SSH" → usuario `baqueano` → pega el contenido de `baqueano_azure.pub`.
3. Borra el archivo `.pem` antiguo de tu equipo (Descargas). Nunca subas claves privadas a Git ni las pegues en chats.
4. Si Azure tenía el par guardado como recurso "Clave SSH", elimínalo en el portal.

### Paso 1 — Reglas de red (Cloud Shell)

```bash
# En tu PC, averigua tu IP pública:  curl https://api.ipify.org
# En Azure Cloud Shell (bash):
curl -fsSLO https://raw.githubusercontent.com/OscarElieser/APP-BAQUEANO/main/azure/configure-nsg.sh
ADMIN_IP=<tu_ip> bash configure-nsg.sh
```

Si tu IP cambia (red doméstica o del instituto), vuelve a ejecutarlo con la nueva.

### Paso 2 — Aprovisionar el servidor

```powershell
ssh -i $HOME\.ssh\baqueano_azure baqueano@<IP_PUBLICA>
```

```bash
git clone https://github.com/OscarElieser/APP-BAQUEANO.git ~/APP-BAQUEANO
sudo bash ~/APP-BAQUEANO/azure/setup-server.sh
```

### Paso 3 — Primer despliegue

```bash
bash ~/APP-BAQUEANO/azure/deploy.sh
curl http://<IP_PUBLICA>/health     # desde tu PC
```

### Paso 4 — Videos (no versionados en Git)

Desde tu PC, en la raíz del proyecto:

```powershell
ssh -i $HOME\.ssh\baqueano_azure baqueano@<IP_PUBLICA> "mkdir -p /var/www/baqueano/media/videos"
scp -i $HOME\.ssh\baqueano_azure "website/assets/videos/video nicaragua.mp4" website/assets/videos/destinos.mp4 website/assets/videos/gastronomia.mp4 website/assets/videos/historia.mp4 website/assets/videos/video.mp4 baqueano@<IP_PUBLICA>:/var/www/baqueano/media/videos/
```

Después, `bash ~/APP-BAQUEANO/azure/deploy.sh`. Comprimir los videos antes (< 5 MB) es una tarea P2 (`docs/audit/PERFORMANCE_AUDIT.md`).

### Paso 5 — DNS en Hostinger

1. hPanel → Dominios → `baqueanonicaragua.com` → **DNS / Nameservers**.
2. Baja el TTL a 300 s.
3. Borra o desactiva la página de "parking" y cualquier registro `A`/`CNAME` existente para `@` y `www`.
4. Crea `A  @  <IP_PUBLICA>` y `A  www  <IP_PUBLICA>`.
5. Comprueba con `nslookup baqueanonicaragua.com` que ya devuelva la IP de Azure.

### Paso 6 — HTTPS

```bash
sudo CERTBOT_EMAIL=<correo_admin> bash ~/APP-BAQUEANO/azure/enable-https.sh
```

### Paso 7 — Autorizar el nuevo dominio en Firebase y Supabase

Sin este paso, el inicio de sesión con Google falla en `baqueanonicaragua.com`.

1. **Firebase Console** → Authentication → Settings → **Authorized domains** → añadir `baqueanonicaragua.com` y `www.baqueanonicaragua.com`.
2. **Google Cloud Console** → APIs y servicios → Credenciales → cliente OAuth web (`578585227888-47unu…`) → *Orígenes de JavaScript autorizados*: añadir `https://baqueanonicaragua.com` y `https://www.baqueanonicaragua.com`.
3. **Supabase** → Authentication → URL Configuration: *Site URL* `https://baqueanonicaragua.com`; añadir ambos dominios y `https://app-baqueano.web.app` en *Redirect URLs*. (PostgREST no requiere configurar CORS para la clave publicable.)

### Paso 8 — Comprobación final

```bash
curl -I http://baqueanonicaragua.com            # 301 → https
curl -I https://www.baqueanonicaragua.com       # 301 → https://baqueanonicaragua.com
curl https://baqueanonicaragua.com/health       # commit desplegado
curl https://baqueanonicaragua.com/api/azure/db # Supabase ok + PostgreSQL local ok
```

### Despliegues posteriores y rollback

```bash
bash ~/APP-BAQUEANO/azure/deploy.sh             # último main
bash ~/APP-BAQUEANO/azure/deploy.sh --rollback  # release anterior
```

### Evidencia para el jurado

| Requisito | Comando o prueba |
| --- | --- |
| Servidor Azure | Captura de Overview de la VM (IP, SO, tamaño) |
| SSH | `ssh -v baqueano@<IP>` (autenticación por clave) |
| Puertos | Captura de las reglas del NSG; `nmap -Pn <IP>` debe mostrar solo 22, 80 y 443 |
| No localhost | `curl https://baqueanonicaragua.com/health` → JSON con `commit` |
| BD en Azure | `systemctl status postgresql`; `ss -ltnp \| grep 5432` → solo `127.0.0.1` |
| Azure → Supabase | `curl https://baqueanonicaragua.com/api/azure/db` → `"ok":true,"departments":17` |
| Lista completa de capturas | [docs/evidencias/azure/README.md](evidencias/azure/README.md) |
| GitHub = producción | El `commit` de `/health` coincide con `git rev-parse --short origin/main` |
| HTTPS | `curl -I http://baqueanonicaragua.com` → 301 a `https://` |
| Seguridad | `curl -I https://baqueanonicaragua.com` muestra CSP, HSTS y X-Frame-Options |

### Costes (Azure for Students)

- D2s_v3 cuesta **0,11 USD/h ≈ 80 USD/mes** encendida 24/7, más el disco Premium SSD. Con el crédito de 100 USD alcanza para unas 5 semanas.
- Opciones: activar **Apagado automático** en el portal fuera de horas de demo, o redimensionar a **B2s** (≈ 0,04 USD/h), que basta para un sitio estático con Nginx.
- La IP pública está configurada para conservarse aunque se elimine la VM (útil para no tocar el DNS otra vez).

### Recuperación

- **Si la VM se pierde:** crear otra VM igual, ejecutar los pasos 1 a 4 y reasignar la IP pública conservada (o actualizar el registro `A`).
- **Si un despliegue falla:** `deploy.sh --rollback`.
- **Si cae el servidor:** `app-baqueano.web.app` sigue sirviendo el mismo sitio desde Firebase Hosting.

### Pendiente (lotes siguientes)

- Ampliar la API de Azure con `/api/baqui` y las escrituras del Ops Center con `service_role` solo en el servidor (lotes P1-8 y P1-10). La prueba CRUD de punta a punta del Sprint 3 (`13-crud.png`) depende de la integración Firebase Auth ↔ Supabase (lote P1-4/P1-5).
- GitHub Actions para desplegar por SSH en cada push a `main`.
