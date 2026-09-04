// ============================================================================
// BAQUEANO BACKEND - CONSTANTES DE DOMINIO
// ============================================================================
// POR QUE:
// - El dinero, los limites y los identificadores de infraestructura deben tener
//   una unica fuente controlada por el servidor, nunca valores enviados por APK.
//
// COMO:
// - Se publican estructuras inmutables, expresadas en unidades monetarias
//   menores para evitar errores de coma flotante y facilitar validaciones exactas.
//
// QUE:
// - Base Firestore nombrada, region, catalogo comercial, metodos admitidos,
//   conversion de referencia y limites operativos del backend.
// ============================================================================

export const DATABASE_ID = 'appbaqueano';
export const FUNCTIONS_REGION = 'us-central1';
export const EXCHANGE_RATE_NIO = 36.65;

export const PAYMENT_METHODS = Object.freeze([
  'card',
  'banpro',
  'bac',
  'lafise',
]);

export const MEMBERSHIP_PLANS = Object.freeze({
  aliado_verificado: Object.freeze({
    id: 'aliado_verificado',
    title: 'Plan Aliado Verificado',
    monthlyAmountMinor: 2_000,
    annualAmountMinor: 19_200,
    durationDaysMonthly: 30,
    durationDaysAnnual: 365,
  }),
  alianza_destacada: Object.freeze({
    id: 'alianza_destacada',
    title: 'Plan Alianza Destacada',
    monthlyAmountMinor: 4_500,
    annualAmountMinor: 43_200,
    durationDaysMonthly: 30,
    durationDaysAnnual: 365,
  }),
});

export const AI_RATE_LIMIT = Object.freeze({
  maxRequests: 12,
  windowMs: 60_000,
});

export const INPUT_LIMITS = Object.freeze({
  documentId: 128,
  contactName: 120,
  phone: 40,
  email: 254,
  message: 4_000,
  chatMessages: 20,
  chatCharacters: 12_000,
  participants: 20,
});
