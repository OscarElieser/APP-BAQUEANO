// ============================================================================
// 🗓️ BAQÜI — RESPUESTAS SOBRE LA AGENDA DE EVENTOS (events-answer.ts)
// ============================================================================
// 🎯 POR QUÉ (propietario, 2026-10-20): «¿Qué eventos hay este fin de semana en León?» → BAQÜI
//   consulta la agenda real, filtra por fecha y departamento y devuelve solo coincidencias
//   publicadas. Nunca inventa eventos para completar una respuesta.
// ⚙️ CÓMO: funciones puras (fecha en hora de Nicaragua, UTC−6 todo el año) + una consulta a
//   public_events (solo publicados, sin cancelados ni finalizados en «próximos»).
// 📦 QUÉ: isEventsQuestion(text), parseEventQuery(text, now), formatEventsAnswer(rows, query, lang),
//   buildEventsAnswer(supabase, prompt, lang, now). Pruebas: events-answer.test.ts.
// ============================================================================

export type EventQuery = { departmentId: string | null; from: string; to: string; window: "today" | "tomorrow" | "weekend" | "week" | "month" | "next" };
export type EventRow = {
  slug: string; title: string; start_at: string; end_at: string | null; time_confirmed: boolean; modality: string;
  location_name: string; department_id: string | null; time_state: string; event_status: string;
};

const DEPARTMENTS: Array<[string, RegExp, string]> = [
  ["boaco", /\bboaco\b/, "Boaco"], ["carazo", /\bcarazo\b|\bjinotepe\b|\bdiriamba\b/, "Carazo"],
  ["chinandega", /\bchinandega\b/, "Chinandega"], ["chontales", /\bchontales\b|\bjuigalpa\b/, "Chontales"],
  ["raccn", /\bcaribe norte\b|\bbilwi\b|\bpuerto cabezas\b|\braccn\b/, "Costa Caribe Norte"],
  ["raccs", /\bcaribe sur\b|\bbluefields\b|\bcorn island\b|\bislas del maiz\b|\braccs\b/, "Costa Caribe Sur"],
  ["esteli", /\bestel[ií]\b/, "Estelí"], ["granada", /\bgranada\b/, "Granada"], ["jinotega", /\bjinotega\b/, "Jinotega"],
  ["leon", /\ble[oó]n\b/, "León"], ["madriz", /\bmadriz\b|\bsomoto\b/, "Madriz"], ["managua", /\bmanagua\b/, "Managua"],
  ["masaya", /\bmasaya\b/, "Masaya"], ["matagalpa", /\bmatagalpa\b/, "Matagalpa"],
  ["nueva_segovia", /\bnueva segovia\b|\bocotal\b/, "Nueva Segovia"], ["rio_san_juan", /\brio san juan\b|\bsan carlos\b/, "Río San Juan"],
  ["rivas", /\brivas\b|\bsan juan del sur\b|\bometepe\b/, "Rivas"],
];

function norm(text: string) { return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

export function isEventsQuestion(text: string): boolean {
  const t = norm(text);
  return /\b(eventos?|fiestas?( patronal(es)?)?|festival(es)?|ferias?|conciertos?|agenda|patronales|carnaval(es)?|hipicos?|desfiles?|exposiciones?|ferias?)\b/.test(t)
    || /\bque (hay|actividades hay|se hace|puedo hacer) (hoy|manana|este fin|el fin|esta semana|este finde)\b/.test(t)
    || /\bactividades (hay )?(hoy|manana|este fin de semana|esta semana)\b/.test(t);
}

// Fecha local de Nicaragua (UTC−6, sin horario de verano) en formato YYYY-MM-DD.
function localDate(ms: number) { return new Date(ms - 6 * 3600_000).toISOString().slice(0, 10); }
function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function parseEventQuery(text: string, now = Date.now()): EventQuery {
  const t = norm(text);
  const today = localDate(now);
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay(); // 0 domingo … 6 sábado
  const dept = DEPARTMENTS.find(([, re]) => re.test(t));
  let window: EventQuery["window"] = "next";
  let from = today;
  let to = addDays(today, 30);
  if (/\bpasado manana\b/.test(t)) { window = "tomorrow"; from = to = addDays(today, 2); }
  else if (/\bhoy\b|\besta noche\b/.test(t)) { window = "today"; from = to = today; }
  else if (/\bmanana\b/.test(t)) { window = "tomorrow"; from = to = addDays(today, 1); }
  else if (/\bfin(de)?( de semana)?\b|\bfinde\b|\bsabado\b|\bdomingo\b/.test(t)) {
    window = "weekend";
    // Si hoy es sábado o domingo, el fin de semana es este; si no, el próximo viernes a domingo.
    if (weekday === 6) { from = today; to = addDays(today, 1); }
    else if (weekday === 0) { from = to = today; }
    else { from = addDays(today, 5 - weekday); to = addDays(today, 7 - weekday); }
  } else if (/\besta semana\b/.test(t)) { window = "week"; to = addDays(today, weekday === 0 ? 0 : 7 - weekday); }
  else if (/\beste mes\b/.test(t)) { window = "month"; const [y, m] = today.split("-").map(Number); to = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10); }
  return { departmentId: dept ? dept[0] : null, from, to, window };
}

