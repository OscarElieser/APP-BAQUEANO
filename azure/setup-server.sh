#!/usr/bin/env bash
# =====================================================
# BAQUEANO — Aprovisionamiento del servidor Azure
# =====================================================
#
# PROPÓSITO:
#   Convertir una VM Ubuntu recién creada (vm-baqueano-prod) en el servidor
#   público de baqueanonicaragua.com, cumpliendo la rúbrica del Hackathon
#   Nicaragua 2026 (servidor, SSH, IP pública, puertos, entorno).
#
# ARQUITECTURA:
#   Nginx (80→301, 443 TLS) sirve el Website estático desde
#   /var/www/baqueano/current (enlace simbólico a la release activa).
#   Node.js 20 solo se usa para construir el sitio (y para la futura API).
#   Firewall en dos capas: NSG de Azure + ufw dentro de la VM.
#
# DEPENDENCIAS:
#   Ubuntu 22.04/24.04 LTS, usuario con sudo (baqueano), acceso a Internet.
#
# DATOS:
#   No contiene secretos. Los secretos futuros (Supabase service_role, Gemini)
#   irán en /etc/baqueano/api.env con permisos 600, nunca en Git.
#
# SEGURIDAD:
#   - SSH solo por clave pública; sin contraseña; sin login de root.
#   - fail2ban bloquea fuerza bruta en SSH.
#   - ufw permite únicamente 22, 80 y 443. La base de datos (5432) NUNCA se abre:
#     Supabase está en su propia nube y se consulta por HTTPS.
#   - Actualizaciones de seguridad automáticas (unattended-upgrades).
#
# RELACIÓN:
#   azure/nginx/baqueano.conf (sitio), azure/deploy.sh (despliegues),
#   docs/AZURE_DEPLOYMENT.md (guía paso a paso).
#
# USO (en la VM):
#   git clone https://github.com/OscarElieser/APP-BAQUEANO.git ~/APP-BAQUEANO
#   sudo bash ~/APP-BAQUEANO/azure/setup-server.sh
#
# Es idempotente: puede ejecutarse varias veces sin efectos adversos.
# =====================================================
set -euo pipefail

# Usuario que administra la VM (definido al crear la VM en el portal).
APP_USER="${APP_USER:-baqueano}"
REPO_DIR="/home/${APP_USER}/APP-BAQUEANO"
WEB_ROOT="/var/www/baqueano"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Este script debe ejecutarse con sudo." >&2
  exit 1
fi

echo "==> 1/7 Actualizando paquetes del sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y nginx ufw fail2ban git rsync curl ca-certificates unattended-upgrades

echo "==> 2/7 Instalando Node.js 20 LTS (repositorio oficial NodeSource)"
# Se verifica la versión instalada para no reinstalar en cada ejecución.
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v20.* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v

echo "==> 3/7 Instalando Certbot (certificados TLS de Let's Encrypt)"
apt-get install -y certbot python3-certbot-nginx

echo "==> 4/7 Endureciendo SSH"
# Archivo drop-in: no modifica sshd_config original, se puede revertir borrándolo.
cat > /etc/ssh/sshd_config.d/90-baqueano-hardening.conf <<'EOF'
# BAQUEANO — SSH solo por clave pública.
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
EOF
# Validar la sintaxis ANTES de recargar para no perder el acceso remoto.
sshd -t
systemctl reload ssh || systemctl reload sshd

echo "==> 5/7 Configurando firewall interno (ufw) espejo del NSG de Azure"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH administracion'
ufw allow 80/tcp comment 'HTTP solo redireccion a HTTPS'
ufw allow 443/tcp comment 'HTTPS Website BAQUEANO'
ufw --force enable

echo "==> 6/7 Activando fail2ban y actualizaciones automáticas"
cat > /etc/fail2ban/jail.d/baqueano-sshd.local <<'EOF'
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> 7/7 Preparando directorios del sitio y configuración de Nginx"
mkdir -p "${WEB_ROOT}/releases" /etc/baqueano
chown -R "${APP_USER}:${APP_USER}" "${WEB_ROOT}"
chmod 750 /etc/baqueano

# Página provisional para que Nginx arranque antes del primer despliegue.
if [[ ! -e "${WEB_ROOT}/current" ]]; then
  mkdir -p "${WEB_ROOT}/releases/bootstrap"
  echo '<!doctype html><title>BAQUEANO</title><p>Servidor BAQUEANO listo. Ejecute azure/deploy.sh.</p>' \
    > "${WEB_ROOT}/releases/bootstrap/index.html"
  echo '{"status":"bootstrap"}' > "${WEB_ROOT}/releases/bootstrap/health.json"
  ln -sfn "${WEB_ROOT}/releases/bootstrap" "${WEB_ROOT}/current"
  chown -R "${APP_USER}:${APP_USER}" "${WEB_ROOT}"
fi

install -m 644 "${REPO_DIR}/azure/nginx/baqueano-security-headers.conf" /etc/nginx/snippets/baqueano-security-headers.conf
install -m 644 "${REPO_DIR}/azure/nginx/baqueano.conf" /etc/nginx/sites-available/baqueano.conf
ln -sfn /etc/nginx/sites-available/baqueano.conf /etc/nginx/sites-enabled/baqueano.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo ""
echo "Servidor aprovisionado."
echo "Siguiente paso: bash ${REPO_DIR}/azure/deploy.sh   (como ${APP_USER}, sin sudo)"
echo "Después, cuando el DNS apunte a esta IP: sudo bash ${REPO_DIR}/azure/enable-https.sh"
