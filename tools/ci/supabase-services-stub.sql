-- 🧪 Usado por tools/ci/migrations-replay.sh (CI). No es una migración.
-- Imita lo que agregan storage-api y gotrue (sus imágenes no están disponibles aquí).
alter table storage.buckets add column if not exists public boolean default false,
  add column if not exists file_size_limit bigint, add column if not exists allowed_mime_types text[],
  add column if not exists avif_autodetection boolean default false, add column if not exists owner_id text,
  add column if not exists type text default 'STANDARD';
alter table storage.objects add column if not exists path_tokens text[] generated always as (string_to_array(name, '/')) stored,
  add column if not exists version text, add column if not exists owner_id text, add column if not exists user_metadata jsonb;
alter table storage.objects enable row level security;
alter table storage.buckets enable row level security;
alter table auth.users add column if not exists email_confirmed_at timestamptz, add column if not exists phone text,
 add column if not exists phone_confirmed_at timestamptz, add column if not exists banned_until timestamptz,
 add column if not exists deleted_at timestamptz, add column if not exists is_anonymous boolean default false,
 add column if not exists is_sso_user boolean default false;
