# EVALUACIÓN Y HOMOLOGACIÓN DE HARDWARE IoT PARA CONDICIONES TROPICALES

## 1. Criterios de Evaluación

Los dispositivos destinados a campo en Nicaragua deben superar estrictas condiciones ambientales:
- **Grado de Protección**: Mínimo **IP67** (inmersión temporal en agua y hermético al polvo fino).
- **Rango Térmico de Operación**: -5°C a +60°C.
- **Resistencia UV**: Carcasas de ABS estabilizado con inhibidores de radiación ultravioleta.
- **Química de Batería**: Fosfato de hierro y litio (**LiFePO4**), preferido sobre Li-Ion debido a su estabilidad térmica y vida útil superior.

---

## 2. Matriz Comparativa de Hardware Homologado

| Componente | Opción Evaluada A | Opción Evaluada B | Elección Baqueano | Razón de Selección |
| :--- | :--- | :--- | :---: | :--- |
| **Gateway LoRaWAN Exterior** | Dragino DLOS8 (4G/LoRa) | RAKwireless RAK7240 | **Dragino DLOS8** | Excelente relación costo/beneficio, bajo consumo (5W) y soporte 4G multi-banda B2/B4/B28 para Nicaragua. |
| **Nodo Sensor Ambiental** | Seeed Studio SenseCAP S2101 | RAKwireless WisBlock Kit | **SenseCAP S2101** | Batería integrada de hasta 10 años, protección IP66 de fábrica, sin necesidad de soldaduras en campo. |
| **Chip / Tag NFC** | NXP NTAG213 (144 bytes) | NXP NTAG216 (888 bytes) | **NXP NTAG213** | Capacidad suficiente para URLs compactas de Baqueano, menor costo por unidad en compras por volumen. |
| **Tablet para Kiosco** | Samsung Galaxy Tab Active3 (Rugerizada) | Lenovo Tab M10 con Gabinete | **Tab Active3 (o equivalente IP68)** | Modo "No Battery Mode" para alimentación continua en red eléctrica sin inflado de celdas. |
