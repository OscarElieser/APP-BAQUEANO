#!/usr/bin/env bash
# =====================================================
# BAQUEANO — Despliegue automático (pull) en Azure
# =====================================================
#
# PROPÓSITO:
#   Que cada push a la rama main de GitHub se publique solo en
#   baqueanonicaragua.com, sin pasos manuales (requisito del propietario y
#   Sprint 3: "GitHub = código desplegado").
#
# ARQUITECTURA (pull, no push):
#   Un temporizador systemd (azure/systemd/baqueano-autodeploy.timer) ejecuta
#   este script cada 2 minutos. Compara el commit de origin/main con el commit
#   activo (health.json de la release). Si difieren, ejecuta deploy.sh.
#   GitHub Actions NO entra por SSH: el puerto 22 sigue restringido a la IP del
#   administrador y ninguna clave del servidor se guarda en GitHub.
#   El workflow .github/workflows/deploy-production.yml solo VERIFICA desde
#   fuera que /health muestre el commit subido.
#
# SEGURIDAD:
#   - Quien puede hacer push a main puede desplegar: proteger la rama main en
#     GitHub (Settings → Branches) y exigir que pasen los checks.
#   - flock impide dos despliegues simultáneos.
#   - Si el build falla, deploy.sh no cambia "current": el sitio sigue en la
#     release anterior y el error queda en: journalctl -u baqueano-autodeploy
#
# RELACIÓN:
#   azure/deploy.sh, azure/systemd/baqueano-autodeploy.{service,timer}.
# =====================================================
set -euo pipefail

# Todo el cuerpo va dentro de una función: bash lo lee completo antes de
# ejecutarlo, así un "git checkout" que actualice este mismo archivo no
# altera la ejecución en curso.
main() {
  local repo="${REPO_DIR:-$HOME/APP-BAQUEANO}"
  local health="/var/www/baqueano/current/health.json"

  cd "${repo}"
  git fetch --quiet --prune origin main

  local remote current
  remote="$(git rev-parse --short origin/main)"
  current="$(sed -nE 's/.*"commit":"([0-9a-f]+)".*/\1/p' "${health}" 2>/dev/null || true)"

  if [[ -n "${current}" && "${remote}" == "${current}"* ]]; then
    exit 0   # Producción ya sirve el último commit: nada que hacer.
  fi

  echo "[autodeploy] Nuevo commit en main: ${current:-ninguno} → ${remote}"
  git checkout --quiet --detach origin/main

  # Se ejecuta una copia temporal de deploy.sh para que su propia
  # actualización no interfiera mientras corre.
  local runner
  runner="$(mktemp /tmp/baqueano-deploy.XXXXXX.sh)"
  cp azure/deploy.sh "${runner}"
  bash "${runner}" HEAD
  rm -f "${runner}"
  echo "[autodeploy] Desplegado ${remote}"
}

main "$@"
