<!--
🎯 POR QUÉ: el propietario compartió el Manual Maestro de Azure (2026-10-06) para administrar la VM
  de producción desde una PC nueva sin repetir los errores de la instalación original (disco al 100 %,
  default_server duplicado, PEM ejecutada como programa).
⚙️ CÓMO: conversión fiel del .docx original (docs/deployment/Manual_Maestro_Azure_BAQUEANO_desde_cero.docx).
  El repositorio quedó alineado con el manual: azure/deploy.sh usa KEEP=3 y normaliza server_name.
📦 QUÉ: procedimiento completo de PowerShell, SSH, NGINX, AutoDeploy, health checks, rollback y mantenimiento.
  No contiene la clave privada ni secretos.
-->

> **Estado del repositorio frente a este manual (verificado el 2026-10-06):**
> - `azure/deploy.sh`: `KEEP=3`. Antes tenía `KEEP=5`; se alineó con la sección 7.
> - `azure/deploy.sh`: normaliza `listen 80 default_server` y `server_name baqueanonicaragua.com _` (sección 12.1).
> - `azure/autodeploy.sh` y `azure/systemd/*`: coinciden con las secciones 13.1 a 13.3 (timer de 2 min, `flock`, `TimeoutStartSec=15min`).
> - **Producción:** despliegue manual de `8dbde46` el 2026-10-06 a las 16:57 UTC.
>   - `kronox-evidence` (ejecución 37501243499): 62 OK y 0 críticos.
>   - Única observación: el puerto 22 está abierto a Internet. Hay que restringirlo en el NSG de Azure.
> - **Videos del hero:** `assets/videos/hero/*.mp4` no está en Git. Copiar a `/var/www/baqueano/media/videos/hero/` para que no respondan 404.

BAQUEANO NICARAGUA

## Manual Maestro de Azuredesde una computadora nueva

PowerShell · SSH · Ubuntu · GitHub · NGINX · despliegue atómico · AutoDeploy · health checks · mantenimiento

| Objetivo. Dejar una computadora Windows nueva preparada para administrar la VM de producción de BAQUEANO y ejecutar el flujo de despliegue de forma segura y repetible, evitando los errores encontrados durante la configuración original. |
|---|

| Elemento | Valor |
|---|---|
| Proyecto | BAQUEANO Nicaragua |
| Dominio de producción | https://baqueanonicaragua.com/ |
| VM Azure | vm-baqueano-prod |
| Sistema servidor | Ubuntu 22.04 LTS |
| Usuario SSH | baqueano |
| IP pública usada en esta instalación | 20.80.81.65 |
| Repositorio local en VM | /home/baqueano/APP-BAQUEANO |
| Web root | /var/www/baqueano |
| Release activa | /var/www/baqueano/current → /var/www/baqueano/releases/<fecha>-<sha> |
| Servicio web | NGINX |
| AutoDeploy | baqueano-autodeploy.timer + baqueano-autodeploy.service |
| Rama de producción | origin/main |

## Contenido

1. Alcance y reglas de seguridad

2. Preparar Windows y PowerShell

3. Preparar la clave privada PEM

4. Conectarse por SSH a Azure

5. Reconocer cuándo se está en Windows y cuándo en Ubuntu

6. Verificación inicial de la VM

7. Diagnóstico y control del espacio en disco

8. Estructura de releases de BAQUEANO

9. NGINX: configuración correcta y validación

10. GitHub y sincronización de producción

11. AutoDeploy: cómo funciona y cómo verificarlo

12. Script deploy.sh: estado final recomendado

13. Script autodeploy.sh y unidades systemd

14. Activar, detener y probar AutoDeploy

15. Health checks y comprobaciones externas

16. API, PostgreSQL y servicios

17. Recuperación y rollback

18. Mantenimiento preventivo

19. Errores que no deben repetirse

20. Procedimiento completo de instalación en una PC nueva

21. Checklist final de producción

22. Comandos de referencia rápida

