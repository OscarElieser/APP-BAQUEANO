/**
 * POR QUE: Una fuente contradictoria o vencida requiere visibilidad operativa.
 * COMO: Lee data_sources, valida documentos y agrupa estados de revision.
 * QUE: Resumen real para el panel de calidad.
 */
import { collection, getDocs, limit, query } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";
import { dataSourceRecordSchema } from "@baqueano/validators";

export async function getSourceAdminSummary() {
  try {
    const snapshot = await getDocs(query(collection(getBaqueanoDb(), firestoreCollections.dataSources), limit(250)));
    const sources = snapshot.docs.map((item) => dataSourceRecordSchema.safeParse({ ...item.data(), id: item.id })).filter((item) => item.success).map((item) => item.data);
    return {
      connected: true,
      sources,
      verified: sources.filter((item) => item.dataStatus === "verified").length,
      needsReview: sources.filter((item) => item.dataStatus === "needs_review").length,
      expired: sources.filter((item) => item.dataStatus === "expired").length,
      disputed: sources.filter((item) => item.dataStatus === "disputed").length
    };
  } catch {
    return { connected: false, sources: [], verified: 0, needsReview: 0, expired: 0, disputed: 0 };
  }
}
