<!--
🎯 POR QUÉ: evidencia del despliegue en Azure medida desde fuera de la VM.
⚙️ CÓMO: workflow kronox-evidence (runner de GitHub) y deploy-production.
📦 QUÉ: estado, cifras y acciones del propietario.
-->
# Informe Azure — Kronox 2026

**Estado:** 🟡 AVANZADO (S2-15). **Fallo crítico abierto:** producción no sirve `main`.

| Control | Resultado |
|---|---|
| DNS | `baqueanonicaragua.com` A → 20.80.81.65 |
| TLS y HTTPS | Válido; 301 desde HTTP; `www` redirige al dominio raíz |
| API de la VM → Supabase | 200; 17 departamentos; latencia de 249 ms |
| Puertos 80 y 443 | Abiertos |
| Puertos 5432, 3000, 6379, 8080, 3306 | Cerrados o filtrados |
| Puerto 22 | ⚠️ Abierto a Internet |
| `/health` | Sirve `56bd236` (desplegado 2026-10-05 00:27 UTC) ≠ `main` |

## Despliegue y rollback

Un temporizador systemd ejecuta `azure/autodeploy.sh` cada 2 minutos. Este lanza `azure/deploy.sh`, que construye un release atómico, cambia el enlace simbólico `current` y escribe `health.json`. El rollback se hace con `sudo azure/deploy.sh --rollback`, que restaura el release anterior. El build de HEAD se reproduce en CI, así que el bloqueo está en la VM.

## Acciones del propietario

1. Revisar `sudo journalctl -u baqueano-autodeploy -n 100` y `df -h`.
2. Restringir el puerto 22 en el NSG.
3. Ejecutar y registrar una prueba de rollback (`deploy.sh --rollback`, luego `/health`, luego volver a desplegar).
