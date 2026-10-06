# NEEDS-VALIDATION · auditoría de seguridad 2026-10-06

> 🎯 **POR QUÉ:** ningún hallazgo se pudo confirmar ejecutándolo (no hay sandbox). Este archivo dice qué falta para cerrar cada uno, sin pedir claves ni tokens.
> ⚙️ **CÓMO:**
> - Todas las acciones son de solo lectura o de configuración.
> - Ninguna exige atacar producción.
> - Los comandos SQL son consultas, no cambios.
> 📦 **QUÉ:**
> - **A:** acciones del propietario.
> - **B:** despliegue.
> - **C:** abiertos con propuesta.
> - **D:** unidades diferidas.

## A. Acciones del propietario (bloquean el verde)

### A1. Autodeploy con sudo (hallazgo 2)
En la VM `vm-baqueano-prod`:

```bash
sudo -l -U baqueano                       # ¿qué puede hacer con sudo?
sudo journalctl -u baqueano-autodeploy -n 100
df -h
```

En GitHub:
- Activar la protección de rama en `main`: revisión obligatoria, checks obligatorios y sin bypass para bots.

**Riesgo:** quien pueda escribir en `main` ejecuta código en la VM a los 2 minutos.

### A2. Confirmación de correo en Supabase Auth (hallazgo 3)
1. En el panel de Supabase, abrir **Authentication → Providers → Email** y confirmar que **"Confirm email"** está activado.
2. Revisar qué proveedores externos están activos.

**Por qué importa:** los correos de super admin están publicados en una migración. Si la confirmación estuviera desactivada, cualquiera podría registrarse con uno de ellos y recibir el rol.

**Consulta de control:** personal que ya no está activo en `staff_roles` pero conserva el rol.

```sql
select u.email, ur.role_id
from public.user_roles ur
join auth.users u on u.id = ur.user_id
where ur.role_id in ('admin','auditor','superadmin')
  and not exists (
    select 1 from public.staff_roles s
    where lower(s.email) = lower(u.email) and s.is_active
  );
```

### A3. Cabeceras servidas
Confirmar la CSP real de `/admin.html`:

```bash
curl -sI https://baqueanonicaragua.com/admin.html
```

La CSP del repositorio permite `'unsafe-inline'`.

## B. Despliegue pendiente (las correcciones 🟡)

Desplegar desde una máquina con la CLI de Supabase y sesión iniciada:

```bash
supabase functions deploy baqueano-ai baqueano-mirror baqueano-identity baqueano-ops baqueano-sos baqueano-reservas baqueano-community --project-ref heiudfpthqwtjrtluqlm
```

**Prueba después del despliegue**
1. Enviar 21 consultas a BAQUI desde la misma red en menos de 10 minutos. La número 21 debe responder 429.
2. Un usuario de prueba de Firebase intenta escribir `businesses/<id ajeno>` en `baqueano-mirror`. Debe recibir 403.
3. Un perfil de prueba con `status = 'suspended'` y claim `admin` no debe entrar al Ops Center.

## C. Abiertos con propuesta (no se aplicaron para no romper la analítica)

### C1. Analítica según `anonymous_id` (hallazgo 8)
**Propuesta:**
- Una Edge Function emite un token de dispositivo firmado, con hash de IP y vencimiento.
- `track_event`, `track_commercial_action` y `submit_feedback` lo exigen.
- Límites globales por hora y por entidad.
- `is_qualified = false` para acciones anónimas hasta tener una segunda señal.

Cambia el significado de los KPIs actuales, así que requiere decisión del propietario.

### C2. Evidencias de sprint vencidas (hallazgo 9)
- El KPI ya cuenta solo las vigentes (migración `20261006060000`). Hoy hay 0 filas.
- Una limpieza programada que borre las vencidas es un borrado. Por la regla "no eliminar nada" queda como decisión del propietario.

### C3. Recuperación de BAQUI (hallazgo 6)
El verificador nota que algunas columnas privadas de negocios publicados ya son legibles por anon vía PostgREST. Hay que revisar los grants por columna de `businesses`:

```sql
select column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'businesses' and grantee = 'anon';
```

## D. Unidades diferidas por el crítico final (próxima corrida)

1. **Revocación en `firestore.rules`, `storage.rules` y `functions/lib/auth-middleware.js`.** Usan listas de correos fijas, fuera del RBAC de Supabase.
2. **Render de planes y respuestas de BAQUI** (`route-builder.js`, `baqui-evolved.js`, `baqueano-ai.js`, `ai-assistant.js`). Primero hay que establecer qué páginas los cargan.
3. **Aislamiento entre usuarios** en Firebase Storage, en los buckets de Supabase Storage y en las lecturas de `firestore.rules` (`conversations`, `messages`, `reservation_requests`, `travelPlans`).
4. **`baqueano-status`.** Conteos con service role sin filtro de publicación; el impacto probable es bajo.
