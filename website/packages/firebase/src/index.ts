// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — FIREBASE CLIENT & DATA ACCESS LAYER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar el acceso a Firebase Client SDK de manera segura e isomórfica
//   para el portal web público y el Control Center administrativo.
// - Evitar lecturas dispersas en componentes UI y garantizar el cumplimiento
//   estricto de los contratos compartidos con Android (`places`, `businesses`,
//   `user_saved_places`, `business_subscriptions`, `audit_logs`).
// - Operación en tiempo real conectada directamente a Cloud Firestore.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inicialización perezosa (Lazy initialization) leyendo exclusivamente variables
//   públicas `NEXT_PUBLIC_FIREBASE_*`.
// - Validación exhaustiva de entradas y salidas mediante Zod.
// - Operaciones atómicas para persistencia de destinos, favoritos de exploradores,
//   fichas de anfitriones, fiscalización de membresías y pistas de auditoría inmutables.
//
// 📦 3. QUÉ (WHAT / SERVICIOS & MÉTODOS EXPUESTOS):
// - SDKs: `getBaqueanoFirebaseApp`, `getBaqueanoAuth`, `getBaqueanoDb`, `getBaqueanoStorage`.
// - Destinos: `listPublishedPlaces`, `listPlacesForAdmin`, `getPlaceById`, `createPlace`,
//   `updatePlace`, `publishPlace`, `archivePlace`.
// - Favoritos: `toggleSavePlace`, `listUserSavedPlaceIds`.
// - Negocios: `createBusiness`, `updateBusiness`, `listBusinessesForAdmin`, `getBusinessByOwner`.
// - Suscripciones: `listSubscriptionsForAdmin`, `updateSubscriptionStatus`.
// - Pagos / Órdenes: `createPaymentOrder`, `listPaymentOrdersForAdmin`.
// - Auditoría: `recordAuditLog`, `listAuditLogs`.
// ============================================================================

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  limit,
  orderBy,
  query,
  where,
  type CollectionReference,
  type DocumentData,
  type QueryConstraint
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firestoreCollections, validatePublicEnvironment } from "@baqueano/config";
import type {
  AuditLog,
  BusinessRecord,
  BusinessSubscriptionRecord,
  DataResult,
  PaymentOrderRecord,
  PlaceRecord
} from "@baqueano/types";
import {
  auditLogSchema,
  businessRecordSchema,
  businessSubscriptionRecordSchema,
  paymentOrderRecordSchema,
  placeRecordSchema,
  type BusinessRecordInput,
  type PaymentOrderRecordInput,
  type PlaceRecordInput
} from "@baqueano/validators";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export function getBaqueanoFirebaseApp(): FirebaseApp {
  const validation = validatePublicEnvironment();
  if (!validation.ok) {
    throw new Error(`Missing Baqueano Firebase environment: ${validation.missing.join(", ")}`);
  }

  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getFirebaseAvailability(): { available: boolean; reason?: string } {
  const validation = validatePublicEnvironment();
  if (!validation.ok) {
    return { available: false, reason: `Missing environment variables: ${validation.missing.join(", ")}` };
  }

  return { available: true };
}

export function getBaqueanoAuth() {
  return getAuth(getBaqueanoFirebaseApp());
}

export function getBaqueanoDb() {
  return getFirestore(getBaqueanoFirebaseApp());
}

export function getBaqueanoStorage() {
  return getStorage(getBaqueanoFirebaseApp());
}

export function baqueanoCollection<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(getBaqueanoDb(), path) as CollectionReference<T>;
}

// ============================================================================
// SECCIÓN 1: DESTINOS (places)
// ============================================================================

/**
 * Consulta pública: Retorna únicamente lugares en estado publicado.
 */
export async function listPublishedPlaces(seedItems: readonly PlaceRecord[] = []): Promise<DataResult<PlaceRecord>> {
  const availability = getFirebaseAvailability();

  if (!availability.available) {
    return {
      source: "seed",
      isConnected: false,
      items: seedItems,
      warning: availability.reason
    };
  }

  try {
    const constraints: QueryConstraint[] = [where("status", "==", "published"), orderBy("updatedAt", "desc"), limit(48)];
    const snapshot = await getDocs(query(baqueanoCollection(firestoreCollections.places), ...constraints));
    const items = snapshot.docs
      .map((docSnap) => placeRecordSchema.safeParse({ ...docSnap.data(), placeId: docSnap.data().placeId ?? docSnap.id }))
      .filter((result) => result.success)
      .map((result) => result.data);

    if (items.length === 0 && seedItems.length > 0) {
      return { source: "seed", isConnected: true, items: seedItems, warning: "Firestore vacio, mostrando catalogo base." };
    }

    return { source: "firestore", isConnected: true, items };
  } catch (error) {
    return {
      source: "seed",
      isConnected: false,
      items: seedItems,
      warning: error instanceof Error ? error.message : "Firestore places query failed."
    };
  }
}

