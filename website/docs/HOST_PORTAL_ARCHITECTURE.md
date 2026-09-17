# 🧭 ARQUITECTURA DEL PORTAL DE ANFITRIONES (HOST PORTAL) — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Empoderar a los anfitriones, baqueanos locales, fincas campesinas, cooperativas y comedores tradicionales de Nicaragua con una herramienta digital accesible y segura para gestionar su presencia turística, coordinar solicitudes de visitantes y administrar sus servicios sin depender de intermediarios.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & SEGURIDAD)

- **Principio de Propiedad Estricta (`Ownership`)**: Toda consulta y mutación valida en reglas de Firestore y en el backend que `resource.data.ownerUid == request.auth.uid`.
- **Aislamiento Total entre Negocios**: Un anfitrión jamás puede leer reservas, estadísticas privadas, teléfonos o datos financieros de otro negocio.
- **Flujo de Verificación Editorial**:

```text
SOLICITUD INICIAL
       ↓
COMPLETADO DE PERFIL
       ↓
REVISIÓN ADMINISTRATIVA
       ↓
SELLO "BAQUEANO VERIFICADO"
       ↓
PUBLICACIÓN OFICIAL
```

---

## 📦 3. QUÉ (WHAT / ESTRUCTURA DE MÓDULOS DEL HOST PORTAL)

| Módulo | Ruta | Funcionalidad | Estado |
| --- | --- | --- | --- |
| **Dashboard** | `/host/dashboard` | Resumen de visitas, solicitudes de reserva pendientes y estado del negocio. | ✅ REAL |
| **Mi Negocio** | `/host/mi-negocio` | Edición de datos generales, descripción, municipio, contacto WhatsApp y fotos. | ✅ REAL |
| **Servicios** | `/host/servicios` | Catálogo de actividades guiadas, hospedaje rural y gastronomía local. | ✅ REAL |
| **Reservas** | `/host/reservas` | Bandeja de solicitudes entrantes para confirmación o rechazo con notas. | ✅ REAL |
| **Disponibilidad** | `/host/disponibilidad` | Bloqueo de fechas no laborables y aforo máximo por jornada. | 🟡 PARCIAL |
| **Multimedia** | `/host/multimedia` | Galería fotográfica con validación de peso y moderación editorial. | ✅ REAL |
| **Suscripción** | `/host/suscripcion` | Consulta de plan activo (Starter / Growth / Alliance) y vigencia. | ✅ REAL |
