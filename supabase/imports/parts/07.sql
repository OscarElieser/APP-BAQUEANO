-- BAQUEANO · Importación territories-data.js → Supabase · parte 07 de 07
-- Generado desde supabase/imports/20261005_territories_import.sql. Ejecutar las partes EN ORDEN en el SQL Editor.
-- Idempotente: si una parte se ejecuta dos veces, no duplica (ON CONFLICT).
begin;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-comedor-la-parada', 'Restaurant Guru / AZ Nicaragua', 'https://es.restaurantguru.com/Comedor-La-Parada-Granada-Granada', 'directory', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-comedor-martha', 'Google Business', 'https://www.google.com/maps/search/?api=1&query=Comedor+Martha+Granada+Nicaragua', 'directory', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-kiosco-la-gata', 'La Gaceta / La Verdad Nica', 'https://www.lagaceta.gob.ni/la-imponente-gran-sultana-granada-muestra-algunos-de-sus-rincones-mas-hermosos/', 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-silvestre-selva-negra', 'Sitio oficial', 'https://selvanegramatagalpa.wixsite.com/snpatrio2024/acerca-de', 'business_official', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-albergue-tierra-alta-ecolodge', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-rio-tuma', 'OpenStreetMap', 'https://mapcarta.com/es/N5135651522', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-cascada-la-luna-el-tuma-la-dalia', 'OpenStreetMap / Mapa Nacional de Turismo', 'https://mapcarta.com/es/N5607799821', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-cascada-blanca-rio-yasica', 'OpenStreetMap / UCC', 'https://mapcarta.com/es/N4904807522', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-natural-cerro-musun', 'Mapa Nacional de Turismo (catálogo de naturaleza 2026)', null, 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-selva-negra-ecolodge', 'Selva Negra (sitio oficial)', 'https://www.selvanegra.com/', 'business_official', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-selva-negra-ecolodge', 'AntWeb / referencia geográfica de Selva Negra Hotel', 'https://www.antweb.org/locality.do?code=loc12.9990835%2C-85.90928', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-hotel-san-jose-matagalpa', 'Hotel San José Matagalpa (sitio oficial)', 'https://hotelsanjosematagalpa.com/', 'business_official', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-hotel-san-jose-matagalpa', 'Mapcarta / OpenStreetMap', 'https://mapcarta.com/es/N1780589783', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-natural-tisey-la-estanzuela', 'Mapa Nacional de Turismo / Wikidata (catálogo de naturaleza 2026)', null, 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-natural-miraflor', 'OpenStreetMap / Wikidata (catálogo de naturaleza 2026)', null, 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-finca-lindos-ojos', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-ecoposada-tisey', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-albergue-familiar-neblina-del-bosque', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-asopasn-programa-agricola-san-nicolas', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-finca-agroturistica-fuente-de-vida', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-salto-de-la-estanzuela', 'Mapa Nacional de Turismo / referencia geográfica secundaria', 'https://www.mapanicaragua.com/category/atractivos-turisticos/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-cuevas-y-mirador-de-apaguaji', 'Visit Nicaragua / OpenStreetMap (catálogo de naturaleza 2026)', null, 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-cueva-del-duende-tisey', 'Plan de Manejo Tisey-La Estanzuela / OpenStreetMap (catálogo de naturaleza 2026)', null, 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-mirador-el-ranchito-tisey', 'OpenStreetMap (catálogo de naturaleza 2026)', null, 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-volcan-cosiguina-y-laguna-crater', 'MARENA / Geographic Names (catálogo de naturaleza 2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-estero-padre-ramos', 'Mapa Nacional de Turismo (catálogo de naturaleza 2026)', null, 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-rancho-maribel', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-campamento-ecologico-campuzano', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-cabanas-el-manantial', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-playa-jiquilillo', 'Mapa Nacional de Turismo', 'https://www.mapanicaragua.com/sol-y-playa/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-laguna-de-tiscapa', 'Mapa Nacional de Turismo / MARENA (catálogo de naturaleza 2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-laguna-de-xiloa-y-apoyeque', 'Visit Nicaragua / OpenStreetMap (catálogo de naturaleza 2026)', null, 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-laguna-de-asososca', 'Mapa Nacional de Turismo / MARENA (catálogo de naturaleza 2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-natural-chocoyero-el-brujo', 'Mapa Nacional de Turismo / KBA', 'https://www.mapanicaragua.com/reserva-natural-chocoyero-el-brujo/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-hotel-bosque-las-nubes', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-finca-las-delicias', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-silvestre-privada-montibelli', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-playa-pochomil', 'Mapa Nacional de Turismo / GeoNames', 'https://www.mapanicaragua.com/sol-y-playa/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-playa-masachapa', 'Mapa Nacional de Turismo / GeoNames', 'https://www.mapanicaragua.com/sol-y-playa/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-laguna-de-apoyeque', 'Visit Nicaragua (catálogo de naturaleza 2026)', null, 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-lago-xolotlan-lago-de-managua', 'Mapa Nacional de Turismo / Geographic Names (catálogo de naturaleza 2026)', null, 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-natural-peninsula-de-chiltepe', 'Mapa Nacional de Turismo (catálogo de naturaleza 2026)', null, 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-intercontinental-managua-at-metrocentro-mall', 'IHG / InterContinental (sitio oficial)', 'https://www.ihg.com/intercontinental/hotels/es/es/managua/mgahb/hoteldetail', 'business_official', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-intercontinental-managua-at-metrocentro-mall', 'Mapcarta / OpenStreetMap', 'https://mapcarta.com/es/32287560', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-hyatt-place-managua', 'Hyatt (sitio oficial)', 'https://www.hyatt.com/hyatt-place/es-ES/mgazm-hyatt-place-managua', 'business_official', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-hyatt-place-managua', 'Mapcarta / OpenStreetMap', 'https://mapcarta.com/W286996213', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-cocina-de-dona-haydee', 'Google Business / OpenStreetMap', 'https://mapcarta.com/N887699115', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-restaurante-don-candido', 'Google Business / OpenStreetMap', 'https://mapcarta.com/es/N1748771743', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-restaurante-el-eskimo', 'Google Business / OpenStreetMap', 'https://mapcarta.com/es/N887537085', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-restaurante-los-ranchos', 'Google Business / OpenStreetMap', 'https://mapcarta.com/es/N887536144', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-kiosko-vilma', 'Google Business / Bigfoot Hostel', 'https://www.bigfoothostelleon.com/service-page/from-managua-airport-to-leon-shared-shuttle-23', 'directory', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-la-boquita', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/atractivos/playas/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-silvestre-privada-la-makina', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-finca-los-angeles', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-finca-poza-redonda-azul', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-cerro-mogoton-2-107-msnm', 'GeoNames (catálogo de naturaleza 2026)', null, 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-fortaleza-de-la-inmaculada-concepcion-el-castillo', 'Mapa Nacional de Turismo', 'https://www.mapanicaragua.com/arquitectura-de-el-castillo/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-fortaleza-de-la-inmaculada-concepcion-el-castillo', 'Mapa Nacional de Turismo', 'https://www.mapanicaragua.com/cultura-de-el-castillo/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-biologica-indio-maiz', 'MARENA / OpenStreetMap (catálogo de naturaleza 2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-archipielago-de-solentiname', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/atractivos/islas/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-hostal-buen-amigo', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-albergue-caiman-los-guatuzos', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-rio-san-juan', 'Mapa Nacional de Turismo / Wikidata', 'https://www.mapanicaragua.com/rio-san-juan/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-reserva-de-biosfera-bosawas', 'Mapa Nacional de Turismo / MARENA (catálogo de naturaleza 2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-rio-coco-wangki', 'GeoNames / Wikidata', 'https://mapcarta.com/es/19586360', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-finca-agroturistica-el-cortes', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-parque-nacional-saslaya', 'MARENA · Plan de Manejo Parque Nacional Saslaya (catálogo de naturaleza 2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-corn-island-little-corn-island', 'Visit Nicaragua', 'https://www.visitanicaragua.com/islas/great-corn-island/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-little-corn-island-y-otto-beach', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/atractivos/islas/', 'media', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-garifuna-secrets-of-the-jungle', 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', null, 'government', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-rio-grande-de-matagalpa', 'GeoNames / OpenStreetMap', 'https://mapcarta.com/es/19583878', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('place', 'pl-rio-escondido', 'GeoNames / Mapcarta', 'https://mapcarta.com/es/19584100', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-yemaya-reefs', 'Yemaya Reefs (sitio oficial)', 'https://yemayalittlecorn.com/es/inicio/', 'business_official', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values ('business', 'biz-yemaya-reefs', 'OpenStreetMap / punto turístico inmediato al hotel', 'https://mapcarta.com/es/N8694728217', 'osm', '2026-10-05'::timestamptz, '2026-10-05'::timestamptz + interval '1 year', 'migration:territories', 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.data_migration_runs (run_key, source, mode, finished_at, totals, status)
values ('territories-2026-10-05', 'website/js/territories-data.js', 'apply', now(), '{"total_fuente_original":266,"places":237,"businesses":25,"total_insertados":262,"total_actualizados":0,"total_duplicados":4,"total_pendientes":141,"total_parciales":6,"total_verificados":115,"total_sin_coordenadas":183,"total_coordenadas_descartadas":0,"total_sin_fuente":141,"total_map_ready":37,"total_sin_municipio":193,"total_categoria_inferida":177,"total_notas_precio":38}'::jsonb, 'ok')
on conflict (run_key) do update set finished_at = now(), totals = excluded.totals, status = 'ok';
commit;
