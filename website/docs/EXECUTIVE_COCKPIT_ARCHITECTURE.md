# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — ARQUITECTURA DEL EXECUTIVE COCKPIT
# ============================================================================

## 1. Diseño de la Experiencia Ejecutiva
El Cockpit Ejecutivo (`/admin/strategic`) está concebido bajo el principio de **claridad sobre espectáculo**:
- **Consola HUD Glassmorphism**: Interfaz oscura de alto contraste (`#06151f`, `#165D6F`, `#F65E01`, `#F4E6C1`).
- **Nivel Superior Conciso**: Muestra inicialmente solo las señales activas y métricas críticas consolidadas.
- **Drill-down Trazable**: Permite navegar desde el total país (Nicaragua) hasta el departamento, municipio y ficha técnica específica con su fórmula y procedencia.

## 2. Jerarquía de Navegación
```text
/admin/strategic/            → Cockpit Ejecutivo Consolidado & Copiloto
/admin/strategic/scenarios   → Sala de Escenarios (What-If Studio)
/admin/strategic/scorecard   → Cuadro de Mando Integral (Metas vs Modelos)
/admin/strategic/briefing    → Generador de Resumen Semanal & Exportación
```

## 3. Adaptabilidad Multi-dispositivo
- **Desktop (1440px - 2560px)**: Vista panorámica con matriz de cuadrantes, telemetría y consola interactiva de copiloto.
- **Tablet (768px - 1024px)**: Disposición de dos columnas con controles colapsables.
- **Mobile (390px - 430px)**: Priorización de señales de atención y KPIs consolidados.
