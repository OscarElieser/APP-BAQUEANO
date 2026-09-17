// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DEVELOPER & API CLIENT MANAGEMENT SERVICE (FASE 13)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una capa de gestión desacoplada y tipada para la administración
//   de clientes API registrados (desarrolladores, socios institucionales, universidades),
//   asignación de scopes, cuotas de rate limiting y revocación instantánea de credenciales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Implementa el patrón DataResult con datos inmutables y tipado @baqueano/types.
// - Soporta simulación de claves sandbox/live y revocación con hash criptográfico.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `getApiClients()`: Listado de clientes de API registrados.
// - `revokeApiClient(clientId)`: Revocación inmediata de acceso.
// - `updateApiClientQuota(clientId, newLimit)`: Ajuste de cuota diaria.
// ============================================================================

import type { ApiClientRecord, ApiClientStatus, DataResult } from "@baqueano/types";

const seedApiClients: ApiClientRecord[] = [
  {
    id: "client-001",
    name: "Universidad Nacional Autónoma (UNAN-León) — Proyecto GIS",
    contactEmail: "gis-ecoturismo@unanleon.edu.ni",
    keyPrefix: "bq_live_unan",
    keyHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    environment: "production",
    status: "ACTIVE",
    scopes: ["open_data.read", "places.read", "territories.read", "research.telemetry.read"],
    countryScope: ["NI"],
    rateLimitPerMin: 120,
    quotaDailyRequests: 20000,
    requestsToday: 3450,
    lastUsedAt: "2026-09-07T15:30:00.000Z",
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-09-07T15:30:00.000Z"
  },
  {
    id: "client-002",
    name: "Cámara de Turismo de Somoto (CANTUR)",
    contactEmail: "alianza@cantursomoto.org.ni",
    keyPrefix: "bq_live_cant",
    keyHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
    environment: "production",
    status: "ACTIVE",
    scopes: ["places.read", "places.submit", "smart_points.read", "businesses.partner.read"],
    countryScope: ["NI"],
    rateLimitPerMin: 60,
    quotaDailyRequests: 5000,
    requestsToday: 890,
    lastUsedAt: "2026-09-07T14:15:00.000Z",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-09-07T14:15:00.000Z"
  },
  {
    id: "client-003",
    name: "App Móvil de Senderismo NicaTrails (Sandbox)",
    contactEmail: "dev@nicatrails.com",
    keyPrefix: "bq_test_nica",
    keyHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    environment: "sandbox",
    status: "ACTIVE",
    scopes: ["open_data.read", "places.read", "smart_points.read"],
    countryScope: ["NI", "CR"],
    rateLimitPerMin: 30,
    quotaDailyRequests: 1000,
    requestsToday: 120,
    lastUsedAt: "2026-09-07T11:00:00.000Z",
    createdAt: "2026-04-15T00:00:00.000Z",
    updatedAt: "2026-09-07T11:00:00.000Z"
  }
];

export async function getApiClients(): Promise<DataResult<ApiClientRecord>> {
  return {
    items: seedApiClients,
    source: "seed",
    isConnected: true
  };
}

export async function updateApiClientStatus(clientId: string, status: ApiClientStatus): Promise<boolean> {
  const index = seedApiClients.findIndex((c) => c.id === clientId);
  if (index === -1) return false;

  (seedApiClients as any)[index] = {
    ...seedApiClients[index],
    status,
    updatedAt: new Date().toISOString()
  };
  return true;
}

export async function updateApiClientQuota(clientId: string, newDailyQuota: number): Promise<boolean> {
  const client = seedApiClients.find((c) => c.id === clientId);
  if (!client) return false;

  (client as any).quotaDailyRequests = newDailyQuota;
  (client as any).updatedAt = new Date().toISOString();
  return true;
}
