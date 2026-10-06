# Auditoría de seguridad BAQUEANO · 2026-10-06

> 🎯 **POR QUÉ:** el propietario pidió auditar la seguridad completa con la skill pública `cloudflare/security-audit-skill`, sin marcar verde nada que no se pueda demostrar.
> ⚙️ **CÓMO:**
> - Se usó la skill copiada en `.claude/skills/security-audit/` (licencia MIT, ver `ORIGEN.md`).
> - Perfil `quick`: una ola de 6 cazadores, un verificador independiente por candidato y un crítico final de cobertura.
> - Solo se revisó código fuente: no hubo sandbox para ejecutar ataques.
> - Ledger y hallazgos validados con los validadores de la skill (`PASS`).
> 📦 **QUÉ:** el resumen, los hallazgos con su estado, lo corregido, lo que queda y la cobertura.

## 1. Alcance y límites (léase primero)

**Datos de la corrida**
- **Perfil:** `quick`. Es una **pasada parcial**, no una auditoría exhaustiva.
- **Presupuesto:** 30 agentes, ampliado de 20 tras un rate limit (registrado en `run-metadata.json`).
- **Usados:** 6 cazadores, 10 verificadores y 1 crítico final.
- **Fuente revisada:**
  - La corrida arrancó sobre el árbol de trabajo de `4d1ac3c`, con ediciones de la auditoría todavía sin commit.
  - Los verificadores recomprobaron cada traza en `a25cb23`.
  - Las correcciones posteriores se hicieron en `8e781b0` y en este commit.
- **Ejecución:** solo lectura de código y consultas SQL de solo lectura a la base de producción mediante el conector Supabase.
  - No existe un sandbox verificado en este entorno.
  - Ningún hallazgo pudo **confirmarse** ejecutándolo. Los 10 quedan como `needs_validation` y así se reportan.
- **Fuera de alcance:** `ios/`, Flutter `web/` (regla del proyecto) y código nativo (no hay).
- **Sin corrida previa:** es la primera, `run-1`.

## 2. Hallazgos

| # | Hallazgo | Severidad estimada | Estado |
|---|---|---|---|
| 1 | XSS almacenado en Ops Center vía `businesses.cover_image` | Alta | 🟢 Corregido en cliente y BD. El CHECK se probó contra la carga de ataque |
| 2 | Autodeploy de la VM sin compuerta de CI y con `sudo` | Alta (condicional) | 🔴 Acción del propietario |
| 3 | Rol de personal al registrarse si el correo figura como confirmado | Alta (condicional) | 🔴 Acción del propietario (Supabase Auth) |
| 4 | La revocación en RBAC no aplicaba a quien entra con Firebase (5 funciones) | Media | 🟡 Corregido en código, falta desplegar |
| 5 | BAQUI pública sin límite: gasto de Gemini e inflado de KPIs | Media | 🟡 Presupuesto en BD aplicado y probado; la función falta desplegar |
| 6 | Recuperación de BAQUI con service role ignoraba el estado de publicación | Media | 🟡 Corregido en código, falta desplegar |
| 7 | `baqueano-mirror`: un usuario podía pisar filas de otro | Media (integridad) | 🟡 Corregido en código, falta desplegar |
| 8 | Límites de analítica según un `anonymous_id` que elige el cliente | Media (integridad de KPIs) | 🔴 Abierto, con propuesta |
| 9 | `travel_plans` guardado con un `userUid` enviado por el cliente | Baja-Media | 🟡 Corregido en código, falta desplegar |
| 10 | Evidencias de sprint vencidas sumaban al KPI interno | Baja | 🟢 KPI corregido en BD y verificado |

Para cada uno, el detalle (traza, evidencia, bloqueos y plan de validación) está en `FINDINGS-DETAIL.md`. Lo que falta para cerrarlos está en `NEEDS-VALIDATION.md`.

**Qué significa 🟡:** el código corregido está en el repositorio, pero las Edge Functions de Supabase **no se desplegaron** desde esta sesión. El entorno no tiene Deno ni la CLI de Supabase, y no se pidieron credenciales. Hasta el despliegue, producción sigue con la versión anterior.

## 3. Cambios hechos por esta auditoría

**Base de datos** (aplicadas a `heiudfpthqwtjrtluqlm`, aditivas, sin borrar datos)
- `20261006050000_business_cover_image_check.sql`: CHECK `businesses_cover_image_safe_url`.
  - Rechaza la carga de XSS y `javascript:`, y acepta `https`.
