# TAXONOMÍA REGIONAL DE ATRACTIVOS, EXPERIENCIAS & CATEGORÍAS

## 1. Núcleo Taxonómico Común

Para mantener interoperabilidad entre países sin fragmentar los filtros de búsqueda ni el motor de recomendaciones AI:

```typescript
export const CORE_TOURISM_CATEGORIES = [
  { id: "volcanoes", esLabel: "Volcanes & Cráteres", enLabel: "Volcanoes & Craters" },
  { id: "nature_reserves", esLabel: "Reservas Naturales & Bosques", enLabel: "Nature Reserves & Rainforests" },
  { id: "beaches_coastal", esLabel: "Playas & Costas", enLabel: "Beaches & Coastlines" },
  { id: "lakes_rivers", esLabel: "Lagos, Lagunas & Ríos", enLabel: "Lakes, Lagoons & Rivers" },
  { id: "rural_community", esLabel: "Turismo Rural Comunitario", enLabel: "Rural Community Tourism" },
  { id: "culture_heritage", esLabel: "Cultura, Historia & Patrimonio", enLabel: "Culture, History & Heritage" },
  { id: "gastronomy", esLabel: "Gastronomía Autóctona", enLabel: "Local Gastronomy" },
  { id: "adventure_sports", esLabel: "Aventura & Senderismo Extremo", enLabel: "Adventure & Hiking" }
] as const;
```

---

## 2. Extensiones Territoriales Específicas

Cada país puede asociar etiquetas o categorías contextuales complementarias (ej: "Ruta del Café" en Nicaragua/Costa Rica, "Sitios Mayas" en Guatemala), vinculándolas a la categoría principal sin romper las consultas globales.
