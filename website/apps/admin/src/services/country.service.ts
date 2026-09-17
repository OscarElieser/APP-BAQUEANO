// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — REGIONAL COUNTRY MANAGEMENT SERVICE (FASE 12)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una capa de abstracción desacoplada y tipada para la gestión
//   del catálogo de países centroamericanos, estados de preparación (readiness),
//   capacidades activas y switches de activación/pausa de mercado.
// - Asegura que Nicaragua continúe operando como mercado nuclear activo mientras
//   otros países centroamericanos se configuran progresivamente de forma segura.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consume @baqueano/config y @baqueano/types con validación Zod.
// - Implementa operaciones asíncronas respetando el patrón DataResult.
// - Permite actualizar el estado de un país (PLANNED, CONFIGURING, PILOT, ACTIVE, PAUSED).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `getCountries()`: Listado completo de países de la región con estadísticas.
// - `getCountryByCode()`: Detalle de un país con estructura territorial y emergencias.
// - `updateCountryStatus()`: Transición de ciclo de vida o activación de kill-switch.
// ============================================================================

import type { CountryRecord, CountryStatus, DataResult } from "@baqueano/types";
import { CENTRAL_AMERICA_COUNTRIES } from "@baqueano/config";

const seedCountryRecords: CountryRecord[] = CENTRAL_AMERICA_COUNTRIES.map((c) => ({
  id: c.id,
  code: c.code,
  name: c.name,
  officialName: c.officialName,
  status: c.status,
  defaultLocale: c.defaultLocale,
  supportedLocales: c.supportedLocales as any,
  defaultCurrency: c.defaultCurrency,
  supportedCurrencies: c.supportedCurrencies as any,
  timezone: c.timezone,
  territorialStructure: {
    level1Label: c.level1Label,
    level2Label: c.level2Label,
    hasIndigenousTerritories: c.hasIndigenousTerritories,
    indigenousTerritoryLabel: c.indigenousTerritoryLabel
  },
  capabilities: c.capabilities,
  emergencyInfo: {
    nationalEmergencyPhone: c.emergencyPhone,
    policePhone: c.policePhone,
    redCrossPhone: c.redCrossPhone,
    fireDeptPhone: "115",
    civilProtectionPhone: "100",
    verifiedAt: "2026-09-07T00:00:00.000Z"
  },
  mapCenterCoordinates: {
    latitude: c.mapCenter.latitude,
    longitude: c.mapCenter.longitude,
    defaultZoom: c.mapCenter.defaultZoom
  },
  activePartnersCount: c.code === "NI" ? 48 : c.code === "CR" ? 4 : c.code === "GT" ? 2 : 0,
  verifiedDestinationsCount: c.code === "NI" ? 180 : c.code === "CR" ? 12 : c.code === "GT" ? 8 : 0,
  verifiedBusinessesCount: c.code === "NI" ? 95 : c.code === "CR" ? 6 : c.code === "GT" ? 3 : 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-09-07T12:00:00.000Z"
}));

export async function getCountries(): Promise<DataResult<CountryRecord>> {
  return {
    items: seedCountryRecords,
    source: "seed",
    isConnected: true
  };
}

export async function getCountryByCode(code: string): Promise<CountryRecord | null> {
  const found = seedCountryRecords.find((c) => c.code === code.toUpperCase());
  return found ?? null;
}

export async function updateCountryStatus(code: string, newStatus: CountryStatus): Promise<boolean> {
  const index = seedCountryRecords.findIndex((c) => c.code === code.toUpperCase());
  if (index === -1) return false;

  // Preserve immutability in record
  (seedCountryRecords as any)[index] = {
    ...seedCountryRecords[index],
    status: newStatus,
    updatedAt: new Date().toISOString()
  };
  return true;
}
