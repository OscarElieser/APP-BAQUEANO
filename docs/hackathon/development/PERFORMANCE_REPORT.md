<!--
🎯 POR QUÉ: no declarar rendimiento sin medición.
⚙️ CÓMO: se documenta lo medido (tamaño del build) y lo que falta medir con Lighthouse/CWV.
📦 QUÉ: estado, cifras disponibles y plan de medición.
-->
# Informe de rendimiento — Kronox 2026

**Estado:** 🔴 PENDIENTE (S3-13). No existe una medición Lighthouse ni de Core Web Vitals reproducible en el repositorio. Los documentos previos (`docs/audit/PERFORMANCE_AUDIT.md`) son análisis y no mediciones.

## Cifras medidas

| Métrica | Valor | Fuente |
|---|---|---|
| Salida publicada | 727 archivos, 624,9 MiB | `node website/scripts/build-hostinger-static.mjs` |
| Mayor recurso versionado | APK de 91 MiB (excluido del build) | `git ls-files` + `du` |
| HTML de la portada | 84 515 bytes | run 37263032958 |

## Plan de medición

1. Ejecutar Lighthouse CI sobre `/`, `/destinos.html`, `/mapa.html` y `/baqueano-ia.html` en móvil.
2. Fijar presupuestos: LCP < 2,5 s, CLS < 0,1, INP < 200 ms.
3. Revisar los audios de 8–13 MiB y los videos que sigan en la salida publicada.
