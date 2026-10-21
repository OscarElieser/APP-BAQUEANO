-- ============================================================================
-- 🧭 BAQUEANO — (OPCIONAL) ESTRELLAS SIN RESPALDO EN public.destinations
-- ============================================================================
-- 🎯 POR QUÉ: las 7 filas de `destinations` tienen rating 4.88–4.98 y reviews_count 275–512,
--   pero `reviews` está vacía: son cifras sin respaldo. La web ya no las muestra; esto evita
--   que otra pantalla o la app las use. Regla: nunca 5 estrellas ni promedios por defecto.
-- ⚙️ CÓMO: primero respaldo completo (nada se pierde), después rating = null y reviews_count = 0.
-- ↩️ ROLLBACK: update public.destinations d set rating = b.rating, reviews_count = b.reviews_count
--              from public.destinations_rating_backup_20261020 b where b.id = d.id;
-- ============================================================================
begin;
create table if not exists public.destinations_rating_backup_20261020 as
  select id, rating, reviews_count, now() as backed_up_at from public.destinations;
alter table public.destinations_rating_backup_20261020 enable row level security;
revoke all on public.destinations_rating_backup_20261020 from public, anon, authenticated;
update public.destinations set rating = null, reviews_count = 0 where rating is not null or reviews_count <> 0;
commit;
