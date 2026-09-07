# PRIVACIDAD, ANONIMIZACIÓN & K-ANONYMITY EN EL ECOSISTEMA ABIERTO

## 1. Compromiso Ético de Cero Vigilancia

Baqueano establece un principio inquebrantable:
> **"La ciencia territorial y los datos abiertos sirven para proteger los ecosistemas y fortalecer a las comunidades, nunca para vigilar a los individuos."**

---

## 2. Reglas de Anonimización Estricta

1. **Supresión de Celdas Pequeñas (Small Cell Suppression)**: Si en un sendero o punto inteligente se registra una afluencia menor a 5 personas en una hora, la telemetría se reporta como *"Baja"* de forma agregada para impedir la deducción de identidades individuales.
2. **Exclusión Total de Trayectorias GPS Personales**: Ningún dataset abierto ni de investigación contiene marcas de tiempo secuenciales asociadas a un dispositivo o usuario específico.
3. **Anonimización de Direcciones IP**: En los logs de acceso de la API se trunca el último octeto de la dirección IP (`192.168.1.0/24`) antes de calcular métricas de tráfico.
