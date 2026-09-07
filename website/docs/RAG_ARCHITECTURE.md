# 🧭 ARQUITECTURA RAG (RETRIEVAL-AUGMENTED GENERATION) — BAQUEANO AI

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Fundamentar cada respuesta, sugerencia y planificación generada por Baqueano AI en datos reales, verificados y actualizados de Nicaragua, erradicando alucinaciones de lugares inexistentes, precios inventados o ubicaciones erróneas.

---

## ⚙️ 2. CÓMO (HOW / FUENTES Y PROCESO DE RECUPERACIÓN)

- **Fuentes de Conocimiento Verificadas**:
  - Colección `places`: Coordenadas, fotos, horarios y descripciones de atractivos.
  - Colección `businesses`: Anfitriones y cooperativas comunitarias activas.
  - Colección `territories`: 15 departamentos + RACCN y RACCS con identidad cultural y ambiental.
- **Filtrado por Estado**: La IA solo puede recuperar documentos con `status == 'published'` y `verified == true`.
- **Top-K y Ventana de Contexto**: Recuperación de los 5 a 10 documentos más relevantes según la intención del usuario para evitar sobrecarga de tokens.

---

## 📦 3. QUÉ (WHAT / ESQUEMA DE CITACIÓN Y ATRIBUCIÓN)

Cada itinerario generado incluye la propiedad `sourcesCount` y el listado de paradas con identificador oficial de lugar (`placeId`), permitiendo al frontend renderizar enlaces directos a las fichas oficiales del catálogo.
