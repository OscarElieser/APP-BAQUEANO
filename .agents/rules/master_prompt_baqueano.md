# 🧭 PROMPT MAESTRO FINAL — BAQUEANO NICARAGUA
### Plataforma Tecnológica para Turismo Sostenible, Conservación y Bienestar Comunitario

---

## 🔴 REGLA DE ORO — LEER ANTES DE MODIFICAR CUALQUIER COSA

> **SI YA FUNCIONA, SE CONSERVA.**

El proyecto BAQUEANO ya existe y contiene código, pantallas, navegación, componentes, servicios, modelos, Firebase, autenticación, configuración, estilos y funcionalidades implementadas.

### 🚫 ESTÁ PROHIBIDO:
1. Crear un proyecto Flutter nuevo desde cero.
2. Borrar funcionalidades existentes.
3. Reemplazar módulos funcionales sin necesidad.
4. Eliminar pantallas existentes.
5. Eliminar rutas existentes.
6. Eliminar servicios existentes.
7. Eliminar modelos existentes.
8. Eliminar componentes reutilizables.
9. Eliminar colecciones de Firebase.
10. Cambiar innecesariamente Firebase Authentication.
11. Cambiar Firestore Rules sin analizar primero el impacto.
12. Cambiar Storage Rules sin analizar primero el impacto.
13. Cambiar dependencias sin necesidad.
14. Cambiar la identidad visual existente sin justificación.
15. Hacer refactorizaciones masivas que no estén relacionadas con el objetivo solicitado.
16. Crear soluciones paralelas cuando ya existe una solución funcional.
17. Duplicar servicios, modelos o componentes que ya existen.
18. Romper una funcionalidad existente para implementar otra.

### 🛡️ PRINCIPIO OBLIGATORIO:
**CONSERVAR + REUTILIZAR + INTEGRAR + EXTENDER + MEJORAR**  
*(Nunca: BORRAR + REEMPLAZAR + RECONSTRUIR)*

---

## 1. IDENTIDAD DEL PROYECTO
**Nombre:** BAQUEANO NICARAGUA  
BAQUEANO representa al conocedor del territorio: quien conoce los caminos, montañas, ríos, comunidades, historias, tradiciones y secretos de cada lugar. No es una app turística genérica; es una plataforma tecnológica de turismo sostenible, aventura, ecoturismo, turismo rural, turismo comunitario y preservación del patrimonio histórico-cultural de Nicaragua.

---

## 2. PROBLEMA CENTRAL QUE SOLUCIONA
> **«Impulso del turismo para la conservación del entorno y el bienestar de las comunidades locales.»**

La tecnología es el medio. El turismo sostenible es el propósito.

---

## 3. MATRIZ DE PENSAMIENTO DE CADA FUNCIONALIDAD
Cadena de validación innegociable:
`PROBLEMA → NECESIDAD → SOLUCIÓN BAQUEANO → FUNCIONALIDAD → USUARIO BENEFICIADO → COMUNIDAD BENEFICIADA → IMPACTO AMBIENTAL/CULTURAL/ECONÓMICO → INDICADOR`

---

## 4. OBJETIVOS ESTRATÉGICOS
* **4.1 Diversificar el turismo:** Desconcentrar flujos, visibilizar destinos rurales y comunidades emergentes.
* **4.2 Proteger el medio ambiente:** Educación ambiental, buenas prácticas, respeto a flora y fauna, reducción de residuos, altimetría y dificultad técnica.
* **4.3 Fortalecer las comunidades:** Visibilizar baqueanos, guías campesinos, posadas, comedores, artesanos y cooperativas.
* **4.4 Mejorar la distribución económica:** Trato directo Explorador ↔ Comunidad sin intermediación abusiva.
* **4.5 Preservar la memoria histórica y cultural:** Enciclopedia viva de historia, pueblos originarios, símbolos, gastronomía, literatura y tradiciones.

---

## 5. USUARIO PRINCIPAL: 🌱 EXPLORADOR RESPONSABLE
El visitante no es un simple turista; es un explorador consciente que viaja con respeto, consume local y apoya la conservación.

---

## 6. PAPEL PROTAGÓNICO DEL BAQUEANO
El baqueano tradicional campesino es el corazón del ecosistema: su sabiduría territorial, anécdotas y guía personalizada se colocan al centro de la experiencia digital.

---

## 7. ALCANCE ACTUAL — EXCLUSIVAMENTE APP ANDROID
> **«La prioridad y alcance actual de este proyecto es exclusivamente la aplicación móvil Android desarrollada en Flutter/Dart.»**

Antigravity interpreta y opera sobre la arquitectura central:
```
BAQUEANO
   │
   └── 📱 APP ANDROID
          │
          ├── Flutter / Dart
          ├── Firebase (Auth, Firestore, Storage)
          ├── Google Maps & Geolocalización
          ├── Asistente IA Responsable
          ├── Reservas y Comercio Campesino
          ├── Pasaporte Baqueano y Gamificación
          ├── Historia, Departamentos y Cultura Viva
          ├── Comunidad y Chat Directo
          ├── Emergencias y Rescate SOS
          └── Turismo Sostenible
```

### 🚨 REGLAS ESTRICTAS DE ALCANCE:
1. El desarrollo actual de BAQUEANO está dirigido **únicamente y con exclusividad** a la aplicación móvil Android (`lib/` y `android/`).
2. **NO implementar, desarrollar ni priorizar actualmente:**
   - Versión iOS;
   - Aplicación Web pública;
   - PWA;
   - Panel administrativo Web;
   - Adaptación específica para navegador;
   - Funcionalidades exclusivas de escritorio.
3. Si existen carpetas, archivos o arquitecturas relacionadas con Web, iOS o administración (`admin/`), **no eliminarlas**, pero **tampoco convertirlas en parte del desarrollo actual**.
4. No modificar componentes relacionados con esas plataformas salvo que sea estrictamente necesario para que Android funcione correctamente.
5. Toda nueva funcionalidad debe responder primero a esta pregunta:
   > **«¿Esto es necesario o aporta valor directamente a la experiencia del usuario de la APP ANDROID BAQUEANO?»**  
   > *Si la respuesta es no, no debe implementarse ahora.*

---

## 8. INTEGRIDAD DE FIREBASE Y SEGURIDAD RBAC
* Roles contemplados: `superadmin`, `admin`, `operator`, `guide`, `user`.
* La seguridad no se confía únicamente a la UI: se blinda en `firestore.rules` y `storage.rules`.
* Cero migraciones destructivas.

---

## 9. CONEXIÓN CULTURA ↔ TURISMO
Integración relacional transversal:
`PERSONAJE HISTÓRICO → LUGAR RELACIONADO → HISTORIA → DESTINO → MAPA → EXPERIENCIAS → NEGOCIOS LOCALES`

---

## 10. ESTÁNDAR VISUAL Y DE CÓDIGO
* **Paleta Volcánica Oficial:**
  * `#082B35` (Petróleo Volcánico)
  * `#C86432` (Terracota)
  * `#D4AF37` (Oro Pinolero)
  * `#0F172A` (Noche Profunda)
* **Glassmorphism:** `BackdropFilter(sigmaX: 12, sigmaY: 12)` con bordes lumínicos sutiles.
* **Cero Deprecaciones:** Uso riguroso de `.withValues(alpha: X)` eliminando totalmente `.withOpacity()`.
* **Análisis Limpio:** `flutter analyze` debe arrojar siempre **`No issues found!`**.
* **Documentación:** Encabezados explicativos detallando propósito, arquitectura, integraciones y dependencias.
