// Pruebas de utilidades puras de baqueano-events (sin red ni base de datos).
// deno test supabase/functions/baqueano-events/helpers.test.ts
import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { HttpError, isoToManagua, managuaToIso, slugify, validateEvent } from "./helpers.ts";

const base = {
  title: "Festival del Maíz", category: "festival_cultural", departmentId: "leon", locationName: "Parque Central",
  startDate: "2026-11-14", startTime: "18:30", timeConfirmed: true,
};

Deno.test("hora de Nicaragua → UTC sin ambigüedad (UTC−6, sin horario de verano)", () => {
  assertEquals(managuaToIso("2026-11-14", "18:30"), "2026-11-15T00:30:00.000Z");
  assertEquals(managuaToIso("2026-07-01", "09:00"), "2026-07-01T15:00:00.000Z");
  assertEquals(managuaToIso("2026-11-14"), "2026-11-14T06:00:00.000Z");
  assertEquals(isoToManagua("2026-11-15T00:30:00.000Z"), { date: "2026-11-14", time: "18:30" });
  assertEquals(managuaToIso("2026-02-31", "10:00"), null);
  assertEquals(managuaToIso("14/11/2026", "10:00"), null);
  assertEquals(managuaToIso("2026-11-14", "25:00"), null);
});

Deno.test("slug legible y seguro", () => {
  assertEquals(slugify("¡Fiesta de San Jerónimo! 2026"), "fiesta-de-san-jeronimo-2026");
  assertEquals(slugify("Ñandú & Café"), "nandu-cafe");
});

Deno.test("sin hora confirmada no se guarda una hora", () => {
  const r = validateEvent({ ...base, timeConfirmed: false });
  assertEquals(r.time_confirmed, false);
  assertEquals(r.start_at, "2026-11-14T06:00:00.000Z");
});

Deno.test("precio solo si es de pago; gratis nunca lleva precio", () => {
  assertEquals(validateEvent({ ...base, accessType: "free", price: 100, currency: "NIO" }).price, null);
  const paid = validateEvent({ ...base, accessType: "paid", price: "150", currency: "NIO" });
  assertEquals([paid.price, paid.currency], [150, "NIO"]);
  assertThrows(() => validateEvent({ ...base, accessType: "paid", price: "-5", currency: "NIO" }), HttpError);
});

Deno.test("un borrador se guarda solo con nombre y fecha (lo demás se completa antes de publicar)", () => {
  const draft = validateEvent({ title: "Agüizotes 2026", category: "tradiciones", startDate: "2026-10-23" });
  assertEquals([draft.department_id, draft.location_name, draft.description, draft.source_url], [null, null, null, null]);
  assertThrows(() => validateEvent({ category: "tradiciones", startDate: "2026-10-23" }), HttpError);
  assertThrows(() => validateEvent({ title: "Agüizotes 2026", category: "tradiciones" }), HttpError);
});

Deno.test("validaciones que evitan datos inventados o peligrosos", () => {
  assertThrows(() => validateEvent({ ...base, category: "rave" }), HttpError);
  assertThrows(() => validateEvent({ ...base, departmentId: "atlantida" }), HttpError);
  assertThrows(() => validateEvent({ ...base, latitude: 40.4, longitude: -3.7 }), HttpError);
  assertThrows(() => validateEvent({ ...base, officialUrl: "javascript:alert(1)" }), HttpError);
  assertThrows(() => validateEvent({ ...base, officialUrl: "mailto:x@y.ni" }), HttpError);
  assertThrows(() => validateEvent({ ...base, endDate: "2026-11-13" }), HttpError);
  const virtual = validateEvent({ ...base, modality: "virtual", departmentId: "", locationName: "", virtualUrl: "https://example.org/vivo" });
  assertEquals([virtual.location_name, virtual.department_id], ["En línea", null]);
  // Enlaces pegados sin https:// o con http:// se completan a https:// (la base solo admite https).
  assertEquals(validateEvent({ ...base, officialUrl: "http://alcaldia.ni/agenda" }).official_url, "https://alcaldia.ni/agenda");
  assertEquals(validateEvent({ ...base, sourceUrl: "facebook.com/AlcaldiaMasaya" }).source_url, "https://facebook.com/AlcaldiaMasaya");
  const coords = validateEvent({ ...base, latitude: "12.4351", longitude: "-86.8794" });
  assertEquals(coords.coords_verified, false);
});
