-- ============================================================================
-- 🧭 BAQUEANO — TERRITORIO: 153 MUNICIPIOS Y CLAVES FORÁNEAS (auditoría BD B-1/D-1/D-2)
-- ============================================================================
-- 🎯 POR QUÉ:
--   `municipalities` existía con FK a `departments` pero con 0 filas, y 12 tablas
--   guardaban `municipality_id` sin FK; `businesses` repetía el departamento y
--   el municipio como TEXTO (dependencia transitiva, filtros rotos, 3FN violada).
-- ⚙️ CÓMO (aditivo e idempotente):
--   1. Columnas nuevas en `municipalities`: coordenadas, precisión, fuente,
--      geografía (trigger común `sync_geography_point`) y `updated_at`.
--   2. Carga de los 153 municipios oficiales: 140 desde el inventario curado del
--      portal (`website/js/territories-data.js`) + los 13 de Chinandega.
--      Solo Madriz trae coordenadas en el portal (centro aproximado, marcado
--      `approximate`); los demás quedan `missing` — no se inventan coordenadas.
--   3. FK `municipality_id → municipalities(id) ON DELETE SET NULL` en todas
--      las tablas que ya tenían la columna (NOT VALID + VALIDATE).
--   4. `businesses.department_id` / `municipality_id` (FK) rellenadas a partir
--      del texto existente; las columnas de texto se CONSERVAN (compatibilidad
--      web/app) y quedan documentadas como heredadas.
--   5. `destinations.municipality_id` y `experiences.municipality_id` (FK).
-- 📦 QUÉ: jerarquía Nicaragua → departamento → municipio → (comunidad, lugar,
--   destino, negocio, experiencia, cultura, emergencia) con integridad real.
-- ↩️ ROLLBACK: las columnas/FK nuevas pueden retirarse sin pérdida (los datos de
--   texto originales no se tocaron). Requiere autorización (ver MIGRATION_GUIDE).
-- ============================================================================

alter table public.municipalities
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_precision text not null default 'missing',
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists geom extensions.geography(Point, 4326),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'municipalities_location_precision_check') then
    alter table public.municipalities add constraint municipalities_location_precision_check
      check (location_precision in ('verified', 'approximate', 'missing'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'municipalities_coords_valid') then
    alter table public.municipalities add constraint municipalities_coords_valid
      check ((latitude is null) = (longitude is null)
        and (latitude is null or (latitude between 10.5 and 15.2 and longitude between -88.0 and -82.5)));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'municipalities_department_name_key') then
    alter table public.municipalities add constraint municipalities_department_name_key unique (department_id, name);
  end if;
end $$;

create or replace trigger trg_municipalities_geom before insert or update of latitude, longitude
  on public.municipalities for each row execute function public.sync_geography_point();

comment on table public.municipalities is 'Municipios oficiales de Nicaragua (153). Fuente de verdad territorial; las demás entidades referencian municipality_id.';
comment on column public.municipalities.location_precision is 'verified = coordenada comprobada; approximate = centro aproximado del inventario del portal; missing = sin coordenada (no se inventa).';

