-- ============================================================================
-- 🧭 BAQUEANO — PERFIL EDITABLE DEL VIAJERO (traveler_profiles + bucket avatars)
-- ============================================================================
-- 🎯 POR QUÉ: el propietario reportó (2026-10-07) que en perfil.html "el usuario no puede editar su
--    perfil en ningún lugar": los botones "Editar" solo recargaban la página y no había formularios.
--    public.profiles exige una cuenta de Supabase Auth (FK a auth.users) y hoy las cuentas viven en
--    Firebase Auth (0 perfiles vinculados), así que el perfil del viajero necesita su propia tabla,
--    con Supabase como base principal (directiva 2026-10-05).
-- ⚙️ CÓMO:
--    - Una fila por cuenta de Firebase (firebase_uid). Solo la Edge Function baqueano-profile (service
--      role, token de Firebase verificado) lee y escribe: RLS activo y sin políticas, sin permisos para
--      anon ni authenticated.
--    - Cada columna tiene su límite de tamaño y los valores cerrados tienen lista blanca (idioma,
--      moneda, intereses), igual que la regla isValidProfileDetails de firestore.rules.
--    - Fotos: bucket público `avatars` (lectura pública como cualquier foto de perfil) con 300 KB y
--      solo WebP/JPEG. Solo la función sube archivos; antes valida los bytes reales de la imagen.
-- 📦 QUÉ: tabla public.traveler_profiles, trigger de updated_at y bucket avatars. Sin DROP ni DELETE.
-- ============================================================================
create table if not exists public.traveler_profiles (
  firebase_uid      text primary key check (char_length(firebase_uid) between 6 and 128),
  email             text check (email is null or char_length(email) <= 254),
  display_name      text check (display_name is null or char_length(display_name) <= 120),
  phone             text check (phone is null or char_length(phone) <= 30),
  city              text check (city is null or char_length(city) <= 80),
  country           text check (country is null or char_length(country) <= 80),
  emergency_contact text check (emergency_contact is null or char_length(emergency_contact) <= 120),
  dietary           text check (dietary is null or char_length(dietary) <= 300),
  accessibility     text check (accessibility is null or char_length(accessibility) <= 300),
  language          text not null default 'es' check (language in ('es', 'en', 'fr', 'it', 'pt', 'de')),
  currency          text not null default 'NIO' check (currency in ('NIO', 'USD')),
  interests         text[] not null default '{}'::text[] check (
                      cardinality(interests) <= 12
                      and interests <@ array['playas', 'volcanes', 'senderismo', 'gastronomia', 'cafe',
                                             'cascadas', 'cultura', 'familiar', 'fotografia', 'aventura']::text[]),
  consents          jsonb not null default '{}'::jsonb check (jsonb_typeof(consents) = 'object'),
  avatar_url        text check (avatar_url is null or char_length(avatar_url) <= 500),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.traveler_profiles is
  'Perfil editable del viajero (cuenta de Firebase). Solo lo lee y escribe la Edge Function baqueano-profile con el token verificado.';

alter table public.traveler_profiles enable row level security;
revoke all on table public.traveler_profiles from anon, authenticated;

create or replace trigger trg_traveler_profiles_updated_at
  before update on public.traveler_profiles
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 307200, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;
