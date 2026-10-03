#!/usr/bin/env bash
# =====================================================
# BAQUEANO — Reglas de red (Network Security Group)
# =====================================================
#
# PROPÓSITO:
#   Dejar abiertos a Internet SOLO los puertos necesarios (rúbrica Sprint 2/3):
#     443/TCP  HTTPS   → cualquiera   (Website)
#      80/TCP  HTTP    → cualquiera   (solo redirección 301 a HTTPS)
#      22/TCP  SSH     → solo la IP del equipo administrador
#   Todo lo demás (incluido 5432 PostgreSQL) queda denegado por defecto.
#
# ARQUITECTURA:
#   Se ejecuta en Azure Cloud Shell (bash) o en un equipo con Azure CLI.
#   Si la NIC de la VM no tiene NSG (el resumen de creación mostraba "-"),
#   crea uno y lo asocia; si ya existe, actualiza sus reglas.
#
# SEGURIDAD:
#   Sin NSG en la NIC ni en la subred, Azure permite TODO el tráfico entrante a la
#   IP pública. Por eso este paso es obligatorio antes de publicar el dominio.
#
# USO (Cloud Shell):
#   ADMIN_IP=$(curl -s https://api.ipify.org)   # ejecútalo en TU equipo, no en Cloud Shell
#   ADMIN_IP=203.0.113.10 bash configure-nsg.sh
# =====================================================
set -euo pipefail

RG="${RG:-rg-baqueano-prod}"
VM="${VM:-vm-baqueano-prod}"
NSG="${NSG:-${VM}-nsg}"
: "${ADMIN_IP:?Defina ADMIN_IP con la IP pública de su equipo (curl https://api.ipify.org)}"

NIC_ID="$(az vm show -g "${RG}" -n "${VM}" --query 'networkProfile.networkInterfaces[0].id' -o tsv)"
NIC_NAME="$(basename "${NIC_ID}")"
LOCATION="$(az vm show -g "${RG}" -n "${VM}" --query location -o tsv)"

echo "==> NIC: ${NIC_NAME} · Región: ${LOCATION}"

CURRENT_NSG="$(az network nic show --ids "${NIC_ID}" --query 'networkSecurityGroup.id' -o tsv || true)"
if [[ -z "${CURRENT_NSG}" ]]; then
  echo "==> La NIC no tiene NSG: creando ${NSG}"
  az network nsg create -g "${RG}" -n "${NSG}" -l "${LOCATION}" -o none
  az network nic update --ids "${NIC_ID}" --network-security-group "${NSG}" -o none
else
  NSG="$(basename "${CURRENT_NSG}")"
  echo "==> NSG existente: ${NSG}"
fi

# Función auxiliar: crea o actualiza una regla de entrada.
rule() {
  local name="$1" priority="$2" port="$3" source="$4" desc="$5"
  az network nsg rule create -g "${RG}" --nsg-name "${NSG}" -n "${name}" \
    --priority "${priority}" --direction Inbound --access Allow --protocol Tcp \
    --source-address-prefixes "${source}" --source-port-ranges '*' \
    --destination-address-prefixes '*' --destination-port-ranges "${port}" \
    --description "${desc}" -o none
  echo "    ✓ ${name}: ${port}/tcp desde ${source}"
}

echo "==> Aplicando reglas"
# Si el portal creó "SSH" abierto a Any, se reemplaza por la versión restringida.
az network nsg rule delete -g "${RG}" --nsg-name "${NSG}" -n SSH -o none 2>/dev/null || true
az network nsg rule delete -g "${RG}" --nsg-name "${NSG}" -n default-allow-ssh -o none 2>/dev/null || true
rule baqueano-https 100 443 Internet "BAQUEANO Website HTTPS"
rule baqueano-http  110 80  Internet "BAQUEANO redireccion HTTP a HTTPS"
rule baqueano-ssh   120 22  "${ADMIN_IP}/32" "BAQUEANO SSH solo administrador"

echo ""
az network nsg rule list -g "${RG}" --nsg-name "${NSG}" \
  --query "[].{Regla:name,Prioridad:priority,Puerto:destinationPortRange,Origen:sourceAddressPrefix}" -o table
echo ""
echo "IP pública de la VM:"
az vm show -d -g "${RG}" -n "${VM}" --query publicIps -o tsv
