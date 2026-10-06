-- ============================================================================
-- 🧭 BAQUEANO — businesses.cover_image solo URL segura (auditoría de seguridad 2026-10-06)
-- ============================================================================
-- 🎯 POR QUÉ: el dueño/gestor de un negocio puede actualizar cover_image por PostgREST
--   (grant de columna + is_business_manager), sin la validación de URL que sí aplica
--   baqueano-ops. El valor llegaba a <img src> del Ops Center (candidato
--   ops-engine.js:renderTableRow:raw-imageUrl-from-businesses.cover_image).
-- ⚙️ CÓMO: CHECK que acepta solo https://…, ruta absoluta del sitio o assets/…, sin comillas,
--   ángulos ni espacios. NOT VALID + VALIDATE (hoy 0 filas con imagen, verificado).
-- 📦 QUÉ: una restricción. No borra nada.
-- ↩️ ROLLBACK: alter table public.businesses drop constraint businesses_cover_image_safe_url;
-- ============================================================================
alter table public.businesses drop constraint if exists businesses_cover_image_safe_url;
alter table public.businesses add constraint businesses_cover_image_safe_url
  check (cover_image is null or (cover_image ~* '^(https://|/[^/]|assets/)' and cover_image !~ '["''<>\s`]')) not valid;
alter table public.businesses validate constraint businesses_cover_image_safe_url;
