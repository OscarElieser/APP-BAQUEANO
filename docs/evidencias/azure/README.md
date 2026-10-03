# 📸 BAQUEANO — Evidencias Azure para el jurado

## 🎯 POR QUÉ

La rúbrica del Hackathon Nicaragua 2026 (Sprint 2 y 3) se evalúa con pruebas visibles: servidor, SSH, IP pública, puertos, base de datos, dominio, HTTPS, integración y correspondencia con GitHub.

## ⚙️ CÓMO

Guarda cada captura en esta carpeta con el nombre indicado. Antes de subirla, **tapa o recorta** cualquier dato sensible: claves, tokens, correos personales, teléfonos, ID de suscripción completo e IP de tu casa (la IP de origen permitida en la regla SSH).

## 📦 QUÉ

| Archivo | Qué debe verse | Cómo obtenerlo |
| --- | --- | --- |
| `01-resource-group.png` | `rg-baqueano-prod` con VM, IP, VNet, NSG y disco | Portal → Grupos de recursos |
| `02-vm-running.png` | Estado "En ejecución", Ubuntu 22.04, tamaño | Portal → VM → Información general |
| `03-public-ip.png` | IP pública estática | Portal → VM → Información general |
| `04-nsg-ports.png` | 443 y 80 desde Internet, 22 solo IP admin; sin 3000, 5432, 3306 | Portal → VM → Redes |
| `05-ssh-login.png` | Prompt `baqueano@vm-baqueano-prod:~$` | `ssh -i ~/.ssh/baqueano_azure baqueano@IP` |
| `06-node-version.png` | `node -v` (v20.x) y `nginx -v` | Terminal SSH |
| `07-postgresql-running.png` | `systemctl status postgresql` activo y `ss -ltnp \| grep 5432` solo en 127.0.0.1 | Terminal SSH |
| `08-nginx-running.png` | `systemctl status nginx` y `systemctl status baqueano-api` activos | Terminal SSH |
| `09-website-ip.png` | El Website de BAQUEANO abierto en `http://IP` | Navegador |
| `10-domain-working.png` | `https://baqueanonicaragua.com` cargado | Navegador |
| `11-https.png` | Candado y certificado Let's Encrypt; `curl -I http://...` → 301 | Navegador + terminal |
| `12-supabase-connection.png` | `https://baqueanonicaragua.com/api/azure/db` con `"departments":17` y `ok:true` | Navegador |
| `13-crud.png` | Crear → refrescar → sigue guardado (tras el lote de integración Supabase) | Navegador |
| `14-github-main.png` | El `commit` de `/health` coincide con el último commit de `main` en GitHub | Navegador + GitHub |
| `15-nmap.png` (opcional) | `nmap -Pn IP` muestra solo 22, 80 y 443 | Terminal en tu PC |
