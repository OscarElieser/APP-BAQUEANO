#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: un diccionario de datos escrito a mano envejece el mismo día. Este
 *   generador lo produce desde la instantánea real del catálogo de Supabase, de
 *   modo que cada columna documentada existe en producción.
 * ⚙️ CÓMO: lee `tools/db/catalog-<fecha>.txt` (una línea por tabla:
 *   `tabla|col:tipo[!] [PK] [FK→t] [UQ] [=default]; ...`, extraída de
 *   information_schema/pg_constraint vía MCP), agrupa por dominio y añade el
 *   propósito de cada tabla. Las tablas no clasificadas aparecen en "Sin dominio"
 *   para que nada quede oculto.
 * 📦 QUÉ: `node tools/db/gen-data-dictionary.mjs [catalog.txt] > docs/database/DATA_DICTIONARY.md`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = process.argv[2] || path.join(here, 'catalog-2026-10-05.txt');
const snapshot = path.basename(catalogPath).match(/(\d{4}-\d{2}-\d{2})/)?.[1] || 'sin fecha';

const DOMAINS = [
  ['Identidad, roles y permisos', {
    profiles: 'Perfil de cada persona (viajero, anfitrión, staff). `id` = auth.users; `firebase_uid` enlaza la identidad heredada.',
    identity_links: 'Vincula una identidad externa (proveedor + uid heredado de Firebase) con un perfil. Base de la migración Firebase → Supabase.',
    roles: 'Catálogo de roles RBAC con rango (traveler, business_owner, auditor, admin, superadmin…).',
    permissions: 'Catálogo de permisos atómicos; `critical` marca los que exigen doble control.',
    role_permissions: 'Relación N:M rol ↔ permiso.',
    user_roles: 'Roles asignados a un perfil; `granted_by` y `reason` dejan rastro. Nadie puede autoasignarse staff.',
    staff_roles: 'Roles de staff por correo (puente con el Ops Center heredado mientras se migra a `user_roles`).',
    official_super_admins: 'Lista cerrada de superadministradores oficiales; solo escritura de servidor.'
  }],
  ['Territorio', {
    departments: '15 departamentos + 2 regiones autónomas (17 territorios).',
    municipalities: '153 municipios con FK a departamento; `location_precision` declara si la coordenada es real, aproximada o falta.'
  }],
  ['Catálogo turístico', {
    destinations: 'Destinos publicables; trazabilidad (`source_*`, `verification_status`, `valid_until`) y FK a territorio.',
    places: 'Lugares concretos dentro de un destino.',
    experiences: 'Experiencias ofrecidas por un negocio o comunidad (precio, duración, requisitos, no incluido).',
    routes: 'Rutas de varios días/territorios.',
    route_stops: 'Paradas ordenadas de una ruta (día, duración, coordenada).',
    day_passes: 'Pases de día de un negocio (precio adulto/niño, restricciones, reserva).',
    tourism_services: 'Servicios con precio y fuente obligatoria (`source_name`); nunca precio sin origen.',
    events: 'Eventos con fecha, lugar y costo.'
  }],
  ['Negocios', {
    businesses: 'Negocios/anfitriones; `status`, `verification_status` y FK a departamento y municipio. Completitud en `v_business_profile_completion`.',
    business_members: 'Personas que administran un negocio (owner/manager) con estado.',
    verification_requests: 'Solicitudes de verificación revisadas por staff (decisión, notas y revisor).'
  }],
  ['Cultura y patrimonio', {
    culture: 'Contenido cultural general por territorio.',
    heritage: 'Patrimonio material (tipo, período, estatus UNESCO, decreto).',
    museums: 'Museos con horario y tarifas.',
    festivals: 'Fiestas patronales y tradiciones por mes.',
    gastronomy: 'Platos típicos, ingredientes y técnicas.',
    crafts: 'Artesanías y cooperativas artesanas.',
    legends: 'Leyendas y tradición oral.',
    music: 'Patrimonio musical.',
    historical_figures: 'Personajes históricos.',
    communities: 'Comunidades anfitrionas (cooperativas, pueblos originarios).'
  }],
  ['Seguridad y emergencias', {
    emergencies: 'Directorio de emergencias por territorio (tipo de servicio validado por CHECK).',
    sos_events: 'Alertas SOS emitidas desde la app; lectura solo staff.'
  }],
  ['Viajero', {
    favorites: 'Favoritos de un usuario (único por entidad).',
    reservations: 'Reservas con código único, historial de estados y canal.',
    reviews: 'Reseñas con calificación; `verified_visit` indica visita comprobada.',
    travel_plans: 'Planes de viaje generados (determinista o IA).',
    travel_diaries: 'Diarios de viaje personales/públicos.',
    explorer_passport_stamps: 'Sellos del pasaporte explorador (único por entidad).'
  }],
  ['Comunidad (testimonios)', {
    testimonials: 'Testimonios moderados (`pending_review` por defecto) con contadores y búsqueda de texto completo.',
    testimonial_media: 'Fotos/videos de un testimonio con tamaño y tipo validados.',
    testimonial_comments: 'Comentarios encadenados (`parent_id`).',
    testimonial_reactions: 'Reacciones a testimonios o comentarios.',
    testimonial_reports: 'Reportes de moderación.'
  }],
  ['BAQUI (IA) y conocimiento', {
    ai_sessions: 'Sesión de conversación con BAQUI (canal, proveedor, modelo, idioma, conteo de mensajes).',
    ai_messages: 'Mensajes de la sesión con tokens, latencia y herramientas usadas; texto minimizado (sin correos/teléfonos).',
    rag_sources: 'Fuentes citables por BAQUI con nivel de confianza; BAQUI nunca las verifica.',
    ai_message_sources: 'Fuentes usadas por cada respuesta (rango y similitud).',
    knowledge_documents: 'Documentos con embedding (pgvector 768) para recuperación.',
    knowledge_candidates: 'Datos propuestos por fuentes externas pendientes de revisión humana.',
    baqui_knowledge_gaps: 'Temas que BAQUI no pudo responder (prioriza curaduría).',
    baqui_trip_memory: 'Memoria de viaje con consentimiento y expiración.',
    baqui_feedback: 'Retroalimentación sobre respuestas de BAQUI.',
    content_translations: 'Traducciones revisadas de contenido (6 idiomas), con estado y sugerencia IA marcada.'
  }],
  ['Analítica SMART', {
    analytics_event_types: 'Catálogo de eventos con etapa AARRR; `is_activation` define activación (≠ registro); `client_allowed` separa eventos de servidor.',
    analytics_events: 'Eventos ingresados solo vía RPC `track_event` (el usuario lo fija el servidor).',
    commercial_actions: 'Intenciones comerciales (WhatsApp, llamada, reserva) ligadas a negocio/destino/experiencia.',
    campaign_attribution: 'Primer contacto UTM por sesión.',
    user_feedback: 'Calificación 1–5 por funcionalidad vía RPC `submit_feedback`.',
    traffic_sessions: 'Sesiones de tráfico (plataforma y página) con inserción acotada.'
  }],
  ['Auditoría, respaldo y operación', {
    audit_logs: 'Bitácora inmutable (triggers bloquean UPDATE/DELETE/TRUNCATE) con valores antes/después.',
    firestore_mirror: 'Réplica de Firestore (origen heredado de Android) mientras dura la migración.',
    backup_operations: 'Cola de operaciones de respaldo Firebase ↔ Supabase con reintentos.',
    storage_backups: 'Respaldo de archivos de Firebase Storage en Supabase Storage con checksum.',
    ops_backup_entities: 'Respaldo de entidades del Ops Center.',
    sprint_evidence_records: 'Registros de evidencia con hash de prueba y expiración.'
  }]
];

