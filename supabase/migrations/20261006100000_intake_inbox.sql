-- ============================================================================
-- 🧭 BAQUEANO — BUZÓN REAL: CONTACTO, SOLICITUDES DE NEGOCIO Y DENUNCIAS AMBIENTALES
-- ============================================================================
-- 🎯 POR QUÉ:
-- - La auditoría del Prompt Maestro Integral (2026-10-06) encontró tres formularios públicos que no
--   guardaban nada:
--   - nosotros.html recargaba la página con el mensaje en la URL;
--   - denuncias.html mostraba "registrado con éxito";
--   - "Postular mi negocio" solo abría WhatsApp.
--   El propietario exige que todo se guarde primero en Supabase, aparezca en el Ops Center con un
--   código y que el correo sea solo un aviso.
--
-- ⚙️ CÓMO:
-- - Tablas privadas: RLS activo y sin privilegios para anon ni authenticated. Solo la Edge Function
--   baqueano-intake (service_role) lee y escribe, y valida rol, origen y límites.
-- - Códigos legibles y únicos por tipo y año (BAQ-CONTACT-2026-000001) mediante un contador
--   transaccional.
-- - Las evidencias de denuncias van a un bucket privado; la tabla guarda solo ruta, tipo, tamaño y
--   hash.
-- - Avisos por correo en una cola (intake_notifications): si el envío falla, el registro sigue
--   guardado y se reintenta.
-- - Nada se borra: las tablas no aceptan DELETE; se cierran o archivan con un estado.
--
-- 📦 QUÉ:
-- - intake_counters + next_intake_code(kind)
-- - contact_messages, business_applications, eco_reports, eco_report_evidence
-- - intake_events (historial inmutable), intake_notifications
-- - bucket privado eco-evidence
-- ============================================================================

create table if not exists public.intake_counters (
  kind text not null,
  year int not null,
  last_value int not null default 0,
  primary key (kind, year)
);

create or replace function public.next_intake_code(p_kind text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from (now() at time zone 'America/Managua'))::int;
  v_next int;
  v_prefix text;
begin
  v_prefix := case p_kind when 'contact' then 'BAQ-CONTACT' when 'business' then 'BAQ-BIZ' when 'eco' then 'BAQ-ECO' else null end;
  if v_prefix is null then raise exception 'tipo de código desconocido: %', p_kind; end if;
  insert into public.intake_counters (kind, year, last_value) values (p_kind, v_year, 1)
  on conflict (kind, year) do update set last_value = public.intake_counters.last_value + 1
  returning last_value into v_next;
  return v_prefix || '-' || v_year || '-' || lpad(v_next::text, 6, '0');
end;
$$;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id text,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  subject text not null check (subject in ('alianza','destino','negocio','guia','reporte','prensa','privacidad','cookies','otro')),
  department text check (department is null or char_length(department) <= 60),
  message text not null check (char_length(message) between 10 and 4000),
  language text not null default 'es',
  status text not null default 'new' check (status in ('new','in_review','answered','closed')),
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 4000),
  handled_by text,
  ip_hash text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  answered_at timestamptz,
  closed_at timestamptz
);

create table if not exists public.business_applications (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id text not null,
  business_name text not null check (char_length(business_name) between 2 and 160),
  trade_name text check (trade_name is null or char_length(trade_name) <= 160),
  owner_name text not null check (char_length(owner_name) between 2 and 120),
  owner_role text check (owner_role is null or char_length(owner_role) <= 80),
  phone text check (phone is null or char_length(phone) <= 40),
  whatsapp text check (whatsapp is null or char_length(whatsapp) <= 40),
  email text not null check (char_length(email) <= 254),
  website text check (website is null or website ~ '^https://'),
  socials jsonb not null default '{}'::jsonb,
  department text not null,
  municipality text,
  community text,
  address text,
  lat double precision check (lat is null or lat between 10.5 and 15.2),
  lng double precision check (lng is null or lng between -88.0 and -82.5),
  category text not null check (category in ('alojamiento','restaurante','gastronomia','guia','transporte','finca','turismo_rural','artesania','cultura','musica','experiencia','day_pass','alquiler_vehiculos','otro')),
  short_description text not null check (char_length(short_description) between 20 and 300),
  description text check (description is null or char_length(description) <= 4000),
  offerings text check (offerings is null or char_length(offerings) <= 2000),
  audience text check (audience is null or char_length(audience) <= 600),
  schedule text check (schedule is null or char_length(schedule) <= 600),
  season text check (season is null or char_length(season) <= 300),
  capacity text check (capacity is null or char_length(capacity) <= 120),
  languages text[] not null default '{}',
  price_info text check (price_info is null or char_length(price_info) <= 1000),
  sustainability text check (sustainability is null or char_length(sustainability) <= 2000),
  local_impact text check (local_impact is null or char_length(local_impact) <= 2000),
  consents jsonb not null default '{}'::jsonb,
  language text not null default 'es',
  status text not null default 'submitted' check (status in ('draft','submitted','under_review','needs_information','approved','rejected','published')),
  review_notes text check (review_notes is null or char_length(review_notes) <= 4000),
  applicant_message text check (applicant_message is null or char_length(applicant_message) <= 2000),
  reviewed_by text,
  idempotency_key text unique,
  submitted_at timestamptz not null default now(),
  review_started_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists business_applications_user_idx on public.business_applications (user_id, created_at desc);
create index if not exists business_applications_status_idx on public.business_applications (status, created_at desc);

create table if not exists public.eco_reports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id text,
  anonymous boolean not null default true,
  contact_name text check (contact_name is null or char_length(contact_name) <= 120),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 40),
  category text not null check (category in ('tala_ilegal','quema','basura','contaminacion_agua','caza_trafico_fauna','mineria','invasion_area_protegida','ruido','otro')),
  severity text check (severity is null or severity in ('baja','media','alta')),
  description text not null check (char_length(description) between 20 and 4000),
  incident_at timestamptz,
  incident_time_unsure boolean not null default false,
  department text not null,
  municipality text,
  community text,
  reference text check (reference is null or char_length(reference) <= 600),
  lat double precision check (lat is null or lat between 10.5 and 15.2),
  lng double precision check (lng is null or lng between -88.0 and -82.5),
  location_source text not null default 'none' check (location_source in ('map','gps','address','none')),
  language text not null default 'es',
  status text not null default 'received' check (status in ('received','under_review','needs_information','referred','closed','archived')),
  priority text not null default 'normal' check (priority in ('baja','normal','alta','urgente')),
  assignee text,
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 4000),
  public_note text check (public_note is null or char_length(public_note) <= 1000),
  referred_to text,
  referred_at timestamptz,
  referred_by text,
  reference_number text,
  delivery_method text check (delivery_method is null or delivery_method in ('manual','email','api','official_portal','other')),
  delivery_status text check (delivery_status is null or delivery_status in ('pending','sent','failed','external_confirmed')),
  lookup_token_hash text not null,
  ip_hash text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists eco_reports_status_idx on public.eco_reports (status, created_at desc);

