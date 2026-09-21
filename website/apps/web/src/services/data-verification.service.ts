/**
 * POR QUE: Los datos operativos deben mostrar procedencia y vigencia.
 * COMO: Lee fuentes, calcula caducidad y bloquea datos contradictorios.
 * QUE: Resumen publicable por recurso con revision humana como estado seguro.
 */
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";
import type { DataSourceRecord, DataVerificationStatus } from "@baqueano/types";

export function evaluateSource(source: DataSourceRecord, now = new Date()): DataVerificationStatus {
  if (source.dataStatus === "disputed") return "disputed";
  if (source.validUntil && new Date(source.validUntil).getTime() < now.getTime()) return "expired";
  return source.dataStatus;
}

export async function getVerificationSummary(resourceId: string) {
  try {
    const snapshot = await getDocs(query(collection(getBaqueanoDb(), firestoreCollections.dataSources), where("resourceId", "==", resourceId), limit(25)));
    const sources = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as DataSourceRecord);
    const states = sources.map((source) => evaluateSource(source));
    const status: DataVerificationStatus = states.includes("disputed") ? "disputed" : states.includes("expired") ? "expired" : states.includes("verified") ? "verified" : "needs_review";
    return { status, canPublishAsCurrent: status === "verified", message: status === "verified" ? "Dato vigente y trazable." : "Dato sujeto a confirmacion humana.", sources };
  } catch {
    return { status: "needs_review" as const, canPublishAsCurrent: false, message: "Procedencia no comprobada.", sources: [] };
  }
}
