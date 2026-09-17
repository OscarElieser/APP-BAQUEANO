# GOBIERNO DE DATOS ABIERTOS & PROTOCOLO DE PUBLICACIÓN

## 1. Proceso de Aprobación de Publicación de Datasets

Ningún dataset se publica como Open Data sin superar el flujo de 5 etapas:

```
[1. PROPUESTA] (Owner del Dataset define alcance y fuente)
       ↓
[2. SANITIZACIÓN & PROYECCIÓN] (Eliminación de campos internos y PII)
       ↓
[3. AUDITORÍA DE SEGURIDAD] (Revisión de riesgos y K-anonymity)
       ↓
[4. REVISIÓN LEGAL DE LICENCIA] (Verificación de derechos de autor y licencias CC)
       ↓
[5. PUBLICACIÓN & MONITOREO] (Generación de snapshots y alta en /open-data)
```

---

## 2. Roles y Responsabilidades

- **Data Steward (Responsable de Calidad)**: Verifica la completitud de coordenadas GPS y exactitud toponímica.
- **Privacy Engineer**: Audita que los datasets de aforo y Smart Points no permitan la re-identificación de personas ni vehículos.
- **Super Admin**: Otorga la autorización final para publicar el snapshot estático en el CDN.
