// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CURRENCY & MONEY FORMATTER (FASE 12)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar un motor determinístico y seguro para el manejo de divisas
//   centroamericanas (NIO, CRC, GTQ, HNL, USD, BZD, PAB).
// - Prevenir errores de precisión de punto flotante almacenando montos en
//   unidades menores (centavos) y formateando según la convención del país/locale.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Utiliza Intl.NumberFormat con configuraciones estrictas por código ISO 4217.
// - Soporta conversión y mapeo bidireccional entre minor units y major units.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `formatMoney(amountMinor, currency, locale)`
// - `minorToMajor(amountMinor)`
// - `majorToMinor(amountMajor)`
// ============================================================================

import type { CurrencyCode, LocaleCode, MoneyAmount } from "@baqueano/types";

const currencyLocaleMap: Record<CurrencyCode, string> = {
  NIO: "es-NI",
  CRC: "es-CR",
  GTQ: "es-GT",
  HNL: "es-HN",
  USD: "en-US",
  BZD: "en-BZ",
  PAB: "es-PA"
};

/**
 * Formats a money amount stored in minor units into a localized currency string.
 */
export function formatMoney(
  amountMinor: number,
  currency: CurrencyCode = "NIO",
  locale?: LocaleCode
): string {
  const targetLocale = locale ?? currencyLocaleMap[currency] ?? "es-NI";
  const majorValue = amountMinor / 100;

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(majorValue);
  } catch {
    // Fallback in case of unsupported runtime locale
    return `${currency} ${majorValue.toFixed(2)}`;
  }
}

/**
 * Converts minor units (integer cents) to major units (decimal number).
 */
export function minorToMajor(amountMinor: number): number {
  return amountMinor / 100;
}

/**
 * Converts major units (decimal) into minor units (integer cents) avoiding floating point quirks.
 */
export function majorToMinor(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}

/**
 * Helper to build a validated MoneyAmount object.
 */
export function createMoneyAmount(amountMinor: number, currency: CurrencyCode): MoneyAmount {
  return {
    amountMinor: Math.max(0, Math.floor(amountMinor)),
    currency
  };
}
