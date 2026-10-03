#!/usr/bin/env bash
# =====================================================
# BAQUEANO — Activación de HTTPS (Let's Encrypt)
# =====================================================
#
# PROPÓSITO:
#   Emitir el certificado TLS de baqueanonicaragua.com y www, y forzar HTTPS
#   (puerto 80 queda solo para redirección 301).
#
# ARQUITECTURA:
#   Certbot con el plugin de Nginx modifica azure/nginx/baqueano.conf instalado
#   en /etc/nginx/sites-available: añade "listen 443 ssl" y el bloque de
#   redirección. La renovación automática la hace el timer systemd de certbot.
#
# DEPENDENCIAS:
#   - DNS en Hostinger apuntando a la IP pública de la VM (registros A @ y www).
#   - Puertos 80 y 443 abiertos en el NSG de Azure y en ufw.
#
# SEGURIDAD:
#   El correo se usa solo para avisos de expiración de Let's Encrypt.
#
# USO:
#   sudo CERTBOT_EMAIL=correo@dominio bash ~/APP-BAQUEANO/azure/enable-https.sh
# =====================================================
set -euo pipefail

DOMAIN="baqueanonicaragua.com"
: "${CERTBOT_EMAIL:?Defina CERTBOT_EMAIL con el correo para avisos de expiracion del certificado}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Este script debe ejecutarse con sudo." >&2
  exit 1
fi

# Verificación previa: el DNS debe resolver a esta VM; si no, Let's Encrypt falla
# y puede aplicar límites de intentos.
PUBLIC_IP="$(curl -fsS https://api.ipify.org)"
for host in "${DOMAIN}" "www.${DOMAIN}"; do
  resolved="$(getent ahostsv4 "${host}" | awk 'NR==1{print $1}')"
  if [[ "${resolved}" != "${PUBLIC_IP}" ]]; then
    echo "El DNS de ${host} resuelve a '${resolved:-nada}', no a esta VM (${PUBLIC_IP})." >&2
    echo "Actualice los registros A en Hostinger y espere la propagación." >&2
    exit 1
  fi
done

certbot --nginx --non-interactive --agree-tos --redirect \
  -m "${CERTBOT_EMAIL}" -d "${DOMAIN}" -d "www.${DOMAIN}"

nginx -t
systemctl reload nginx
certbot renew --dry-run

echo "HTTPS activo: https://${DOMAIN}/health"