## 1. Alcance y reglas de seguridad

Este manual parte de que la VM de Azure de BAQUEANO ya existe y está operativa. El objetivo principal es configurar una computadora Windows nueva para administrarla y dejar verificado el flujo de producción. También documenta la configuración del servidor que debe mantenerse para que el despliegue continúe funcionando.

- No ejecutar la clave .pem como si fuera un programa. La clave se pasa a ssh mediante -i.
- No copiar ni publicar el contenido de la clave privada PEM en chats, repositorios, correos o capturas.
- No usar rm -rf sobre /var/www/baqueano, /home/baqueano/APP-BAQUEANO o /etc/nginx sin identificar exactamente el objetivo.
- Antes de modificar NGINX, crear copia de seguridad del archivo que se tocará y ejecutar siempre sudo nginx -t antes de recargar.
- No usar git push --force en main para resolver divergencias normales.
- El bloque catch-all server_name _ debe existir únicamente en baqueano-ip.conf; el dominio canónico no debe llevar _.
- La variable site_config existe dentro de deploy.sh. No debe copiarse literalmente en la terminal como ${site_config}, salvo que antes se haya definido.
| Regla de operación. Si un comando muestra el prompt secundario > porque quedó una comilla abierta o una instrucción incompleta, presionar Ctrl+C y volver al prompt normal antes de continuar. |
|---|

## 2. Preparar Windows y PowerShell

### 2.1 Abrir PowerShell y confirmar identidad

    whoami
    $HOME
Ejemplo esperado: el usuario de Windows y una ruta de perfil como C:\Users\PC 1.

### 2.2 Verificar OpenSSH

    ssh -V
Si OpenSSH Client no existe, abrir PowerShell como Administrador y comprobar/instalar:

    Get-WindowsCapability -Online | Where-Object Name -like "OpenSSH.Client*"
    Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

## 3. Preparar la clave privada PEM

### 3.1 Ubicar la clave

    cd "$HOME\Downloads"
    dir vm-baqueano-prod_key.pem
    Test-Path "$HOME\Downloads\vm-baqueano-prod_key.pem"
Test-Path debe devolver True. En la instalación verificada, la clave estaba en Downloads; una ruta D:\Desktop\... no existía y no debe asumirse en otra PC.

### 3.2 Restringir permisos

    $key = "$HOME\Downloads\vm-baqueano-prod_key.pem"
    $me = whoami
    icacls $key /inheritance:r
    icacls $key /grant:r "$($me):(R)"
    icacls $key
La salida final debe mostrar al usuario actual con permiso (R). No es necesario eliminar “Authenticated Users” si no está presente.

| Importante. La PEM no se abre ni se ejecuta. Un comando como D:\Desktop\vm-baqueano-prod_key.pem produce “command not found / no se reconoce” porque no es un ejecutable. |
|---|

## 4. Conectarse por SSH a Azure

    cd "$HOME\Downloads"
    ssh -i ".\vm-baqueano-prod_key.pem" baqueano@20.80.81.65
La primera vez, OpenSSH puede pedir confirmar la huella del host. Verificar que corresponde a la VM administrada y aceptar con yes. El prompt correcto dentro del servidor es:

    baqueano@vm-baqueano-prod:~$

## 5. Reconocer Windows vs Ubuntu

Antes de SSH se está en PowerShell de Windows. Después de SSH se está en Ubuntu. No mezclar comandos ni rutas.

| Contexto | Correcto | No usar |
|---|---|---|
| Windows PowerShell | C:\..., D:\..., icacls, Test-Path, ssh -i | sudo, systemctl, /var/www |
| Ubuntu Azure | /home/..., /var/www/..., sudo, systemctl, nginx, git | C:\..., D:\..., icacls |

## 6. Verificación inicial de la VM

    hostname
    whoami
    pwd
    df -h
Valores esperados: hostname vm-baqueano-prod, usuario baqueano y directorio /home/baqueano. Revisar especialmente el porcentaje de / antes de desplegar.