const tables = new Map();
for (const line of fs.readFileSync(catalogPath, 'utf8').split('\n').filter(Boolean)) {
  const [name, cols] = line.split('|');
  tables.set(name, cols.split('; ').map((raw) => {
    const [head, ...rest] = raw.split(' ');
    const sep = head.indexOf(':');
    const col = head.slice(0, sep);
    let type = head.slice(sep + 1);
    const notNull = type.endsWith('!');
    if (notNull) type = type.slice(0, -1);
    const tail = rest.join(' ');
    const def = tail.match(/=(.+)$/)?.[1] || '';
    const flags = tail.replace(/=.+$/, '').trim().split(/\s+/).filter(Boolean);
    // tipos con espacio ("double precision", "tsvector (generada)") quedan en flags: se reincorporan
    const extraType = flags.filter((f) => !/^(PK|UQ|FK→)/.test(f));
    if (extraType.length) type = `${type} ${extraType.join(' ')}`.replace(/!$/, '');
    const nn = notNull || /!$/.test(extraType.at(-1) || '');
    return {
      col, type: type.replace(/!$/, ''), notNull: nn || flags.includes('PK'), def,
      pk: flags.includes('PK'), uq: flags.includes('UQ'), fk: flags.find((f) => f.startsWith('FK→'))?.slice(3) || ''
    };
  }));
}

