# MODELO DE DATOS: SMART POINTS (PUNTOS INTELIGENTES TERRITORIALES)

## 1. Definición del Smart Point

Un **Smart Point** es un elemento físico o virtual georreferenciado en el territorio nicaragüense que actúa como ancla de interacción, información contextual, monitoreo ambiental y seguridad para los exploradores y baqueanos.

---

## 2. Estructura de Datos (`SmartPointRecord`)

```typescript
export interface SmartPointRecord {
  id: string;                    // Identificador único (ej: "sp-miraflor-01")
  slug: string;                  // Slug amigable para URL QR/NFC (ej: "miraflor-entrada")
  name: string;                  // Nombre del punto (ej: "Entrada Principal & Mirador Los Cedros")
  type: SmartPointType;          // Tipo de punto territorial
  status: SmartPointStatus;      // Estado operativo actual
  location: {
    lat: number;
    lng: number;
    altitudeMeters?: number;
    department: string;
    municipality: string;
    protectedArea?: string;
  };
  qrCodeUrl: string;             // URL canónica resuelta al escanear QR
  nfcTagId?: string;             // ID único del chip NFC físico (ej: NTAG213/NTAG215)
  description: string;
  facilities: string[];          // Servicios disponibles (agua potable, baños, primeros auxilios, etc.)
  liveAforo?: {
    currentEstimatedVisitors: number;
    maxCapacity: number;
    densityStatus: "LOW" | "MODERATE" | "HIGH" | "CAPACITY_REACHED";
    lastCalculatedAt: string;
  };
  environmentalAlerts?: {
    level: "INFO" | "WARNING" | "DANGER";
    message: string;
    issuedAt: string;
  }[];
  audioGuide?: {
    spanishUrl?: string;
    englishUrl?: string;
    miskitoUrl?: string;
    durationSeconds: number;
  };
  conservationRules: string[];
  emergencyContact: {
    phone: string;
    radioFrequency?: string;
    stationName: string;
  };
  associatedDeviceIds?: string[];
  totalScans: number;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Tipología de Puntos (`SmartPointType`)

- **`TRAILHEAD`**: Entrada o inicio de sendero con registro de excursionistas y advertencias de dificultad.
- **`INTERPRETIVE_STATION`**: Estación de educación ambiental, flora, fauna o patrimonio cultural rural.
- **`VIEWPOINT`**: Mirador paisajístico con orientación panorámica y datos geográficos.
- **`SHELTER_SAFETY`**: Refugio de montaña o punto de seguridad con radiofrecuencia y kit de primeros auxilios.
- **`COMMUNITY_CENTER`**: Casa comunal, cooperativa campesina o centro de atención al visitante.
- **`KIOSK_TOTEM`**: Estructura de autoatención interactiva con pantalla táctil e información digital.
