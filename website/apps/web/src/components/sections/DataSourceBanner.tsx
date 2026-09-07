/**
 * WHY
 * Makes seed data and disconnected Firebase states visible instead of hiding them.
 *
 * HOW
 * Displays the data source envelope returned by service calls.
 *
 * WHAT
 * Reusable data status banner.
 */
import type { DataResult } from "@baqueano/types";

export function DataSourceBanner<T>({ result, label }: { result: DataResult<T>; label: string }) {
  return (
    <div className="rounded-md border border-[#F65E01]/30 bg-[#F65E01]/10 px-4 py-3 text-sm text-white/76">
      <strong className="font-tech uppercase text-[#F4E6C1]">{label}:</strong>{" "}
      {result.source === "firestore" ? "Conectado a Firestore." : "Usando datos semilla identificados."}
      {result.warning ? <span className="block pt-1 text-xs text-white/55">{result.warning}</span> : null}
    </div>
  );
}