## 7. Diagnóstico y control del espacio en disco

En la incidencia real el filesystem raíz llegó al 100%. La causa fue acumulación de releases completas bajo /var/www/baqueano/releases. El diagnóstico correcto es progresivo:

    df -h
    sudo du -xh / --max-depth=1 2>/dev/null | sort -h
    sudo du -xh /var --max-depth=1 2>/dev/null | sort -h
    sudo du -xh /var/www --max-depth=1 2>/dev/null | sort -h
    sudo du -xh /var/www/baqueano --max-depth=2 2>/dev/null | sort -h | tail -n 30
    sudo journalctl --disk-usage
    sudo find /var /home -type f -size +500M -exec ls -lh {} \; 2>/dev/null

### 7.1 Limpieza segura de logs/caché

    sudo journalctl --vacuum-size=100M
    sudo apt clean
    df -h

### 7.2 Limpieza de releases antiguas

El sistema final usa KEEP=3. Para una limpieza manual de emergencia, conservar las tres releases más recientes:

    readlink -f /var/www/baqueano/current
    ls -1dt /var/www/baqueano/releases/*
    ls -1dt /var/www/baqueano/releases/* | tail -n +4
| Primero visualizar. Ejecutar el comando con tail -n +4 para ver qué se eliminaría. Confirmar que current no está en esa lista. |
|---|

    ls -1dt /var/www/baqueano/releases/* | tail -n +4 | sudo xargs -r rm -rf
    df -h
    du -sh /var/www/baqueano/releases

## 8. Estructura de releases de BAQUEANO

    /var/www/baqueano/
    ├── current -> /var/www/baqueano/releases/<fecha>-<sha>
    ├── releases/
    │   ├── <fecha>-<sha>/
    │   ├── <fecha>-<sha>/
    │   └── <fecha>-<sha>/
    └── media/videos/
current es un enlace simbólico a la release activa. Cada release contiene el sitio estático, health.json, videos incorporados y el APK cuando está disponible.

## 9. NGINX: configuración correcta y validación

### 9.1 Regla del default_server

Solo baqueano-ip.conf debe ser default_server y usar server_name _. El virtual host canónico de baqueanonicaragua.com debe escuchar en 80 sin default_server.

    sudo grep -Rni "default_server" /etc/nginx/sites-enabled
    sudo grep -Rni "server_name.*_" /etc/nginx/sites-enabled
Resultado esperado para server_name _:

    /etc/nginx/sites-enabled/baqueano-ip.conf:...:    server_name _;

### 9.2 Corregir un default_server duplicado

    sudo cp /etc/nginx/sites-available/baqueano.conf /etc/nginx/sites-available/baqueano.conf.backup-$(date +%Y%m%d-%H%M%S)
    sudo sed -i 's/listen 80 default_server;/listen 80;/' /etc/nginx/sites-available/baqueano.conf
    sudo sed -i 's/listen \[::\]:80 default_server;/listen [::]:80;/' /etc/nginx/sites-available/baqueano.conf
    sudo sed -i -E 's/server_name baqueanonicaragua\.com _;/server_name baqueanonicaragua.com;/' /etc/nginx/sites-available/baqueano.conf
    sudo nginx -t
    sudo systemctl reload nginx

### 9.3 Verificación final

    sudo nginx -t
    sudo nginx -T 2>&1 | grep -E "conflicting|duplicate|emerg|warn"
    sudo systemctl status nginx --no-pager
nginx -t debe indicar syntax is ok y test is successful. El grep de errores/advertencias idealmente no devuelve nada.

## 10. GitHub y sincronización de producción

### 10.1 Repositorio de la VM

    cd /home/baqueano/APP-BAQUEANO
    git status
    git branch --show-current || true
    git remote -v
    git fetch --prune origin
    git rev-parse --short origin/main
El despliegue usa origin/main como fuente de verdad.

### 10.2 Cuando se trabaja desde una PC local con Git

    git status
    git add .
    git commit -m "guardar cambios locales antes de sincronizar"
    git pull --rebase origin main
    git push origin main
Si hay conflictos durante rebase:

    git diff --name-only --diff-filter=U
    # resolver los archivos
    git add <archivo-resuelto>
    git rebase --continue
    git status
| Evitar. No usar git push --force como solución rutinaria. No descartar cambios sin revisar. |
|---|

## 11. AutoDeploy: cómo funciona y cómo verificarlo

El timer despierta periódicamente el servicio. autodeploy.sh hace git fetch, obtiene origin/main y compara ese SHA con el commit guardado en /var/www/baqueano/current/health.json. Si son iguales, termina con código 0 y no crea una release. Si difieren, ejecuta deploy.sh.

### 11.1 Comprobar comparación manualmente

    remote="$(git -C /home/baqueano/APP-BAQUEANO rev-parse --short origin/main)"
    current="$(sed -nE 's/.*"commit":"([0-9a-f]+)".*/\1/p' /var/www/baqueano/current/health.json)"
    echo "GitHub:     $remote"
    echo "Producción: $current"

