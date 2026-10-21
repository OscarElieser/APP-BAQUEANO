// Pruebas de duties.ts: deno test supabase/functions/baqueano-plans/duties.test.ts
import { assertEquals } from "jsr:@std/assert@1";
import { activeInMonth, dutiesFor, monthEnd, monthStart, PLAN_RULES, sameBusiness, summarize } from "./duties.ts";

const base = { status: "paid", period_start: "2026-10-15", period_end: "2026-11-14", email: "a@b.ni", business_id: null };

Deno.test("mes en hora de Nicaragua y fin de mes", () => {
  // 2026-11-01 03:00 UTC todavía es 31 de octubre en Managua.
  assertEquals(monthStart(null, Date.UTC(2026, 10, 1, 3)), "2026-10-01");
  assertEquals(monthStart("2026-02"), "2026-02-01");
  assertEquals(monthStart("2026-13"), monthStart(null));
  assertEquals(monthEnd("2026-02-01"), "2026-02-28");
});

Deno.test("vigencia: cuenta en los meses que toca y solo si está pagado", () => {
  const o = { id: "1", plan_code: "mirador", ...base };
  assertEquals(activeInMonth(o, "2026-10-01"), true);
  assertEquals(activeInMonth(o, "2026-11-01"), true);
  assertEquals(activeInMonth(o, "2026-12-01"), false);
  assertEquals(activeInMonth({ ...o, status: "contacted" }, "2026-10-01"), false);
  assertEquals(activeInMonth({ ...o, plan_code: "otro" }, "2026-10-01"), false);
});

Deno.test("las reglas coinciden con las tarjetas de planes.html", () => {
  assertEquals(PLAN_RULES.sendero.photoLimit, 6);
  assertEquals(PLAN_RULES.mirador.photoLimit, 20);
  assertEquals(PLAN_RULES.cumbre.photoLimit, null);
  assertEquals(PLAN_RULES.sendero.automatic.alliesFirst, false);
  assertEquals(PLAN_RULES.mirador.automatic.departmentFeatured, true);
  assertEquals(PLAN_RULES.mirador.automatic.home, false);
  assertEquals(PLAN_RULES.cumbre.automatic.home, true);
  assertEquals(PLAN_RULES.cumbre.automatic.baquiRecommends, true);
  assertEquals(PLAN_RULES.mirador.monthly, { social_post: 2, chronicle: 1 });
  assertEquals(PLAN_RULES.cumbre.monthly, { social_post: 4, chronicle: 1, social_ad: 1, report_pdf: 1 });
});

Deno.test("entregas del mes: cuenta lo hecho, ignora anuladas y otros meses", () => {
  const o = { id: "o1", plan_code: "cumbre", ...base };
  const done = [
    { order_id: "o1", kind: "social_post", period_month: "2026-10-01", status: "done" },
    { order_id: "o1", kind: "social_post", period_month: "2026-10-01", status: "void" },
    { order_id: "o1", kind: "social_post", period_month: "2026-09-01", status: "done" },
    { order_id: "o1", kind: "social_welcome", period_month: "2026-09-01", status: "done" },
  ];
  const d = dutiesFor(o, "2026-10-01", done);
  const post = d.find((x) => x.kind === "social_post")!;
  assertEquals([post.required, post.done, post.missing], [4, 1, 3]);
  assertEquals(d.find((x) => x.kind === "social_welcome")!.missing, 0);
  assertEquals(d.find((x) => x.kind === "video")!.missing, 1);
  assertEquals(d.some((x) => x.kind === "social_ad"), true);
  const s = summarize(d);
  // Cumbre: 4 + 1 + 1 + 1 al mes + 4 únicas = 11.
  assertEquals([s.required, s.done, s.complete], [11, 2, false]);
});

Deno.test("Sendero solo tiene la bienvenida; más entregas no superan lo requerido", () => {
  const o = { id: "s1", plan_code: "sendero", ...base };
  const d = dutiesFor(o, "2026-10-01", [
    { order_id: "s1", kind: "social_welcome", period_month: "2026-10-01", status: "done" },
    { order_id: "s1", kind: "social_welcome", period_month: "2026-10-01", status: "done" },
  ]);
  assertEquals(d.map((x) => x.kind), ["social_welcome"]);
  assertEquals(summarize(d), { required: 1, done: 1, missing: 0, complete: true });
});

Deno.test("renovar no repite las entregas únicas del mismo negocio", () => {
  const prev = { id: "p", plan_code: "mirador", ...base, business_id: "biz-1" };
  const renewal = { id: "r", plan_code: "mirador", ...base, period_start: "2026-11-15", period_end: "2026-12-14", business_id: "biz-1" };
  const other = { id: "x", plan_code: "mirador", ...base, business_id: "biz-2" };
  const ids = sameBusiness(renewal, [prev, renewal, other]);
  assertEquals(ids.sort(), ["p", "r"]);
  const d = dutiesFor(renewal, "2026-12-01", [{ order_id: "p", kind: "verification", period_month: "2026-10-01", status: "done" }], ids);
  assertEquals(d.find((x) => x.kind === "verification")!.missing, 0);
});
