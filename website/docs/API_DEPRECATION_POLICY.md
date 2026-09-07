# POLÍTICA DE DEPRECACIÓN & CICLO DE VIDA DE LA API

## 1. Compromiso de Estabilidad

Baqueano garantiza que ningún endpoint en estado `STABLE` sufrirá cambios incompatibles (*breaking changes*) sin previo aviso y sin un periodo de transición formal.

---

## 2. Ciclo de Vida de un Endpoint

```
[EXPERIMENTAL / BETA] (Pruebas preliminares en sandbox)
         ↓
[STABLE] (Garantía de retrocompatibilidad y soporte)
         ↓
[DEPRECATED] (Aviso con cabecera 'Sunset' y soporte activo por mínimo 6 meses)
         ↓
[SUNSET / RETIRED] (Desactivación definitiva)
```

---

## 3. Cabeceras HTTP de Deprecación

Cuando un endpoint pasa a estado `DEPRECATED`, responderá con:
```http
Deprecation: @1798761600
Sunset: Wed, 01 Jul 2027 00:00:00 GMT
Link: <https://baqueano.app/developers/migration-v2>; rel="successor-version"
```