### 11.2 Probar autodeploy sin crear release innecesaria

    find /var/www/baqueano/releases -mindepth 1 -maxdepth 1 -type d | wc -l
    bash /home/baqueano/APP-BAQUEANO/azure/autodeploy.sh
    echo $?
    find /var/www/baqueano/releases -mindepth 1 -maxdepth 1 -type d | wc -l
Si GitHub y producción coinciden, echo $? debe ser 0 y el número de releases debe permanecer igual.

## 12. Script deploy.sh: estado final recomendado

El archivo debe vivir en /home/baqueano/APP-BAQUEANO/azure/deploy.sh y conservar la lógica versionada del repositorio. Los puntos críticos que deben existir son los siguientes.

    REPO_DIR="${REPO_DIR:-$HOME/APP-BAQUEANO}"
    WEB_ROOT="/var/www/baqueano"
    RELEASES="${WEB_ROOT}/releases"
    MEDIA_VIDEOS="${WEB_ROOT}/media/videos"
    KEEP=3

### 12.1 Normalización NGINX dentro de reload_nginx()

    local site_config="/etc/nginx/sites-available/baqueano.conf"
    # El bloque IP posee el único default_server.
    sudo sed -i -E 's/listen 80 default_server;/listen 80;/' "${site_config}"
    sudo sed -i -E 's/listen \[::\]:80 default_server;/listen [::]:80;/' "${site_config}"
    sudo sed -i -E 's/server_name baqueanonicaragua\.com _;/server_name baqueanonicaragua.com;/' "${site_config}"
    sudo nginx -t
    sudo systemctl reload nginx

### 12.2 Creación de release y health.json

    RELEASE="${RELEASES}/$(date -u +%Y%m%d%H%M%S)-${SHA}"
    mkdir -p "${RELEASE}"
    rsync -a --delete "${REPO_DIR}/website/dist-hostinger/" "${RELEASE}/"
    cat > "${RELEASE}/health.json" <<EOF
    {"status":"ok","service":"baqueano-website","host":"azure","commit":"${SHA}","deployedAt":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
    EOF

### 12.3 Activación atómica y retención

    ln -sfn "${RELEASE}" "${WEB_ROOT}/current.tmp" && mv -Tf "${WEB_ROOT}/current.tmp" "${WEB_ROOT}/current"
    reload_nginx
    # conservar únicamente las 3 releases más recientes
    ls -1dt "${RELEASES}"/*/ | grep -v bootstrap | tail -n +$((KEEP + 1)) | xargs -r rm -rf

### 12.4 Validar sintaxis del script

    bash -n /home/baqueano/APP-BAQUEANO/azure/deploy.sh
Si no imprime nada, la sintaxis Bash es válida.

## 13. Script autodeploy.sh y unidades systemd

### 13.1 autodeploy.sh

    #!/usr/bin/env bash
    set -euo pipefail
    main() {
      local repo="${REPO_DIR:-$HOME/APP-BAQUEANO}"
      local health="/var/www/baqueano/current/health.json"
      cd "${repo}"
      git fetch --quiet --prune origin main
      local remote current
      remote="$(git rev-parse --short origin/main)"
      current="$(sed -nE 's/.*"commit":"([0-9a-f]+)".*/\1/p' "${health}" 2>/dev/null || true)"
      if [[ -n "${current}" && "${remote}" == "${current}"* ]]; then
        exit 0
      fi
      echo "[autodeploy] Nuevo commit en main: ${current:-ninguno} → ${remote}"
      git checkout --quiet --detach origin/main
      local runner
      runner="$(mktemp /tmp/baqueano-deploy.XXXXXX.sh)"
      cp azure/deploy.sh "${runner}"
      bash "${runner}" HEAD
      rm -f "${runner}"
      echo "[autodeploy] Desplegado ${remote}"
    }
    main "$@"

