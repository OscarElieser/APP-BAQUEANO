# 🧭 ARQUITECTURA PWA (PROGRESSIVE WEB APP) — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Proporcionar a los exploradores una experiencia web rápida, instalable en la pantalla de inicio y con disponibilidad de contenidos esenciales fuera de línea (App Shell y fichas recientemente consultadas), complementando a la aplicación nativa Android sin competir con ella.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & CACHÉ SEGURO)

- **Manifiesto Web (`manifest.json`)**: Configuración con paleta oficial de colores (`#165D6F`, `#F65E01`), iconos adaptativos e inicio en pantalla completa (`display: standalone`).
- **Aislamiento de Privacidad en Service Worker**: Queda estrictamente prohibido cachear en el cliente respuestas de rutas privadas (`/admin`, `/perfil`, `/host`, transacciones bancarias o mensajes de usuario).
- **Estrategia Stale-While-Revalidate**: Utilizada para recursos estáticos, imágenes de destinos y hojas de estilo para acelerar tiempos de carga en conexiones móviles 3G.

---

## 📦 3. QUÉ (WHAT / COMPONENTES DE LA PWA)

1. **`website/manifest.json`**: Manifiesto web estándar con metadatos oficiales de Nicaragua.
2. **Iconos Adaptativos**: Resoluciones 192x192 y 512x512 en `website/assets/icons/`.
3. **Página de Contingencia Offline (`/offline`)**: Mensaje amable de conexión intermitente con acceso a destinos cacheados previamente.
