// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PASAPORTE DIGITAL DE EXPERIENCIAS (passport.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una bitácora editorial y personal de los territorios, atractivos y balizas
//   Smart Points verificadas por el explorador en Nicaragua.
// - Convertir el Pasaporte en un registro de memorias y aprendizajes culturales, no en un
//   sistema de vigilancia o rastreo invasivo de ubicación.
// - Compartición Privada por Defecto (Privacy-First Sharing): Solo se comparten resúmenes
//   culturales con autorización explícita (opt-in), sin exponer fechas exactas ni reservas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Verificación de Visita: Acepta registros procedentes de escaneo QR físico, aproximación NFC
//   o validación en balizas Smart Points (Fase 11).
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - getPassportEntries(): Recupera el historial de sellos y visitas verificadas.
// - recordPassportVisit(): Registra un nuevo sello en el pasaporte del explorador.
// ============================================================================

import type { PassportEntryRecord } from "@baqueano/types";

const SEED_PASSPORT_ENTRIES: readonly PassportEntryRecord[] = [
  {
    entryId: "pass-01",
    userId: "user-demo-explorador",
    placeId: "cerro-negro",
    placeName: "Volcán Cerro Negro",
    territoryId: "Leon",
    smartPointId: "sp-leon-cerro-negro",
    verificationType: "QR_SCAN",
    verifiedAt: "2026-09-07T11:45:00Z",
    memoryNote: "Ascenso exigente y descenso inolvidable en tabla sobre ceniza volcánica.",
    badgeUnlocked: "Explorador de Volcanes Activos"
  },
  {
    entryId: "pass-02",
    userId: "user-demo-explorador",
    placeId: "san-juan-de-oriente-talleres",
    placeName: "Talleres Cerámicos de San Juan de Oriente",
    territoryId: "Masaya",
    smartPointId: "sp-masaya-pueblos-blancos",
    verificationType: "SMART_POINT",
    verifiedAt: "2026-08-28T15:20:00Z",
    memoryNote: "Clase de torno ancestral con el maestro ceramista Don Manuel.",
    badgeUnlocked: "Guardián de Tradiciones Ancestrales"
  }
];

export class PassportService {
  private entries: Map<string, PassportEntryRecord[]> = new Map();

  constructor() {
    this.entries.set("user-demo-explorador", [...SEED_PASSPORT_ENTRIES]);
  }

  /**
   * Obtiene los sellos y entradas verificadas del pasaporte del usuario.
   */
  public getPassportEntries(userId: string): readonly PassportEntryRecord[] {
    return this.entries.get(userId) ?? this.entries.get("user-demo-explorador") ?? [];
  }

  /**
   * Registra un nuevo sello verificado en el pasaporte.
   */
  public recordPassportVisit(params: {
    readonly userId: string;
    readonly placeId: string;
    readonly placeName: string;
    readonly territoryId: string;
    readonly smartPointId?: string;
    readonly verificationType: PassportEntryRecord["verificationType"];
    readonly memoryNote?: string;
    readonly badgeUnlocked?: string;
  }): PassportEntryRecord {
    const entry: PassportEntryRecord = {
      entryId: `pass-${Date.now()}`,
      userId: params.userId,
      placeId: params.placeId,
      placeName: params.placeName,
      territoryId: params.territoryId,
      smartPointId: params.smartPointId,
      verificationType: params.verificationType,
      verifiedAt: new Date().toISOString(),
      memoryNote: params.memoryNote,
      badgeUnlocked: params.badgeUnlocked
    };

    const current = this.entries.get(params.userId) ?? [];
    this.entries.set(params.userId, [entry, ...current]);
    return entry;
  }
}

export const passportService = new PassportService();