### 13.2 Servicio systemd

    [Unit]
    Description=BAQUEANO despliegue automatico desde GitHub main
    After=network-online.target
    Wants=network-online.target
    [Service]
    Type=oneshot
    User=baqueano
    Group=baqueano
    Environment=HOME=/home/baqueano
    ExecStart=/usr/bin/flock -n /tmp/baqueano-deploy.lock /bin/bash /home/baqueano/APP-BAQUEANO/azure/autodeploy.sh
    TimeoutStartSec=15min

### 13.3 Timer systemd

    [Unit]
    Description=BAQUEANO comprobar GitHub main cada 2 minutos
    [Timer]
    OnBootSec=2min
    OnUnitActiveSec=2min
    RandomizedDelaySec=15s
    Persistent=true
    [Install]
    WantedBy=timers.target

## 14. Activar, detener y probar AutoDeploy

### 14.1 Detener antes de reparar

    sudo systemctl stop baqueano-autodeploy.timer
    sudo systemctl status baqueano-autodeploy.timer --no-pager

### 14.2 Recargar systemd después de editar unidades

    sudo systemctl daemon-reload

### 14.3 Habilitar e iniciar

    sudo systemctl enable baqueano-autodeploy.timer
    sudo systemctl start baqueano-autodeploy.timer
    sudo systemctl status baqueano-autodeploy.timer --no-pager
    systemctl list-timers --all | grep -i baqueano

### 14.4 Revisar ejecución

    sudo systemctl status baqueano-autodeploy.service --no-pager
    sudo journalctl -u baqueano-autodeploy.service -n 100 --no-pager
Como el servicio es Type=oneshot, tras una ejecución correcta puede verse inactive (dead). Lo importante es que no figure failed.

## 15. Health checks y comprobaciones externas

    curl -fsS https://baqueanonicaragua.com/health
    curl -I https://baqueanonicaragua.com
    readlink -f /var/www/baqueano/current
    cat /var/www/baqueano/current/health.json
health debe devolver status ok, host azure y el commit desplegado. El commit debe coincidir con origin/main.

    git -C /home/baqueano/APP-BAQUEANO rev-parse --short origin/main
    sed -nE 's/.*"commit":"([0-9a-f]+)".*/\1/p' /var/www/baqueano/current/health.json

## 16. API, PostgreSQL y servicios

### 16.1 API

    sudo systemctl status baqueano-api --no-pager
    sudo journalctl -u baqueano-api -n 100 --no-pager
    sudo systemctl restart baqueano-api

### 16.2 PostgreSQL

    sudo systemctl status postgresql --no-pager
    pg_isready -h 127.0.0.1 -p 5432
    sudo -u postgres psql
Si psql muestra “could not change directory to /home/baqueano: Permission denied” pero luego abre el prompt postgres=#, el mensaje no implica que PostgreSQL esté caído. Para salir:

    \q

