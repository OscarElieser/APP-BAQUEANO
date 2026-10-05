-- ============================================================================
-- 🧭 BAQUEANO — IMPORTACIÓN MARENA: NORMATIVAS Y VEDAS (GENERADO — NO editar a mano)
-- 🎯 Fuente oficial trazable. ⚙️ Generado por website/scripts/import-marena-*.mjs; idempotente.
-- 📦 211 sentencias. Importar ≠ publicar: nada queda is_published = true.
-- ⚠️ Requiere 20261005090000_environmental_marena_module.sql. Ejecutar en UNA transacción y SOLO con autorización.
-- ============================================================================
insert into public.environmental_regulations (regulation_key, title, document_type, institution, publication_reference, publication_date, effective_date, source_url, applies_to, summary, superseded_by, verified_at, status)
values ('rm-016-2026-vedas', 'Resolución Ministerial No. 016-2026 "Actualización del Sistema de Vedas para el año 2026"', 'resolucion_ministerial', 'MARENA', 'La Gaceta, Diario Oficial No. 29, págs. 1643-1654', '2026-02-16'::date, '2026-02-16'::date, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', 'Todo el territorio nacional: especies de flora y fauna silvestres (Art. 2).', 'Vedas nacionales indefinidas (Art. 4) y parciales (Art. 5) para 2026. Art. 6: tortuga verde del Caribe solo consumo de subsistencia de comunidades costeñas. Art. 7: pesca deportiva de Sábalo Real autorizada en septiembre en Río San Juan con autorizaciones. Art. 9 deroga la R.M. 009-2025. Art. 10: sigue vigente si no se publica el sistema 2027. Vigencia desde su publicación (Art. 11).', null, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key) do update set title = excluded.title, publication_reference = excluded.publication_reference, publication_date = excluded.publication_date,
  effective_date = excluded.effective_date, source_url = excluded.source_url, applies_to = excluded.applies_to, summary = excluded.summary,
  superseded_by = excluded.superseded_by, verified_at = excluded.verified_at, status = excluded.status;
insert into public.environmental_regulations (regulation_key, title, document_type, institution, publication_reference, publication_date, effective_date, source_url, applies_to, summary, superseded_by, verified_at, status)
values ('ley-1248-acads', 'Ley No. 1248, Ley Área de Conservación Ambiental y Desarrollo Sostenible', 'ley', 'Asamblea Nacional', null, null, null, null, null, 'Citada por la R.M. 016-2026 (Art. 8) como marco sancionatorio; los considerandos se refieren al SINACADS. Texto no leído: pendiente de fuente oficial.', null, null, 'pending')
on conflict (regulation_key) do update set title = excluded.title, publication_reference = excluded.publication_reference, publication_date = excluded.publication_date,
  effective_date = excluded.effective_date, source_url = excluded.source_url, applies_to = excluded.applies_to, summary = excluded.summary,
  superseded_by = excluded.superseded_by, verified_at = excluded.verified_at, status = excluded.status;
insert into public.environmental_regulations (regulation_key, title, document_type, institution, publication_reference, publication_date, effective_date, source_url, applies_to, summary, superseded_by, verified_at, status)
values ('ley-217-ambiente', 'Ley No. 217, Ley General del Medio Ambiente y los Recursos Naturales', 'ley', 'Asamblea Nacional', null, null, null, null, null, 'Citada por la R.M. 016-2026 (considerandos III-V, Art. 8). Texto no leído: pendiente de fuente oficial.', null, null, 'pending')
on conflict (regulation_key) do update set title = excluded.title, publication_reference = excluded.publication_reference, publication_date = excluded.publication_date,
  effective_date = excluded.effective_date, source_url = excluded.source_url, applies_to = excluded.applies_to, summary = excluded.summary,
  superseded_by = excluded.superseded_by, verified_at = excluded.verified_at, status = excluded.status;
insert into public.environmental_regulations (regulation_key, title, document_type, institution, publication_reference, publication_date, effective_date, source_url, applies_to, summary, superseded_by, verified_at, status)
values ('ley-489-pesca', 'Ley No. 489, Ley de Pesca y Acuicultura', 'ley', 'Asamblea Nacional', 'La Gaceta No. 251 (27-12-2004), según la R.M. 016-2026', null, null, null, null, 'Citada por la R.M. 016-2026 (considerando VI, Art. 6). Texto no leído: pendiente de fuente oficial.', null, null, 'pending')
on conflict (regulation_key) do update set title = excluded.title, publication_reference = excluded.publication_reference, publication_date = excluded.publication_date,
  effective_date = excluded.effective_date, source_url = excluded.source_url, applies_to = excluded.applies_to, summary = excluded.summary,
  superseded_by = excluded.superseded_by, verified_at = excluded.verified_at, status = excluded.status;
insert into public.environmental_regulations (regulation_key, title, document_type, institution, publication_reference, publication_date, effective_date, source_url, applies_to, summary, superseded_by, verified_at, status)
values ('rm-007-99-sistema-vedas', 'Resolución Ministerial No. 007-99, Sistema de Vedas de Especies Silvestres Nicaragüenses', 'resolucion_ministerial', 'MARENA', 'La Gaceta No. 109 (09-06-1999), según la R.M. 016-2026', '1999-06-09'::date, null, null, null, 'Establece el Sistema de Vedas; su Art. 13 ordena revisión y publicación anual. Texto no leído: pendiente.', null, null, 'pending')
on conflict (regulation_key) do update set title = excluded.title, publication_reference = excluded.publication_reference, publication_date = excluded.publication_date,
  effective_date = excluded.effective_date, source_url = excluded.source_url, applies_to = excluded.applies_to, summary = excluded.summary,
  superseded_by = excluded.superseded_by, verified_at = excluded.verified_at, status = excluded.status;
insert into public.environmental_regulations (regulation_key, title, document_type, institution, publication_reference, publication_date, effective_date, source_url, applies_to, summary, superseded_by, verified_at, status)
values ('rm-009-2025-vedas', 'Resolución Ministerial No. 009-2025 (Sistema de Vedas 2025)', 'resolucion_ministerial', 'MARENA', 'La Gaceta, Diario Oficial No. 35 (21-02-2025)', '2025-02-21'::date, null, null, null, 'Derogada por la R.M. 016-2026 (Art. 9). Se registra solo para no usar vedas de 2025 como vigentes.', 'rm-016-2026-vedas', null, 'expired')
on conflict (regulation_key) do update set title = excluded.title, publication_reference = excluded.publication_reference, publication_date = excluded.publication_date,
  effective_date = excluded.effective_date, source_url = excluded.source_url, applies_to = excluded.applies_to, summary = excluded.summary,
  superseded_by = excluded.superseded_by, verified_at = excluded.verified_at, status = excluded.status;
insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, document_date, retrieved_at)
values ('environmental_regulation', 'rm-016-2026-vedas', 'La Gaceta, Diario Oficial No. 29 (16-02-2026)', 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', 'regulation', '2026-10-05'::timestamptz, 'import:marena', 'MARENA', 'Resolución Ministerial No. 016-2026 "Actualización del Sistema de Vedas para el año 2026"', '2026-02-16'::date, '2026-10-05'::timestamptz)
on conflict (entity_type, entity_id, source_name, source_url) do nothing;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Myrmecophaga tridactyla', 'Oso hormiguero/ Oso Caballo/ Hormiguero Gigante', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Tamandua mexicana', 'Hormiguero Colmenero/ Perico/ Tamandúa Norteña', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Cíclopes dorsalis', 'Hormiguero Enano/ Oso hormiguero sedoso', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Choloepus hoffmanni', 'Perezoso de Dos Garfios', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Bradypus variegatus', 'Perezoso de Tres Garfios', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Cebus imitator', 'Mono Cara Blanca, Capuchino', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Alouatta palliata', 'Mono Congo, Mono Aullador', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Ateles geoffroyi', 'Mono Araña, / Mono Bayo/ Mono Colorado', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Sciurus richmondi', 'Ardilla del Rama', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Orthogeomys matagalpae', 'Taltuza Segoviana', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Potos flavus', 'Cuyuso/ Kinkayú', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Bassaricyon gabbii', 'Cuyuso / Olingo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Bassariscus sumichrasti', 'Cuyuso / Cacomistle', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Nasua narica', 'Pizote, Pizote Solo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Neogale frenata', 'Comadreja de Cola Larga', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Galictis vittata', 'Tejon / Glotón Mayor', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Eira barbara', 'Gato Culumuco', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Lontra longicaudis', 'Perro de Agua/ Nutria / Nutria Colilarga', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Leopardus pardalis', 'Tigrillo, Manigordo / Ocelote', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Leopardus wiedii', 'Gato de Monte / Margay', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Herpailurus yaguarondi', 'Leoncillo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Puma concolor', 'León/ Puma', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Pantera onca', 'Tigre/ Jaguar', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Trichechus manatus', 'Manatí, Palpa', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Tapirus bairdii', 'Danto, Danta, Tapir Centroamericano', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Sotalia fluviatilis', 'Delfín/ Bufeo Negro/ Delfín Lagunero', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Tursiops truncatus', 'Delfín Nariz de Botella, Delfín Hocicudo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Megaptera novaeangliae', 'Ballena Jorobada', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Penelope purpurascens', 'Pava Crestada', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Penelopina nigra', 'Chachalaca Segoviana', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Crax rubra', 'Pavón, Pajuil', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ardea alba', 'Garza Real', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ardea Herodias', 'Garzón Azul', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Platalea ajaja', 'Espátula Rosada, Garza rosada', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Jabiru mycteria', 'Pancho Galán, Galán Sin Ventura', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Mesembrinibis cayennensis', 'Ibis Verde', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Sarcoramphus papa', 'Rey de los Zopilotes', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Pandion haliaetus', 'Águila Pescadora', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Leptodon cayanensis', 'Gavilán Cabeza Gris', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Chondrohierax uncinatus', 'Gavilán Pico Ganchudo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Elanoides forficatus', 'Gavilancito Cola de Tijera', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Gampsonyx swainsonii', 'Gavilancito Cara Amarilla', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Elanus leucurus', 'Gavilán Cola Blanca', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Rosthramus sociabilis', 'Gavilancito Caracolero', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Harpagus bidentatus', 'Gavilancito Bidentado', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ictinia mississippiensis', 'Elanio Cola Negra', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ictinia plumbea', 'Elanio Gris', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Microspiza superciliosus', 'Gavilancito Pequeño', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Accipiter striatus', 'Gavilancito Pajarero', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Astur bicolor', 'Gavilán Bicolor', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Busarellus nigricolis', 'Gavilán Cuello Negro', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Circus hudsonius', 'Aguilucho de Pantano', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Geranospiza caerulescens', 'Gavilán Ranero Patas Rojas', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Pseudastur albicollis', 'Aguilucho Blanco', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteogallus anthracinus', 'Gavilán Cangrejero', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteogallus urubitinga', 'Gavilán Negro', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Parabuteo unicinctus', 'Gavilán Alicastaño', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteogallus solitarius', 'Águila Solitaria', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Rupornis magnirostris', 'Gavilán Chapulinero, Gavilán de las Rondas', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteo platypterus', 'Gavilán Alas Anchas', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteo plagiatus', 'Gavilán Gris', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteo brachyurus', 'Gavilán Cola Corta', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteo swainsoni', 'Gavilán Pechioscuro', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Geranoaetus albicaudatus', 'Gavilán Cola Blanca', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteo albonotatus', 'Gavilán Impostor', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Buteo jamaicensis', 'Gavilán Cola Rojiza', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Leucopternis semiplumbeus', 'Gavilán Lomo gris', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Morphnus guianensis', 'Águila Crestada', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Harpia harpyja', 'Águila Arpía', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Spizaetus melanoleucus', 'Aguililla Blanca y Negra', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Spizaetus tyrannus', 'Aguililla Negra', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Spizaetus ornatus', 'Aguililla Penachuda', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Caracara plancus', 'Querque', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Herpetotheres cachinnas', 'Guas Guas, Guaco', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Falco sparverius', 'Cernícalo Americano, Halconcito de patilla', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Falco columbarius', 'Halcón Palomero, Esmerejón, Merlin', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Falco femoralis', 'Halcón Plomizo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Falco rufigularis', 'Halcón Murcielaguero', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Falco deiroleucus', 'Halcón Pecho Canelo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Falco peregrinus', 'Halcón Peregrino', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Micrastur ruficollis', 'Halcón Selvático Cola Bandada', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Micrastur semitorquatus', 'Halcón Collarejo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Porphyrio martinica', 'Gallareta Morada', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Gallinula galeata', 'Gallinita Pico Rojo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Fulica americana', 'Gallinita de Cáitez', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Burhinus bistriatus', 'Alcaraván', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Psittacara holochlorus', 'Chocoyo Jalacatero, Chocoyo Coludo, Perico Verde', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Psittacara finschi', 'Chocoyo Frente Carmesí', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Psittacara strenuus', 'Chocoyo Coludo-Chocoyo Verde', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Eupsittula nana', 'Chocoyo Chanero, Perico Frente Oliva', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Eupsittula canicularis', 'Chocoyo Frente Anaranjada', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ara ambiguus', 'Lapa Verde', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ara macao', 'Lapa Roja', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Bolborhynchus lineola', 'Chocoyito Listado', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Brotogeris jugularis', 'Chocoyo Zapoyolito, Chocoyo Barbilla Anaranjada', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Pyrilia haematotis', 'Perico Real, Perico Cabeza parda', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Pionus senilis', 'Cotorra Costeña, Cotorra Corona Blanca', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Amazona albifrons', 'Cotorra o Cancán Cotorra Frente Blanca', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Amazona autumnalis', 'Lora Frente Roja', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Amazona farinosa', 'Lora Ojona, Lora Corona Azul', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Amazona auropalliata', 'Lora Nuca Amarilla', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Pharomachrus mocinno', 'Quetzal', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Aulacorhynchus prasinus', 'Tucancito Verde', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Selenidera spectabilis', 'Tucancito Oído Amarillo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Pteroglossus torquatus', 'Tucán de Collar', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ramphastos sulfuratus', 'Tucán Pico Arcoíris', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ramphastos ambiguus', 'Tucán Bicolor', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Procnias tricarunculatus', 'Pájaro Campana, Rancho o Ranchero', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Quiscalus nicaraguensis', 'Zanatillo, Zanate Nicaragüense', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Caretta caretta', 'Tortuga Caguama, Tortuga Cabezona', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Chelonia mydas', 'Tortuga Verde, Torita', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Dermochelys coriacea', 'Tortuga Tora', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Eretmochelys imbricata', 'Tortuga Carey', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Lepidochelys olivacea', 'Tortuga Pásmala', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Crocodylus acutus', 'Lagarto, Cocodrilo, Lagarto Amarillo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Ungaliophis panamensis', 'Chatilla, Boa Enana de Panamá', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Ungaliophis continentalis', 'Chatilla, Boa Enana', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Corallus annulatus', 'Boa Arborícola', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Ctenosaura quinquecarinata', 'Garrobo Cola Chata', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Carcharhinus leucas', 'Tiburón Toro', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Rhincodon typus', 'Tiburón Ballena', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Carcharhinus longimanus', 'Tiburón Oceánico Punta Blanca', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Pristis pectinatus', 'Pez Sierra del Lago de Nicaragua y Río San Juan', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Pristis perotteti', 'Pez Sierra del Lago de Nicaragua y Río San Juan', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'moluscos', 'Anadara grandis', 'Casco de Burro', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'anfibios', 'Lithobates miadis', 'Rana Leopardo Isleña', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'anfibios', 'Bolitoglossa insularis', 'Salamandra del Volcán Maderas', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'anfibios', 'Bolitoglossa mombachoensis', 'Salamandra del Volcán Mombacho', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'anfibios', 'Nototriton Saslaya', 'Salamandra del Saslaya', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Dipterix panamensis', 'Almendro', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Swietenia macrophylla King.', 'Caoba del Atlántico', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Swietenia humilis Zucc.', 'Caoba del Pacifico', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Conocarpus erectus', 'Mangle Falso', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Laguncularia racemosa', 'Mangle Blanco', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Avicennia germinans', 'Mangle Negro', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Rhizophora mangle', 'Mangle Rojo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Ceiba pentandra', 'Ceibo', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Guaiacum sanctum L.', 'Guayacán', 'indefinite', 'Indefinida', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Pochota fendleri', 'Pochote', 'indefinite', 'Indefinida Dentro de Área de Conservación Ambiental y Desarrollo Sostenible', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'flora', 'Cedrela odorata', 'Cedro Real', 'indefinite', 'Indefinida Dentro de Área de Conservación Ambiental y Desarrollo Sostenible', null, null, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Cuniculus paca', 'Guardatinaja, Güía', 'partial', '1ro Enero / 30 Junio', '2026-01-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Dasyprocta punctata', 'Guatuza', 'partial', '1ro Enero / 30 Junio', '2026-01-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Dasypus novemcinctus', 'Cusuco, Armado o Pitero', 'partial', '1ro Enero / 30 Junio', '2026-01-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Odocoileus virginianus', 'Venado Cola Blanca, de Ramazón, Malacate', 'partial', '1ro Enero / 30 Junio', '2026-01-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Tayassu pecari', 'Jabalí, Chancho de monte', 'partial', '1ro Enero / 30 Junio', '2026-01-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'mamiferos', 'Dicotyles tajacu', 'Sahino, Sajino, Chancho de monte', 'partial', '1ro Enero / 30 Junio', '2026-01-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Crypturellus soui', 'Chinga, Perdiz pequeña solitaria', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Crypturellus cinnamomeus', 'Perdiz canela, Chinga', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Crypturellus boucardi', 'Perdiz, Chinga', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Tinamus major', 'Gallinita de monte', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Dendrocygna autumnalis', 'Piche Canelo', 'partial', '1ro Enero / 31 Mayo', '2026-01-01'::date, '2026-05-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Dendrocygna bicolor', 'Piche Bicolor', 'partial', '1ro Enero / 31 Abril', null, null, 'El texto oficial dice "31 Abril" (fecha inexistente). No se convierte a fecha: se publica el texto tal cual y queda en revisión (conflicting).', 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'conflicting')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Cairina moschata', 'Pato Real', 'partial', '1ro Enero / 31 Mayo', '2026-01-01'::date, '2026-05-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ortalis vetula', 'Chachalaca Vientre Claro', 'partial', '1ro Marzo / 30 Junio', '2026-03-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Ortalis cinereiceps', 'Chachalaca Cabeza Gris', 'partial', '1ro Marzo / 30 Junio', '2026-03-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Rhynchortyx cinctus', 'Codorniz Patas Largas', 'partial', '1ro Marzo / 30 Junio', '2026-03-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Amaurolimnas concolor', 'Gallinita Gris', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Aramides axillaris', 'Gallinita Cuello Rojizo', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Aramides albiventris', 'Gallinita Poponé', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Pardirallus maculatus', 'Gallinita Moteada', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Porzana carolina', 'Gallinita de Agua', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Laterallus flaviventer', 'Gallinita Pecho Amarillo', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Laterallus ruber', 'Gallinita Rojiza', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Laterallus exilis', 'Gallinita Pecho Gris', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Laterallus albigularis', 'Gallinita Garganta Blanca', 'partial', '1ro Abril / 31 Julio', '2026-04-01'::date, '2026-07-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Icterus pectoralis', 'Chichiltote Pecho Manchado', 'partial', '1ro Marzo / 30 Junio', '2026-03-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Icterus gularis', 'Chichiltote Garganta Negra', 'partial', '1ro Marzo / 30 Junio', '2026-03-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Icterus gálbula', 'Chorchita Amarilla', 'partial', '1ro Marzo / 30 Junio', '2026-03-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Turdus grayi', 'Sensontle Pardo', 'partial', '1ro Mayo / 31 Agosto', '2026-05-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'aves', 'Turdus plebejus', 'Sinsontle Segoviano', 'partial', '1ro Mayo / 31 Agosto', '2026-05-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Ctenosaura similis', 'Garrobo Negro', 'partial', '1ro Enero / 30 Abril', '2026-01-01'::date, '2026-04-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Iguana iguana', 'Iguana Verde, Garrobo Lapa', 'partial', '1ro Enero / 30 Abril', '2026-01-01'::date, '2026-04-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Basiliscus basiliscus', 'Gallego Café', 'partial', '1ro Abril / 31 Agosto', '2026-04-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Basiliscus plumifrons', 'Gallego Verde', 'partial', '1ro Abril / 31 Agosto', '2026-04-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Basiliscus vittatus', 'Basilisco', 'partial', '1ro Abril / 31 Agosto', '2026-04-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Boa imperator', 'Boa Común', 'partial', '1ro Abril / 31 Agosto', '2026-04-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Lampropeltis abnorma', 'Falso Coral', 'partial', '1ro Abril / 31 Agosto', '2026-04-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Rhinoclemmys annulatta', 'Tortuga de Tierra', 'partial', '1ro Abril / 31 Agosto', '2026-04-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Rhinoclemmys funerea', 'Tortuga de Tierra', 'partial', '1ro Abril / 31 Agosto', '2026-04-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Rhinoclemmys pulcherrima', 'Tortuga Sabanera', 'partial', '1ro Abril / 31 Agosto', '2026-04-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'reptiles', 'Caiman crocodilus', 'Cuajipal, Maizola, Caimán', 'partial', '1ro Marzo / 30 Junio', '2026-03-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'anfibios', 'Agalychnis callidryas', 'Rana Ojos Rojos', 'partial', '1ro Enero / 30 Abril', '2026-01-01'::date, '2026-04-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'anfibios', 'Dendrobates auratus', 'Ranita Camuflada', 'partial', '1ro Enero / 30 Abril', '2026-01-01'::date, '2026-04-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'anfibios', 'Oophaga pumilio', 'Ranita de Sangre', 'partial', '1ro Enero / 30 Abril', '2026-01-01'::date, '2026-04-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Lepisosteus tropicus', 'Gaspar del Lago Cocibolca', 'partial', '1ro Mayo / 31 Octubre', '2026-05-01'::date, '2026-10-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Lepisosteus spatula', 'Gaspar del Lago Cocibolca', 'partial', '1ro Mayo / 31 Octubre', '2026-05-01'::date, '2026-10-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Centropomus parallelus', 'Róbalo del Lago Cocibolca y Río San Juan', 'partial', '01 / 31 Diciembre', '2026-12-01'::date, '2026-12-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Centropomus pectinatus', 'Róbalo del Lago Cocibolca y Río San Juan', 'partial', '01 / 31 Diciembre', '2026-12-01'::date, '2026-12-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Megalops atlanticus', 'Sábalo Real', 'partial', '01 Abril / 30 Junio, y 01 Agosto / 31 Octubre', null, null, 'Dos períodos (01-04 a 30-06 y 01-08 a 31-10). Art. 7: se autoriza en septiembre la pesca deportiva de Sábalo Real en Río San Juan con las autorizaciones correspondientes.', 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Parachromis dovii', 'Guapote Lagunero', 'partial', '20 Mayo / 20 Julio', '2026-05-20'::date, '2026-07-20'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Parachromis managuensis', 'Guapote Tigre', 'partial', '20 Mayo / 20 Julio', '2026-05-20'::date, '2026-07-20'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Pomadasys crocro', 'Roncador (San Carlos Río San Juan)', 'partial', '15 Noviembre / 31 Diciembre', '2026-11-15'::date, '2026-12-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Thunus albacares', 'Atunes del Océano Pacifico Oriental', 'partial', '29 Julio / 8 Octubre y/o del 9 Noviembre / 19 Enero de 2024. (Se puede aplicar cualquiera de los dos períodos). Para la pesca de los atunes aleta amarilla, patudo y barrilete realizado por los buques cerqueros dentro del área de 96º y 110º O y entre 4º N y 3º S, conocida como el “corralito” tiene veda desde las 00:00 horas del 9 de octubre hasta las 24:00 horas del 8 de noviembre de cada año.', null, null, 'El texto oficial 2026 cita "19 Enero de 2024": año inconsistente. No se convierte a fechas (conflicting).', 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'conflicting')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Thunus obesus', 'Atunes del Océano Pacifico Oriental', 'partial', '29 Julio / 8 Octubre y/o del 9 Noviembre / 19 Enero de 2024. (Se puede aplicar cualquiera de los dos períodos). Para la pesca de los atunes aleta amarilla, patudo y barrilete realizado por los buques cerqueros dentro del área de 96º y 110º O y entre 4º N y 3º S, conocida como el “corralito” tiene veda desde las 00:00 horas del 9 de octubre hasta las 24:00 horas del 8 de noviembre de cada año.', null, null, 'El texto oficial 2026 cita "19 Enero de 2024": año inconsistente. No se convierte a fechas (conflicting).', 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'conflicting')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'peces', 'Katsuwonus pelamis', 'Atunes del Océano Pacifico Oriental', 'partial', '29 Julio / 8 Octubre y/o del 9 Noviembre / 19 Enero de 2024. (Se puede aplicar cualquiera de los dos períodos). Para la pesca de los atunes aleta amarilla, patudo y barrilete realizado por los buques cerqueros dentro del área de 96º y 110º O y entre 4º N y 3º S, conocida como el “corralito” tiene veda desde las 00:00 horas del 9 de octubre hasta las 24:00 horas del 8 de noviembre de cada año.', null, null, 'El texto oficial 2026 cita "19 Enero de 2024": año inconsistente. No se convierte a fechas (conflicting).', 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'conflicting')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'moluscos', 'Anadara similis', 'Concha Negra', 'partial', '21 Abril / 15 Julio', '2026-04-21'::date, '2026-07-15'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'moluscos', 'Anadara tuberculosa', 'Concha Negra', 'partial', '21 Abril / 15 Julio', '2026-04-21'::date, '2026-07-15'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'moluscos', 'Strombus gigas', 'Caracol Rosado del Caribe', 'partial', 'Del 01 de junio al 30 de septiembre, se suspenden las actividades pesqueras como medida de protección a la reproducción.', '2026-06-01'::date, '2026-09-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'crustaceos', 'Farfantepenaeus y Litopenaeus sp.', 'Camarones Costeros del Caribe', 'partial', '15 Abril / 15 Junio. las actividades pesqueras se suspenden, con el objetivo de proteger la reproducción y el reclutamiento a la pesquería.', '2026-04-15'::date, '2026-06-15'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'crustaceos', 'Gen. Farfantepenaeus y Litopenaeus. Trachypenaeus sp. Tigre o rayado) y Xiphopenaeus riveti (titi)', 'Camarones Costeros del pacifico, Chacalines Tigre y Titi del Pacifico.', 'partial', 'Del 01 de abril al 31 de mayo, se suspenden las actividades pesqueras para los camarones costeros en la zona marina (Pesca Industrial) con el objetivo de proteger la reproducción y del 01 de octubre al 30 de noviembre para proteger el reclutamiento a la pesquería.', null, null, 'Dos períodos (01-04 a 31-05 y 01-10 a 30-11).', 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'crustaceos', 'Gen. Farfantepenaeus y Litopenaeus sp.', 'Larvas silvestres de camarones costeros en esteros y zona marina inmediata al litoral.', 'partial', 'Del 01 de junio al 31 de agosto, se suspenden las actividades para la captura de larvas silvestre de camarón costero del Pacífico.', '2026-06-01'::date, '2026-08-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'crustaceos', 'Panulirus argus', 'Langosta Espinosa del Caribe', 'partial', '01 de marzo al 30 de junio', '2026-03-01'::date, '2026-06-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'equinodermos', 'Familias Holothuridae, Stichopodidae', 'Pepinos de Mar del Caribe y del Océano Pacifico', 'partial', '01 de junio al 30 de noviembre se suspenden las actividades pesqueras para la captura de los pepinos de mar del Caribe y del O. Pacífico.', '2026-06-01'::date, '2026-11-30'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', 2026, 'equinodermos', 'Familias Holothuridae, Stichopodidae', 'Pepino Lápiz y Carajo del caribe', 'partial', '01 de enero al 31 de diciembre', '2026-01-01'::date, '2026-12-31'::date, null, 'https://www.marena.gob.ni/wp-content/uploads/2026/03/GACETA29_2026.pdf', '2026-02-16'::date, '2026-10-05'::timestamptz, 'verified')
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;
