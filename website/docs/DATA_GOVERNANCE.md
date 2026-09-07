# 🧭 DATA GOVERNANCE — MODELO FORMAL DE GOBIERNO DE DATOS

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Garantizar la calidad, trazabilidad, ciclo de vida, privacidad y seguridad de toda la información manejada por Baqueano, estableciendo reglas claras de minimización de datos, retención obligatoria y procedimientos de eliminación controlada.

---

## ⚙️ 2. CÓMO (HOW / POLÍTICAS DE GOBIERNO DE DATOS)

1. **Clasificación de 4 Niveles**:
   - `PUBLIC`: Información turística, rutas, mapas y alertas públicas visibles para cualquier visitante.
   - `INTERNAL`: Métricas operativas, analítica territorial y bitácoras de incidencias internas.
   - `CONFIDENTIAL`: Datos personales de exploradores y anfitriones (emails, teléfonos, preferencias de viaje).
   - `RESTRICTED`: Registros de pagos, logs de auditoría de seguridad y credenciales de acceso.

2. **Minimización de Datos**:
   - Solo se solicitan y almacenan los datos estrictamente necesarios para la experiencia y la seguridad del viaje.
   - Queda estrictamente prohibido recolectar datos "por si acaso se necesitan después".

3. **Inmutabilidad de Registros Críticos**:
   - Las transacciones financieras y las bitácoras de seguridad (`audit_logs`) son inmutables y no pueden ser eliminadas mediante la interfaz gráfica.

---

## 📦 3. QUÉ (WHAT / CICLO DE VIDA DE MIGRACIONES DE ESQUEMA)

Todo cambio relevante de esquema sigue el flujo obligatorio:

```text
DISEÑO DE ESQUEMA
        ↓
REVISIÓN DE COMPATIBILIDAD (Android + Web)
        ↓
BACKUP DE PRE-MIGRACIÓN
        ↓
DRY RUN EN ENTORNO STAGING
        ↓
APLICACIÓN CONTROLADA
        ↓
VERIFICACIÓN DE INTEGRIDAD
        ↓
VENTANA DE ROLLBACK
```
