# 🧭 REALTIME ARCHITECTURE — SINCRONIZACIÓN Y ARQUITECTURA EN TIEMPO REAL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Asegurar que los cambios en el estado operativo de los 17 territorios (alertas climáticas, incidencias de transporte, límites de capacidad) se propaguen a la Torre de Control y a las aplicaciones de los usuarios en milisegundos con mínimo consumo de ancho de banda y batería.

---

## ⚙️ 2. CÓMO (HOW / ESTRATEGIA DE SNAPSHOTS Y AGREGACIÓN EFICIENTE)

Para balancear tiempo real con optimización de costos en Firestore:

```text
[Cambio de Estado Territorial en Firestore]
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
 [onSnapshot Admin]        [Cached Static Read]
   Torre de Control          Páginas Públicas Web
  (Latencia < 200ms)         (Cache S-MaxAge 60s)
```

- **Torre de Control (Admin)**: Suscripción a nivel de colección para `incidents` y `alerts` activas mediante listeners reactivos de Firestore.
- **Páginas Públicas Web**: Revalidación periódica bajo demanda (Incremental Static Regeneration o ISR de 60s) para evitar lecturas masivas innecesarias.
- **App Móvil Android**: Sincronización offline-first con persistencia local SQLite/Room y reconexión automática cuando hay cobertura de red.

---

## 📦 3. QUÉ (WHAT / CONTRATOS DE TELEMETRÍA Y RENDIMIENTO)

1. **Latencia P95 de Notificación de Alerta**: &lt; 500 ms desde la publicación hasta la recepción en el cliente admin.
2. **Backoff Exponencial en Desconexión**: Intervalos de reconexión de 1s, 2s, 4s, 8s hasta un máximo de 30s.
3. **Consumo de Datos en Modo Ahorro**: &lt; 50 KB por sesión de consulta territorial en áreas rurales.
