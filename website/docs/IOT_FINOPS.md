# ANÁLISIS FINOPS & EFICIENCIA DE COSTOS EN INFRAESTRUCTURA IoT

## 1. Estructura de Costos de la Red IoT Territorial

El modelo financiero de Baqueano optimiza tanto el gasto de capital inicial (CapEx) como el gasto operativo continuo (OpEx) para comunidades campesinas:

### A. CapEx por Smart Point / Nodo de Campo
- **Placa QR/NFC de Aluminio Anodizado Grabado Láser (IP68)**: ~$8 - $15 USD por punto.
- **Nodo Sensor Ambiental Autónomo (LoRaWAN + Panel Solar 5W + Batería LiFePO4)**: ~$65 - $110 USD por nodo.
- **Gateway LoRaWAN Celular 4G Exterior (IP67)**: ~$180 - $280 USD (cubre un radio de 5 a 12 km de reserva).
- **Tótem Kiosco Táctil Exterior / Semi-cubierto (Tablet Rugerizada 10" + Gabinete Metálico)**: ~$220 - $380 USD.

### B. OpEx Mensual Estimado
- **Conectividad Celular SIM M2M (10 MB/mes por Gateway)**: ~$1.50 - $3.00 USD / mes.
- **Ingestión Serverless en Cloud / Firestore (100,000 lecturas/mes)**: < $0.80 USD / mes (dentro del free tier de Google Cloud).
- **Mantenimiento Preventivo Comunitario (Revisión semestral de baterías)**: Absorbiendo por la cooperativa local.

---

## 2. Estrategias de Optimización de Consumo y Tráfico

1. **Agrupación de Lecturas (Batching)**:
   - Los nodos envían ráfagas empaquetadas en binario (Cayenne LPP o Protobuf) cada 15-30 minutos en lugar de transmisiones HTTP individuales por cada segundo.
2. **SSG Caching en Resolver QR (`/p/[slug]`)**:
   - Páginas contextuales pre-renderizadas estáticamente en el Edge con revalidación periódica (ISR) para reducir el costo de cómputo en el servidor central a prácticamente cero.
3. **Selección de Baterías LiFePO4**:
   - Mayor vida útil (> 2000 ciclos de carga) y resistencia a temperaturas tropicales extremas (hasta 55°C) frente al ion de litio convencional, reduciendo drásticamente el costo de reposición.
