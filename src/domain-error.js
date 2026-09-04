// ============================================================================
// BAQUEANO BACKEND - ERRORES DE DOMINIO SEGUROS
// ============================================================================
// POR QUE:
// - Los clientes necesitan respuestas accionables sin recibir trazas, secretos
//   ni detalles internos de proveedores, Firebase o infraestructura.
//
// COMO:
// - Un error tipado separa codigo estable, mensaje publico y estado HTTP; la
//   causa tecnica permanece solo en registros estructurados del servidor.
//
// QUE:
// - `DomainError`, deteccion de errores previstos y conversion de estados.
// ============================================================================

export class DomainError extends Error {
  constructor(code, publicMessage, httpStatus = 400, details = undefined) {
    super(publicMessage);
    this.name = 'DomainError';
    this.code = code;
    this.publicMessage = publicMessage;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export function isDomainError(error) {
  return error instanceof DomainError;
}
