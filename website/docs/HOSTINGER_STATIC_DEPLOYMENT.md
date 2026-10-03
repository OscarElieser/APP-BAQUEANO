# Despliegue estático de BAQUEANO en Hostinger

## 🎯 POR QUÉ

`website/` contiene el portal HTML vigente y, además, un workspace con dos aplicaciones Next.js independientes. Hostinger no debe intentar ejecutar ambos proyectos como una sola aplicación Express.

## ⚙️ CÓMO

El comando raíz `pnpm build` genera `dist-hostinger/`. La salida contiene únicamente archivos públicos y reglas Apache; `apps/`, `packages/`, dependencias, documentación, pruebas y fuentes de compilación no se publican.

La arquitectura futura permanece disponible:

- `pnpm build:workspace`: compila web y administración.
- `pnpm build:web`: compila solo `apps/web`.
- `pnpm build:admin`: compila solo `apps/admin`.

## 📦 QUÉ CONFIGURAR EN HOSTINGER

### Opción recomendada: aplicación web con salida estática

- Directorio raíz: `website`
- Framework: `Other` o aplicación estática; no Express
- Node.js: 22.x
- Comando de compilación: `corepack pnpm build`
- Directorio de salida: `dist-hostinger`
- Comando de inicio: ninguno para salida estática

### Opción de hosting HTML/Git

En un sitio HTML de Hostinger, publicar el contenido generado de `website/dist-hostinger/` dentro de `public_html`. La integración Git para sitios HTML es distinta del flujo de aplicaciones Node.

## Validación local

```powershell
cd website
corepack pnpm build
corepack pnpm test:hostinger
corepack pnpm test
```

Antes de cambiar DNS, comprobar en la URL temporal de Hostinger:

- `/`, `/destinos.html`, `/departamento.html?depto=managua` y `/baqueano-ia.html`.
- carga de CSS, JavaScript, imágenes y catálogos `locales/`.
- autenticación Firebase, consultas Supabase, BAQUI, mapas y service worker.
- `/admin.html` sin indexación pública.

No cambiar todavía el dominio principal hasta completar esa verificación. `apps/web` y `apps/admin` deben desplegarse posteriormente como aplicaciones separadas, cada una con su propio dominio y configuración.