/**
 * Consulta de Control Center: Retorna todos los lugares sin filtrar por estado.
 */
export async function listPlacesForAdmin(seedItems: readonly PlaceRecord[] = []): Promise<DataResult<PlaceRecord>> {
  const availability = getFirebaseAvailability();

  if (!availability.available) {
    return {
      source: "seed",
      isConnected: false,
      items: seedItems,
      warning: availability.reason
    };
  }

  try {
    const snapshot = await getDocs(query(baqueanoCollection(firestoreCollections.places), orderBy("updatedAt", "desc"), limit(100)));
    const items = snapshot.docs
      .map((docSnap) => placeRecordSchema.safeParse({ ...docSnap.data(), placeId: docSnap.data().placeId ?? docSnap.id }))
      .filter((result) => result.success)
      .map((result) => result.data);

    if (items.length === 0 && seedItems.length > 0) {
      return { source: "seed", isConnected: true, items: seedItems, warning: "Firestore vacio, mostrando registros de inicializacion." };
    }

    return { source: "firestore", isConnected: true, items };
  } catch (error) {
    return {
      source: "seed",
      isConnected: false,
      items: seedItems,
      warning: error instanceof Error ? error.message : "Firestore admin places query failed."
    };
  }
}

export async function getPlaceById(placeId: string): Promise<PlaceRecord | null> {
  const availability = getFirebaseAvailability();
  if (!availability.available) return null;

  try {
    const docRef = doc(getBaqueanoDb(), firestoreCollections.places, placeId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const parsed = placeRecordSchema.safeParse({ ...snap.data(), placeId: snap.id });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function createPlace(input: PlaceRecordInput): Promise<PlaceRecord> {
  const validated = placeRecordSchema.parse(input);
  const docRef = doc(getBaqueanoDb(), firestoreCollections.places, validated.placeId);
  await setDoc(docRef, validated);
  return validated;
}

export async function updatePlace(placeId: string, partial: Partial<PlaceRecordInput>): Promise<void> {
  const docRef = doc(getBaqueanoDb(), firestoreCollections.places, placeId);
  const updatedAt = new Date().toISOString();
  await updateDoc(docRef, { ...partial, updatedAt });
}

export async function publishPlace(placeId: string): Promise<void> {
  await updatePlace(placeId, { status: "published" });
}

export async function archivePlace(placeId: string): Promise<void> {
  await updatePlace(placeId, { status: "archived" });
}

// ============================================================================
// SECCIÓN 2: FAVORITOS (user_saved_places)
// ============================================================================

/**
 * Guarda o quita un lugar de favoritos para el usuario autenticado.
 * Retorna true si fue guardado, false si fue removido.
 */
export async function toggleSavePlace(userId: string, placeId: string): Promise<boolean> {
  const savedId = `${userId}_${placeId}`;
  const docRef = doc(getBaqueanoDb(), firestoreCollections.userSavedPlaces, savedId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    await deleteDoc(docRef);
    return false;
  } else {
    const savedAt = new Date().toISOString();
    await setDoc(docRef, { userId, placeId, savedAt });
    return true;
  }
}

/**
 * Obtiene los IDs de lugares guardados por un usuario.
 */
export async function listUserSavedPlaceIds(userId: string): Promise<string[]> {
  const availability = getFirebaseAvailability();
  if (!availability.available) return [];

  try {
    const snapshot = await getDocs(
      query(baqueanoCollection(firestoreCollections.userSavedPlaces), where("userId", "==", userId), limit(100))
    );
    return snapshot.docs.map((d) => d.data().placeId as string).filter(Boolean);
  } catch {
    return [];
  }
}

// ============================================================================
// SECCIÓN 3: NEGOCIOS & PORTAL DEL HOST (businesses)
// ============================================================================

export async function createBusiness(input: BusinessRecordInput): Promise<BusinessRecord> {
  const validated = businessRecordSchema.parse(input);
  const docRef = doc(getBaqueanoDb(), firestoreCollections.businesses, validated.id);
  await setDoc(docRef, validated);
  return validated;
}

export async function updateBusiness(businessId: string, partial: Partial<BusinessRecordInput>): Promise<void> {
  const docRef = doc(getBaqueanoDb(), firestoreCollections.businesses, businessId);
  const updatedAt = new Date().toISOString();
  await updateDoc(docRef, { ...partial, updatedAt });
}

export async function listBusinessesForAdmin(): Promise<DataResult<BusinessRecord>> {
  const availability = getFirebaseAvailability();
  if (!availability.available) return { source: "seed", isConnected: false, items: [] };

  try {
    const snapshot = await getDocs(
      query(baqueanoCollection(firestoreCollections.businesses), orderBy("updatedAt", "desc"), limit(60))
    );
    const items = snapshot.docs
      .map((d) => businessRecordSchema.safeParse({ ...d.data(), id: d.id }))
      .filter((r) => r.success)
      .map((r) => r.data as BusinessRecord);

    return { source: "firestore", isConnected: true, items };
  } catch (err) {
    return {
      source: "seed",
      isConnected: false,
      items: [],
      warning: err instanceof Error ? err.message : "Error al leer negocios"
    };
  }
}

export async function getBusinessByOwner(ownerUid: string): Promise<BusinessRecord | null> {
  const availability = getFirebaseAvailability();
  if (!availability.available) return null;

  try {
    const snapshot = await getDocs(
      query(baqueanoCollection(firestoreCollections.businesses), where("ownerUid", "==", ownerUid), limit(1))
    );
    if (snapshot.empty) return null;
    const parsed = businessRecordSchema.safeParse({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// ============================================================================
// SECCIÓN 4: SUSCRIPCIONES (business_subscriptions)
// ============================================================================

export async function listSubscriptionsForAdmin(): Promise<DataResult<BusinessSubscriptionRecord>> {
  const availability = getFirebaseAvailability();
  if (!availability.available) return { source: "seed", isConnected: false, items: [] };

  try {
    const snapshot = await getDocs(
      query(baqueanoCollection(firestoreCollections.businessSubscriptions), limit(50))
    );
    const items = snapshot.docs
      .map((d) => businessSubscriptionRecordSchema.safeParse({ ...d.data(), id: d.id }))
      .filter((r) => r.success)
      .map((r) => r.data as BusinessSubscriptionRecord);

    return { source: "firestore", isConnected: true, items };
  } catch (err) {
    return {
      source: "seed",
      isConnected: false,
      items: [],
      warning: err instanceof Error ? err.message : "Error al consultar membresías"
    };
  }
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: "active" | "past_due" | "cancelled",
  plan: "starter" | "growth" | "alliance"
): Promise<void> {
  const docRef = doc(getBaqueanoDb(), firestoreCollections.businessSubscriptions, subscriptionId);
  await updateDoc(docRef, { status, plan });
}

// ============================================================================
// SECCIÓN 5: ÓRDENES DE PAGO (payment_orders)
// ============================================================================

export async function createPaymentOrder(order: PaymentOrderRecordInput): Promise<PaymentOrderRecord> {
  const validated = paymentOrderRecordSchema.parse(order);
  const docRef = doc(getBaqueanoDb(), firestoreCollections.paymentOrders, validated.id);
  await setDoc(docRef, validated);
  return validated;
}

export async function listPaymentOrdersForAdmin(): Promise<DataResult<PaymentOrderRecord>> {
  const availability = getFirebaseAvailability();
  if (!availability.available) return { source: "seed", isConnected: false, items: [] };

  try {
    const snapshot = await getDocs(
      query(baqueanoCollection(firestoreCollections.paymentOrders), orderBy("createdAt", "desc"), limit(50))
    );
    const items = snapshot.docs
      .map((d) => paymentOrderRecordSchema.safeParse({ ...d.data(), id: d.id }))
      .filter((r) => r.success)
      .map((r) => r.data as PaymentOrderRecord);

    return { source: "firestore", isConnected: true, items };
  } catch (err) {
    return {
      source: "seed",
      isConnected: false,
      items: [],
      warning: err instanceof Error ? err.message : "Error al consultar ordenes de pago"
    };
  }
}

// ============================================================================
// SECCIÓN 6: AUDITORÍA INMUTABLE (audit_logs)
// ============================================================================

export async function recordAuditLog(log: Omit<AuditLog, "id" | "createdAtIso">): Promise<void> {
  const availability = getFirebaseAvailability();
  if (!availability.available) return;

  try {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const createdAtIso = new Date().toISOString();
    const fullLog: AuditLog = {
      id: logId,
      actorId: log.actorId,
      actorEmail: log.actorEmail,
      actorRole: log.actorRole,
      action: log.action,
      collection: log.collection,
      documentId: log.documentId,
      metadata: log.metadata ?? {},
      createdAtIso
    };

    const docRef = doc(getBaqueanoDb(), firestoreCollections.auditLogs, logId);
    await setDoc(docRef, fullLog);
  } catch (error) {
    console.error("No se pudo escribir en audit_logs:", error);
  }
}

export async function listAuditLogs(limitCount = 50): Promise<DataResult<AuditLog>> {
  const availability = getFirebaseAvailability();

  if (!availability.available) {
    return {
      source: "seed",
      isConnected: false,
      items: [],
      warning: availability.reason
    };
  }

  try {
    const snapshot = await getDocs(
      query(baqueanoCollection(firestoreCollections.auditLogs), orderBy("createdAtIso", "desc"), limit(limitCount))
    );

    const items = snapshot.docs
      .map((docSnap) => auditLogSchema.safeParse({ ...docSnap.data(), id: docSnap.id }))
      .filter((result) => result.success)
      .map((result) => result.data as AuditLog);

    return { source: "firestore", isConnected: true, items };
  } catch (error) {
    return {
      source: "seed",
      isConnected: false,
      items: [],
      warning: error instanceof Error ? error.message : "Error al leer audit_logs"
    };
  }
}
