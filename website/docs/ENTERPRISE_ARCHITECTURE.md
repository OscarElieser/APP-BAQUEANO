# 🧭 ENTERPRISE ARCHITECTURE — ARQUITECTURA DE PLATAFORMA BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Definir la arquitectura de referencia de Baqueano para soportar de forma coordinada a exploradores, anfitriones, cooperativas comunitarias, alcaldías e instituciones turísticas sin comprometer la simplicidad, seguridad y soberanía de los datos.

---

## ⚙️ 2. CÓMO (HOW / PATRÓN MONOLITO MODULAR & DOMINIOS DE PLATAFORMA)

Se implementa un **Monolito Modular** estructurado en 10 dominios de plataforma:

```text
                                 BAQUEANO PLATFORM
                                         │
        ┌──────────────┬─────────────────┼─────────────────┬──────────────┐
        ▼              ▼                 ▼                 ▼              ▼
    IDENTITY       TERRITORY        MARKETPLACE        OPERATIONS        AI
    (Auth/RBAC)  (Places/Twin)     (Reservations)    (Control Tower)  (Gateway)
        │              │                 │                 │              │
        └──────────────┴─────────────────┼─────────────────┴──────────────┘
                                         ▼
                                 SHARED FOUNDATION
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
             FIRESTORE DB          FIREBASE AUTH        STORAGE / CDN
```

### Reglas de Dependencia y Desacoplamiento:
1. **Unidireccionalidad**: La capa de interfaz (UI/App Router) consume la capa de Servicios y Dominios; los Dominios consumen la Infraestructura tipada.
2. **Cero Dependencias Circulares**: Los paquetes `@baqueano/types`, `@baqueano/validators` y `@baqueano/config` son hojas inmutables del árbol de dependencias.
3. **Aislamiento de Servicios Externos**: Proveedores como pasarelas de pago, motores de mapas e IA operan detrás de interfaces abstractas.

---

## 📦 3. QUÉ (WHAT / COMPONENTES DE PLATAFORMA)

- **`apps/web`**: Experiencia pública turística, explorador de rutas, planificador AI y endpoints de Partner API (`/api/v1/`).
- **`apps/admin`**: Panel de control unificado con módulos de contenido, operaciones territoriales (`/control-tower`) y plataforma institucional (`/plataforma`).
- **`packages/types`**: Contratos tipados de datos (`OrganizationRecord`, `ApiKeyRecord`, `DataGovernanceRecord`).
- **`packages/validators`**: Validación estricta con esquemas Zod en todas las fronteras de entrada.
