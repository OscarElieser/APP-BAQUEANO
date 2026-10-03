#!/usr/bin/env bash
# =====================================================
# BAQUEANO — Despliegue del Website en Azure
# =====================================================
#
# PROPÓSITO:
#   Publicar en la VM exactamente el código de la rama main de GitHub
#   (requisito Sprint 3: "GitHub = código desplegado").
#
# ARQUITECTURA (releases atómicas):
#   1. git fetch + checkout del commit de origin/main.
#   2. Build estático existente: website/scripts/build-hostinger-static.mjs
#      → website/dist-hostinger/ (sin dependencias npm).
#   3. Copia a /var/www/baqueano/releases/<fecha>-<sha>/.
#   4. Copia los videos (no versionados en Git) desde /var/www/baqueano/media/videos.
#   5. Escribe health.json con el commit y la fecha.
#   6. Cambia el enlace "current" de forma atómica y recarga Nginx.
#   7. Conserva las 5 últimas releases para poder volver atrás (rollback).
#
# SEGURIDAD:
#   - Se ejecuta como usuario sin privilegios (baqueano); solo "nginx -t" y
#     "systemctl reload nginx" requieren sudo.
#   - Si el build falla, "current" no cambia: el sitio sigue sirviendo la release anterior.
#
# RELACIÓN:
#   azure/setup-server.sh, azure/nginx/baqueano.conf, docs/AZURE_DEPLOYMENT.md.
#
# USO:
#   bash ~/APP-BAQUEANO/azure/deploy.sh            # despliega origin/main
#   bash ~/APP-BAQUEANO/azure/deploy.sh <sha>      # despliega un commit concreto
#   bash ~/APP-BAQUEANO/azure/deploy.sh --rollback # vuelve a la release anterior
# =====================================================
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/APP-BAQUEANO}"
WEB_ROOT="/var/www/baqueano"
RELEASES="${WEB_ROOT}/releases"
MEDIA_VIDEOS="${WEB_ROOT}/media/videos"
KEEP=5

reload_nginx() {
  # POR QUÉ: las cabeceras versionadas deben llegar a producción junto con cada release.
  # CÓMO: instalamos el snippet antes de validar; nginx -t impide activar una configuración inválida.
  # QUÉ: Permissions-Policy, CSP y demás controles quedan sincronizados con origin/main.
  sudo install -m 0644 "${REPO_DIR}/azure/nginx/baqueano-security-headers.conf" "/etc/nginx/snippets/baqueano-security-headers.conf"
  sudo nginx -t
  sudo systemctl reload nginx
}

# --- Rollback: apunta "current" a la release anterior a la activa ---
if [[ "${1:-}" == "--rollback" ]]; then
  active="$(readlink -f "${WEB_ROOT}/current")"
  previous="$(ls -1dt "${RELEASES}"/*/ | sed 's:/$::' | grep -v "^${active}$" | grep -v bootstrap | head -1 || true)"
  if [[ -z "${previous}" ]]; then
    echo "No hay release anterior a la cual volver." >&2
    exit 1
  fi
  ln -sfn "${previous}" "${WEB_ROOT}/current.tmp" && mv -Tf "${WEB_ROOT}/current.tmp" "${WEB_ROOT}/current"
  reload_nginx
  echo "Rollback completado → ${previous}"
  exit 0
fi

echo "==> 1/6 Obteniendo código de GitHub"
cd "${REPO_DIR}"
git fetch --prune origin
TARGET="${1:-origin/main}"
git checkout --quiet --detach "${TARGET}"
SHA="$(git rev-parse --short HEAD)"
echo "Commit a desplegar: ${SHA} ($(git log -1 --format=%s))"

echo "==> 2/6 Construyendo sitio estático"
cd "${REPO_DIR}/website"
node scripts/build-hostinger-static.mjs

echo "==> 3/6 Creando release"
RELEASE="${RELEASES}/$(date -u +%Y%m%d%H%M%S)-${SHA}"
mkdir -p "${RELEASE}"
rsync -a --delete "${REPO_DIR}/website/dist-hostinger/" "${RELEASE}/"

echo "==> 4/6 Incorporando videos (fuera de Git)"
# Los videos están en .gitignore (exceden límites de GitHub). Se suben una vez
# por SCP a ${MEDIA_VIDEOS} y se copian en cada release. Ver docs/AZURE_DEPLOYMENT.md.
if [[ -d "${MEDIA_VIDEOS}" ]]; then
  mkdir -p "${RELEASE}/assets/videos"
  rsync -a "${MEDIA_VIDEOS}/" "${RELEASE}/assets/videos/"
else
  echo "Aviso: ${MEDIA_VIDEOS} no existe; los videos responderán 404 (igual que hoy en web.app)."
fi

echo "==> 5/6 Escribiendo health.json (evidencia de despliegue)"
cat > "${RELEASE}/health.json" <<EOF
{"status":"ok","service":"baqueano-website","host":"azure","commit":"${SHA}","deployedAt":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF

echo "==> 6/6 Activando release"
ln -sfn "${RELEASE}" "${WEB_ROOT}/current.tmp" && mv -Tf "${WEB_ROOT}/current.tmp" "${WEB_ROOT}/current"
reload_nginx

# -----------------------------------------------------
# API BAQUEANO — Dependencias y reinicio controlado
# -----------------------------------------------------
# La API corre directamente desde el checkout activo del repositorio.
# Antes de reiniciarla instalamos exactamente las dependencias declaradas
# en package-lock.json usando npm ci.
#
# IMPORTANTE:
# - npm ci garantiza una instalación reproducible.
# - --omit=dev evita instalar dependencias de desarrollo en producción.
# - Si npm ci falla, set -e detiene el despliegue antes de reiniciar la API.
# - Nunca se almacenan secretos dentro del repositorio.
API_DIR="${REPO_DIR}/azure/api"

if [[ -f "${API_DIR}/package-lock.json" ]]; then
  echo "==> Instalando dependencias de la API Azure"
  (
    cd "${API_DIR}"
    npm ci --omit=dev
  )
fi

# Reinicia la API para que ejecute exactamente el mismo commit desplegado.
if systemctl list-unit-files baqueano-api.service >/dev/null 2>&1; then
  sudo systemctl restart baqueano-api
fi

# Limpieza de releases antiguas (se conservan las ${KEEP} más recientes).
ls -1dt "${RELEASES}"/*/ | grep -v bootstrap | tail -n +$((KEEP + 1)) | xargs -r rm -rf

echo ""
echo "Desplegado ${SHA} → ${RELEASE}"
curl -fsS --resolve baqueanonicaragua.com:443:127.0.0.1 https://baqueanonicaragua.com/health && echo
