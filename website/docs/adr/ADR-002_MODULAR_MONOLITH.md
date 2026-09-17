# 🧭 ADR-002: MONOLITO MODULAR EN LUGAR DE MICROSERVICIOS

## 🎯 1. Contexto (Context)
Con el crecimiento de Baqueano a 10 dominios funcionales (identidad, territorio, marketplace, reservas, pagos, contenido, IA, operaciones, analítica e integración), se analizó la opción de descomponer la aplicación en microservicios independientes desplegados en Kubernetes.

---

## ⚙️ 2. Decisión (Decision)
Se decide **adoptar una arquitectura de Monolito Modular (Modular Monolith) dentro de un monorepo pnpm estructurado en TypeScript**, rechazando la división prematura en microservicios.

### Razones Técnicas:
1. **Evitar la Complejidad Distribuida**: Los microservicios introducen problemas de consistencia eventual, transacciones distribuidas (Sagas), latencia de red inter-servicio y costos elevados de observabilidad.
2. **Límites de Dominio Claros en Código**: La modularidad se garantiza mediante fronteras de paquetes (`@baqueano/types`, `@baqueano/validators`, `@baqueano/config`) y servicios desacoplados.
3. **Velocidad de Entrega**: Un solo equipo de ingeniería puede evolucionar y refactorizar dominios con total seguridad de tipos de extremo a extremo sin lidiar con orquestadores complejos.

---

## 📦 3. Consecuencias (Consequences)
- **Positivas**: Despliegues atómicos, depuración unificada, latencia cero entre llamadas internas y costos de infraestructura mínimos.
- **Regla de Extracción**: Solo se extraerá un dominio como servicio independiente si tiene un requisito de escalado radicalmente dispar o una frontera de seguridad aislada por normativa.
