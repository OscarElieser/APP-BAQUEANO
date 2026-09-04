// ============================================================================
// BAQUEANO BACKEND - VALIDACION Y CALCULOS PUROS
// ============================================================================
// POR QUE:
// - Ningun monto, rol, cupo o instruccion sensible puede confiarse al cliente o
//   a un webhook sin comprobar forma, rango y coherencia con datos del servidor.
//
// COMO:
// - Funciones puras normalizan entradas, trabajan dinero en centavos, rechazan
//   campos ambiguos y producen cotizaciones deterministas faciles de probar.
//
// QUE:
// - Validadores de pagos, reservas y chat, calculadora de cotizacion y reglas de
//   idempotencia que usan las Cloud Functions.
// ============================================================================

import {
  EXCHANGE_RATE_NIO,
  INPUT_LIMITS,
  MEMBERSHIP_PLANS,
  PAYMENT_METHODS,
} from './constants.js';
import { DomainError } from './domain-error.js';

const SAFE_DOCUMENT_ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]*$/;
const SAFE_TRANSACTION_ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_STATUSES = new Set(['approved', 'paid', 'succeeded', 'completed']);
const SUCCESS_EVENT_TYPES = new Set([
  'payment.succeeded',
  'payment.completed',
  'checkout.session.completed',
]);

export function isPlainObject(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype
      || Object.getPrototypeOf(value) === null);
}

export function requirePlainObject(value, label = 'payload') {
  if (!isPlainObject(value)) {
    throw new DomainError('invalid_argument', `${label} debe ser un objeto JSON.`, 400);
  }
  return value;
}

export function requireString(value, field, { min = 1, max = 256, trim = true } = {}) {
  if (typeof value !== 'string') {
    throw new DomainError('invalid_argument', `${field} debe ser texto.`, 400);
  }
  const normalized = trim ? value.trim() : value;
  if (normalized.length < min || normalized.length > max) {
    throw new DomainError(
      'invalid_argument',
      `${field} debe contener entre ${min} y ${max} caracteres.`,
      400,
    );
  }
  return normalized;
}

export function requireDocumentId(value, field) {
  const normalized = requireString(value, field, { max: INPUT_LIMITS.documentId });
  if (!SAFE_DOCUMENT_ID.test(normalized) || normalized === '.' || normalized === '..') {
    throw new DomainError('invalid_argument', `${field} no es un identificador valido.`, 400);
  }
  return normalized;
}

export function resolvePlanPrice(planId, isAnnual) {
  const plan = MEMBERSHIP_PLANS[planId];
  if (!plan) {
    throw new DomainError('invalid_plan', 'El plan solicitado no esta disponible.', 400);
  }
  const amountMinor = isAnnual ? plan.annualAmountMinor : plan.monthlyAmountMinor;
  const durationDays = isAnnual ? plan.durationDaysAnnual : plan.durationDaysMonthly;
  return { ...plan, amountMinor, durationDays };
}

export function validateCreatePaymentInput(value) {
  const input = requirePlainObject(value, 'data');
  const businessId = requireDocumentId(input.businessId, 'businessId');
  const planId = requireString(input.planId, 'planId', { max: 64 });
  if (typeof input.isAnnual !== 'boolean') {
    throw new DomainError('invalid_argument', 'isAnnual debe ser booleano.', 400);
  }
  const methodType = requireString(input.methodType, 'methodType', { max: 32 }).toLowerCase();
  if (!PAYMENT_METHODS.includes(methodType)) {
    throw new DomainError('invalid_payment_method', 'El metodo de pago no esta habilitado.', 400);
  }
  const plan = resolvePlanPrice(planId, input.isAnnual);
  return {
    businessId,
    planId,
    isAnnual: input.isAnnual,
    methodType,
    plan,
  };
}

export function minorToMajor(amountMinor) {
  return amountMinor / 100;
}

export function parseMajorAmountToMinor(value, field = 'amount') {
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new DomainError('invalid_webhook', `${field} debe ser un monto decimal.`, 400);
  }
  const source = typeof value === 'number' ? String(value) : value.trim();
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(source)) {
    throw new DomainError('invalid_webhook', `${field} tiene un formato monetario invalido.`, 400);
  }
  const [whole, fraction = ''] = source.split('.');
  const minor = (Number(whole) * 100) + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(minor) || minor <= 0) {
    throw new DomainError('invalid_webhook', `${field} esta fuera de rango.`, 400);
  }
  return minor;
}

