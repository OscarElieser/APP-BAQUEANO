// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PLACE UTILITIES & NORMALIZATION
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Proveer funciones puras de formateo, slugificación y normalización de búsqueda
// para destinos turísticos y territorios, permitiendo coincidencias fluidas
// y tolerantes a tildes (ej. "León" vs "Leon", "volcán" vs "volcan") sin
// arrastrar dependencias pesadas ni comprometer el hilo de renderizado.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Normalización Unicode NFD para remover diacríticos y tildes sin perder legibilidad.
// - Algoritmo determinista sin efectos secundarios ni llamadas externas.
// - Totalmente compatible con la estructura de datos consumida por la app Android.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `slugifyPlace(place)`: Genera identificadores URL amigables y canónicos.
// - `normalizeSearchText(text)`: Estandariza cadenas de texto para búsqueda flexible.
// ============================================================================

import type { PlaceRecord } from "@baqueano/types";

/**
 * Genera un slug canónico a partir del nombre del destino.
 */
export function slugifyPlace(place: PlaceRecord): string {
  return place.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Normaliza una cadena eliminando mayúsculas, tildes y diacríticos para búsqueda resiliente.
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
