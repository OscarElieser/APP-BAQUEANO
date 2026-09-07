# MODELO DE CLIENTES DE API & GESTIÓN DE ACCESOS (API CLIENT MODEL)

## 1. Definición del Modelo de Cliente (`ApiClientRecord`)

```typescript
export interface ApiClientRecord {
  id: string;                         // Identificador único (ej: "client-001")
  organizationId?: string;            // ID de la organización o universidad asociada
  name: string;                       // Nombre de la app o proyecto de integración
  contactEmail: string;               // Correo del responsable técnico
  keyPrefix: string;                  // Prefijo visible (ej: "bq_live_unan", "bq_test_nica")
  keyHash: string;                    // Hash SHA-256 de la API Key
  environment: "sandbox" | "production";
  status: "ACTIVE" | "SUSPENDED" | "REVOKED" | "PENDING";
  scopes: readonly ApiScope[];        // Permisos granulares asignados
  countryScope: readonly CountryCode[];// Países autorizados (ej: ["NI", "CR"])
  rateLimitPerMin: number;            // Límite de peticiones por minuto
  quotaDailyRequests: number;         // Cuota diaria de peticiones
  requestsToday: number;              // Peticiones consumidas en el día actual
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Ciclo de Vida de Credenciales

- **Registro**: El aliado solicita credenciales a través del portal de desarrolladores o formulario institucional.
- **Aprobación & Emisión**: El Super Admin asigna scopes y genera la clave única. El secreto se muestra **una sola vez**.
- **Monitoreo & Auditoría**: La plataforma contabiliza el uso en tiempo real y detecta anomalías o superación de cuotas.
- **Revocación / Suspensión**: Transición instantánea a `REVOKED` en caso de sospecha de compromiso.
