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
              │   Nginx :443 TLS Let's Encrypt                                  │
              │     /          → /var/www/baqueano/current (release de main)    │
              │     /health    → commit desplegado (evidencia jurado)           │
              │     /api/*     → proxy a Firebase Functions (temporal)          │
              └──────────────────────────┬──────────────────────────────────────┘
                                         │ HTTPS desde el navegador
                    Firebase Auth · Firestore · Supabase · Gemini (BAQUI)
```

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

- API propia en Azure (`/api/baqui`, escrituras del Ops Center con `service_role` solo en el servidor), lotes P1-8 y P1-10.
- GitHub Actions para desplegar por SSH en cada push a `main`.