function parseMinorAmount(value, field = 'amountMinor') {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new DomainError('invalid_webhook', `${field} debe ser un entero positivo.`, 400);
  }
  return value;
}

function selectWebhookData(payload) {
  if (isPlainObject(payload.data)) {
    return { ...payload, ...payload.data };
  }
  return payload;
}

export function normalizePaymentWebhook(value) {
  const payload = requirePlainObject(value, 'webhook');
  const data = selectWebhookData(payload);
  const eventId = requireString(
    payload.eventId ?? payload.id,
    'eventId',
    { max: 128 },
  );
  const orderId = requireDocumentId(
    data.orderId ?? data.merchantOrderId ?? data.merchant_order_id,
    'orderId',
  );
  const transactionId = requireString(
    data.transactionId ?? data.providerTransactionId ?? data.paymentId,
    'transactionId',
    { max: 128 },
  );
  if (!SAFE_TRANSACTION_ID.test(transactionId)) {
    throw new DomainError('invalid_webhook', 'transactionId no es valido.', 400);
  }

  const currency = requireString(data.currency, 'currency', { min: 3, max: 3 }).toUpperCase();
  const amountMinor = data.amountMinor !== undefined
    ? parseMinorAmount(data.amountMinor)
    : parseMajorAmountToMinor(
      isPlainObject(data.amount) ? data.amount.value : data.amount,
      'amount',
    );

  if (data.amountMinor !== undefined && data.amount !== undefined) {
    const majorMinor = parseMajorAmountToMinor(
      isPlainObject(data.amount) ? data.amount.value : data.amount,
      'amount',
    );
    if (majorMinor !== amountMinor) {
      throw new DomainError('invalid_webhook', 'Los campos de monto no coinciden.', 400);
    }
  }

  const status = requireString(data.status, 'status', { max: 40 }).toLowerCase();
  const eventType = typeof payload.type === 'string' ? payload.type.trim().toLowerCase() : '';
  const actionable = SUCCESS_STATUSES.has(status)
    && (eventType.length === 0 || SUCCESS_EVENT_TYPES.has(eventType));

  const cardBrand = typeof data.brand === 'string'
    ? data.brand.trim().slice(0, 32)
    : typeof data.cardBrand === 'string'
      ? data.cardBrand.trim().slice(0, 32)
      : null;
  const last4 = typeof data.last4 === 'string' && /^\d{4}$/.test(data.last4)
    ? data.last4
    : null;
  const authCode = typeof data.authCode === 'string'
    ? data.authCode.trim().slice(0, 64)
    : null;

  return {
    eventId,
    eventType,
    orderId,
    transactionId,
    amountMinor,
    currency,
    status,
    actionable,
    cardBrand,
    last4,
    authCode,
  };
}

export function assertWebhookMatchesOrder(webhook, order) {
  if (!order || typeof order !== 'object') {
    throw new DomainError('order_not_found', 'La orden no existe.', 404);
  }
  if (!Number.isSafeInteger(order.amountMinor) || order.amountMinor <= 0) {
    throw new DomainError('invalid_order', 'La orden no tiene un monto verificable.', 409);
  }
  if (webhook.amountMinor !== order.amountMinor) {
    throw new DomainError('amount_mismatch', 'El monto confirmado no coincide con la orden.', 409);
  }
  if (webhook.currency !== order.currency) {
    throw new DomainError('currency_mismatch', 'La moneda confirmada no coincide con la orden.', 409);
  }
  if (order.status === 'gateway_failed' || order.status === 'cancelled') {
    throw new DomainError('invalid_order_state', 'La orden no admite confirmacion.', 409);
  }
  return true;
}

export function classifyPaymentIdempotency({ event, order, transaction }) {
  if (event) {
    return 'event_already_processed';
  }
  if (order?.status === 'paid') {
    if (order.transactionId === transaction?.transactionId) {
      return 'order_already_paid';
    }
    return 'conflict';
  }
  if (transaction) {
    return 'conflict';
  }
  return 'process';
}