insert into public.municipalities (id, department_id, name, latitude, longitude, location_precision)
values
  ('madriz__somoto', 'madriz', 'Somoto', 13.4833, -86.5833, 'approximate'),
  ('madriz__yalaguina', 'madriz', 'Yalagüina', 13.4833, -86.5, 'approximate'),
  ('madriz__totogalpa', 'madriz', 'Totogalpa', 13.5667, -86.4833, 'approximate'),
  ('madriz__san_lucas', 'madriz', 'San Lucas', 13.4167, -86.6, 'approximate'),
  ('madriz__las_sabanas', 'madriz', 'Las Sabanas', 13.35, -86.6167, 'approximate'),
  ('madriz__san_jose_de_cusmapa', 'madriz', 'San José de Cusmapa', 13.2833, -86.65, 'approximate'),
  ('madriz__san_juan_del_rio_coco', 'madriz', 'San Juan del Río Coco', 13.55, -86.1667, 'approximate'),
  ('madriz__telpaneca', 'madriz', 'Telpaneca', 13.5333, -86.2833, 'approximate'),
  ('madriz__palacaguina', 'madriz', 'Palacagüina', 13.45, -86.4, 'approximate'),
  ('leon__leon', 'leon', 'León', null, null, 'missing'),
  ('leon__la_paz_centro', 'leon', 'La Paz Centro', null, null, 'missing'),
  ('leon__nagarote', 'leon', 'Nagarote', null, null, 'missing'),
  ('leon__telica', 'leon', 'Telica', null, null, 'missing'),
  ('leon__el_sauce', 'leon', 'El Sauce', null, null, 'missing'),
  ('leon__larreynaga', 'leon', 'Larreynaga', null, null, 'missing'),
  ('leon__santa_rosa_del_penon', 'leon', 'Santa Rosa del Peñón', null, null, 'missing'),
  ('leon__achuapa', 'leon', 'Achuapa', null, null, 'missing'),
  ('leon__el_jicaral', 'leon', 'El Jicaral', null, null, 'missing'),
  ('leon__quezalguaque', 'leon', 'Quezalguaque', null, null, 'missing'),
  ('rivas__rivas', 'rivas', 'Rivas', null, null, 'missing'),
  ('rivas__san_jorge', 'rivas', 'San Jorge', null, null, 'missing'),
  ('rivas__buenos_aires', 'rivas', 'Buenos Aires', null, null, 'missing'),
  ('rivas__potosi', 'rivas', 'Potosí', null, null, 'missing'),
  ('rivas__belen', 'rivas', 'Belén', null, null, 'missing'),
  ('rivas__tola', 'rivas', 'Tola', null, null, 'missing'),
  ('rivas__san_juan_del_sur', 'rivas', 'San Juan del Sur', null, null, 'missing'),
  ('rivas__cardenas', 'rivas', 'Cárdenas', null, null, 'missing'),
  ('rivas__moyogalpa', 'rivas', 'Moyogalpa', null, null, 'missing'),
  ('rivas__altagracia', 'rivas', 'Altagracia', null, null, 'missing'),
  ('jinotega__jinotega', 'jinotega', 'Jinotega', null, null, 'missing'),
  ('jinotega__san_rafael_del_norte', 'jinotega', 'San Rafael del Norte', null, null, 'missing'),
  ('jinotega__san_sebastian_de_yali', 'jinotega', 'San Sebastián de Yalí', null, null, 'missing'),
  ('jinotega__la_concordia', 'jinotega', 'La Concordia', null, null, 'missing'),
  ('jinotega__santa_maria_de_pantasma', 'jinotega', 'Santa María de Pantasma', null, null, 'missing'),
  ('jinotega__el_cua', 'jinotega', 'El Cuá', null, null, 'missing'),
  ('jinotega__san_jose_de_bocay', 'jinotega', 'San José de Bocay', null, null, 'missing'),
  ('jinotega__wiwili_de_jinotega', 'jinotega', 'Wiwilí de Jinotega', null, null, 'missing'),
  ('masaya__masaya', 'masaya', 'Masaya', null, null, 'missing'),
  ('masaya__nindiri', 'masaya', 'Nindirí', null, null, 'missing'),
  ('masaya__tisma', 'masaya', 'Tisma', null, null, 'missing'),
  ('masaya__la_concepcion', 'masaya', 'La Concepción', null, null, 'missing'),
  ('masaya__masatepe', 'masaya', 'Masatepe', null, null, 'missing'),
  ('masaya__nandasmo', 'masaya', 'Nandasmo', null, null, 'missing'),
  ('masaya__catarina', 'masaya', 'Catarina', null, null, 'missing'),
  ('masaya__san_juan_de_oriente', 'masaya', 'San Juan de Oriente', null, null, 'missing'),
  ('masaya__niquinohomo', 'masaya', 'Niquinohomo', null, null, 'missing'),
  ('granada__granada', 'granada', 'Granada', null, null, 'missing'),
  ('granada__diria', 'granada', 'Diriá', null, null, 'missing'),
  ('granada__diriomo', 'granada', 'Diriomo', null, null, 'missing'),
  ('granada__nandaime', 'granada', 'Nandaime', null, null, 'missing'),
  ('matagalpa__matagalpa', 'matagalpa', 'Matagalpa', null, null, 'missing'),
  ('matagalpa__sebaco', 'matagalpa', 'Sébaco', null, null, 'missing'),
  ('matagalpa__ciudad_dario', 'matagalpa', 'Ciudad Darío', null, null, 'missing'),
  ('matagalpa__esquipulas', 'matagalpa', 'Esquipulas', null, null, 'missing'),
  ('matagalpa__matiguas', 'matagalpa', 'Matiguás', null, null, 'missing'),
  ('matagalpa__muy_muy', 'matagalpa', 'Muy Muy', null, null, 'missing'),
  ('matagalpa__rancho_grande', 'matagalpa', 'Rancho Grande', null, null, 'missing'),
  ('matagalpa__rio_blanco', 'matagalpa', 'Río Blanco', null, null, 'missing'),
  ('matagalpa__san_dionisio', 'matagalpa', 'San Dionisio', null, null, 'missing'),
  ('matagalpa__san_isidro', 'matagalpa', 'San Isidro', null, null, 'missing'),
  ('matagalpa__san_ramon', 'matagalpa', 'San Ramón', null, null, 'missing'),
  ('matagalpa__terrabona', 'matagalpa', 'Terrabona', null, null, 'missing'),
  ('matagalpa__el_tuma_la_dalia', 'matagalpa', 'El Tuma–La Dalia', null, null, 'missing'),
  ('esteli__esteli', 'esteli', 'Estelí', null, null, 'missing'),
  ('esteli__condega', 'esteli', 'Condega', null, null, 'missing'),
  ('esteli__pueblo_nuevo', 'esteli', 'Pueblo Nuevo', null, null, 'missing'),
  ('esteli__la_trinidad', 'esteli', 'La Trinidad', null, null, 'missing'),
  ('esteli__san_nicolas', 'esteli', 'San Nicolás', null, null, 'missing'),
  ('esteli__san_juan_de_limay', 'esteli', 'San Juan de Limay', null, null, 'missing'),
  ('managua__managua', 'managua', 'Managua', null, null, 'missing'),
  ('managua__ciudad_sandino', 'managua', 'Ciudad Sandino', null, null, 'missing'),
  ('managua__el_crucero', 'managua', 'El Crucero', null, null, 'missing'),
  ('managua__mateare', 'managua', 'Mateare', null, null, 'missing'),
  ('managua__san_francisco_libre', 'managua', 'San Francisco Libre', null, null, 'missing'),
  ('managua__san_rafael_del_sur', 'managua', 'San Rafael del Sur', null, null, 'missing'),
  ('managua__ticuantepe', 'managua', 'Ticuantepe', null, null, 'missing'),
  ('managua__tipitapa', 'managua', 'Tipitapa', null, null, 'missing'),
  ('managua__villa_el_carmen', 'managua', 'Villa El Carmen', null, null, 'missing'),
  ('carazo__jinotepe', 'carazo', 'Jinotepe', null, null, 'missing'),
  ('carazo__diriamba', 'carazo', 'Diriamba', null, null, 'missing'),
  ('carazo__san_marcos', 'carazo', 'San Marcos', null, null, 'missing'),
  ('carazo__dolores', 'carazo', 'Dolores', null, null, 'missing'),
  ('carazo__el_rosario', 'carazo', 'El Rosario', null, null, 'missing'),
  ('carazo__la_paz_de_carazo', 'carazo', 'La Paz de Carazo', null, null, 'missing'),
  ('carazo__santa_teresa', 'carazo', 'Santa Teresa', null, null, 'missing'),
  ('carazo__la_conquista', 'carazo', 'La Conquista', null, null, 'missing'),
  ('chontales__juigalpa', 'chontales', 'Juigalpa', null, null, 'missing'),
  ('chontales__acoyapa', 'chontales', 'Acoyapa', null, null, 'missing'),
  ('chontales__comalapa', 'chontales', 'Comalapa', null, null, 'missing'),
  ('chontales__la_libertad', 'chontales', 'La Libertad', null, null, 'missing'),
  ('chontales__santo_domingo', 'chontales', 'Santo Domingo', null, null, 'missing'),
  ('chontales__santo_tomas', 'chontales', 'Santo Tomás', null, null, 'missing'),
  ('chontales__san_pedro_de_lovago', 'chontales', 'San Pedro de Lóvago', null, null, 'missing'),
  ('chontales__san_francisco_de_cuapa', 'chontales', 'San Francisco de Cuapa', null, null, 'missing'),
  ('chontales__villa_sandino', 'chontales', 'Villa Sandino', null, null, 'missing'),
  ('chontales__el_coral', 'chontales', 'El Coral', null, null, 'missing'),
  ('boaco__boaco', 'boaco', 'Boaco', null, null, 'missing'),
  ('boaco__camoapa', 'boaco', 'Camoapa', null, null, 'missing'),
  ('boaco__santa_lucia', 'boaco', 'Santa Lucía', null, null, 'missing'),
  ('boaco__san_jose_de_los_remates', 'boaco', 'San José de los Remates', null, null, 'missing'),
  ('boaco__teustepe', 'boaco', 'Teustepe', null, null, 'missing'),
  ('boaco__san_lorenzo', 'boaco', 'San Lorenzo', null, null, 'missing'),
  ('nueva_segovia__ocotal', 'nueva_segovia', 'Ocotal', null, null, 'missing'),
  ('nueva_segovia__dipilto', 'nueva_segovia', 'Dipilto', null, null, 'missing'),
  ('nueva_segovia__mozonte', 'nueva_segovia', 'Mozonte', null, null, 'missing'),
  ('nueva_segovia__macuelizo', 'nueva_segovia', 'Macuelizo', null, null, 'missing'),
  ('nueva_segovia__santa_maria', 'nueva_segovia', 'Santa María', null, null, 'missing'),
  ('nueva_segovia__san_fernando', 'nueva_segovia', 'San Fernando', null, null, 'missing'),
  ('nueva_segovia__ciudad_antigua', 'nueva_segovia', 'Ciudad Antigua', null, null, 'missing'),
  ('nueva_segovia__el_jicaro', 'nueva_segovia', 'El Jícaro', null, null, 'missing'),
  ('nueva_segovia__jalapa', 'nueva_segovia', 'Jalapa', null, null, 'missing'),
  ('nueva_segovia__murra', 'nueva_segovia', 'Murra', null, null, 'missing'),
  ('nueva_segovia__quilali', 'nueva_segovia', 'Quilalí', null, null, 'missing'),
  ('nueva_segovia__wiwili_de_nueva_segovia', 'nueva_segovia', 'Wiwilí de Nueva Segovia', null, null, 'missing'),
  ('rio_san_juan__san_carlos', 'rio_san_juan', 'San Carlos', null, null, 'missing'),
  ('rio_san_juan__el_castillo', 'rio_san_juan', 'El Castillo', null, null, 'missing'),
  ('rio_san_juan__san_juan_de_nicaragua', 'rio_san_juan', 'San Juan de Nicaragua', null, null, 'missing'),
  ('rio_san_juan__san_miguelito', 'rio_san_juan', 'San Miguelito', null, null, 'missing'),
  ('rio_san_juan__morrito', 'rio_san_juan', 'Morrito', null, null, 'missing'),
  ('rio_san_juan__el_almendro', 'rio_san_juan', 'El Almendro', null, null, 'missing'),
  ('raccn__puerto_cabezas_bilwi', 'raccn', 'Puerto Cabezas / Bilwi', null, null, 'missing'),
  ('raccn__waspam', 'raccn', 'Waspam', null, null, 'missing'),
  ('raccn__prinzapolka', 'raccn', 'Prinzapolka', null, null, 'missing'),
  ('raccn__rosita', 'raccn', 'Rosita', null, null, 'missing'),
  ('raccn__bonanza', 'raccn', 'Bonanza', null, null, 'missing'),
  ('raccn__siuna', 'raccn', 'Siuna', null, null, 'missing'),
  ('raccn__mulukuku', 'raccn', 'Mulukukú', null, null, 'missing'),
  ('raccn__waslala', 'raccn', 'Waslala', null, null, 'missing'),
  ('raccs__bluefields', 'raccs', 'Bluefields', null, null, 'missing'),
  ('raccs__corn_island', 'raccs', 'Corn Island', null, null, 'missing'),
  ('raccs__laguna_de_perlas', 'raccs', 'Laguna de Perlas', null, null, 'missing'),
  ('raccs__kukra_hill', 'raccs', 'Kukra Hill', null, null, 'missing'),
  ('raccs__el_rama', 'raccs', 'El Rama', null, null, 'missing'),
  ('raccs__nueva_guinea', 'raccs', 'Nueva Guinea', null, null, 'missing'),
  ('raccs__muelle_de_los_bueyes', 'raccs', 'Muelle de los Bueyes', null, null, 'missing'),
  ('raccs__el_ayote', 'raccs', 'El Ayote', null, null, 'missing'),
  ('raccs__bocana_de_paiwas', 'raccs', 'Bocana de Paiwas', null, null, 'missing'),
  ('raccs__la_cruz_de_rio_grande', 'raccs', 'La Cruz de Río Grande', null, null, 'missing'),
  ('raccs__desembocadura_de_rio_grande', 'raccs', 'Desembocadura de Río Grande', null, null, 'missing'),
  ('raccs__el_tortuguero', 'raccs', 'El Tortuguero', null, null, 'missing'),
  ('chinandega__chinandega', 'chinandega', 'Chinandega', null, null, 'missing'),
  ('chinandega__chichigalpa', 'chinandega', 'Chichigalpa', null, null, 'missing'),
  ('chinandega__corinto', 'chinandega', 'Corinto', null, null, 'missing'),
  ('chinandega__el_realejo', 'chinandega', 'El Realejo', null, null, 'missing'),
  ('chinandega__el_viejo', 'chinandega', 'El Viejo', null, null, 'missing'),
  ('chinandega__posoltega', 'chinandega', 'Posoltega', null, null, 'missing'),
  ('chinandega__puerto_morazan', 'chinandega', 'Puerto Morazán', null, null, 'missing'),
  ('chinandega__somotillo', 'chinandega', 'Somotillo', null, null, 'missing'),
  ('chinandega__villanueva', 'chinandega', 'Villanueva', null, null, 'missing'),
  ('chinandega__santo_tomas_del_norte', 'chinandega', 'Santo Tomás del Norte', null, null, 'missing'),
  ('chinandega__cinco_pinos', 'chinandega', 'Cinco Pinos', null, null, 'missing'),
  ('chinandega__san_francisco_del_norte', 'chinandega', 'San Francisco del Norte', null, null, 'missing'),
  ('chinandega__san_pedro_del_norte', 'chinandega', 'San Pedro del Norte', null, null, 'missing')
