-- ============================================================================
-- 🧭 BAQUEANO — IMPORTACIÓN MARENA: ÁREAS PROTEGIDAS (GENERADO — NO editar a mano)
-- 🎯 Fuente oficial trazable. ⚙️ Generado por website/scripts/import-marena-*.mjs; idempotente.
-- 📦 116 sentencias. Importar ≠ publicar: nada queda is_published = true.
-- ⚠️ Requiere 20261005090000_environmental_marena_module.sql. Ejecutar en UNA transacción y SOLO con autorización.
-- ============================================================================
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-reserva-natural-tisey-la-estanzuela', 'Reserva Natural Tisey la Estanzuela', 'Reserva Natural Tisey la Estanzuela', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-tisey-la-estanzuela/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-reserva-natural-tisey-la-estanzuela', 'MARENA — Plan de Manejo Reserva Natural Tisey la Estanzuela', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-tisey-la-estanzuela/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Tisey la Estanzuela', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-serrania-de-dipilto-y-jalapa', 'marena-reserva-natural-serrania-de-dipilto-y-jalapa', 'Reserva Natural Serranía de Dipilto y Jalapa', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serrania-de-dipilto-y-jalapa/', 'official', 'marena-planes-de-manejo', 'reserva-natural-serrania-de-dipilto-y-jalapa', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-serrania-de-dipilto-y-jalapa', 'Reserva Natural Serranía de Dipilto y Jalapa', 'Reserva Natural Serranía de Dipilto y Jalapa', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serrania-de-dipilto-y-jalapa/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-serrania-de-dipilto-y-jalapa', 'MARENA — Plan de Manejo Reserva Natural Serranía de Dipilto y Jalapa', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serrania-de-dipilto-y-jalapa/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Serranía de Dipilto y Jalapa', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-tomabu', 'marena-reserva-natural-cerro-tomabu', 'Reserva Natural Cerro Tomabu', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-tomabu/', 'official', 'marena-planes-de-manejo', 'reserva-natural-cerro-tomabu', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-tomabu', 'Reserva Natural Cerro Tomabu', 'Reserva Natural Cerro Tomabu', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-tomabu/', '2026-10-05'::timestamptz, 'partial', 'Hay Gaceta enlazada, pero el número de resolución no se pudo confirmar en su texto: approval_reference NULL.', 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-cerro-tomabu', 'MARENA — Plan de Manejo Reserva Natural Cerro Tomabu', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-tomabu/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Tomabu', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-kuskawas', 'marena-reserva-natural-cerro-kuskawas', 'Reserva Natural Cerro kuskawas', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-kuskawas/', 'official', 'marena-planes-de-manejo', 'reserva-natural-cerro-kuskawas', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-kuskawas', 'Reserva Natural Cerro kuskawas', 'Reserva Natural Cerro kuskawas', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-kuskawas/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-cerro-kuskawas', 'MARENA — Plan de Manejo Reserva Natural Cerro kuskawas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-kuskawas/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro kuskawas', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-alamikamba', 'marena-reserva-natural-alamikamba', 'Reserva Natural Alamikamba', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-alamikamba/', 'official', 'marena-planes-de-manejo', 'reserva-natural-alamikamba', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-alamikamba', 'Reserva Natural Alamikamba', 'Reserva Natural Alamikamba', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-alamikamba/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-alamikamba', 'MARENA — Plan de Manejo Reserva Natural Alamikamba', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-alamikamba/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Alamikamba', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-complejo-volcanico-san-cristobal', 'marena-complejo-volcanico-san-cristobal', 'Complejo Volcánico San Cristobal', 'area_protegida', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-complejo-volcanico-san-cristobal/', 'official', 'marena-planes-de-manejo', 'complejo-volcanico-san-cristobal', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-complejo-volcanico-san-cristobal', 'Complejo Volcánico San Cristobal', 'Complejo Volcánico San Cristobal', null, null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-complejo-volcanico-san-cristobal/', '2026-10-05'::timestamptz, 'partial', 'El título del plan no indica la categoría legal: official_category queda NULL (por confirmar).', 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-complejo-volcanico-san-cristobal', 'MARENA — Plan de Manejo Complejo Volcánico San Cristobal', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-complejo-volcanico-san-cristobal/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Complejo Volcánico San Cristobal', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-monumento-historico-concepcion-de-maria', 'marena-monumento-historico-concepcion-de-maria', 'Monumento Historico Concepción de María', 'area_protegida', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-historico-concepcion-de-maria/', 'official', 'marena-planes-de-manejo', 'monumento-historico-concepcion-de-maria', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-monumento-historico-concepcion-de-maria', 'Monumento Historico Concepción de María', 'Monumento Historico Concepción de María', 'monumento_historico', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-historico-concepcion-de-maria/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-monumento-historico-concepcion-de-maria', 'MARENA — Plan de Manejo Monumento Historico Concepción de María', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-historico-concepcion-de-maria/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Monumento Historico Concepción de María', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-monumento-nacional-archipielago-solentiname', 'marena-monumento-nacional-archipielago-solentiname', 'Monumento Nacional Archipiélago Solentiname', 'area_protegida', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-nacional-archipielago-solentiname/', 'official', 'marena-planes-de-manejo', 'monumento-nacional-archipielago-solentiname', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-monumento-nacional-archipielago-solentiname', 'Monumento Nacional Archipiélago Solentiname', 'Monumento Nacional Archipiélago Solentiname', 'monumento_nacional', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-nacional-archipielago-solentiname/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-monumento-nacional-archipielago-solentiname', 'MARENA — Plan de Manejo Monumento Nacional Archipiélago Solentiname', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-nacional-archipielago-solentiname/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Monumento Nacional Archipiélago Solentiname', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-monumento-nacional-canon-de-somoto', 'marena-monumento-nacional-canon-de-somoto', 'Monumento Nacional Cañón de Somoto', 'area_protegida', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-nacional-canon-de-somoto/', 'official', 'marena-planes-de-manejo', 'monumento-nacional-canon-de-somoto', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-monumento-nacional-canon-de-somoto', 'Monumento Nacional Cañón de Somoto', 'Monumento Nacional Cañón de Somoto', 'monumento_nacional', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-nacional-canon-de-somoto/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-monumento-nacional-canon-de-somoto', 'MARENA — Plan de Manejo Monumento Nacional Cañón de Somoto', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-monumento-nacional-canon-de-somoto/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Monumento Nacional Cañón de Somoto', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-paisaje-terrestre-mesas-de-miraflor', 'marena-paisaje-terrestre-mesas-de-miraflor', 'Paisaje Terrestre Mesas de Miraflor', 'area_protegida', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-paisaje-terrestre-mesas-de-miraflor/', 'official', 'marena-planes-de-manejo', 'paisaje-terrestre-mesas-de-miraflor', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-paisaje-terrestre-mesas-de-miraflor', 'Paisaje Terrestre Mesas de Miraflor', 'Paisaje Terrestre Mesas de Miraflor', 'paisaje_terrestre_protegido', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-paisaje-terrestre-mesas-de-miraflor/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-paisaje-terrestre-mesas-de-miraflor', 'MARENA — Plan de Manejo Paisaje Terrestre Mesas de Miraflor', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-paisaje-terrestre-mesas-de-miraflor/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Paisaje Terrestre Mesas de Miraflor', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-parque-nacional-archipielago-zapatera', 'marena-parque-nacional-archipielago-zapatera', 'Parque Nacional Archipielago Zapatera', 'parque', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-archipielago-zapatera/', 'official', 'marena-planes-de-manejo', 'parque-nacional-archipielago-zapatera', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-parque-nacional-archipielago-zapatera', 'Parque Nacional Archipielago Zapatera', 'Parque Nacional Archipielago Zapatera', 'parque_nacional', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-archipielago-zapatera/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-parque-nacional-archipielago-zapatera', 'MARENA — Plan de Manejo Parque Nacional Archipielago Zapatera', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-archipielago-zapatera/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Parque Nacional Archipielago Zapatera', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-parque-nacional-saslaya', 'Parque Nacional Saslaya', 'Parque Nacional Saslaya', 'parque_nacional', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-saslaya/', '2026-10-05'::timestamptz, 'conflicting', 'Hay Gaceta enlazada, pero el número de resolución no se pudo confirmar en su texto: approval_reference NULL. Conflicto: MARENA titula el plan "Parque Nacional Saslaya" y el archivo de la Gaceta dice "Reserva Natural Cerro Saslaya".', 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-parque-nacional-saslaya', 'MARENA — Plan de Manejo Parque Nacional Saslaya', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-saslaya/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Parque Nacional Saslaya', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-parque-nacional-volcan-maderas', 'marena-parque-nacional-volcan-maderas', 'Parque Nacional Volcán Maderas', 'parque', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-volcan-maderas/', 'official', 'marena-planes-de-manejo', 'parque-nacional-volcan-maderas', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-parque-nacional-volcan-maderas', 'Parque Nacional Volcán Maderas', 'Parque Nacional Volcán Maderas', 'parque_nacional', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-volcan-maderas/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-parque-nacional-volcan-maderas', 'MARENA — Plan de Manejo Parque Nacional Volcán Maderas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-volcan-maderas/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Parque Nacional Volcán Maderas', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-parque-nacional-volcan-masaya', 'Parque Nacional Volcán Masaya', 'Parque Nacional Volcán Masaya', 'parque_nacional', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-volcan-masaya/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-parque-nacional-volcan-masaya', 'MARENA — Plan de Manejo Parque Nacional Volcán Masaya', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-parque-nacional-volcan-masaya/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Parque Nacional Volcán Masaya', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-refugio-vida-silvestre-istian', 'marena-refugio-vida-silvestre-istian', 'Refugio Vida Silvestre Istián', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-refugio-vida-silvestre-istian/', 'official', 'marena-planes-de-manejo', 'refugio-vida-silvestre-istian', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-refugio-vida-silvestre-istian', 'Refugio Vida Silvestre Istián', 'Refugio Vida Silvestre Istián', 'refugio_vida_silvestre', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-refugio-vida-silvestre-istian/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-refugio-vida-silvestre-istian', 'MARENA — Plan de Manejo Refugio Vida Silvestre Istián', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-refugio-vida-silvestre-istian/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Refugio Vida Silvestre Istián', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-refugio-vida-silvestre-rio-escalante', 'marena-refugio-vida-silvestre-rio-escalante', 'Refugio Vida Silvestre Río Escalante', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-refugio-vida-silvestre-rio-escalante/', 'official', 'marena-planes-de-manejo', 'refugio-vida-silvestre-rio-escalante', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-refugio-vida-silvestre-rio-escalante', 'Refugio Vida Silvestre Río Escalante', 'Refugio Vida Silvestre Río Escalante', 'refugio_vida_silvestre', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-refugio-vida-silvestre-rio-escalante/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-refugio-vida-silvestre-rio-escalante', 'MARENA — Plan de Manejo Refugio Vida Silvestre Río Escalante', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-refugio-vida-silvestre-rio-escalante/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Refugio Vida Silvestre Río Escalante', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-refugio-de-vida-silvestre-rio-san-juan', 'Refugio Vida Silvestre Río San Juan', 'Refugio Vida Silvestre Río San Juan', 'refugio_vida_silvestre', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-refugio-vida-silvestre-rio-san-juan/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-refugio-de-vida-silvestre-rio-san-juan', 'MARENA — Plan de Manejo Refugio Vida Silvestre Río San Juan', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-refugio-vida-silvestre-rio-san-juan/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Refugio Vida Silvestre Río San Juan', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-recursos-geneticos-apacunca', 'marena-reserva-recursos-geneticos-apacunca', 'Reserva Recursos Geneticos Apacunca', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-recursos-geneticos-apacunca/', 'official', 'marena-planes-de-manejo', 'reserva-recursos-geneticos-apacunca', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-recursos-geneticos-apacunca', 'Reserva Recursos Geneticos Apacunca', 'Reserva Recursos Geneticos Apacunca', 'reserva_recursos_geneticos', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-recursos-geneticos-apacunca/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-recursos-geneticos-apacunca', 'MARENA — Plan de Manejo Reserva Recursos Geneticos Apacunca', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-recursos-geneticos-apacunca/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Recursos Geneticos Apacunca', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-arenal', 'marena-reserva-natural-cerro-arenal', 'Reserva Natural Cerro Arenal', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-arenal/', 'official', 'marena-planes-de-manejo', 'reserva-natural-cerro-arenal', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-arenal', 'Reserva Natural Cerro Arenal', 'Reserva Natural Cerro Arenal', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-arenal/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-cerro-arenal', 'MARENA — Plan de Manejo Reserva Natural Cerro Arenal', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-arenal/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Arenal', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-cumaica', 'marena-reserva-natural-cerro-cumaica', 'Reserva Natural Cerro Cumaica', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-cumaica/', 'official', 'marena-planes-de-manejo', 'reserva-natural-cerro-cumaica', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-cumaica', 'Reserva Natural Cerro Cumaica', 'Reserva Natural Cerro Cumaica', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-cumaica/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-cerro-cumaica', 'MARENA — Plan de Manejo Reserva Natural Cerro Cumaica', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-cumaica/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Cumaica', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-reserva-natural-cerro-datanli-el-diablo', 'Reserva Natural Cerro Datanlí El Diablo', 'Reserva Natural Cerro Datanlí El Diablo', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-datanli-el-diablo/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-reserva-natural-cerro-datanli-el-diablo', 'MARENA — Plan de Manejo Reserva Natural Cerro Datanlí El Diablo', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-datanli-el-diablo/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Datanlí El Diablo', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-kilambe', 'marena-reserva-natural-cerro-kilambe', 'Reserva Natural Cerro Kilambé', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-kilambe/', 'official', 'marena-planes-de-manejo', 'reserva-natural-cerro-kilambe', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-kilambe', 'Reserva Natural Cerro Kilambé', 'Reserva Natural Cerro Kilambé', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-kilambe/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-cerro-kilambe', 'MARENA — Plan de Manejo Reserva Natural Cerro Kilambé', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-kilambe/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Kilambé', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-reserva-mombachito-cerro-la-vieja', 'Reserva Natural Cerro Mombachito La Vieja', 'Reserva Natural Cerro Mombachito La Vieja', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-mombachito-la-vieja/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-reserva-mombachito-cerro-la-vieja', 'MARENA — Plan de Manejo Reserva Natural Cerro Mombachito La Vieja', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-mombachito-la-vieja/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Mombachito La Vieja', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-reserva-natural-cerro-musun', 'Reserva Natural Cerro Musún', 'Reserva Natural Cerro Musún', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-musun/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-reserva-natural-cerro-musun', 'MARENA — Plan de Manejo Reserva Natural Cerro Musún', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-musun/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Musún', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-quiabuc-las-brisas', 'marena-reserva-natural-cerro-quiabuc-las-brisas', 'Reserva Natural Cerro Quiabúc Las Brisas', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-quiabuc-las-brisas/', 'official', 'marena-planes-de-manejo', 'reserva-natural-cerro-quiabuc-las-brisas', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-quiabuc-las-brisas', 'Reserva Natural Cerro Quiabúc Las Brisas', 'Reserva Natural Cerro Quiabúc Las Brisas', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-quiabuc-las-brisas/', '2026-10-05'::timestamptz, 'partial', 'Hay Gaceta enlazada, pero el número de resolución no se pudo confirmar en su texto: approval_reference NULL.', 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-cerro-quiabuc-las-brisas', 'MARENA — Plan de Manejo Reserva Natural Cerro Quiabúc Las Brisas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-quiabuc-las-brisas/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Quiabúc Las Brisas', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-silva', 'marena-reserva-natural-cerro-silva', 'Reserva Natural Cerro Silva', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-silva/', 'official', 'marena-planes-de-manejo', 'reserva-natural-cerro-silva', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-cerro-silva', 'Reserva Natural Cerro Silva', 'Reserva Natural Cerro Silva', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-silva/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-cerro-silva', 'MARENA — Plan de Manejo Reserva Natural Cerro Silva', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerro-silva/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerro Silva', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-cerros-de-yali', 'marena-reserva-natural-cerros-de-yali', 'Reserva Natural Cerros de Yalí', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerros-de-yali/', 'official', 'marena-planes-de-manejo', 'reserva-natural-cerros-de-yali', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-cerros-de-yali', 'Reserva Natural Cerros de Yalí', 'Reserva Natural Cerros de Yalí', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerros-de-yali/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-cerros-de-yali', 'MARENA — Plan de Manejo Reserva Natural Cerros de Yalí', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-cerros-de-yali/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Cerros de Yalí', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-complejo-volcanico-telica', 'marena-reserva-natural-complejo-volcanico-telica', 'Reserva Natural Complejo Volcánico Telica', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-complejo-volcanico-telica/', 'official', 'marena-planes-de-manejo', 'reserva-natural-complejo-volcanico-telica', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-complejo-volcanico-telica', 'Reserva Natural Complejo Volcánico Telica', 'Reserva Natural Complejo Volcánico Telica', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-complejo-volcanico-telica/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-complejo-volcanico-telica', 'MARENA — Plan de Manejo Reserva Natural Complejo Volcánico Telica', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-complejo-volcanico-telica/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Complejo Volcánico Telica', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-delta-estero-real', 'marena-reserva-natural-delta-estero-real', 'Reserva Natural Delta Estero Real', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-delta-estero-real/', 'official', 'marena-planes-de-manejo', 'reserva-natural-delta-estero-real', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-delta-estero-real', 'Reserva Natural Delta Estero Real', 'Reserva Natural Delta Estero Real', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-delta-estero-real/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-delta-estero-real', 'MARENA — Plan de Manejo Reserva Natural Delta Estero Real', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-delta-estero-real/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Delta Estero Real', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-estero-padre-ramos', 'Reserva Natural Estero Padre Ramos', 'Reserva Natural Estero Padre Ramos', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-estero-padre-ramos/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-estero-padre-ramos', 'MARENA — Plan de Manejo Reserva Natural Estero Padre Ramos', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-estero-padre-ramos/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Estero Padre Ramos', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-lagunetas-mecatepe', 'marena-reserva-natural-lagunetas-mecatepe', 'Reserva Natural Lagunetas Mecatepe', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-lagunetas-mecatepe/', 'official', 'marena-planes-de-manejo', 'reserva-natural-lagunetas-mecatepe', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-lagunetas-mecatepe', 'Reserva Natural Lagunetas Mecatepe', 'Reserva Natural Lagunetas Mecatepe', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-lagunetas-mecatepe/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-lagunetas-mecatepe', 'MARENA — Plan de Manejo Reserva Natural Lagunetas Mecatepe', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-lagunetas-mecatepe/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Lagunetas Mecatepe', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-isla-juan-venado', 'marena-reserva-natural-isla-juan-venado', 'Reserva Natural Isla Juan Venado', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-isla-juan-venado/', 'official', 'marena-planes-de-manejo', 'reserva-natural-isla-juan-venado', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-isla-juan-venado', 'Reserva Natural Isla Juan Venado', 'Reserva Natural Isla Juan Venado', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-isla-juan-venado/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-isla-juan-venado', 'MARENA — Plan de Manejo Reserva Natural Isla Juan Venado', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-isla-juan-venado/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Isla Juan Venado', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-reserva-natural-laguna-de-apoyo', 'Reserva Natural Laguna Apoyo', 'Reserva Natural Laguna Apoyo', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-laguna-apoyo/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-reserva-natural-laguna-de-apoyo', 'MARENA — Plan de Manejo Reserva Natural Laguna Apoyo', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-laguna-apoyo/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Laguna Apoyo', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-laguna-asososca', 'marena-reserva-natural-laguna-asososca', 'Reserva Natural Laguna Asososca', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-laguna-asososca/', 'official', 'marena-planes-de-manejo', 'reserva-natural-laguna-asososca', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-laguna-asososca', 'Reserva Natural Laguna Asososca', 'Reserva Natural Laguna Asososca', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-laguna-asososca/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-laguna-asososca', 'MARENA — Plan de Manejo Reserva Natural Laguna Asososca', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-laguna-asososca/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Laguna Asososca', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-laguna-tiscapa', 'marena-reserva-natural-laguna-tiscapa', 'Reserva Natural Laguna Tiscapa', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-laguna-tiscapa/', 'official', 'marena-planes-de-manejo', 'reserva-natural-laguna-tiscapa', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-laguna-tiscapa', 'Reserva Natural Laguna Tiscapa', 'Reserva Natural Laguna Tiscapa', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-laguna-tiscapa/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-laguna-tiscapa', 'MARENA — Plan de Manejo Reserva Natural Laguna Tiscapa', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-laguna-tiscapa/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Laguna Tiscapa', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-llanos-limbaica', 'marena-reserva-natural-llanos-limbaica', 'Reserva Natural Llanos Limbaica', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-llanos-limbaica/', 'official', 'marena-planes-de-manejo', 'reserva-natural-llanos-limbaica', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-llanos-limbaica', 'Reserva Natural Llanos Limbaica', 'Reserva Natural Llanos Limbaica', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-llanos-limbaica/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-llanos-limbaica', 'MARENA — Plan de Manejo Reserva Natural Llanos Limbaica', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-llanos-limbaica/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Llanos Limbaica', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-reserva-natural-macizo-de-penas-blancas', 'Reserva Natural Macizo Peñas Blancas', 'Reserva Natural Macizo Peñas Blancas', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-macizo-penas-blancas/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-reserva-natural-macizo-de-penas-blancas', 'MARENA — Plan de Manejo Reserva Natural Macizo Peñas Blancas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-macizo-penas-blancas/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Macizo Peñas Blancas', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-serrania-amerrisque', 'marena-reserva-natural-serrania-amerrisque', 'Reserva Natural Serrania Amerrisque', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serrania-amerrisque/', 'official', 'marena-planes-de-manejo', 'reserva-natural-serrania-amerrisque', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-serrania-amerrisque', 'Reserva Natural Serrania Amerrisque', 'Reserva Natural Serrania Amerrisque', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serrania-amerrisque/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-serrania-amerrisque', 'MARENA — Plan de Manejo Reserva Natural Serrania Amerrisque', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serrania-amerrisque/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Serrania Amerrisque', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-serranias-tepesomoto', 'marena-reserva-natural-serranias-tepesomoto', 'Reserva Natural Serranias Tepesomoto', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serranias-tepesomoto/', 'official', 'marena-planes-de-manejo', 'reserva-natural-serranias-tepesomoto', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-serranias-tepesomoto', 'Reserva Natural Serranias Tepesomoto', 'Reserva Natural Serranias Tepesomoto', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serranias-tepesomoto/', '2026-10-05'::timestamptz, 'partial', 'Hay Gaceta enlazada, pero el número de resolución no se pudo confirmar en su texto: approval_reference NULL.', 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-serranias-tepesomoto', 'MARENA — Plan de Manejo Reserva Natural Serranias Tepesomoto', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-serranias-tepesomoto/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Serranias Tepesomoto', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-volcan-concepcion', 'marena-reserva-natural-volcan-concepcion', 'Reserva Natural Volcán Concepción', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-concepcion/', 'official', 'marena-planes-de-manejo', 'reserva-natural-volcan-concepcion', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-volcan-concepcion', 'Reserva Natural Volcán Concepción', 'Reserva Natural Volcán Concepción', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-concepcion/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-volcan-concepcion', 'MARENA — Plan de Manejo Reserva Natural Volcán Concepción', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-concepcion/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Volcán Concepción', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-volcan-cosiguina', 'marena-reserva-natural-volcan-cosiguina', 'Reserva Natural Volcán Cosigüina', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-cosiguina/', 'official', 'marena-planes-de-manejo', 'reserva-natural-volcan-cosiguina', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-volcan-cosiguina', 'Reserva Natural Volcán Cosigüina', 'Reserva Natural Volcán Cosigüina', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-cosiguina/', '2026-10-05'::timestamptz, 'partial', null, 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-volcan-cosiguina', 'MARENA — Plan de Manejo Reserva Natural Volcán Cosigüina', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-cosiguina/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Volcán Cosigüina', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values ('pl-marena-reserva-natural-volcan-mombacho', 'marena-reserva-natural-volcan-mombacho', 'Reserva Natural Volcán Mombacho', 'reserva', 'protected_area', 'missing', false, false, 'partial', '2026-10-05'::timestamptz, 'MARENA — Planes de Manejo de Áreas Protegidas', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-mombacho/', 'official', 'marena-planes-de-manejo', 'reserva-natural-volcan-mombacho', 'import:marena', 'import:marena')
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = 'import:marena';
insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values ('pl-marena-reserva-natural-volcan-mombacho', 'Reserva Natural Volcán Mombacho', 'Reserva Natural Volcán Mombacho', 'reserva_natural', null, 'unknown', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-mombacho/', '2026-10-05'::timestamptz, 'partial', 'Hay Gaceta enlazada, pero el número de resolución no se pudo confirmar en su texto: approval_reference NULL.', 'import:marena', 'import:marena')
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = 'import:marena';
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', 'pl-marena-reserva-natural-volcan-mombacho', 'MARENA — Plan de Manejo Reserva Natural Volcán Mombacho', 'https://www.marena.gob.ni/planes-de-manejo/plan-de-manejo-reserva-natural-volcan-mombacho/', 'management_plan', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Plan de Manejo Reserva Natural Volcán Mombacho', '2026-10-05'::timestamptz, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
