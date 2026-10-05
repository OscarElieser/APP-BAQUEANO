# 🧭 BAQUEANO — Objetivos SMART, estrategia de crecimiento y métricas

## 🎯 POR QUÉ (Propósito)
Convertir la visión ("descubrí lo que no sale en el mapa") en metas medibles, con fecha y con una forma de comprobarlas. Las cifras son **metas**, no resultados alcanzados. La línea base se toma el día del lanzamiento público.

## ⚙️ CÓMO (Método)
- Criterio SMART: específico, medible, alcanzable, relevante y con plazo.
- Embudo de crecimiento **AARRR** (adquisición, activación, retención, recomendación e ingresos), alineado con las 4F (`docs/design/MARKETING_4F_BAQUEANO.md`).
- Medición con datos propios, sin rastreadores de terceros:
  - `traffic_sessions`: telemetría anónima.
  - `testimonials`: experiencias publicadas.
  - `businesses.verified`: negocios verificados.
  - Eventos `baqueano:telemetry`: rutas de BAQUI y entidades resueltas.

## 📦 QUÉ (Entregables)

### 1. Objetivos SMART (primeros 6 meses tras el lanzamiento)

| # | Objetivo | Métrica y fuente | Meta | Plazo |
|---|---|---|---|---|
| O1 | Atraer exploradores nacionales al sitio | Sesiones únicas mensuales (`traffic_sessions`) | 5 000 / mes | Mes 3 |
| O2 | Lograr que el visitante planifique con BAQUI | % de sesiones con al menos una ruta generada | 15 % | Mes 3 |
| O3 | Construir comunidad con contenido real | Experiencias publicadas y aprobadas (`testimonials.status = published`) | 300 | Mes 6 |
| O4 | Cubrir todo el territorio | Territorios con al menos 3 experiencias publicadas | 17 / 17 | Mes 6 |
| O5 | Dar visibilidad a emprendedores | Negocios verificados (`businesses.verified`) | 120 (mínimo 5 por territorio) | Mes 6 |
| O6 | Generar contacto directo con anfitriones | Clics a WhatsApp o "Cómo llegar" desde fichas | 2 000 / mes | Mes 6 |
| O7 | Retener exploradores | Usuarios registrados que vuelven en 30 días | 25 % | Mes 6 |
| O8 | Alcance internacional | Sesiones en EN, FR, IT, PT y DE | 20 % del total | Mes 6 |
| O9 | Calidad y seguridad | Contenido denunciado resuelto en menos de 48 h (Ops Center) | 95 % | Continuo |

### 2. Estrategia de crecimiento (embudo AARRR)

| Etapa | Táctica en BAQUEANO | Indicador |
|---|---|---|
| **Adquisición** | SEO por territorio (`departamento.html?id=…` en 6 idiomas); campañas por departamento (ver `05_BRIEF_CREATIVO_Y_CAMPANA.md`); códigos QR en negocios aliados; alianzas con universidades y alcaldías | Sesiones por canal |
| **Activación** | BAQUI con un ejemplo listo ("3 días entre Granada y Masaya…"); mapa del territorio al primer clic | Primera ruta o primer favorito en la sesión |
| **Retención** | Pasaporte del explorador e insignias; "Mi viaje" guardado; respuestas a las experiencias publicadas | Regreso a 7 y 30 días |
| **Recomendación** | Publicar la experiencia con fotos y video; compartir la ruta de BAQUI; reacciones y comentarios | Experiencias por usuario activo; enlaces compartidos |
| **Ingresos** (fase 2) | Plan destacado para negocios verificados; anuncios contextuales por territorio | Negocios con plan destacado; ingreso mensual |

**Bucle de crecimiento (loop):**

1. El viajero publica su experiencia.
2. La experiencia aparece en el departamento y en el destino, y se indexa en buscadores.
3. Un nuevo viajero la encuentra, planifica con BAQUI y visita el lugar.
4. Ese viajero publica su propia experiencia, y el bucle vuelve a empezar.

En paralelo, el anfitrión ve llegar visitantes y comparte su ficha verificada, con lo que trae más tráfico.

### 3. Prioridades por fase

| Fase | Duración | Foco | Segmentos (ver `01_…`) |
|---|---|---|---|
| Lanzamiento | Meses 0–1 | Hackathon, demo y primeras 50 experiencias | S1 y S5 |
| Tracción | Meses 2–3 | Contenido por departamento y alianzas con alcaldías | S1, S2 y S5 |
| Expansión | Meses 4–6 | Diáspora e internacional (6 idiomas); plan destacado | S3, S4 y S5 |