create table if not exists public.eco_report_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.eco_reports(id),
  storage_path text not null unique,
  file_type text not null check (file_type in ('image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime')),
  file_size bigint not null check (file_size > 0 and file_size <= 52428800),
  sha256 text,
  status text not null default 'pending' check (status in ('pending','stored','rejected')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
create index if not exists eco_report_evidence_report_idx on public.eco_report_evidence (report_id);

create table if not exists public.intake_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact','business','eco')),
  ref_id uuid not null,
  actor_type text not null check (actor_type in ('user','anonymous','admin','system')),
  actor_ref text,
  actor_role text,
  action text not null,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists intake_events_ref_idx on public.intake_events (kind, ref_id, created_at);

create table if not exists public.intake_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact','business','eco')),
  ref_id uuid not null,
  recipient text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed','not_configured')),
  attempts int not null default 0,
  message_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists intake_notifications_status_idx on public.intake_notifications (status, created_at);

-- Seguridad: nadie fuera de service_role toca estas tablas.
alter table public.intake_counters enable row level security;
alter table public.contact_messages enable row level security;
alter table public.business_applications enable row level security;
alter table public.eco_reports enable row level security;
alter table public.eco_report_evidence enable row level security;
alter table public.intake_events enable row level security;
alter table public.intake_notifications enable row level security;
revoke all on public.intake_counters, public.contact_messages, public.business_applications, public.eco_reports,
  public.eco_report_evidence, public.intake_events, public.intake_notifications from public, anon, authenticated;
revoke all on function public.next_intake_code(text) from public, anon, authenticated;
grant execute on function public.next_intake_code(text) to service_role;

-- Sin borrado físico; el historial es inmutable.
create or replace function public.intake_no_delete() returns trigger language plpgsql as $$
begin
  raise exception 'BAQUEANO: los registros del buzón no se borran; se cierran o archivan con un estado.';
end;
$$;
create or replace function public.intake_events_immutable() returns trigger language plpgsql as $$
begin
  raise exception 'BAQUEANO: el historial del buzón es inmutable.';
end;
$$;
create or replace function public.intake_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists contact_messages_no_delete on public.contact_messages;
create trigger contact_messages_no_delete before delete on public.contact_messages for each row execute function public.intake_no_delete();
drop trigger if exists business_applications_no_delete on public.business_applications;
create trigger business_applications_no_delete before delete on public.business_applications for each row execute function public.intake_no_delete();
drop trigger if exists eco_reports_no_delete on public.eco_reports;
create trigger eco_reports_no_delete before delete on public.eco_reports for each row execute function public.intake_no_delete();
drop trigger if exists eco_report_evidence_no_delete on public.eco_report_evidence;
create trigger eco_report_evidence_no_delete before delete on public.eco_report_evidence for each row execute function public.intake_no_delete();
drop trigger if exists intake_events_guard on public.intake_events;
create trigger intake_events_guard before update or delete on public.intake_events for each row execute function public.intake_events_immutable();

drop trigger if exists contact_messages_touch on public.contact_messages;
create trigger contact_messages_touch before update on public.contact_messages for each row execute function public.intake_touch();
drop trigger if exists business_applications_touch on public.business_applications;
create trigger business_applications_touch before update on public.business_applications for each row execute function public.intake_touch();
drop trigger if exists eco_reports_touch on public.eco_reports;
create trigger eco_reports_touch before update on public.eco_reports for each row execute function public.intake_touch();
drop trigger if exists intake_notifications_touch on public.intake_notifications;
create trigger intake_notifications_touch before update on public.intake_notifications for each row execute function public.intake_touch();

-- Bucket privado para evidencias (sin políticas públicas: solo service_role con URLs firmadas).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('eco-evidence', 'eco-evidence', false, 52428800,
        array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
