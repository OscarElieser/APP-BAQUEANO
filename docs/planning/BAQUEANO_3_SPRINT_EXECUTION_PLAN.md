# 🧭 BAQUEANO — Plan operativo de 3 sprints

## 🎯 POR QUÉ (Why / Propósito)

Convertir la propuesta del Hackathon Nicaragua 2026 en un backlog ejecutable, trazable y demostrable sin reemplazar la arquitectura oficial de BAQUEANO ni atribuir como terminadas funciones que todavía no han sido verificadas.

El plan protege cinco decisiones:

1. Firebase identifica al usuario mediante Authentication, sesión, Google Sign-In y Firebase UID.
2. Supabase almacena toda la información dinámica y operativa.
3. Hostinger administra `baqueanonicaragua.com`, DNS, SSL y futuros subdominios.
4. Firebase Hosting conserva `app-baqueano.web.app` como infraestructura técnica secundaria.
5. Azure solo cubre la evidencia exigida por la competencia y no sustituye la arquitectura principal.

## ⚙️ CÓMO (How / Arquitectura y ejecución)

El tablero usa siete listas y etiquetas funcionales. Las tarjetas avanzan únicamente cuando cumplen la Definition of Done. Las dependencias bloqueantes se resuelven en este orden:

```text
Auditoría → contratos de datos → modelo Supabase/RLS → identidad Firebase UID
→ lectores/escritores dinámicos → Ops Center → experiencia E2E
→ seguridad, rendimiento, accesibilidad, despliegue y evidencia
```

La planificación no autoriza migraciones, despliegues, cambios DNS, creación de Azure ni movimientos masivos de archivos. Cada acción externa o de infraestructura se ejecutará desde su tarjeta, con evidencia y revisión proporcional al riesgo.

## 📦 QUÉ (What / Entregables)

- Tablero: **BAQUEANO — HACKATHON NICARAGUA 2026**.
- CSV operativo: `docs/planning/BAQUEANO_TRELLO_IMPORT.csv`.
- Auditoría base: `docs/audit/DATA_SOURCE_MAP.md`.
- 72 tarjetas: 20 en Sprint 1, 26 en Sprint 2 y 26 en Sprint 3.
- Definition of Done común, dependencias, prioridades y reglas de evidencia.

## Listas del tablero

1. 📥 BACKLOG
2. 🔵 SPRINT 1 — FUNDAMENTOS
3. 🟠 SPRINT 2 — INTEGRACIÓN
4. 🟢 SPRINT 3 — PRODUCCIÓN
5. 🧪 QA / PRUEBAS
6. ⚠️ BLOQUEADOS
7. ✅ TERMINADO
8. 📚 EVIDENCIAS

## Etiquetas

| Etiqueta | Uso |
|---|---|
| DESARROLLO | Código, arquitectura y tooling |
| DISEÑO | UX, sistema visual, assets y accesibilidad |
| MARKETING | 4C, campaña, segmentación y contenidos |
| WEBSITE | Web pública, PWA y SEO |
| ANDROID | Flutter y configuración Android |
| SEGURIDAD | Auth, RLS, RBAC, OWASP y secretos |
| BASE DE DATOS | Supabase/PostgreSQL, datos y migraciones |
| IA / BAQUI | RAG, planificación y respuestas verificadas |
| TURISMO | Catálogo, territorio, servicios y fuentes |
| INFRAESTRUCTURA | Hosting, DNS, Azure, CI/CD y observabilidad |

## Estado inicial verificable

| Tarjeta | Estado | Evidencia | Próxima acción |
|---|---|---|---|
| S1-01 Auditoría general | ✅ TERMINADO | `docs/audit/DATA_SOURCE_MAP.md` | Adjuntar el documento a Trello |
| S1-04 Arquitectura BAQUEANO | En progreso | Arquitectura definida en AGENTS, auditoría y documentación dispersa | Consolidar ADR oficial y marcar decisiones Firestore anteriores como sustituidas |
| S1-05 Modelo ER Supabase | En progreso | Migraciones existentes bajo `supabase/migrations/` | Crear ER canónico, revisar 2FN/3FN y detectar huecos sin aplicar cambios remotos |
| S1-06 Firebase Authentication | En progreso | Código Auth web/Android existente | Ejecutar matriz de pruebas real por plataforma |
| S1-11 Ejecución local | Pendiente de verificación actual | Existen proyectos y scripts | Ejecutar comandos documentados y capturar resultados |
| Resto | BACKLOG o sprint correspondiente | No existe evidencia suficiente para cerrarlo | Ejecutar según dependencias |

## Dependencias bloqueantes

| Tarjeta | Depende de | Motivo |
|---|---|---|
| S1-02 | S1-01 | No mover archivos sin mapa y referencias |
| S1-03 | S1-02, S1-04, S1-11 | README debe reflejar estructura y comandos reales |
| S1-05 | S1-01, S1-04 | El ER debe responder a fuentes y arquitectura oficiales |
| S1-07 | S1-05, S1-06 | Roles requieren identidad y autorización coherentes |
| S2-01 | S1-05, S1-07 | Producción requiere modelo y controles aprobados |
| S2-02 | S2-01 | Website no puede migrar antes de confirmar esquema/RLS |
| S2-03 | S1-06, S2-01 | Sincronización exige token Firebase verificable y perfil Supabase |
| S2-04 | S2-01, S2-03 | CRUD necesita autorización server-side |
| S2-05–S2-12 | S2-01, S2-02 | Producto dinámico depende de datos canónicos |
| S3-05, S3-06 | S2-01, S2-03, S2-04 | RLS/RBAC deben probar flujos reales |
| S3-07, S3-08 | S2-02–S2-12 | E2E necesita integraciones completas |
| S3-10 | S3-04–S3-08, S3-13–S3-17 | Publicación final requiere controles y QA |

