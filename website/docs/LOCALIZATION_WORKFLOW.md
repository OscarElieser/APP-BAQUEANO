# FLUJO DE LOCALIZACIÓN CULTURAL & TRADUCCIÓN (I18N WORKFLOW)

## 1. Localización vs Traducción Literal

Baqueano distingue formalmente entre:
- **Cadenas de Interfaz (UI Strings)**: Textos utilitarios como "Explorar", "Mapa", "Buscar", "Filtrar", gestionados mediante diccionarios JSON tipados con fallback a `es-NI`.
- **Contenido Editorial & Cultural**: Historias comunitarias, descripciones de senderos, saberes ancestrales y gastronomía, que requieren revisión humana especializada.

---

## 2. Ciclo de Vida de una Traducción (`LocalizationStatus`)

```
[MISSING] (Contenido original sin traducción)
    ↓
[MACHINE_GENERATED / DRAFT] (Borrador asistido por IA)
    ↓
[REVIEWED] (Revisado por experto local o baqueano comunitario)
    ↓
[PUBLISHED] (Activo en la web pública con atribución y versión)
```

---

## 3. Manejo de Idiomas Indígenas y Comunitarios

- La plataforma soporta metadatos y audioguías en lenguas locales (como Miskito en Nicaragua o lenguas Maya en Guatemala).
- **Regla Estricta**: Queda terminantemente prohibido generar traducciones automáticas sin sentido en lenguas originarias; todo contenido en estas lenguas debe ser provisto directamente por las comunidades u organizaciones aliadas.
