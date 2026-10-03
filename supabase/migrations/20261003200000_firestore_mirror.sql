-- ============================================================================
-- 🧭 BAQUEANO — ESPEJO COMPLETO DE FIRESTORE EN SUPABASE (firestore_mirror)
-- ============================================================================
-- 🎯 POR QUÉ: directiva del propietario (2026-10-03): Firestore es la fuente
--    prioritaria y Supabase debe guardar la misma información. La auditoría de
--    paridad mostró 26 colecciones sin tabla y ninguna réplica activa.
-- ⚙️ CÓMO: una tabla genérica y privada guarda cada documento de Firestore
--    completo (jsonb) por su ruta, incluidas subcolecciones. Solo escribe la
--    Edge Function `baqueano-mirror` con la clave de servicio, después de
--    verificar el token de Firebase y las mismas reglas de firestore.rules.
--    Los borrados se marcan (deleted = true) y nunca eliminan la copia.
--    Cambio ADITIVO: no altera tablas, políticas ni datos existentes.
-- 📦 QUÉ: public.firestore_mirror con RLS activa y sin políticas públicas
--    (anon y authenticated sin acceso), índices por colección y dueño.
-- ============================================================================

create table if not exists public.firestore_mirror (
  doc_path        text primary key check (char_length(doc_path) between 3 and 500),
  collection      text not null check (collection ~ '^[A-Za-z0-9_-]{1,64}$'),
  doc_id          text not null,
  data            jsonb not null default '{}'::jsonb,
  owner_uid       text,
  written_by_uid  text not null,
  written_by_email text,
  op              text not null check (op in ('set', 'update', 'add', 'delete')),
  deleted         boolean not null default false,
  version         integer not null default 1,
  source          text not null default 'web',
  mirrored_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

comment on table public.firestore_mirror is
  'Espejo completo de Firestore (fuente prioritaria). Escritura exclusiva de la Edge Function baqueano-mirror.';

create index if not exists firestore_mirror_collection_idx on public.firestore_mirror (collection, mirrored_at desc);
create index if not exists firestore_mirror_owner_idx on public.firestore_mirror (owner_uid) where owner_uid is not null;

alter table public.firestore_mirror enable row level security;
revoke all on table public.firestore_mirror from anon, authenticated;
