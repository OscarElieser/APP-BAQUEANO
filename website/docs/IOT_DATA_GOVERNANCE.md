# GOBIERNO DE DATOS, PRIVACIDAD & CONSERVACIÓN AMBIENTAL

## 1. Privacidad por Diseño (Privacy by Design)

Baqueano establece un estándar ético estricto en la recopilación de datos territoriales:

- **Prohibición de Rastreo Biométrico**: Ningún Smart Point o dispositivo IoT implementa tecnologías de reconocimiento facial, estimación de edad/género por visión computacional, o captura de audio ambiental continuo.
- **Prohibición de Recolección de Direcciones MAC**: No se utilizan "sniffers" de Wi-Fi o Bluetooth para rastrear la trayectoria de dispositivos de usuarios individuales sin consentimiento.
- **Anonimización de Aforo**: El conteo de personas en senderos se realiza mediante haces de cruce óptico infrarrojo o ultrasonido, produciendo exclusivamente números enteros acumulados (`conteo total por hora`), sin identificar al individuo.

---

## 2. Retención, Ciclo de Vida y Almacenamiento

1. **Datos de Alta Frecuencia (Raw Sensor Telemetry)**:
   - Almacenamiento caliente en base de datos de series temporales / Firestore por 90 días.
   - Agregación horaria y diaria automática hacia Cloud Storage en formato columnar (Parquet) para análisis histórico de largo plazo.
2. **Datos de Escaneo QR/NFC**:
   - Métricas agregadas de visitas por Smart Point, dispositivo y hora.
   - Las direcciones IP de los escaneos web son anonimizadas mediante truncamiento del último octeto antes de generar métricas de país/región.

---

## 3. Apertura de Datos para Conservación Científica

Los datos meteorológicos, de calidad de aire y de nivel de ríos recopilados por la red Baqueano están a disposición de:
- Guardaparques y ministerios de medio ambiente para alertas tempranas de crecidas o incendios forestales.
- Universidades e investigadores locales para estudios de cambio climático y resiliencia de la biodiversidad en Nicaragua.
