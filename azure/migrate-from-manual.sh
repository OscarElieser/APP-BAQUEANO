#!/usr/bin/env bash
# =====================================================
# BAQUEANO — Migración de la configuración manual a azure/
# =====================================================
#
# PROPÓSITO:
#   La VM se configuró primero a mano (rsync de todo website/ a /var/www/baqueano
#   y un sitio Nginx "baqueano" al que Certbot añadió HTTPS). Esa configuración
#   publica código fuente y documentación interna y no envía cabeceras de
#   seguridad. Este script pasa la VM a la configuración versionada de azure/
#   SIN BORRAR nada de lo manual y reutilizando el certificado ya emitido.
#
# ARQUITECTURA (orden):
#   1. Respaldo: /var/www/baqueano (manual) → /var/www/baqueano-manual-respaldo-<fecha>
#      y /etc/nginx/sites-available/baqueano → copia en el mismo respaldo.
#   2. Desactiva el ENLACE del sitio manual (el archivo se conserva).
#   3. setup-server.sh  → Nginx versionado, PostgreSQL local, API, firewall.
#   4. deploy.sh        → release de origin/main + /health.
#   5. enable-https.sh  → reinstala el certificado existente sobre la nueva config.
#   6. Verificación final.
#
# SEGURIDAD:
#   Cada paso que toca Nginx valida con "nginx -t" antes de recargar. Si algo
#   falla, el script se detiene (set -e) y muestra el paso.
#
# RECUPERACIÓN:
#   Para volver a lo manual:
#     sudo rm /etc/nginx/sites-enabled/baqueano.conf
#     sudo ln -s /etc/nginx/sites-available/baqueano /etc/nginx/sites-enabled/baqueano
#     sudo mv /var/www/baqueano-manual-respaldo-<fecha> /var/www/baqueano   (si se movió)
#     sudo nginx -t && sudo systemctl reload nginx
#
# USO (como usuario baqueano, dentro de la VM):
#   curl -fsSL https://raw.githubusercontent.com/OscarElieser/APP-BAQUEANO/main/azure/migrate-from-manual.sh -o /tmp/migrate.sh
#   bash /tmp/migrate.sh
#   (Sirve tanto si el repositorio está en /var/www/APP-BAQUEANO como en ~/APP-BAQUEANO.)
# =====================================================
set -euo pipefail

REPO_DIR="${HOME}/APP-BAQUEANO"
STAMP="$(date -u +%Y%m%d%H%M%S)"
BACKUP="/var/www/baqueano-manual-respaldo-${STAMP}"

step() { echo ""; echo "==> $*"; }

if [[ "${EUID}" -eq 0 ]]; then
  echo "Ejecute este script como el usuario baqueano (sin sudo); pedirá sudo cuando haga falta." >&2
  exit 1
fi
# La guía manual clonó el repositorio en /var/www/APP-BAQUEANO. Se MUEVE (no se
# borra) a ~/APP-BAQUEANO para que el código fuente quede fuera de /var/www.
if [[ ! -d "${REPO_DIR}/.git" && -d /var/www/APP-BAQUEANO/.git ]]; then
  echo "==> Moviendo /var/www/APP-BAQUEANO → ${REPO_DIR}"
  sudo mv /var/www/APP-BAQUEANO "${REPO_DIR}"
  sudo chown -R "$(id -un):$(id -gn)" "${REPO_DIR}"
fi
if [[ ! -d "${REPO_DIR}/.git" ]]; then
  echo "==> Clonando repositorio en ${REPO_DIR}"
  git clone https://github.com/OscarElieser/APP-BAQUEANO.git "${REPO_DIR}"
fi
# Siempre se parte del último main publicado en GitHub. Si hay cambios locales
# sin publicar, se detiene en lugar de sobrescribirlos.
if [[ -n "$(git -C "${REPO_DIR}" status --porcelain)" ]]; then
  echo "El repositorio ${REPO_DIR} tiene cambios locales. Revíselos con 'git status' antes de migrar." >&2
  exit 1
fi
git -C "${REPO_DIR}" fetch --prune origin
git -C "${REPO_DIR}" checkout --quiet main
git -C "${REPO_DIR}" reset --quiet --hard origin/main

step "1/6 Respaldando configuración manual (sin borrar)"
sudo mkdir -p "${BACKUP}"
# El sitio manual tenía los archivos directamente en /var/www/baqueano (sin releases/).
if [[ -d /var/www/baqueano && ! -L /var/www/baqueano/current ]]; then
  sudo mv /var/www/baqueano "${BACKUP}/www"
  echo "    /var/www/baqueano → ${BACKUP}/www"
fi
if [[ -f /etc/nginx/sites-available/baqueano ]]; then
  sudo cp -a /etc/nginx/sites-available/baqueano "${BACKUP}/nginx-sites-available-baqueano"
  echo "    copia de sites-available/baqueano → ${BACKUP}/"
fi

step "2/6 Desactivando el enlace del sitio manual"
sudo rm -f /etc/nginx/sites-enabled/baqueano

step "3/6 Aprovisionando con azure/setup-server.sh"
sudo bash "${REPO_DIR}/azure/setup-server.sh"

step "4/6 Desplegando origin/main con azure/deploy.sh"
bash "${REPO_DIR}/azure/deploy.sh"

step "5/6 Reinstalando HTTPS sobre la configuración versionada"
sudo bash "${REPO_DIR}/azure/enable-https.sh"

step "6/6 Verificación"
for path in /health /api/azure/health /api/azure/db; do
  printf '%-20s ' "${path}"
  curl -fsS "https://baqueanonicaragua.com${path}" | head -c 160 || echo "FALLÓ"
  echo
done
for path in /README.md /scripts/set-admin-claims.js /docs/ADMIN_GUIDE.md /apps/web/package.json; do
  printf '%-34s %s\n' "${path}" "$(curl -s -o /dev/null -w '%{http_code}' "https://baqueanonicaragua.com${path}")  (esperado 404)"
done
curl -sI https://baqueanonicaragua.com/ | grep -iE 'content-security-policy|strict-transport|x-frame' | cut -c1-80
echo ""
echo "Migración completada. Respaldo de la configuración manual: ${BACKUP}"