const L: Record<string, Record<string, string>> = {
  es: { found: "Encontré estos eventos publicados en la Agenda BAQUEANO", none: "No hay eventos publicados en la Agenda BAQUEANO", in: "en", tbc: "horario por confirmar", online: "en línea",
    today: "para hoy", tomorrow: "para mañana", weekend: "para este fin de semana", week: "para esta semana", month: "para este mes", next: "para los próximos 30 días",
    see: "Ver ficha", all: "Podés ver la agenda completa en", noneTip: "No te invento uno: cuando el equipo publique nuevos eventos aparecerán ahí.", today2: "hoy", ongoing: "en curso" },
  en: { found: "Here are the events published on the BAQUEANO Agenda", none: "There are no events published on the BAQUEANO Agenda", in: "in", tbc: "time to be confirmed", online: "online",
    today: "for today", tomorrow: "for tomorrow", weekend: "for this weekend", week: "for this week", month: "for this month", next: "for the next 30 days",
    see: "See details", all: "You can see the full agenda at", noneTip: "I won't make one up: new events will appear there once the team publishes them.", today2: "today", ongoing: "happening now" },
};
const DEPT_NAME: Record<string, string> = Object.fromEntries(DEPARTMENTS.map(([id, , name]) => [id, name]));

export function formatEventsAnswer(rows: EventRow[], q: EventQuery, language: string, origin = "https://baqueanonicaragua.com"): string {
  const l = L[language] || L.es;
  const scope = `${l[q.window]}${q.departmentId ? ` ${l.in} ${DEPT_NAME[q.departmentId]}` : ""}`;
  if (!rows.length) return `${l.none} ${scope}. ${l.noneTip}\n${l.all} ${origin}/eventos.html`;
  const fmt = new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-NI", { timeZone: "America/Managua", weekday: "short", day: "numeric", month: "short" });
  const hour = new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-NI", { timeZone: "America/Managua", hour: "2-digit", minute: "2-digit", hourCycle: language === "en" ? "h12" : "h23" });
  const lines = [`${l.found} ${scope}:`, ""];
  rows.slice(0, 5).forEach((e) => {
    const when = `${fmt.format(new Date(e.start_at))} · ${e.time_confirmed ? hour.format(new Date(e.start_at)) : l.tbc}`;
    const where = e.modality === "virtual" ? l.online : [e.location_name, e.department_id ? DEPT_NAME[e.department_id] : ""].filter(Boolean).join(", ");
    const tag = e.time_state === "ongoing" ? ` (${l.ongoing})` : e.time_state === "today" ? ` (${l.today2})` : "";
    lines.push(`• ${e.title}${tag} — ${when} — ${where}. ${l.see}: ${origin}/evento.html?e=${e.slug}`);
  });
  lines.push("", `${l.all} ${origin}/eventos.html`);
  return lines.join("\n");
}

type Rpc = { rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }> };

export async function buildEventsAnswer(supabase: Rpc | null, prompt: string, language: string, now = Date.now()) {
  const q = parseEventQuery(prompt, now);
  if (!supabase) return { message: formatEventsAnswer([], q, language), events: [] as EventRow[], query: q, status: "no_database" };
  const { data, error } = await supabase.rpc("public_events", {
    p_scope: "upcoming", p_department: q.departmentId, p_category: null, p_from: q.from, p_to: q.to, p_limit: 5, p_offset: 0,
  });
  const rows = (error ? [] : (data || [])) as EventRow[];
  return { message: formatEventsAnswer(rows, q, language), events: rows, query: q, status: error ? "events_error" : rows.length ? "events_grounded" : "events_none" };
}
