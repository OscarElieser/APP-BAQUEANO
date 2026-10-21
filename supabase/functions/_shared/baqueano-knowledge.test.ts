// Pruebas de la prioridad por plan en BAQUI: deno test supabase/functions/_shared/baqueano-knowledge.test.ts
import { assertEquals } from "jsr:@std/assert@1";
import { BaqueanoKnowledgeService, planZone } from "./baqueano-knowledge.ts";

Deno.test("planZone detecta departamento y servicio", () => {
  assertEquals(planZone("¿Dónde puedo dormir en León?"), { department: "leon", categories: ["hospedaje", "alojamiento"] });
  assertEquals(planZone("quiero comer en Granada").categories, ["restaurante", "comedor", "kiosco", "gastronomia"]);
  assertEquals(planZone("historia de Masaya"), { department: "masaya", categories: [] });
  assertEquals(planZone("hoteles").department, null);
});

// Cliente falso: devuelve filas fijas para cada tabla y los planes vigentes.
function fakeClient(rows: Record<string, Record<string, unknown>[]>, tiers: Array<{ business_id: string; plan_code: string }>) {
  // deno-lint-ignore no-explicit-any
  const chain = (table: string): any => {
    let data = rows[table] || [];
    // deno-lint-ignore no-explicit-any
    const q: any = {
      select: () => q, eq: (c: string, v: unknown) => { if (c === "department_id") data = data.filter((r) => r[c] === v); return q; },
      is: () => q, in: (c: string, v: unknown[]) => { if (c === "id" || c === "category") data = data.filter((r) => v.includes(r[c])); return q; },
      or: () => q, ilike: () => q, limit: () => Promise.resolve({ data, error: null }),
    };
    return q;
  };
  return { from: chain, rpc: () => Promise.resolve({ data: tiers, error: null }) };
}

Deno.test("Mirador y Cumbre van primero, Sendero no; se marcan como destacados", async () => {
  const biz = [
    { id: "b-s", name: "Hostal Sendero", category: "hospedaje", department_id: "leon" },
    { id: "b-none", name: "Hostal Libre", category: "hospedaje", department_id: "leon" },
    { id: "b-m", name: "Hostal Mirador", category: "hospedaje", department_id: "leon" },
  ];
  // deno-lint-ignore no-explicit-any
  const svc = new BaqueanoKnowledgeService(fakeClient({ businesses: biz }, [{ business_id: "b-s", plan_code: "sendero" }, { business_id: "b-m", plan_code: "mirador" }]) as any);
  const out = (await svc.search("hostal")).filter((r) => r.entityType === "businesses");
  assertEquals(out.map((r) => r.entityId), ["b-m", "b-s", "b-none"]);
  assertEquals(out[0].payload.plan_featured, "mirador");
  assertEquals(out[1].payload.plan_featured, undefined);
});

Deno.test("Cumbre se recomienda cuando piden su servicio en su departamento", async () => {
  const biz = [
    { id: "b-c", name: "Casa Cumbre", category: "hospedaje", department_id: "leon" },
    { id: "b-c2", name: "Otra Cumbre", category: "restaurante", department_id: "leon" },
    { id: "b-c3", name: "Cumbre Granada", category: "hospedaje", department_id: "granada" },
  ];
  const tiers = biz.map((b) => ({ business_id: b.id, plan_code: "cumbre" }));
  // Solo la tabla de la consulta extra devuelve filas (la búsqueda por nombre no encuentra nada).
  const client = fakeClient({ businesses: biz }, tiers);
  const originalFrom = client.from;
  let calls = 0;
  // deno-lint-ignore no-explicit-any
  (client as any).from = (t: string) => { if (t !== "businesses") return originalFrom("__none__"); calls++; return calls === 1 ? originalFrom("__none__") : originalFrom(t); };
  // deno-lint-ignore no-explicit-any
  const out = (await new BaqueanoKnowledgeService(client as any).search("hospedaje en León")).filter((r) => r.entityType === "businesses");
  assertEquals(out.map((r) => r.entityId), ["b-c"]);
  assertEquals(out[0].payload.plan_featured, "cumbre");
});

Deno.test("sin planes vigentes no cambia nada", async () => {
  const biz = [{ id: "a", name: "A" }, { id: "b", name: "B" }];
  // deno-lint-ignore no-explicit-any
  const out = await new BaqueanoKnowledgeService(fakeClient({ businesses: biz }, []) as any).search("negocio");
  assertEquals(out.filter((r) => r.entityType === "businesses").map((r) => r.entityId), ["a", "b"]);
});
