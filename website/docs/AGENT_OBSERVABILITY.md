# OBSERVABILIDAD & TRAZABILIDAD DE AGENTES

## 1. Registro de Trazas (*Agent Traces*)
Cada invocación de una herramienta registra:
- `workflowId`, `agentId`, `toolName`, `autonomyLevel`, `latencyMs`, `success`, `errorMessage` y `timestamp`.

## 2. Global AI Kill-Switch & Circuit Breaker
Si un agente o herramienta externa presenta una tasa de fallos superior al 15% en un lapso de 5 minutos, el Circuit Breaker degrada temporalmente la experiencia al modo manual no-IA sin interrumpir la operatividad del sitio web.
