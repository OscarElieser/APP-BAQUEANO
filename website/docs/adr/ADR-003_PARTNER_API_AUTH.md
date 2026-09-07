# 🧭 ADR-003: AUTENTICACIÓN Y AUTORIZACIÓN DE APIS PARA ALIADOS

## 🎯 1. Contexto (Context)
Se requiere permitir que sistemas externos (alcaldías, INTUR, cooperativas y aplicaciones de movilidad) consuman datos verificados de Baqueano de forma segura y controlada.

---

## ⚙️ 2. Decisión (Decision)
Se decide **implementar autenticación mediante API Keys con prefijo explícito (`bq_live_...`), almacenamiento de hash SHA-256 en base de datos, scopes granulares y limitación de tasa por IP/Key**.

### Razones Técnicas:
1. **Simplicidad de Integración**: Las API Keys son fáciles de adoptar para instituciones gubernamentales y pequeñas cooperativas que carecen de infraestructura OAuth2 compleja.
2. **Seguridad contra Fugas**: Las claves completas solo se muestran una vez al momento de creación; en base de datos solo se almacena el hash criptográfico y el prefijo de auditoría.
3. **Control Granular de Acceso**: Cada llave está vinculada a una lista explícita de scopes (`places.read`, `territories.read`, `alerts.read`).
4. **Protección contra Abuso**: Rate limiting por ventana deslizante para evitar saturación de los endpoints.

---

## 📦 3. Consecuencias (Consequences)
- **Positivas**: Interoperabilidad inmediata, trazabilidad por organización y capacidad de revocación en tiempo real.
- **Evolución Futura**: Cuando se incorporen operaciones de escritura por parte de aliados, se evaluará la incorporación de firmas HMAC o mTLS según el perfil de seguridad del aliado.
