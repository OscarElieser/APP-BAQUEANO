# ADR 0006: ARQUITECTURA DE PAÍS & ENRUTAMIENTO REGIONAL EN NEXT.JS

## Estado
Aprobado

## Contexto
Baqueano evoluciona de una plataforma centrada exclusivamente en Nicaragua hacia una plataforma regional para Centroamérica. Se requiere una estrategia de enrutamiento que preserve el 100% del SEO existente de Nicaragua, los deep links de la aplicación móvil Flutter y admita la incorporación progresiva de nuevos países (Costa Rica, Guatemala, etc.).

## Decisión
1. Adoptar el principio **"Single Core, Multiple Territorial Configurations"**.
2. Preservar las rutas sin prefijo (`/destinos/...`, `/mapa`, etc.) como canónicas para Nicaragua.
3. Admitir prefijos de país (`/ni/...`, `/cr/...`, `/gt/...`) con mapeo determinístico a configuraciones territoriales aisladas.
4. Centralizar la configuración de países en `@baqueano/config` con validación Zod.

## Consecuencias
- Cero forks de código por país.
- Mantenimiento centralizado y alta velocidad de iteración.
- Compatibilidad absoluta con la app Android existente.
