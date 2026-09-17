# PRIVACIDAD PREDICTIVA: MODELADO AGREGADO & PROTECCIÓN DE SEGMENTOS

## 🔒 1. Principio Fundamental: Predecir Territorios, No Personas

- **Datos Agregados Exclusivamente**: Las señales de demanda agrupan visitas por destino o municipio; nunca se almacenan series de tiempo a nivel de usuario individual.
- **Protección de Grupos Pequeños (k-anonymity)**: Si un destino cuenta con menos de 5 registros diarios, las señales se agregan a nivel departamental para evitar inferencias individuales.
- **Cero Datos Sensibles**: Queda prohibido el uso de género, origen étnico, religión, preferencias políticas o de salud en los vectores de características predictivas.
