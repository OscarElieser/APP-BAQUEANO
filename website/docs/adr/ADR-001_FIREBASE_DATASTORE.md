# 🧭 ADR-001: MANTENIMIENTO DE FIREBASE COMO DATASTORE PRINCIPAL

## 🎯 1. Contexto (Context)
Baqueano evalúa si la evolución hacia una arquitectura institucional y multi-organización justifica la migración de Cloud Firestore hacia un motor relacional SQL (PostgreSQL, Cloud SQL) o una arquitectura políglota compleja.

---

## ⚙️ 2. Decisión (Decision)
Se decide **mantener Cloud Firestore como el datastore transaccional principal** de la plataforma.

### Razones Técnicas:
1. **Sincronización Nativa en Tiempo Real**: Firestore ofrece listeners reactivos (`onSnapshot`) indispensables para la Torre de Control y la aplicación Android sin necesidad de mantener clústeres de WebSockets dedicados.
2. **Soporte Offline-First**: Imprescindible para el uso en zonas rurales de Nicaragua con conectividad intermitente.
3. **Escalabilidad Elástica sin Administración**: Escala automáticamente sin necesidad de provisionar capacidad de cómputo o réplicas manuales.
4. **Costo-Eficiencia**: Modelo de cobro por operaciones muy ventajoso para el patrón de lecturas con caché implementado.

---

## 📦 3. Consecuencias (Consequences)
- **Positivas**: Cero sobrecosto de infraestructura, menor complejidad de mantenimiento y compatibilidad 100% preservada con la app Android nativa.
- **Mitigación**: Para consultas analíticas complejas futuras, se programarán exportaciones automáticas periódicas hacia BigQuery sin sobrecargar el datastore transaccional.
