// Pruebas de BAQÜI + Agenda (sin red). deno test supabase/functions/baqueano-ai/events-answer.test.ts
import { assertEquals, assert } from "jsr:@std/assert@1";
import { buildEventsAnswer, formatEventsAnswer, isEventsQuestion, parseEventQuery } from "./events-answer.ts";

// Miércoles 21-10-2026, 10:00 en Nicaragua (16:00 UTC).
const WED = Date.parse("2026-10-21T16:00:00Z");

Deno.test("reconoce preguntas de eventos", () => {
  assert(isEventsQuestion("¿Qué eventos hay este fin de semana en León?"));
  assert(isEventsQuestion("fiestas patronales en Masaya"));
  assert(isEventsQuestion("¿Qué actividades hay hoy cerca de mí?"));
  assert(!isEventsQuestion("¿Cómo llego al volcán Masaya?"));
});

Deno.test("fechas en hora de Nicaragua", () => {
  assertEquals(parseEventQuery("qué eventos hay este fin de semana en León", WED), { departmentId: "leon", from: "2026-10-23", to: "2026-10-25", window: "weekend" });
  assertEquals(parseEventQuery("eventos hoy", WED).from, "2026-10-21");
  assertEquals(parseEventQuery("eventos mañana en Granada", WED), { departmentId: "granada", from: "2026-10-22", to: "2026-10-22", window: "tomorrow" });
  // 23:30 del martes en Nicaragua ya es miércoles en UTC: «hoy» sigue siendo martes.
  assertEquals(parseEventQuery("eventos hoy", Date.parse("2026-10-21T05:30:00Z")).from, "2026-10-20");
  // Sábado: el fin de semana es este mismo.
  assertEquals(parseEventQuery("fin de semana", Date.parse("2026-10-24T16:00:00Z")).to, "2026-10-25");
});

Deno.test("sin eventos no inventa nada", () => {
  const msg = formatEventsAnswer([], parseEventQuery("eventos en León este fin de semana", WED), "es");
  assert(msg.startsWith("No hay eventos publicados"));
  assert(msg.includes("León"));
  assert(!msg.includes("•"));
});

Deno.test("con eventos reales: nombre, fecha, hora y ficha", async () => {
  const rows = [{ slug: "festival-x-2026", title: "Festival X", start_at: "2026-10-24T00:30:00Z", end_at: null, time_confirmed: true, modality: "presencial", location_name: "Parque Central", department_id: "leon", time_state: "upcoming", event_status: "scheduled" }];
  let args: Record<string, unknown> = {};
  const fake = { rpc: (_fn: string, a: Record<string, unknown>) => { args = a; return Promise.resolve({ data: rows, error: null }); } };
  const r = await buildEventsAnswer(fake, "¿Qué eventos hay este fin de semana en León?", "es", WED);
  assertEquals([args.p_department, args.p_from, args.p_to, args.p_scope], ["leon", "2026-10-23", "2026-10-25", "upcoming"]);
  assert(r.message.includes("Festival X"));
  assert(r.message.includes("18:30"));
  assert(r.message.includes("evento.html?e=festival-x-2026"));
});
