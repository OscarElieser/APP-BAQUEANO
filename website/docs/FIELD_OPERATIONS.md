# OPERACIONES DE CAMPO, MANTENIMIENTO & LOGÍSTICA EN TERRITORIO

## 1. Protocolo de Inspección y Mantenimiento

Para asegurar la continuidad operativa de los Smart Points y nodos sensores en áreas protegidas de difícil acceso, Baqueano establece tres niveles de mantenimiento:

### Nivel 1: Mantenimiento Preventivo Rutinario (Mensual / Bimensual)
- **Responsable**: Guardaparque o Baqueano Local asignado.
- **Acciones**:
  - Limpieza física de paneles solares (remoción de polvo, resina y hojas).
  - Inspección visual de placas QR/NFC (verificación de legibilidad y adherencia).
  - Comprobación de integridad de carcasas IP67/IP68 contra ingreso de humedad o insectos.
  - Registro de inspección rápida en la consola `/operaciones-campo`.

### Nivel 2: Mantenimiento Correctivo & Calibración (Bajo Demanda / Alerta)
- **Disparador**: Alerta automática de batería baja (< 20%), pérdida de heartbeat (> 12h) o lectura fuera de rango físico.
- **Acciones**:
  - Reemplazo de módulo de batería o celda LiFePO4.
  - Re-calibración de sonda de nivel de agua o sensor barométrico.
  - Reemplazo de placa física QR vandalizada o deteriorada por clima extremo.

### Nivel 3: Mantenimiento Mayor de Red & Gateways (Semestral / Anual)
- **Responsable**: Técnico de Telecomunicaciones o Administrador Regional.
- **Acciones**:
  - Actualización de firmware OTA (*Over-The-Air*) o manual vía puerto local USB/UART.
  - Verificación de VSWR en antenas LoRa de alta ganancia (8 dBi).
  - Respaldo físico de registros locales de memoria flash en gateways.

---

## 2. Flujo de Trabajo en la Consola `/operaciones-campo`

1. **Detección**: El sistema genera un ticket automático (`FieldMaintenanceTask`) o el administrador crea una orden manual con nivel de prioridad (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
2. **Asignación**: Se asigna al técnico o cooperativa encargada del polígono territorial.
3. **Ejecución & Evidencia**: El operador en terreno atiende la incidencia e ingresa notas técnicas y evidencia en la consola web/móvil.
4. **Cierre**: La tarea pasa al estado `DONE` y el estado del dispositivo o Smart Point vuelve a `ONLINE / OPERATIONAL`.