const esc = (v) => String(v).replace(/\|/g, '\\|');
const out = [];
out.push('<!--');
out.push('🎯 POR QUÉ: documentar cada tabla y columna que EXISTE en producción, no las que se planearon.');
out.push('⚙️ CÓMO: generado por tools/db/gen-data-dictionary.mjs desde la instantánea del catálogo de Supabase. No editar a mano: regenerar.');
out.push('📦 QUÉ: dominios, propósito de cada tabla, columnas, tipos, nulabilidad, claves, relaciones y valores por defecto.');
out.push('-->');
out.push('# Diccionario de datos — BAQUEANO (Supabase/PostgreSQL)');
out.push('');
out.push(`> Generado desde el catálogo real del proyecto \`heiudfpthqwtjrtluqlm\` · instantánea **${snapshot}** · ${tables.size} tablas en \`public\`, todas con RLS.`);
out.push('> Regenerar: `node tools/db/gen-data-dictionary.mjs > docs/database/DATA_DICTIONARY.md`.');
out.push('');
out.push('**Convenciones:** `NN` = NOT NULL · `PK` = clave primaria · `UQ` = participa en restricción única · `FK → t` = clave foránea. Columnas comunes de trazabilidad (`source_name`, `source_url`, `source_type`, `retrieved_at`, `verified_at`, `verified_by`, `valid_until`, `verification_status`) significan: origen del dato, cuándo se obtuvo, quién y cuándo lo verificó y hasta cuándo es válido. `verification_status` por defecto es `unverified`: nada se presenta como verificado sin evidencia.');
out.push('');

const seen = new Set();
out.push('## Índice por dominio');
out.push('');
out.push('| Dominio | Tablas |');
out.push('|---|---|');
for (const [domain, entries] of DOMAINS) {
  const present = Object.keys(entries).filter((t) => tables.has(t));
  out.push(`| ${domain} | ${present.map((t) => `\`${t}\``).join(', ')} |`);
}
out.push('');

function renderTable(name, purpose) {
  seen.add(name);
  const cols = tables.get(name);
  const fks = [...new Set(cols.filter((c) => c.fk).map((c) => c.fk))];
  out.push(`### \`${name}\``);
  out.push('');
  out.push(purpose);
  out.push('');
  out.push(`Columnas: ${cols.length} · PK: ${cols.filter((c) => c.pk).map((c) => `\`${c.col}\``).join(', ') || '—'}${fks.length ? ` · Relaciones: ${fks.map((f) => `\`${f}\``).join(', ')}` : ''}`);
  out.push('');
  out.push('| Columna | Tipo | NN | Clave | Por defecto |');
  out.push('|---|---|:-:|---|---|');
  for (const c of cols) {
    const key = [c.pk && 'PK', c.uq && 'UQ', c.fk && `FK → ${c.fk}`].filter(Boolean).join(' · ');
    out.push(`| \`${c.col}\` | ${esc(c.type)} | ${c.notNull ? '✔' : ''} | ${esc(key)} | ${c.def ? `\`${esc(c.def)}\`` : ''} |`);
  }
  out.push('');
}

for (const [domain, entries] of DOMAINS) {
  out.push(`## ${domain}`);
  out.push('');
  for (const [name, purpose] of Object.entries(entries)) if (tables.has(name)) renderTable(name, purpose);
}
const orphan = [...tables.keys()].filter((t) => !seen.has(t));
if (orphan.length) {
  out.push('## Sin dominio asignado');
  out.push('');
  for (const name of orphan) renderTable(name, 'Pendiente de clasificar en un dominio.');
}
process.stdout.write(out.join('\n') + '\n');