- `20261006060000_sprint_evidence_kpi_filter.sql`: `evidencias_sprint` cuenta solo registros vigentes.
  - Firma, `SECURITY DEFINER` y permisos sin cambios (verificado).
- `20261006070000_baqui_request_budget.sql`: tabla `ai_request_budget` y `baqui_consume_budget()`.
  - Solo `service_role` puede usarla.
  - Prueba: con límite 2 devolvió `true, true, false`; anon no tiene acceso.

**Edge Functions** (en código, pendientes de despliegue)
- `_shared/baqueano-knowledge.ts`: filtro de publicación por dominio igual a RLS (eventos `published` e `historical`) y campos privados removidos.
- `baqueano-ai`:
  - no guarda un `userUid` del cliente;
  - `travelStyle` acotado;
  - presupuesto por IP (hash SHA-256, sin IP en claro): 20 consultas cada 10 minutos, 429 al pasarse;
  - presupuesto global: 400 por hora; al pasarse responde solo con el catálogo propio, sin Gemini.
- `baqueano-mirror`:
  - el dueño sale de la fila guardada;
  - 403 si otra persona intenta escribirla o borrarla;
  - no devuelve mensajes internos de error.
- `baqueano-identity` y `_shared/staff-revocation.ts`, usado por `baqueano-ops`, `-sos`, `-reservas` y `-community`:
  - una revocación o suspensión en el RBAC de Supabase quita el rol de personal también a quien entra con Firebase.
  - Se verificó en la BD que hoy ningún miembro del personal pierde el acceso, porque ninguno tiene todavía perfil en Supabase.

**Web**
- `js/ops-center/ops-engine.js`:
  - `escape()` también codifica `'`;
  - `jsAttr()` y `safeUrl()` nuevos;
  - estado en lista blanca;
  - precios validados como número;
  - vista previa codificada.

## 4. Cobertura (ledger validado)

**Unidades:** 16 en total.
- **4 `covered`:** revisadas sin hallazgo.
- **8 `candidate`:** produjeron los 10 hallazgos.
- **4 `deferred`:** las agregó el crítico final. En perfil `quick` no hay segunda ola, así que quedan diferidas con el motivo `quick_profile_final_critic`.

**Las 4 unidades diferidas**
1. **Revocación en todas las puertas.** Incluye `firestore.rules`, `storage.rules` y `functions/lib/auth-middleware.js` con listas de correos fijas.
   - La parte de las Edge Functions ya se corrigió en este commit.
   - Las reglas de Firebase siguen sin revisar.
2. **Render de planes y respuestas de BAQUI.** Cubre `route-builder.js`, `baqui-evolved.js`, `baqueano-ai.js` y `ai-assistant.js`, que interpolan salida del modelo en `innerHTML`.
   - Hay que establecer primero si esas páginas cargan esos scripts.
3. **Aislamiento entre usuarios** en Firebase Storage, en los buckets de Supabase Storage y en lecturas de `firestore.rules`.
4. **`baqueano-status`.** Es una función nueva que el mapa de arquitectura no contaba (9 funciones, no 8). Devuelve conteos con service role; el impacto probable es bajo.

**Notas de endurecimiento sin hallazgo**
- La CSP permite `script-src 'unsafe-inline'`.
- `flutter_ci.yml` expone los secretos del keystore a PRs del mismo repositorio.
- `vector` está en el esquema `public`.

## 5. Semáforo de seguridad

**🟡 Amarillo.**
- El único XSS almacenado de severidad alta está corregido y probado en la BD.
- Pero hay dos riesgos altos que dependen de configuración que solo el propietario puede ver: el autodeploy con sudo y la confirmación de correo en Auth.
- Además, 5 correcciones esperan despliegue.

No se marca verde: nada se pudo confirmar ejecutándolo.

## 6. Archivos de esta carpeta

| Archivo | Contenido |
|---|---|
| `architecture.md` | Mapa de arquitectura, fronteras de confianza y superficies |
| `coverage-ledger.json` | 16 unidades (`validate-coverage-ledger.cjs`: PASS) |
| `findings.json` | 10 registros `needs_validation` (`validate-findings.cjs`: PASS) |
| `FINDINGS-DETAIL.md` | Traza y evidencia de cada hallazgo |
| `NEEDS-VALIDATION.md` | Qué hace falta para cerrar cada uno y quién lo hace |
