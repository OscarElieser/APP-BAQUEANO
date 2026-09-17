/**
 * WHY
 * Keeps admin pages compact and consistent across modules.
 *
 * HOW
 * Provides small cards, tables, and action rows for operational scanning.
 *
 * WHAT
 * Reusable admin metric and module list components.
 */
import type { ReactNode } from "react";

export function AdminMetric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon?: ReactNode }) {
  return (
    <article className="admin-surface p-5">
      <div className="flex items-center justify-between gap-3 text-[#F4E6C1]">{icon}</div>
      <strong className="mt-4 block font-tech text-3xl text-white">{value}</strong>
      <span className="mt-1 block text-sm font-bold text-white">{label}</span>
      <p className="mt-2 text-xs leading-5 text-white/56">{detail}</p>
    </article>
  );
}

export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="admin-surface p-5">
      <h2 className="font-display text-xl font-black text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
