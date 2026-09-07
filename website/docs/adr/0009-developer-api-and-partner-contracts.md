# ADR 0009: CONTRATOS DE INTEGRACIÓN, SCOPES Y GESTIÓN DE CLIENTES DE API

## Estado
Aprobado

## Contexto
Terceros (universidades, cámaras de turismo, municipalidades) requieren integrar capacidades de Baqueano sin acceder directamente a Firestore ni compartir contraseñas de usuarios.

## Decisión
1. Establecer el principio **"Interoperabilidad por Contrato, No por Base de Datos"**.
2. Autenticar clientes de API mediante cabecera `x-api-key` y validar su hash criptográfico SHA-256 en memoria/base de datos.
3. Asignar scopes granulares (`places.read`, `places.submit`, `smart_points.read`, `research.telemetry.read`) y cuotas de rate limiting por cliente.
4. Implementar un panel administrativo en `/desarrolladores` con capacidad de revocación instantánea (Kill-Switch).

## Consecuencias
- Desacoplamiento total entre los consumidores externos y el backend interno.
- Seguridad y observabilidad absoluta sobre el consumo de recursos de la plataforma.