function valueFrom(object, ...paths) {
  for (const path of paths) {
    const segments = path.split('.');
    let value = object;
    for (const segment of segments) {
      value = isPlainObject(value) ? value[segment] : undefined;
    }
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

export function dateFromUnknown(value, field = 'requestedDate') {
  let result;
  if (value instanceof Date) {
    result = value;
  } else if (value && typeof value.toDate === 'function') {
    result = value.toDate();
  } else if (typeof value === 'string') {
    result = new Date(value);
  } else if (typeof value === 'number') {
    result = new Date(value);
  }
  if (!(result instanceof Date) || !Number.isFinite(result.getTime())) {
    throw new DomainError('invalid_reservation', `${field} no es una fecha valida.`, 400);
  }
  return result;
}

export function validateReservationRequest(value, { now = new Date() } = {}) {
  const request = requirePlainObject(value, 'reservation_request');
  if (request.status !== 'queued') {
    throw new DomainError('invalid_reservation_state', 'La solicitud ya no esta en cola.', 409);
  }
  const requestId = requireDocumentId(request.requestId, 'requestId');
  const touristUid = requireDocumentId(request.touristUid, 'touristUid');
  const destinationId = requireDocumentId(request.destinationId, 'destinationId');
  if (!Number.isInteger(request.participants)
      || request.participants < 1
      || request.participants > INPUT_LIMITS.participants) {
    throw new DomainError(
      'invalid_participants',
      `participants debe estar entre 1 y ${INPUT_LIMITS.participants}.`,
      400,
    );
  }
  if (typeof request.isForeignTourist !== 'boolean') {
    throw new DomainError('invalid_reservation', 'isForeignTourist debe ser booleano.', 400);
  }
  const requestedDate = dateFromUnknown(request.requestedDate);
  const earliest = new Date(now.getTime() - (5 * 60_000));
  const latest = new Date(now.getTime() + (730 * 86_400_000));
  if (requestedDate < earliest || requestedDate > latest) {
    throw new DomainError(
      'invalid_requested_date',
      'La fecha solicitada debe ser futura y estar dentro de los proximos dos anos.',
      400,
    );
  }

  const contactName = requireString(request.contactName, 'contactName', {
    max: INPUT_LIMITS.contactName,
  });
  const contactPhone = requireString(request.contactPhone, 'contactPhone', {
    max: INPUT_LIMITS.phone,
  });
  const contactEmail = requireString(request.contactEmail, 'contactEmail', {
    max: INPUT_LIMITS.email,
  }).toLowerCase();
  if (!EMAIL.test(contactEmail)) {
    throw new DomainError('invalid_reservation', 'contactEmail no es valido.', 400);
  }
  const nationality = requireString(request.nationality, 'nationality', { max: 80 });

  return {
    requestId,
    touristUid,
    destinationId,
    requestedDate,
    participants: request.participants,
    isForeignTourist: request.isForeignTourist,
    contactName,
    contactPhone,
    contactEmail,
    nationality,
  };
}

export function validateDestinationForReservation(value, participants) {
  const destination = requirePlainObject(value, 'destination');
  if (destination.status !== 'published' || destination.verified === false) {
    throw new DomainError(
      'destination_unavailable',
      'El destino no esta publicado o habilitado para reservas.',
      409,
    );
  }
  if (valueFrom(destination, 'bookingEnabled', 'booking.enabled') === false) {
    throw new DomainError(
      'booking_disabled',
      'El destino no acepta solicitudes de reserva en este momento.',
      409,
    );
  }

  const hostUid = requireDocumentId(
    valueFrom(destination, 'hostUid', 'booking.hostUid'),
    'destination.hostUid',
  );
  const hostName = requireString(
    valueFrom(destination, 'hostName', 'booking.hostName'),
    'destination.hostName',
    { max: 120 },
  );
  const hostBusiness = requireString(
    valueFrom(destination, 'hostBusiness', 'booking.hostBusiness'),
    'destination.hostBusiness',
    { max: 160 },
  );
  const hostPhone = requireString(
    valueFrom(destination, 'hostPhone', 'booking.hostPhone'),
    'destination.hostPhone',
    { max: INPUT_LIMITS.phone },
  );
  const destinationTitle = requireString(
    valueFrom(destination, 'title', 'name'),
    'destination.title',
    { max: 180 },
  );
  const department = requireString(destination.department, 'destination.department', { max: 100 });

  const unitPrice = valueFrom(destination, 'priceUsd', 'booking.basePriceUsd');
  const unitPriceMinor = parseMajorAmountToMinor(unitPrice, 'destination.priceUsd');
  const maxParticipants = valueFrom(
    destination,
    'maxParticipants',
    'capacity',
    'booking.maxParticipants',
  );
  if (!Number.isInteger(maxParticipants)
      || maxParticipants < 1
      || maxParticipants > 10_000) {
    throw new DomainError(
      'destination_not_configured',
      'El destino aun no tiene cupos verificables configurados.',
      409,
    );
  }
  const availableSpots = valueFrom(destination, 'availableSpots', 'booking.availableSpots');
  if (availableSpots !== undefined
      && (!Number.isInteger(availableSpots) || availableSpots < 0)) {
    throw new DomainError(
      'destination_not_configured',
      'El destino tiene una configuracion de cupos invalida.',
      409,
    );
  }
  const effectiveCapacity = availableSpots === undefined
    ? maxParticipants
    : Math.min(maxParticipants, availableSpots);
  if (participants > effectiveCapacity) {
    throw new DomainError(
      'insufficient_capacity',
      'No hay cupos suficientes para la cantidad de participantes solicitada.',
      409,
    );
  }

  return {
    hostUid,
    hostName,
    hostBusiness,
    hostPhone,
    destinationTitle,
    department,
    unitPriceMinor,
    maxParticipants,
    availableSpots: availableSpots ?? null,
  };
}

export function calculateReservationQuote({
  unitPriceMinor,
  participants,
  isForeignTourist,
  exchangeRate = EXCHANGE_RATE_NIO,
}) {
  if (!Number.isSafeInteger(unitPriceMinor) || unitPriceMinor <= 0) {
    throw new DomainError('invalid_quote', 'La tarifa del destino no es valida.', 500);
  }
  if (!Number.isInteger(participants) || participants < 1) {
    throw new DomainError('invalid_quote', 'La cantidad de participantes no es valida.', 500);
  }
  const subtotalMinor = unitPriceMinor * participants;
  if (!Number.isSafeInteger(subtotalMinor)) {
    throw new DomainError('invalid_quote', 'La cotizacion excede el rango admitido.', 500);
  }
  const vatRateBasisPoints = isForeignTourist ? 0 : 1_500;
  const vatMinor = Math.round((subtotalMinor * vatRateBasisPoints) / 10_000);
  const totalMinor = subtotalMinor + vatMinor;
  const totalNioMinor = Math.round(totalMinor * exchangeRate);
  return Object.freeze({
    currency: 'USD',
    unitPriceUsd: minorToMajor(unitPriceMinor),
    participants,
    subtotalUsd: minorToMajor(subtotalMinor),
    vatRate: vatRateBasisPoints / 10_000,
    vatAmountUsd: minorToMajor(vatMinor),
    discountUsd: 0,
    totalUsd: minorToMajor(totalMinor),
    exchangeRateNio: exchangeRate,
    totalNio: minorToMajor(totalNioMinor),
    amountMinor: totalMinor,
  });
}

export function validateAiChatPayload(value) {
  const input = requirePlainObject(value, 'body');
  if (!Array.isArray(input.messages)
      || input.messages.length < 1
      || input.messages.length > INPUT_LIMITS.chatMessages) {
    throw new DomainError(
      'invalid_chat',
      `messages debe contener entre 1 y ${INPUT_LIMITS.chatMessages} elementos.`,
      400,
    );
  }
  const messages = [];
  let totalCharacters = 0;
  for (const rawMessage of input.messages) {
    const message = requirePlainObject(rawMessage, 'message');
    const role = requireString(message.role, 'message.role', { max: 16 }).toLowerCase();
    if (role === 'system') {
      continue;
    }
    if (role !== 'user' && role !== 'model') {
      throw new DomainError('invalid_chat', 'Cada rol debe ser user, model o system.', 400);
    }
    const content = requireString(message.content, 'message.content', {
      max: INPUT_LIMITS.message,
    });
    totalCharacters += content.length;
    if (totalCharacters > INPUT_LIMITS.chatCharacters) {
      throw new DomainError('invalid_chat', 'El historial excede el limite permitido.', 400);
    }
    messages.push({ role, content });
  }
  if (messages.length === 0 || !messages.some((message) => message.role === 'user')) {
    throw new DomainError('invalid_chat', 'Se requiere al menos un mensaje de usuario.', 400);
  }
  if (messages.at(-1).role !== 'user') {
    throw new DomainError('invalid_chat', 'El ultimo mensaje debe pertenecer al usuario.', 400);
  }
  return { messages };
}
