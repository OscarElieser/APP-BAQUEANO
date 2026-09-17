# MATRIZ DE CAPACIDADES REGIONALES (COUNTRY CAPABILITIES)

## 1. Concepto de Capacidad Impulsada por Configuración (Capability-Driven UI)

La plataforma Baqueano nunca muestra botones o flujos rotos (como "Reservar en línea" o "Pagar con tarjeta local") en territorios donde la infraestructura comercial, bancaria o física no ha sido homologada.

La interfaz pública y administrativa consulta dinámicamente `country.capabilities` para renderizar exclusivamente módulos verificados.

---

## 2. Matriz de Capacidades Actual por País

| Capacidad Técnica | Nicaragua (`NI`) | Costa Rica (`CR`) | Guatemala (`GT`) | Honduras (`HN`) | El Salvador (`SV`) | Belice (`BZ`) | Panamá (`PA`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Destinos Verificados** | `✅ ACTIVO` | `✅ ACTIVO` | `✅ ACTIVO` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` |
| **Negocios Campesinos** | `✅ ACTIVO` | `🟡 PILOTO` | `🟡 PILOTO` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` |
| **Reservas y Disponibilidad**| `✅ ACTIVO` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` |
| **Pasarelas de Pago Online** | `✅ ACTIVO` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` |
| **Baqueano AI Territorial** | `✅ ACTIVO` | `✅ ACTIVO` | `✅ ACTIVO` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` |
| **Smart Tourism & IoT** | `✅ ACTIVO` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` |
| **Operaciones de Campo** | `✅ ACTIVO` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` | `⚪ PENDIENTE` |

---

## 3. Comportamiento de Baqueano AI frente a Capacidades

- Si un usuario consulta: *"¿Puedo reservar un hotel en el Lago Atitlán con Baqueano?"*, el modelo responderá con honestidad:
  > *"Actualmente en Guatemala el módulo de exploración y rutas con Baqueano AI está activo, pero la pasarela de reservas directas está en fase piloto. Te recomendamos contactar directamente a la cooperativa comunitaria local."*
- El modelo tiene prohibido inventar precios, pasarelas de pago o enlaces de reserva no soportados en ese país.
