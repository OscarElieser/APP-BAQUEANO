# GESTIÓN FINOPS & CONTROL DE COSTOS DE LA PLATAFORMA DE APIs

## 1. Eficiencia de Costos en Open Data

Para permitir un alto volumen de descargas y consultas de datos abiertos sin incurrir en costos elevados en Google Cloud / Firebase:

1. **Edge Caching con CDN**: Los endpoints de `/api/open/v1/*` devuelven cabeceras `Cache-Control: public, s-maxage=3600`, permitiendo que hasta el 95% del tráfico sea absorbido por los nodos perimetrales del CDN sin consultar la base de datos de origen.
2. **Generación de Snapshots Estáticos**: Las descargas masivas de datasets se sirven desde archivos JSON/CSV pre-generados en lugar de ejecutar serializaciones costosas en tiempo real.
3. **Control de Abuso y Cuotas por Cliente**: Monitoreo de solicitudes en tiempo real para evitar que scrapers o integradores defectuosos generen picos de costo anómalos.
