# MODELO DE DATOS: PAÍSES & ENTIDADES TERRITORIALES REGIONALES

## 1. Definición de la Entidad País (`CountryRecord`)

El modelo `CountryRecord` encapsula la identidad jurídica, monetaria, lingüística, cartográfica y operativa de cada nación centroamericana dentro de la plataforma Baqueano:

```typescript
export interface CountryRecord {
  id: string;                               // Código ISO 3166-1 alfa-2 (ej: "NI", "CR", "GT")
  code: CountryCode;                        // "NI" | "CR" | "GT" | "HN" | "SV" | "BZ" | "PA"
  name: string;                             // Nombre común (ej: "Nicaragua", "Costa Rica")
  officialName: string;                     // Nombre protocolar (ej: "República de Nicaragua")
  status: CountryStatus;                    // "PLANNED" | "CONFIGURING" | "PILOT" | "ACTIVE" | "PAUSED" | "ARCHIVED"
  defaultLocale: LocaleCode;                // Locale principal (ej: "es-NI", "es-CR", "en")
  supportedLocales: readonly LocaleCode[];  // Locales soportados oficialmente
  defaultCurrency: CurrencyCode;            // Divisa principal ("NIO", "CRC", "GTQ", "USD", etc.)
  supportedCurrencies: readonly CurrencyCode[];
  timezone: string;                         // Identificador IANA (ej: "America/Managua")
  territorialStructure: {
    level1Label: string;                    // "Departamento / Región Autónoma", "Provincia", "Distrito"
    level2Label: string;                    // "Municipio", "Cantón", "Ciudad / Villa"
    hasIndigenousTerritories: boolean;
    indigenousTerritoryLabel?: string;
  };
  capabilities: RegionalCapabilityMap;      // Capacidades activas en el país
  emergencyInfo: CountryEmergencyInfo;      // Números oficiales verificados (Policía, Cruz Roja, SOS)
  mapCenterCoordinates: {
    latitude: number;
    longitude: number;
    defaultZoom: number;
  };
  activePartnersCount: number;
  verifiedDestinationsCount: number;
  verifiedBusinessesCount: number;
  launchStageDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Abstracción Territorial Dinámica

Para evitar el acoplamiento a la división político-administrativa de un solo país, Baqueano implementa la jerarquía:

```
Country (Nivel 0: País ISO-2)
  ├── AdministrativeLevel1 (Nivel 1: Departamento, Provincia, Distrito)
  │     ├── AdministrativeLevel2 (Nivel 2: Municipio, Cantón, Villa)
  │     │     └── Place / Destination (Destino, Atractivo, Comunidad)
  │     └── IndigenousTerritory (Opcional: Territorio Comunitario / Comarca)
```

### Ejemplos Reales:
- **Nicaragua**: País (`NI`) → Departamento (`León`) → Municipio (`Nagarote`) → Destino (`Playa Miramar`).
- **Costa Rica**: País (`CR`) → Provincia (`Guanacaste`) → Cantón (`Santa Cruz`) → Destino (`Playa Tamarindo`).
- **Guatemala**: País (`GT`) → Departamento (`Sololá`) → Municipio (`Panajachel`) → Destino (`Lago de Atitlán`).