## Definition of Done — BAQUEANO

Una tarjeta está terminada solo si:

- está implementada y conectada a su fuente real;
- funciona en el alcance definido y maneja errores;
- es responsive cuando aplica;
- incluye pruebas proporcionales al riesgo;
- no rompe flujos existentes;
- usa información real o etiqueta inequívocamente la simulación;
- respeta seguridad, privacidad, RLS/RBAC y límites de cliente/servidor;
- conserva Supabase como fuente única de información;
- mantiene Firebase Authentication como autoridad de identidad;
- incorpora evidencia reproducible;
- posee commit identificable y está disponible en el remoto autorizado;
- actualiza documentación y `SESSION_LOG.md`;
- no contiene secretos ni datos personales innecesarios;
- pasa `flutter analyze` y `flutter test` cuando toca Android/Flutter;
- pasa build, lint y pruebas web cuando toca Website;
- fue revisada en móvil, tablet y escritorio cuando cambia UI.

## Evidencia mínima por tipo

| Tipo | Evidencia mínima |
|---|---|
| Código | Commit, archivos, prueba automatizada y salida de verificación |
| Base de datos | Diagrama/contrato, migración revisada, RLS, advisors y consulta de prueba |
| Auth/RBAC | Matriz rol × acción, casos permitido/denegado y token verificado server-side |
| UX/UI | Capturas de móvil/tablet/escritorio, navegación por teclado y contraste |
| Infraestructura | Configuración redactada, health check, puertos, HTTPS y runbook |
| Marketing | Documento, fuente de supuestos, 4C, KPI, canal, audiencia y pieza |
| Video | Guion, grabación, URL/archivo, fecha y flujo demostrado |

## Aplicación obligatoria del modelo 4C

Las tarjetas S1-13 a S1-17, S2-17 a S2-22 y S3-21 a S3-25 deben evaluar:

- **Consumidor:** turista/explorador y anfitrión comunitario.
- **Costo:** dinero, tiempo, incertidumbre, conectividad y esfuerzo.
- **Conveniencia:** descubrimiento, contacto, planificación y acceso móvil.
- **Comunicación:** mensajes bidireccionales, fuentes, confianza y seguimiento.

## Regla Azure

S2-15 es una pista aislada de cumplimiento. Debe verificar la rúbrica antes de aprovisionar recursos. Si se exige una VM:

- usar el alcance mínimo demostrable;
- documentar sistema operativo, SSH, IP pública y puertos;
- restringir SSH por origen cuando sea viable;
- no publicar PostgreSQL;
- no almacenar claves de servicio en la imagen ni el repositorio;
- apagar o retirar recursos al finalizar la evidencia si ya no son necesarios;
- mantener Firebase + Supabase + Hostinger como arquitectura oficial.

## Flujo E2E oficial

```text
Entrar → Explorar Nicaragua → Buscar destino → Ver lugar → Ver mapa
→ Consultar BAQUI → Crear itinerario → Guardar en Mi Viaje
→ Consultar alojamiento, gastronomía, transporte, clima y emergencias
→ Guardar, reservar o contactar
```

Para cerrar S3-07, el flujo debe completarse sin intervención técnica, sin datos críticos inventados y con recuperación clara ante desconexión o falta de disponibilidad.

## Criterio de prioridad

- **P0:** arquitectura, seguridad, identidad, modelo de datos, Supabase, E2E y datos de emergencia.
- **P1:** experiencia central, Ops Center, mapa, búsqueda, BAQUI, dominio, calidad y accesibilidad.
- **P2:** campañas, mejoras visuales, contenidos y evidencia no bloqueante.

## Riesgos iniciales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Firestore continúa como fuente paralela | Crítico | Migración por dominio y retiro controlado de doble escritura |
| Seeds presentados como datos reales | Crítico | Proveniencia visible y validación antes de publicar |
| Desalineación Firebase UID/Supabase | Crítico | Verificación server-side e identidad mapeada |
| RLS incompleta o cliente con privilegios | Crítico | Políticas por propiedad/rol, pruebas negativas y sin clave de servicio pública |
| Emergencias desactualizadas | Crítico | Fuente oficial, fecha, verificación y caducidad |
| Reorganización rompe rutas | Alto | Inventario, cambios pequeños, pruebas y rollback |
| Azure desvía la arquitectura | Alto | Alcance aislado ligado a la rúbrica |
| Evidencia insuficiente para jurado | Alto | Lista 📚 EVIDENCIAS y checklist por tarjeta |

## Uso del CSV

`BAQUEANO_TRELLO_IMPORT.csv` contiene una fila por tarjeta con lista, etiquetas, prioridad, dependencia, resultado y estado inicial. Puede importarse con una herramienta compatible con CSV o copiarse mediante automatización de Trello. No se ha creado ni modificado ningún tablero remoto desde este repositorio.
