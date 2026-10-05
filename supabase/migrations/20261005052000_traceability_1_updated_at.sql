-- ============================================================================
-- 🧭 BAQUEANO — TRAZABILIDAD, ESTADO EDITORIAL, SOSTENIBILIDAD Y COMPLETITUD (parte 1/4: updated_at común)
-- ============================================================================
-- 🎯 POR QUÉ (auditoría BD B-2/B-3/B-4/B-8):
--   - 7 destinos publicados sin fuente; negocios sin estado editorial, fuente,
--     verificador ni fecha; cultura/emergencias/experiencias sin trazabilidad
--     homogénea → no se puede distinguir "existe" de "verificado" o "publicado".
--   - No había forma de medir "fichas completas" ni "oferta responsable".
--   - `updated_at` no se mantenía solo en la mayoría de tablas de catálogo.
-- ⚙️ CÓMO (aditivo, idempotente, sin cambiar lecturas públicas existentes):
--   1. `set_updated_at()` — función común reutilizable; se agrega trigger solo
--      a las tablas con `updated_at` que no tenían uno (no se duplican).
--   2. Columnas de trazabilidad homogéneas (nullable) en entidades de contenido:
--      source_name, source_url, source_type, retrieved_at, verified_at,
--      verified_by → profiles, valid_until, verification_status.
--   3. `businesses.status` editorial (draft/pending_review/verified/published/
--      rejected/archived) inicializado desde `verified` (sin cambiar la RLS
--      pública, que sigue exigiendo verified = true).
--   4. `sustainability_attributes` JSONB (objeto) en oferta turística: criterios
--      responsables con estructura flexible y medible (ver DATABASE_DECISIONS).
--   5. Campos faltantes de ficha (negocio, experiencia, day pass, emergencia).
--   6. Vistas `v_business_profile_completion` y `v_verified_businesses`
--      (security_invoker: respetan la RLS de quien consulta).
-- 📦 QUÉ: base medible para KPIs de prestadores, verificación y oferta
--   responsable. No se borra ni renombra nada.
-- ============================================================================

-- 1) updated_at común ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
comment on function public.set_updated_at() is 'Trigger común BEFORE UPDATE: mantiene updated_at = now(). Reutilizar en toda tabla nueva con updated_at.';
revoke all on function public.set_updated_at() from public, anon, authenticated;

do $$
declare
  r record;
begin
  for r in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attname = 'updated_at' and not a.attisdropped)
      and not exists (
        select 1 from pg_trigger t join pg_proc p on p.oid = t.tgfoid
        where t.tgrelid = c.oid and not t.tgisinternal
          and p.proname in ('set_updated_at', 'community_touch_updated_at'))
  loop
    execute format('create or replace trigger trg_%s_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', r.relname, r.relname);
  end loop;
end $$;