### 16.3 NGINX

    sudo systemctl status nginx --no-pager
    sudo nginx -t
    sudo systemctl reload nginx

## 17. Recuperación y rollback

El script deploy.sh soporta rollback a la release anterior:

    bash /home/baqueano/APP-BAQUEANO/azure/deploy.sh --rollback
Después comprobar:

    readlink -f /var/www/baqueano/current
    sudo nginx -t
    curl -fsS https://baqueanonicaragua.com/health

### 17.1 Restaurar NGINX desde copia manual

Si una edición manual rompe el archivo y existe una copia creada antes del cambio:

    sudo cp /etc/nginx/sites-available/baqueano.conf.backup-YYYYMMDD-HHMMSS /etc/nginx/sites-available/baqueano.conf
    sudo nginx -t
    sudo systemctl reload nginx

## 18. Mantenimiento preventivo

Una revisión periódica evita volver a ocupar el disco o acumular fallos silenciosos:

    df -h /
    du -sh /var/www/baqueano/releases
    find /var/www/baqueano/releases -mindepth 1 -maxdepth 1 -type d | wc -l
    sudo nginx -t
    sudo systemctl status nginx --no-pager
    sudo systemctl status baqueano-autodeploy.timer --no-pager
    sudo journalctl -u baqueano-autodeploy.service -n 30 --no-pager
    curl -fsS https://baqueanonicaragua.com/health
Con KEEP=3, el número normal de releases no debe crecer indefinidamente.

## 19. Errores que no deben repetirse

| Error | Causa | Forma correcta |
|---|---|---|
| D:\Desktop\vm-baqueano-prod_key.pem | Intentar ejecutar una PEM o asumir una ruta inexistente | Usar ssh -i con la ruta real; comprobar con Test-Path |
| icacls dentro de Ubuntu | icacls es de Windows | Usarlo solo en PowerShell antes del SSH |
| server_name baqueanonicaragua.com _; escrito en la consola | Es una directiva NGINX, no un comando | Editar el archivo con sed/editor y validar con nginx -t |
| ${site_config} en la consola | La variable solo existe dentro de reload_nginx() | Usar /etc/nginx/sites-available/baqueano.conf explícitamente |
| Prompt > repetido | Comilla/comando incompleto | Ctrl+C; volver a baqueano@vm-baqueano-prod:~$ |
| tail -n +... | Los puntos suspensivos no son un número | Usar tail -n +4 para conservar 3 |
| duplicate default server | Dos sitios activos tenían default_server:80 | Dejar default_server solo en baqueano-ip.conf |
| Disco al 100% | Acumulación de releases completas | KEEP=3 y limpieza automática/manual controlada |
| git push --force | Puede destruir historial remoto | Resolver rebase/conflictos y hacer push normal |

## 20. Procedimiento completo de instalación en una PC nueva

Esta es la secuencia resumida que debe seguirse cuando se configure otra computadora desde cero.

- Abrir PowerShell y comprobar whoami, $HOME y ssh -V.
- Copiar de forma segura vm-baqueano-prod_key.pem a Downloads.
- Aplicar permisos con icacls usando la identidad devuelta por whoami.
- Conectarse con ssh -i .\vm-baqueano-prod_key.pem baqueano@20.80.81.65.
- Confirmar hostname, whoami, pwd y df -h.
- Comprobar que el disco tenga espacio libre suficiente.
- Validar NGINX y confirmar que solo baqueano-ip.conf posee default_server/server_name _.
- Comprobar origin/main y health.json.
- Probar autodeploy.sh manualmente y verificar que no cree una release cuando no hay cambio.
- Comprobar KEEP=3 y sintaxis de deploy.sh.
- Activar el timer de AutoDeploy y revisar su próxima ejecución.
- Comprobar /health, NGINX, API, PostgreSQL y espacio en disco.

