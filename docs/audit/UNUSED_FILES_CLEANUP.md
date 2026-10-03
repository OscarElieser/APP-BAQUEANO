# 🧹 Auditoría de archivos prescindibles y limpieza segura

## 🎯 POR QUÉ (Why / Propósito)

Reducir artefactos regenerables, logs y respaldos temporales que aumentan el peso o generan confusión, sin eliminar código activo, información heredada pendiente de migración, evidencia útil ni configuración de plataforma.

## ⚙️ CÓMO (How / Método y protección)

Se verificó existencia, estado en Git, reglas de `.gitignore` y referencias textuales dentro del repositorio. La ausencia de una referencia textual no basta por sí sola para eliminar archivos de configuración o datos; por ello, la limpieza se divide por nivel de certeza.

No se tocarán `ios/`, el directorio Flutter `web/`, `.runtime`, `.snapshots`, migraciones, assets institucionales, HTML/JSON/JavaScript con datos heredados ni información aún pendiente de importar a Supabase.

## 📦 QUÉ (What / Candidatos exactos)

### Grupo A — Artefactos regenerables de alta certeza

| Ruta | Estado Git | Motivo | Recuperación |
|---|---|---|---|
| `build/` | Ignorado | Salidas generadas por Flutter/builds | Regenerar con build correspondiente |
| `.dart_tool/` | Ignorado | Caché y metadatos generados por Dart/Flutter | `flutter pub get` |
| `node_modules/` | Ignorado | Dependencias instaladas | `npm ci` o gestor definido por cada workspace |
| `.firebase/` | Ignorado | Caché local de Firebase CLI | Firebase CLI la recrea |
| `supabase/.temp/` | Ignorado | Estado temporal de Supabase CLI | Supabase CLI lo recrea |
| `.pnpm-store/` | No rastreado | Almacén local de paquetes | `pnpm install` lo recrea |
| `flutter_01.log` | Ignorado | Log antiguo del 2026-09-02 | No requiere recuperación funcional |

### Grupo B — Respaldos temporales rastreados, sin referencias detectadas

| Ruta | Tamaño | Evidencia | Riesgo |
|---|---:|---|---|
| `temp_old_admin.html` | 101,838 bytes | Nombre temporal; cero referencias encontradas | Bajo/medio: puede ser respaldo manual histórico |
| `temp_old_ops.js` | 467,320 bytes | Nombre temporal; cero referencias encontradas | Bajo/medio: puede ser respaldo manual histórico |
| `temp_old_ops2.js` | 65,630 bytes | Nombre temporal; cero referencias encontradas | Bajo/medio: puede ser respaldo manual histórico |

Estos tres archivos están versionados. Eliminarlos quedaría registrado por Git y sería recuperable desde el historial existente, pero la acción modificaría materialmente el repositorio.

### Grupo C — Conservar

- `.runtime/` y `.snapshots/`: están rastreados por Git; no hay evidencia suficiente para declararlos basura.
- `website/`, `assets/`, catálogos JSON y datos embebidos: contienen información heredada que debe migrarse antes de retirar copias.
- migraciones y configuración Supabase/Firebase: forman parte de arquitectura o recuperación.
- documentación histórica: se conserva con avisos de sustitución cuando contradice la arquitectura vigente.
- archivos modificados por el usuario o por esta sesión: no forman parte de la limpieza.

## Operación propuesta

Con aprobación explícita, eliminar únicamente los elementos de los grupos A y B mediante rutas absolutas verificadas dentro de `D:\Desktop\APP BAQUEANO`. Después:

1. ejecutar `git status --short` sobre los objetivos;
2. reinstalar dependencias solo si una prueba las necesita;
3. ejecutar verificaciones proporcionadas al alcance;
4. registrar exactamente qué se eliminó y cómo recuperarlo.

No se usará una orden global como `git clean` porque podría abarcar archivos fuera del manifiesto.

## Resultado ejecutado — 2026-10-02

- Eliminados: `temp_old_admin.html`, `temp_old_ops.js`, `temp_old_ops2.js` y `flutter_01.log`.
- `build/` fue limpiado por Flutter y se regeneró durante las pruebas; se conserva porque ahora contiene artefactos activos de verificación.
- `.dart_tool/` fue regenerado por `flutter pub get`; se conserva como metadato activo del entorno.
- Se conservaron `node_modules/`, `.firebase/`, `supabase/.temp/` y `.pnpm-store/` porque mantienen dependencias o estado de herramientas y su eliminación no mejora la estructura del código.
- No hubo cambios rastreados en `website/`, `web/`, `android/`, `lib/`, `pubspec.yaml` ni `pubspec.lock`.
- Validación: `flutter analyze` sin hallazgos y `flutter test` con 31 pruebas aprobadas.
