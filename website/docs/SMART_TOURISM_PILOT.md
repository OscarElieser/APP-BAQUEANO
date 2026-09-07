# PLAN DE PILOTO TERRITORIAL DE SMART TOURISM: RESERVA NATURAL MIRAFLOR

## 1. Alcance y Objetivos del Piloto

El primer despliegue piloto de la red de Smart Tourism de Baqueano se ejecutará en la **Reserva Natural Miraflor Moropotente** (Estelí, Nicaragua), integrando a las cooperativas comunitarias locales y guardaparques.

### Objetivos:
1. Validar la adopción de señalética QR/NFC por visitantes nacionales y extranjeros.
2. Comprobar la resiliencia de la telemetría ambiental (temperatura, humedad, conteo de aforo) en clima de bosque nuboso.
3. Capacitar a los guardaparques y baqueanos en el uso del panel de operaciones de campo (`/operaciones-campo`).

---

## 2. Puntos de Despliegue Físico en el Piloto

| ID Punto | Nombre | Tipo | Hardware / Sensores Asociados |
| :--- | :--- | :---: | :--- |
| `sp-miraflor-01` | Entrada Principal & Mirador Los Cedros | `TRAILHEAD` | Gateway LoRaWAN Celular 4G + Estación Meteorológica + Placa QR/NFC |
| `sp-miraflor-02` | Cascada La Chorrera | `INTERPRETIVE_STATION` | Sensor de Nivel de Río + Contador de Aforo Infrarrojo + Placa QR/NFC |
| `sp-miraflor-03` | Centro Comunitario La Laguna | `COMMUNITY_CENTER` | Kiosco Táctil 10" + Placa QR/NFC + Audio Beacon BLE |
| `sp-miraflor-04` | Mirador El Boquerón | `VIEWPOINT` | Nodo Sensor Ambiental Autónomo Solar + Placa QR/NFC |

---

## 3. Cronograma del Piloto (Fase de Campo)

- **Semana 1-2**: Instalación de placas físicas QR/NFC y montaje de gateway central en el centro de visitantes.
- **Semana 3-4**: Despliegue de nodos sensores ambientales y calibración de umbrales en `/api/iot/v1/telemetry`.
- **Semana 5-8**: Operación en vivo, monitoreo de escaneos, pruebas de aforo y retroalimentación de la comunidad.
- **Semana 9**: Evaluación de resultados, métricas de retención de batería y cierre de informe técnico.