### 20.1 Bloque PowerShell de arranque

    whoami
    $HOME
    ssh -V
    cd "$HOME\Downloads"
    Test-Path ".\vm-baqueano-prod_key.pem"
    $key = "$HOME\Downloads\vm-baqueano-prod_key.pem"
    $me = whoami
    icacls $key /inheritance:r
    icacls $key /grant:r "$($me):(R)"
    icacls $key
    ssh -i ".\vm-baqueano-prod_key.pem" baqueano@20.80.81.65

### 20.2 Bloque de verificación Ubuntu

    hostname
    whoami
    pwd
    df -h /
    sudo nginx -t
    sudo systemctl status nginx --no-pager
    sudo grep -Rni "default_server" /etc/nginx/sites-enabled
    sudo grep -Rni "server_name.*_" /etc/nginx/sites-enabled
    git -C /home/baqueano/APP-BAQUEANO fetch --prune origin
    git -C /home/baqueano/APP-BAQUEANO rev-parse --short origin/main
    cat /var/www/baqueano/current/health.json
    bash -n /home/baqueano/APP-BAQUEANO/azure/deploy.sh
    bash /home/baqueano/APP-BAQUEANO/azure/autodeploy.sh
    grep -n "^KEEP=" /home/baqueano/APP-BAQUEANO/azure/deploy.sh
    find /var/www/baqueano/releases -mindepth 1 -maxdepth 1 -type d | wc -l
    sudo systemctl enable baqueano-autodeploy.timer
    sudo systemctl start baqueano-autodeploy.timer
    sudo systemctl status baqueano-autodeploy.timer --no-pager
    curl -fsS https://baqueanonicaragua.com/health

## 21. Checklist final de producción

☐ La PEM está fuera del repositorio y con permisos de solo lectura para el usuario autorizado.

☐ SSH entra como baqueano a vm-baqueano-prod.

☐ El filesystem raíz no está cercano al 100%.

☐ NGINX pasa nginx -t sin errores ni warnings de duplicate/conflicting server.

☐ Solo baqueano-ip.conf tiene server_name _ y default_server en puerto 80.

☐ origin/main y current/health.json muestran el mismo SHA después de un despliegue exitoso.

☐ Autodeploy manual retorna 0 y no crea release cuando no hay commit nuevo.

☐ deploy.sh tiene KEEP=3.

☐ El timer está enabled y active (waiting).

☐ /health responde status ok, host azure y commit.

☐ NGINX está active (running).

☐ baqueano-api no está failed.

☐ PostgreSQL responde pg_isready.

☐ current apunta a una release existente.

☐ Existen como máximo tres releases normales de producción.

## 22. Comandos de referencia rápida

### Conectar desde Windows

    ssh -i "$HOME\Downloads\vm-baqueano-prod_key.pem" baqueano@20.80.81.65

### Ver estado general

    df -h /
    sudo nginx -t
    sudo systemctl status nginx --no-pager
    sudo systemctl status baqueano-autodeploy.timer --no-pager
    curl -fsS https://baqueanonicaragua.com/health

### Ver release activa

    readlink -f /var/www/baqueano/current
    cat /var/www/baqueano/current/health.json

### Ver releases

    ls -1dt /var/www/baqueano/releases/*
    du -sh /var/www/baqueano/releases

### Logs AutoDeploy

    sudo journalctl -u baqueano-autodeploy.service -n 100 --no-pager

### Detener AutoDeploy para mantenimiento

    sudo systemctl stop baqueano-autodeploy.timer

### Reactivar AutoDeploy

    sudo systemctl start baqueano-autodeploy.timer
    systemctl list-timers --all | grep -i baqueano
| Estado de referencia alcanzado durante la corrección. NGINX validado; /health respondió correctamente; origin/main y producción coincidieron; AutoDeploy manual devolvió 0 sin crear una release adicional; el disco bajó de 100% a aproximadamente 31% y se dejó política KEEP=3. |
|---|

FIN DEL MANUAL · BAQUEANO NICARAGUA
