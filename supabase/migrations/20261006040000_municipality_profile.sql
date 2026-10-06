-- ============================================================================
-- 🧭 BAQUEANO — Ficha verificable de los 153 municipios (auditoría 2026-10-06)
-- ============================================================================
-- 🎯 POR QUÉ: el propietario pidió información de cada municipio. `municipalities` solo
--   tenía nombre y departamento. Regla del proyecto: no inventar. Se agregan columnas
--   para datos CALCULADOS del contorno oficial y para el estado de lo que falta verificar.
-- ⚙️ CÓMO: solo ADD COLUMN IF NOT EXISTS, sin borrar ni renombrar nada. latitude/longitude
--   (pin) NO se tocan: el punto interior de un contorno que incluye agua puede caer en un lago.
--   Por eso va en boundary_center_*, con nombre explícito.
-- 📦 QUÉ: area_km2, boundary_center_lat/lng, boundary_bbox, boundary_source(_url), identity
--   (texto curado ya publicado en la web), profile_status y pending_fields.
--   Datos: supabase/imports/20261006_municipalities_geo.sql (tools/data/build-municipalities.mjs).
-- ↩️ ROLLBACK: las columnas son nuevas y nadie depende de ellas aún; se pueden ignorar.
--   Retirarlas requiere autorización del propietario (regla: no borrar).
-- ============================================================================
alter table public.municipalities
  add column if not exists area_km2 numeric(10,1),
  add column if not exists boundary_center_lat double precision,
  add column if not exists boundary_center_lng double precision,
  add column if not exists boundary_bbox jsonb,
  add column if not exists boundary_source text,
  add column if not exists boundary_source_url text,
  add column if not exists identity text,
  add column if not exists profile_status text not null default 'pending_verification',
  add column if not exists pending_fields text[] not null default array['population','history','festivities','cabecera_coordinates'];

comment on column public.municipalities.area_km2 is 'Área geodésica del contorno geoBoundaries ADM2 (OSM). En municipios lacustres/costeros puede incluir agua. No es la cifra oficial INIFOM.';
comment on column public.municipalities.boundary_center_lat is 'Punto interior del contorno (ubica el área). NO es la cabecera municipal ni un pin.';
comment on column public.municipalities.profile_status is 'pending_verification | verified. Solo Ops Center (con fuente) lo pasa a verified.';
