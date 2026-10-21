// ============================================================================
// 🧭 BAQUEANO — LO QUE INCLUYE CADA PLAN Y LO QUE EL EQUIPO DEBE ENTREGAR (duties.ts)
// ============================================================================
// 🎯 POR QUÉ (propietario, 2026-10-20): «adaptar según el plan seleccionado para cumplir lo que
//   debemos hacer». Esta es la única definición de lo que trae cada plan. Coincide punto por
//   punto con las tarjetas de website/planes.html (si cambia una, cambia la otra).
// ⚙️ CÓMO: funciones puras, sin red ni base de datos, para poder probarlas.
//   - PLAN_RULES: beneficios que el sistema aplica solo (automatic) y entregas del equipo
//     (monthly: cantidad por mes; once: una sola vez por negocio).
//   - activeInMonth(): un pedido pagado cuenta en un mes si su vigencia toca ese mes.
//   - dutiesFor(): qué se debe entregar ese mes y cuánto ya se hizo (sin contar anuladas).
// 📦 QUÉ: PLAN_RULES, DUTY_KINDS, monthStart, monthEnd, activeInMonth, dutiesFor, summarize.
//   Pruebas: deno test supabase/functions/baqueano-plans/duties.test.ts
// ============================================================================

export type PlanCode = "sendero" | "mirador" | "cumbre";
export type DutyKind = "social_welcome" | "social_post" | "social_ad" | "chronicle" | "report_pdf" | "verification" | "video" | "onboarding";

export const DUTY_KINDS: readonly DutyKind[] = ["social_welcome", "social_post", "social_ad", "chronicle", "report_pdf", "verification", "video", "onboarding"];

type Rules = {
  photoLimit: number | null; // null = sin límite
  automatic: {
    listing: true; directContact: true; map: true; languages8: true; ownerPanel: true;
    statsBasic: true; statsCompare: boolean;
    departmentFeatured: boolean; alliesFirst: boolean; baquiSearchFirst: boolean;
    home: boolean; baquiRecommends: boolean; promo: boolean;
  };
  monthly: Partial<Record<DutyKind, number>>;
  once: DutyKind[];
};

export const PLAN_RULES: Record<PlanCode, Rules> = {
  sendero: {
    photoLimit: 6,
    automatic: {
      listing: true, directContact: true, map: true, languages8: true, ownerPanel: true,
      statsBasic: true, statsCompare: false,
      departmentFeatured: false, alliesFirst: false, baquiSearchFirst: false,
      home: false, baquiRecommends: false, promo: false,
    },
    monthly: {},
    once: ["social_welcome"],
  },
  mirador: {
    photoLimit: 20,
    automatic: {
      listing: true, directContact: true, map: true, languages8: true, ownerPanel: true,
      statsBasic: true, statsCompare: true,
      departmentFeatured: true, alliesFirst: true, baquiSearchFirst: true,
      home: false, baquiRecommends: false, promo: false,
    },
    monthly: { social_post: 2, chronicle: 1 },
    once: ["social_welcome", "verification"],
  },
  cumbre: {
    photoLimit: null,
    automatic: {
      listing: true, directContact: true, map: true, languages8: true, ownerPanel: true,
      statsBasic: true, statsCompare: true,
      departmentFeatured: true, alliesFirst: true, baquiSearchFirst: true,
      home: true, baquiRecommends: true, promo: true,
    },
    monthly: { social_post: 4, chronicle: 1, social_ad: 1, report_pdf: 1 },
    once: ["social_welcome", "verification", "video", "onboarding"],
  },
};

export function isPlan(code: unknown): code is PlanCode {
  return code === "sendero" || code === "mirador" || code === "cumbre";
}

/** 'YYYY-MM' o 'YYYY-MM-DD' → 'YYYY-MM-01'. Sin argumento: mes actual en hora de Nicaragua (UTC−6). */
export function monthStart(value?: string | null, now = Date.now()): string {
  if (value && /^\d{4}-(0[1-9]|1[0-2])(-\d{2})?$/.test(value)) return `${value.slice(0, 7)}-01`;
  return new Date(now - 6 * 3600_000).toISOString().slice(0, 7) + "-01";
}
export function monthEnd(start: string): string {
  const [y, m] = start.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

export type OrderLike = { id: string; plan_code: string; status: string; period_start: string | null; period_end: string | null; email?: string | null; business_id?: string | null };

export function activeInMonth(o: OrderLike, start: string): boolean {
  if (o.status !== "paid" || !o.period_start || !o.period_end || !isPlan(o.plan_code)) return false;
  return o.period_start <= monthEnd(start) && o.period_end >= start;
}

export type DoneRow = { order_id: string; kind: string; period_month: string; status: string };
export type Duty = { kind: DutyKind; cadence: "monthly" | "once"; required: number; done: number; missing: number };

/**
 * Entregas del mes para un pedido. Las mensuales cuentan solo lo hecho en ese mes; las únicas,
 * lo hecho en cualquier mes por cualquier pedido del mismo negocio (renovar no repite la
 * bienvenida, la verificación, el video ni el armado de la ficha).
 */
export function dutiesFor(o: OrderLike, start: string, done: DoneRow[], sameBusinessOrderIds: string[] = [o.id]): Duty[] {
  if (!isPlan(o.plan_code)) return [];
  const rules = PLAN_RULES[o.plan_code];
  const valid = done.filter((d) => d.status === "done");
  const out: Duty[] = [];
  for (const kind of DUTY_KINDS) {
    const perMonth = rules.monthly[kind];
    if (perMonth) {
      const n = valid.filter((d) => d.order_id === o.id && d.kind === kind && d.period_month === start).length;
      out.push({ kind, cadence: "monthly", required: perMonth, done: n, missing: Math.max(0, perMonth - n) });
    } else if (rules.once.includes(kind)) {
      const n = valid.filter((d) => sameBusinessOrderIds.includes(d.order_id) && d.kind === kind).length;
      out.push({ kind, cadence: "once", required: 1, done: Math.min(n, 1), missing: n > 0 ? 0 : 1 });
    }
  }
  return out;
}

export function summarize(duties: Duty[]) {
  const required = duties.reduce((s, d) => s + d.required, 0);
  const done = duties.reduce((s, d) => s + Math.min(d.done, d.required), 0);
  return { required, done, missing: required - done, complete: required === done };
}

/** Pedidos del mismo negocio: mismo negocio publicado vinculado o, si no hay, mismo correo. */
export function sameBusiness(o: OrderLike, all: OrderLike[]): string[] {
  return all.filter((x) => x.id === o.id
    || (o.business_id && x.business_id === o.business_id)
    || (!o.business_id && o.email && x.email && x.email.toLowerCase() === o.email.toLowerCase())).map((x) => x.id);
}
