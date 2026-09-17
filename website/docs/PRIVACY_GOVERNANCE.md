# 🧭 PRIVACY GOVERNANCE — PRIVACIDAD POR DISEÑO & GOBERNANZA DE DATOS PERSONALES

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Proteger la privacidad, confidencialidad y derechos de los exploradores, anfitriones y comunidades locales, garantizando que el tratamiento de datos personales sea transparente, consentido y seguro.

---

## ⚙️ 2. CÓMO (HOW / PRINCIPIOS DE PRIVACIDAD POR DISEÑO)

1. **Minimización de Datos Personales**:
   - No se almacenan datos innecesarios de navegación o geolocalización continua en tiempo real.
   - La telemetría solo registra eventos anónimos de interacción (`route_planned`, `filter_applied`).
2. **Cero PII en Logs y Analítica**:
   - Los registros de auditoría y los identificadores de eventos de analítica utilizan hashes irreversibles o UIDs opacos.
3. **Derechos de Acceso, Rectificación y Supresión (ARCO)**:
   - Todo usuario puede solicitar la consulta o eliminación de su cuenta y reservas asociadas (respetando las obligaciones fiscales de retención contable de transacciones).

---

## 📦 3. QUÉ (WHAT / PROTOCOLO DE ATENCIÓN DE SOLICITUDES DE DATOS)

```text
[Solicitud de Usuario / Host]
              │
              ▼
    [Verificación de Identidad]
              │
    ┌─────────┴─────────┐
    ▼                   ▼
[Exportación de Datos] [Anonimización / Borrado]
```

- **Plazo de Respuesta Técnico**: &lt; 72 horas hábiles tras la validación de identidad.
- **Retención Excepcional por Ley**: Las facturas y comprobantes fiscales se preservan en estado bloqueado por 7 años conforme a las normas tributarias aplicables.
