# 🧭 ARQUITECTURA DE INTEGRACIÓN DE PAGOS BANCARIOS — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Definir la arquitectura de pasarelas de cobro digital para experiencias turísticas en Nicaragua, manteniendo desacoplada la plataforma de un banco en particular y garantizando el cumplimiento riguroso de normativas de seguridad financiera internacional (PCI-DSS).

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & SEGURIDAD)

- **Cero Almacenamiento de Datos Sensibles**: Baqueano jamás recibe, procesa ni almacena números de tarjeta completos (PAN), códigos de seguridad (CVV) ni contraseñas bancarias (PIN).
- **Patrón Adaptador Desacoplado**:

```text
CAPA DE NEGOCIO (Baqueano Payment Service)
                  │
                  ▼
     PaymentProviderAdapter (Interface)
      ├── BAC Credomatic Adapter
      ├── LAFISE Bancentro Adapter
      └── Banpro Promerica Adapter
```

- **Clasificación Transparente**: Al no contarse con credenciales bancarias de producción activas, la pasarela se clasifica como `⚪ PENDIENTE`.

---

## 📦 3. QUÉ (WHAT / ESTADO DE PROVEEDORES BANCARIOS)

| Pasarela Bancaria | Estado de Integración | Monedas Soportadas | Tokenización | Próxima Acción Requerida |
| --- | --- | --- | --- | --- |
| **BAC Credomatic (Compra-Click)** | ⚪ PENDIENTE | `NIO`, `USD` | Redirección segura / iFrame SDK | Firma de contrato comercial y credenciales Sandbox. |
| **LAFISE Bancentro** | ⚪ PENDIENTE | `NIO`, `USD` | Web Checkout API | Obtención de llaves de prueba API v2. |
| **Banpro Promerica** | ⚪ PENDIENTE | `NIO`, `USD` | Pasarela Directa | Evaluación técnica de especificación de webhooks. |
