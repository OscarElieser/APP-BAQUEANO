# MODELO DE SEGURIDAD & DEFENSA CONTRA PROMPT INJECTION

## 1. Defensa contra Inyección de Prompts (*Data is not Instruction*)
Todos los datos externos recuperados de bases de datos, APIs de aliados o descripciones de anfitriones se tratan estrictamente como **datos inertes** y nunca como instrucciones operativas para el modelo.

## 2. Aislamiento Estricto
- **Aislamiento Multi-Usuario**: Las sesiones y memoria de contexto de un explorador jamás se comparten ni filtran a otros usuarios.
- **Aislamiento Multi-País y Multi-Organización**: Los agentes validan el `countryScope` y `organizationId` del actor antes de permitir el acceso a recursos privados.
- **Cero Ejecución de Código Arbitrario**: Los agentes no tienen acceso a shells, llamadas HTTP abiertas ni ejecución dinámica de scripts.
