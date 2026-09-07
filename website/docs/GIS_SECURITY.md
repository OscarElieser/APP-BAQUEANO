# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — SEGURIDAD GEOESPACIAL (GIS SECURITY)
# ============================================================================

## 1. Protección de Credenciales y Llaves de Mapas

1. **Restricción de Dominio Estricta**:
   - Toda API Key pública de mapas utilizada en el cliente web está restringida estrictamente a los dominios autorizados (`app-baqueano.web.app`, `*.baqueano.ni`, `localhost:3000`).
2. **Aislamiento de Llaves de Servidor**:
   - Las llaves con permisos de geocodificación por lotes o enrutamiento avanzado residen únicamente en variables de entorno del servidor (`process.env.GOOGLE_MAPS_SERVER_KEY`) y jamás son expuestas al bundle de frontend.
3. **Prevención de IDOR Espacial (Insecure Direct Object Reference)**:
   - Todo endpoint de edición o actualización de coordenadas valida que el usuario autenticado sea el anfitrión propietario legítimo del recurso o cuente con rol `super_admin`/`admin`.

---

## 2. Auditoría de Cambios de Coordenadas de Alto Impacto

- Cualquier modificación de coordenadas en un destino publicado que represente un desplazamiento mayor a **500 metros** (`GIS_THRESHOLDS_CONFIG.highImpactMoveThresholdMeters`):
  1. Se marca automáticamente en estado `review`.
  2. Genera un registro en la colección `geo_audit_logs`.
  3. Notifica al Control Tower para verificación antes de reflejarse en las búsquedas públicas.