on conflict (id) do nothing;

update public.municipalities
set source_name = coalesce(source_name, case when department_id = 'chinandega'
      then 'División político-administrativa oficial de Nicaragua (INIFOM/INETER) — 13 municipios de Chinandega'
      else 'Inventario territorial curado BAQUEANO (website/js/territories-data.js), alineado a la división oficial INIFOM/INETER' end),
    updated_at = now()
where source_name is null;

-- FK de municipio en las tablas que ya tenían la columna ----------------------
do $$
declare
  t text;
begin
  foreach t in array array['communities','crafts','culture','emergencies','events','festivals','gastronomy',
                           'heritage','historical_figures','legends','museums'] loop
    if not exists (select 1 from pg_constraint where conname = t || '_municipality_id_fkey') then
      execute format('alter table public.%I add constraint %I foreign key (municipality_id)
                      references public.municipalities(id) on delete set null not valid', t, t || '_municipality_id_fkey');
      execute format('alter table public.%I validate constraint %I', t, t || '_municipality_id_fkey');
      execute format('create index if not exists %I on public.%I (municipality_id)', 'idx_' || t || '_municipality', t);
    end if;
  end loop;
  if not exists (select 1 from pg_constraint where conname = 'communities_department_id_fkey') then
    alter table public.communities add constraint communities_department_id_fkey
      foreign key (department_id) references public.departments(id) on delete set null;
  end if;
end $$;

-- Negocios, destinos y experiencias: relaciones reales ------------------------
alter table public.businesses
  add column if not exists department_id text references public.departments(id) on delete set null,
  add column if not exists municipality_id text references public.municipalities(id) on delete set null;
alter table public.destinations
  add column if not exists municipality_id text references public.municipalities(id) on delete set null;
alter table public.experiences
  add column if not exists municipality_id text references public.municipalities(id) on delete set null;

create index if not exists idx_businesses_department_id on public.businesses (department_id);
create index if not exists idx_businesses_municipality_id on public.businesses (municipality_id);
create index if not exists idx_destinations_municipality_id on public.destinations (municipality_id);
create index if not exists idx_experiences_municipality_id on public.experiences (municipality_id);

-- Relleno desde el texto heredado (comparación sin tildes ni mayúsculas).
update public.businesses b
set department_id = d.id
from public.departments d
where b.department_id is null
  and lower(translate(btrim(b.department), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'))
    = lower(translate(btrim(d.name), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'));

update public.businesses b
set municipality_id = m.id
from public.municipalities m
where b.municipality_id is null
  and m.department_id = b.department_id
  and lower(translate(btrim(b.municipality), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'))
    = lower(translate(btrim(m.name), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'));

comment on column public.businesses.department is 'HEREDADO (texto). Fuente canónica: department_id. Se conserva por compatibilidad con web/app.';
comment on column public.businesses.municipality is 'HEREDADO (texto). Fuente canónica: municipality_id. Se conserva por compatibilidad con web/app.';

-- Privilegios: lectura pública, escritura solo servidor.
revoke insert, update, delete, truncate on public.municipalities from anon, authenticated;
grant select on public.municipalities to anon, authenticated;
