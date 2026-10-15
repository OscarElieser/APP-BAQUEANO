-- ============================================================================
-- 🧭 BAQUEANO — PÁGINAS DEL WEBSITE BUILDER EN SUPABASE (site_pages)
-- 🎯 POR QUÉ: 2026-10-15 «Error al guardar: Firestore no disponible» en Ops Center →
--   Website Builder. La fuente de verdad es Supabase; el Builder escribía en Firestore.
-- ⚙️ CÓMO: lectura pública (las páginas aplican lo publicado); escritura solo desde la
--   Edge Function baqueano-cms con la clave de servicio, después de verificar el rol de
--   personal (admin / super_admin). Ningún cliente anónimo o autenticado puede escribir.
-- 📦 QUÉ: tabla public.site_pages (page_id, title, sections jsonb, updated_at, updated_by).
-- ============================================================================
create table if not exists public.site_pages (
  page_id    text primary key check (page_id ~ '^[a-z0-9_-]{1,60}$'),
  title      text,
  sections   jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array' and pg_column_size(sections) < 400000),
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.site_pages enable row level security;

drop policy if exists site_pages_public_read on public.site_pages;
create policy site_pages_public_read on public.site_pages for select to anon, authenticated using (true);

revoke all on public.site_pages from anon, authenticated;
grant select on public.site_pages to anon, authenticated;

comment on table public.site_pages is 'Website Builder del Ops Center: secciones por página. Escritura solo por la Edge Function baqueano-cms (rol admin verificado).';
