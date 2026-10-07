-- ============================================================================
-- 🧭 BAQUEANO — HOTEL ENCANTO DEL SUR (San Juan del Sur, Rivas)
-- ============================================================================
-- 🎯 POR QUÉ: el propietario de BAQUEANO entregó (2026-10-07) la ficha del hotel para publicarla en
--    destinos.html: servicios, tarifas de octubre 2026 y WhatsApp de contacto directo.
-- ⚙️ CÓMO:
--    - businesses: publicado con verification_status 'partial' y source_type 'business_owner' (dato
--      reportado por el negocio, no auditado en campo). Sin coordenadas: no se inventan; el mapa
--      queda pendiente (location_precision 'pending', map_ready false).
--    - prices: dos tarifas por noche en USD, vigentes solo del 1 al 31 de octubre de 2026; después
--      dejan de mostrarse solas por valid_until (no se borran).
--    - Idempotente: no duplica si se vuelve a aplicar. Sin DELETE ni DROP.
-- 📦 QUÉ: 1 negocio + 2 precios.
-- ============================================================================
insert into public.businesses (id, slug, name, category, business_type, department_id, municipality_id, description,
  location_precision, map_ready, whatsapp, phone, verification_status, verified, source_name, source_type, attributes,
  status, legacy_source, legacy_key, created_by, updated_by)
values ('biz-hotel-encanto-del-sur', 'hotel-encanto-del-sur', 'Hotel Encanto del Sur', 'hospedaje', 'hotel', 'rivas',
  'rivas__san_juan_del_sur',
  'Hospedaje en San Juan del Sur para parejas, familias y grupos que buscan tranquilidad, buena ubicación y fácil acceso a la playa y al centro de la ciudad.',
  'pending', false, '+50577532549', '+505 7753 2549', 'partial', false,
  'Hotel Encanto del Sur (información entregada por el negocio, 2026-10-07)', 'business_owner',
  '{"modality":"Hospedajes","tagline":"Tu descanso a pocos minutos del mar.","amenities":["Habitaciones estándar","Habitaciones familiares","Habitaciones para grupos","Habitaciones cómodas y equipadas","Aire acondicionado disponible","Wi-Fi","Televisión por cable","Limpieza diaria","Atención personalizada","Ambiente familiar","Cerca de la playa y del centro de San Juan del Sur"],"logo":{"status":"pending","note":"Logo original del hotel pendiente de entrega; no se reemplaza por el de BAQUEANO."},"price_note":{"text":"Tarifas de octubre 2026 reportadas por el negocio","status":"en_prices","checked_at":"2026-10-07"}}'::jsonb,
  'published', 'owner-2026-10-07', 'rivas::hotel encanto del sur', 'owner:baqueano', 'owner:baqueano')
on conflict (id) do nothing;

insert into public.prices (entity_type, entity_id, product_name, amount, currency, price_type, valid_from, valid_until, source_name, checked_at, is_active, created_by)
select 'business', 'biz-hotel-encanto-del-sur', v.product, v.amount, 'USD', 'per_night', date '2026-10-01', date '2026-10-31',
  'Hotel Encanto del Sur (tarifa reportada por el negocio)', timestamptz '2026-10-07 12:00:00-06', true, 'owner:baqueano'
from (values ('Habitación pareja por noche sin aire acondicionado', 30::numeric),
             ('Habitación pareja por noche con aire acondicionado', 40::numeric)) as v(product, amount)
where not exists (
  select 1 from public.prices p
  where p.entity_type = 'business' and p.entity_id = 'biz-hotel-encanto-del-sur' and p.product_name = v.product and p.valid_from = date '2026-10-01'
);
