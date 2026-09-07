# ADR 0012: Orquestación Multiagente y Niveles Normativos de Autonomía

## Estado
Aceptado (2026-09-07)

## Contexto
El sistema requería evolucionar de un asistente de conversación simple a un ecosistema de coordinación de tareas turísticas sin crear un "God Agent" incontrolable ni delegar autorizaciones críticas a modelos probabilísticos.

## Decisión
1. Dividir las responsabilidades entre 10 agentes especializados acotados por esquema de entrada y herramientas permitidas.
2. Establecer un Policy Engine determinístico independiente con 5 niveles de autonomía (Nivel 0: Solo Lectura, Nivel 1: Preparar, Nivel 2: Escritura Reversible, Nivel 3: Escritura Sensible, Nivel 4: Prohibido).
3. Limitar a 6 pasos la ejecución secuencial de cualquier workflow, con detección activa de ciclos.

## Consecuencias
- **Positivas**: Arquitectura modular, predecible y segura; trazabilidad completa por agente; costos de tokens acotados.
- **Negativas / Mitigaciones**: Necesidad de coordinar múltiples esquemas de herramientas; mitigado mediante tipado TypeScript estricto en `packages/types` y validadores Zod.
