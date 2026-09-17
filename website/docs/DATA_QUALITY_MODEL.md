# 🧭 DATA QUALITY MODEL — MODELO DE CALIDAD DE DATOS & INTEGRIDAD TERRITORIAL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Asegurar que todas las métricas, coordenadas, reportes y estados emitidos por la Torre de Control y el Gemelo Digital Territorial sean verídicos, consistentes, libres de duplicados y validados antes de impactar las decisiones de viaje de los usuarios.

---

## ⚙️ 2. CÓMO (HOW / DIMENSIONES DE CALIDAD & VALIDACIÓN ZOD)

El ecosistema evalúa la calidad de datos bajo cinco dimensiones cardinales:

1. **Exactitud**: Coordenadas geográficas dentro de los límites políticos oficiales de Nicaragua (Lat 10.7° a 15.0° N, Lon -87.7° a -82.5° W).
2. **Completitud**: Todo registro de territorio contiene métricas obligatorias validadas por `territoryOperationalStateSchema`.
3. **Puntualidad**: Reportes con antigüedad mayor a 4 horas se marcan automáticamente como `no_data` para evitar falsas sensaciones de normalidad.
4. **Consistencia**: El conteo total de incidencias activas en el dashboard coincide exactamente con la suma de incidencias por territorio.
5. **Trazabilidad**: Todo cambio de estado operacional cuenta con identificador de usuario y marca de tiempo UTC.

```text
[Datos Brutos de Entrada]
           │
           ▼
[Zod Schema Validation] ─── (Rechazo inmediato si esquema falla)
           │
           ▼
[Geographic & Timestamp Sanity Checks]
           │
           ▼
[Almacenamiento Confiable en Firestore]
```

---

## 📦 3. QUÉ (WHAT / ESQUEMAS FORMALES DE INTEGRIDAD)

- **`territoryOperationalStateSchema`**: Valida 14 campos estrictos de estado operacional.
- **`incidentRecordSchema`**: Valida severidad, roles de reporte y estructura de bitácora.
- **`alertRecordSchema`**: Valida vigencia, alcance territorial e instrucciones operativas.
