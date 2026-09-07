# 🧭 DISASTER RECOVERY — PLAN DE RECUPERACIÓN ANTE DESASTRES & RESILIENCIA

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Asegurar la pronta y ordenada recuperación del ecosistema Baqueano ante eventos catastróficos (corrupción mayor de datos, desastre de infraestructura Cloud o compromiso de credenciales), definiendo objetivos realistas de tiempo y pérdida de datos.

---

## ⚙️ 2. CÓMO (HOW / RTO, RPO & ESTRATEGIA DE BACKUPS)

- **Recovery Time Objective (RTO)**: **2 Horas** (Tiempo máximo para restaurar servicios esenciales tras una falla total).
- **Recovery Point Objective (RPO)**: **1 Hora** (Pérdida máxima tolerable de datos transaccionales).

```text
[Firestore Productivo (us-central1)]
                 │
                 ▼ (Exportación Diaria Automática + Snapshots)
[Google Cloud Storage Dual-Region (Iowa / South Carolina)]
                 │
                 ▼ (Prueba Mensual de Restauración)
[Staging Recovery Sandbox Environment] ──► Resultado: PASSED (01/09/2026)
```

### Escenarios de Desastre y Respuestas Formales:
1. **Corrupción de Colección en Firestore**:
   - Detener escrituras mediante conmutador de emergencia (`read-only mode`).
   - Restaurar la última exportación limpia desde GCS a una colección paralela temporal.
   - Reconciliar transacciones del período intermedio mediante `audit_logs`.
2. **Despliegue Fallido en Producción (Bad Deploy)**:
   - Rollback inmediato en hosting a la versión previa inmutable (tiempo estimado: &lt; 2 minutos).
3. **Compromiso de Clave de Servicio / API Key**:
   - Revocación instantánea en Firebase Console / IAM y emisión de nuevas credenciales.

---

## 📦 3. QUÉ (WHAT / PROTOCOLO DE CONMUTADORES DE CORTE (KILL SWITCHES))

La consola de administración (`/plataforma`) dispone de interruptores independientes para aislar subsistemas degradados:
- `ai_gateway_enabled`: Desactiva llamadas al modelo sin afectar el resto de la web.
- `partner_api_enabled`: Pausa temporal de endpoints `/api/v1/` para mitigar abusos de tráfico.
- `experimental_payments_enabled`: Bloquea nuevos flujos de pago si la pasarela reporta inconsistencias.
