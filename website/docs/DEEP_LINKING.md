# 🧭 ESTRATEGIA DE DEEP LINKING Y ENLACES UNIVERSALES — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Establecer un esquema unificado y canónico de URLs web que permita a exploradores compartir destinos, rutas e itinerarios en redes sociales y códigos QR físicos en territorio, posibilitando la transición fluida hacia la app Android nativa cuando esté instalada.

---

## ⚙️ 2. CÓMO (HOW / ESQUEMA DE RUTAS CANÓNICAS)

- **Estructura Semántica**: URLs limpias sin IDs numéricos opacos, basadas en slugs normalizados.
- **Mapeo Web ↔ Android**:

```text
URL Web: https://app-baqueano.web.app/destinos/canon-de-somoto
                         │
                         ▼
App Link Android: baqueano://place/place-somoto
```

- **Códigos QR Territoriales**: Generación de códigos QR para puntos de información turística en alcaldías y cooperativas que dirigen a la ficha web con opción de abrir la app.

---

## 📦 3. QUÉ (WHAT / MATRIZ DE DEEP LINKS)

| Ruta Web Canónica | Equivalente Android | Entidad / Destino |
| --- | --- | --- |
| `/destinos/:slug` | `baqueano://destinos/:slug` | Ficha de destino turístico |
| `/territorios/:slug` | `baqueano://territorios/:slug` | Ficha departamental o regional |
| `/mapa?placeId=:id` | `baqueano://mapa?placeId=:id` | Enfoque de pin en mapa interactivo |
| `/perfil/pasaporte` | `baqueano://pasaporte` | Pasaporte del explorador |
| `/host/mi-negocio` | `baqueano://host/mi-negocio` | Panel de anfitrión |
