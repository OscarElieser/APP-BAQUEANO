# 🧪 PLAN DE PRUEBAS Y VALIDACIÓN E2E DE MARKETPLACE — FASE 7 (BAQUEANO)

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Validar exhaustivamente los flujos comerciales y de interacción de la Fase 7 antes de exponer anfitriones o exploradores a procesos transaccionales reales en producción, garantizando la integridad de datos, la seguridad RBAC y la estabilidad del build.

---

## ⚙️ 2. CÓMO (HOW / METODOLOGÍA DE PRUEBAS)

- **Circuitos E2E Críticos**:
  - **Circuito 1 (Reserva)**: Explorador solicita visita → Notificación generada → Anfitrión confirma → Explorador recibe confirmación con snapshot de precios.
  - **Circuito 2 (Gestión de Anfitrión)**: Anfitrión se autentica → Modifica horario/servicios → Publicación reflejada en web pública.
  - **Circuito 3 (Reputación)**: Explorador con visita completada envía reseña → Queda en moderación → Anfitrión emite respuesta oficial.
  - **Circuito 4 (Seguridad Negativa)**: Intento de Anfitrión A de consultar reservas del Anfitrión B → Acceso denegado (HTTP 403).

---

## 📦 3. QUÉ (WHAT / COMANDOS DE VALIDACIÓN AUTOMATIZADA)

```bash
# 1. Validación de estilo y buenas prácticas
corepack pnpm lint

# 2. Comprobación estricta de tipos en TypeScript
corepack pnpm typecheck

# 3. Smoke tests de rutas y contratos
corepack pnpm test

# 4. Compilación completa de producción para Web y Admin
corepack pnpm build

# 5. Confirmación de aislamiento de Android
git diff --stat -- lib android test pubspec.yaml
```
