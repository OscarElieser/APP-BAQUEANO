# Verificación de requisitos técnicos y Azure — 2026-10-03

<!--
🎯 POR QUÉ (WHY / PROPÓSITO):
Determinar con evidencia reproducible si BAQUEANO satisface la rúbrica de
documentación, datos, interfaces, Git, seguridad, compilación e infraestructura.

⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
Cada requisito se contrastó con archivos versionados, pruebas locales, Git
local/remoto y consultas HTTP/TCP al despliegue vigente. “Parcial” significa
que existe implementación, pero falta una evidencia o recorrido exigido.

📦 QUÉ (WHAT / ENTREGABLES):
Matriz de cumplimiento, evidencias, brechas y orden de cierre. Esta auditoría no
realiza push, despliegues, cambios de red ni conexiones SSH autenticadas.
-->

## Veredicto

**BAQUEANO cumple parcialmente la rúbrica.** La infraestructura Azure y la web
pública están activas, pero aún faltan entregables obligatorios y demostraciones
de extremo a extremo.

| # | Requisito | Estado | Evidencia y brecha |
|---:|---|---|---|
| 1 | README técnico | 🟡 Parcial | `README.md` describe el producto, Android, instalación y Azure. Falta una tabla completa del stack real y ejecución local de Website, Functions, Supabase y API Azure. |
| 2 | Modelo ER / 2FN | 🔴 No cumple | Hay migraciones SQL, pero no existe diagrama ER canónico ni documento de normalización. `docs/audit/DATABASE_AUDIT.md` también registra esta ausencia. |
| 3 | Interfaces y formularios | 🟡 Parcial | 30 HTML, navegación en 28 y formularios en 10; smoke test y 10 rutas críticas pasan. No existe prueba E2E que complete todos los formularios ni verificación Flutter vigente. |
| 4 | Git/GitHub | 🟡 Parcial | `main`, `origin/main` y GitHub apuntan a `6cc4841`; hay commits y despliegue automático. Varios mensajes son poco descriptivos y no existe evidencia capturada del uso manual de commit/push/pull. |
| 5 | Seguridad y tres roles | 🟡 Parcial | Firebase Custom Claims, reglas Firestore y middleware prueban superadministrador, administrador y usuario; 28 pruebas pasan. El rol auditor aparece en Ops/mock, pero no está aplicado de forma autoritativa en backend, y `/admin` Flutter no tiene guard de ruta. |
| 6 | Ejecución y video | 🟡 Parcial | Website y API funcionan públicamente; pruebas web/Functions pasan. No existe video de navegación en `docs/evidencias/` y `flutter analyze` agotó 180 s. |
| 7 | APK y build web | 🟡 Parcial | Existe APK local de 95,441,231 bytes y `website/dist-hostinger`; la validación del build estático pasa. El APK devuelve 404 en Azure y Firebase, y no hay paquete web comprimido versionado. |
| 8 | Servidor Azure y SSH | 🟡 Parcial | `/api/azure/health` confirma `vm-baqueano-prod`, Linux Azure y Node v22.23.3; puerto 22 responde. Falta captura o sesión autenticada que demuestre login SSH. |
| 9 | IP y puertos | 🟢 Cumple técnicamente | IP `20.80.81.65`; 22/80/443 abiertos; 3000/5432 cerrados o filtrados. Scripts NSG/UFW documentan la intención. Falta captura formal del portal/nmap para presentación. |
| 10 | Entorno y BD | 🟢 Cumple | Endpoint vivo confirma Node v22.23.3, Supabase PostgreSQL operativo y PostgreSQL local escuchando en `127.0.0.1:5432`. |
| 11 | Conexión cloud sin localhost cliente | 🟢 Cumple con dominio | Cliente público usa HTTPS y Nginx enruta internamente a `127.0.0.1:3000`; ese localhost es privado del servidor. Azure consulta Supabase real. El acceso literal por IP sigue fallando. |
| 12 | Accesibilidad pública | 🟡 Parcial | `https://baqueanonicaragua.com` y APIs responden 200. `http://20.80.81.65/` y `/health` devuelven 404; Android instalado no fue demostrado en dispositivo. |
| 13 | Seguridad básica | 🟢 Cumple en sondeo externo | API 3000 y PostgreSQL 5432 no están expuestos; Nginx publica 80/443. Debe conservarse 22 restringido al origen administrativo y evidenciarlo en el NSG. |
| 14 | Funcionamiento autónomo | 🟡 Parcial | Hay navegación pública y smoke tests, pero falta un E2E grabado del proceso principal completo sin intervención técnica. |
| 15 | Integración cliente/servidor/BD | 🟡 Parcial | Azure lee información real de Supabase (`departments: 17`). No hay prueba vigente de crear→leer→modificar desde el cliente mediante Azure; `13-crud.png` sigue ausente. |
| 16 | Producción = GitHub main | 🟡 Parcial | Producción, HEAD local y HEAD remoto coinciden en `6cc4841`. El worktree contiene cambios sin commit, de modo que el estado de desarrollo actual aún no está en `main` ni en Azure. README sí documenta el despliegue. |

## Evidencia ejecutada

- `git ls-remote origin refs/heads/main` → `6cc4841…`.
- `https://baqueanonicaragua.com/health` → HTTP 200, commit `6cc4841`.
- `/api/azure/health` → VM Azure, Linux `6.8.0-1070-azure`, Node `v22.23.3`.
- `/api/azure/db` → Supabase `ok:true`, 17 departamentos y PostgreSQL local activo.
- Sondeo TCP: 22/80/443 abiertos; 3000/5432 cerrados o filtrados.
- `corepack pnpm --dir website test` → correcto.
- `corepack pnpm --dir website test:hostinger` → 10 rutas críticas correctas.
- `npm --prefix functions test` → 28/28 pruebas correctas.
- `node --check azure/api/server.js` → correcto.
- Validación Bash no ejecutada: `bash` no está disponible en este Windows.
- `flutter analyze --no-pub` → timeout de 180 segundos; no se acredita como limpio.

## Brechas bloqueantes para presentación

1. Crear `docs/DATABASE_ER.md` con el modelo relacional Supabase y justificar 1FN/2FN.
2. Corregir el virtual host predeterminado para que la IP pública sirva o redirija BAQUEANO.
3. Publicar un APK reciente mediante una ruta web estable y verificar descarga/instalación.
4. Grabar navegación web y Android, incluyendo el flujo principal completo.
5. Ejecutar y capturar una sesión SSH autenticada, NSG, servicios, versiones y PostgreSQL local.
6. Implementar una prueba CRUD real cliente→API Azure→BD con autorización y persistencia.
7. Completar el guard RBAC Flutter y definir permisos backend reales para auditor.
8. Resolver el bloqueo de Flutter Analyze/Test y generar un APK release nuevo.
9. Convertir los cambios locales aprobados en commits descriptivos, sincronizar `main` y comprobar `/health` otra vez.

