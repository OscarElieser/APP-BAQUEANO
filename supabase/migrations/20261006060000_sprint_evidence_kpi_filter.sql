-- 🎯 POR QUÉ: auditoría de seguridad 2026-10-06 (sprint_evidence_crud:anon-insert-no-expiry-cleanup-counted-in-kpi).
--   strategic_impact_report() contaba TODAS las filas de sprint_evidence_records, incluidas las
--   vencidas. Esas filas pueden insertarse en forma anónima y nadie las borra, así que el KPI
--   interno "evidencias_sprint" se podía inflar.
-- ⚙️ CÓMO: se toma la definición vigente de la función y se reemplaza solo la línea del conteo,
--   que pasa a contar registros no vencidos (expires_at > now()). No se borra ninguna fila y no
--   cambia la firma, los permisos ni el resto de la función. Si la línea no existe (ya
--   corregida), no hace nada.
-- 📦 QUÉ: el KPI cuenta solo evidencias vigentes. La limpieza de vencidas queda como acción del
--   propietario (ver docs/security-audit/2026-10-06/NEEDS-VALIDATION.md).
do $$
declare
  def text := pg_get_functiondef('public.strategic_impact_report(timestamptz,timestamptz)'::regprocedure);
  old_line text := '''evidencias_sprint'', (select count(*) from public.sprint_evidence_records)';
  new_line text := '''evidencias_sprint'', (select count(*) from public.sprint_evidence_records where expires_at > now())';
begin
  if position(old_line in def) > 0 then
    execute replace(def, old_line, new_line);
  end if;
end $$;
