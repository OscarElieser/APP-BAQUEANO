# 🧭 ORGANIZATION MODEL — MODELO MULTI-ORGANIZACIONAL & MEMBRESÍAS

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Permitir la participación organizada de entidades colectivas (cooperativas de guías, alcaldías municipales, operadores territoriales e instituciones oficiales) en Baqueano, separando la identidad del usuario de su afiliación institucional.

---

## ⚙️ 2. CÓMO (HOW / TAXONOMÍA, MEMBRESÍAS & ALCANCE TERRITORIAL)

El modelo distingue claramente entre **Quién es el usuario** (`UserRecord`) y **A qué organización pertenece** (`OrganizationMembership`):

```text
[Usuario Autenticado]
        │
        ▼
[OrganizationMembership] ────► [Rol: org_admin | org_operator | org_auditor | org_member]
        │
        ▼
[OrganizationRecord] ────────► [Tipo: cooperative | municipality | institution_official]
        │
        ▼
[Territorial Scope] ─────────► [Departamentos / Municipios Autorizados]
```

### Tipos de Organización:
- `central_platform`: Baqueano Central (visibilidad y gobernanza global de la plataforma).
- `institution_official`: Instituciones gubernamentales de turismo o protección ambiental (e.g. INTUR).
- `municipality`: Alcaldías municipales con atribuciones de monitoreo y alertas locales.
- `cooperative`: Cooperativas y asociaciones de base comunitaria y guías locales.
- `territorial_operator`: Operadores de ecoturismo autorizados.
- `tourism_association`: Cámaras y gremios territoriales.

---

## 📦 3. QUÉ (WHAT / CONTRATOS TÉCNICOS)

```typescript
export interface OrganizationRecord {
  readonly id: string;
  readonly name: string;
  readonly legalName: string;
  readonly type: OrganizationType;
  readonly status: OrganizationStatus;
  readonly territories: readonly string[];
  readonly permissions: readonly string[];
  readonly contactEmail: string;
  readonly contactPhone?: string;
  readonly taxId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OrganizationMembership {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly role: OrganizationMemberRole;
  readonly status: "active" | "invited" | "suspended";
  readonly scope: readonly string[];
  readonly assignedAt: string;
}
```
