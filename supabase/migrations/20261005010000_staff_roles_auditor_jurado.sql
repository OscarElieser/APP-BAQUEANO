-- ============================================================================
-- 🧭 BAQUEANO — CUENTA AUDITOR PARA EL JURADO (Hackathon 2026)
-- 🎯 POR QUÉ: demostrar el rol Auditor (solo lectura) con una cuenta real.
-- ⚙️ CÓMO: alta idempotente en public.staff_roles; la Edge Function la aplica
--    solo si Firebase confirma el correo verificado.
-- 📦 QUÉ: evaluadorhackathonkronox26@gmail.com → auditor (activo).
-- ============================================================================
insert into public.staff_roles (email, role, is_active, granted_by, note)
values ('evaluadorhackathonkronox26@gmail.com', 'auditor', true, 'oscarelieser.informatica.inatec@gmail.com', 'Jurado Hackathon 2026 — solo lectura')
on conflict (email) do update set role = excluded.role, is_active = true, note = excluded.note, updated_at = now();
