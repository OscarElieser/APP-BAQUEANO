<!--
🎯 POR QUÉ: estado verificable de la app Android.
⚙️ CÓMO: CI Flutter (analyze + test) y revisión del repositorio.
📦 QUÉ: evidencia, brechas y prueba en dispositivo requerida.
-->
# Informe Android — Kronox 2026

**Estado:** S2-14 🟡 · S3-09 🟠.

| Control | Evidencia |
|---|---|
| `flutter analyze` + `flutter test` | Workflow `flutter_ci.yml` en verde en las ejecuciones recientes |
| Pruebas unitarias | 10 archivos en `test/` (catálogo, reservas, SOS, territorio, i18n, IA, itinerario y otros) |
| Paridad de idiomas y territorios Web → APK | `export-locales-for-app.mjs --check` y `export-territories-for-app.mjs --check` en CI |
| APK publicado | `website/assets/BaqueanoNicaragua.apk` (91 MiB), excluido del build web |

## Brechas

- **Prueba en dispositivo físico:** el equipo debe instalar el APK, iniciar sesión con Google, abrir un destino, usar SOS y BAQUI, y registrar la versión y el modelo del dispositivo.
- **Trazabilidad APK ↔ commit:** falta el `versionName` ligado al SHA.
- **Datos:** Android aún escribe en Firestore (réplica `baqueano-mirror`) y no envía eventos a la analítica de Supabase.
