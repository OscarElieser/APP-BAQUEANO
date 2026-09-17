# ARQUITECTURA DEL MODO KIOSCO & TÓTEM TÁCTIL DE AUTOATENCIÓN

## 1. Propósito y Contexto de Despliegue

El **Modo Kiosco de Baqueano** (`/kiosk/[smartPointId]`) está concebido para terminales táctiles de uso público ubicadas en:
- Centros de visitantes de reservas y parques nacionales.
- Puestos de control de guardaparques y boleterías.
- Oficinas de turismo municipal y cooperativas comunitarias.

---

## 2. Decisiones de Diseño e Interfaz (UI/UX Kiosk Standards)

1. **Objetivos Táctiles Amplios (Touch Targets >= 56px)**:
   - Toda la interfaz utiliza botones, pestañas y tarjetas con padding amplio para garantizar una experiencia cómoda y sin errores en pantallas táctiles de 10" a 32".
2. **Temporizador de Inactividad (Idle Reset Timer a 90 Segundos)**:
   - Si no se detecta interacción táctil durante 90 segundos, el kiosco vuelve automáticamente a la pantalla de bienvenida y restablece el idioma por defecto, protegiendo la privacidad y garantizando un punto de partida limpio para el siguiente usuario.
3. **Soporte Multilingüe e Inclusivo**:
   - Selector directo entre Español, English y Miskito.
   - Transcripción textual completa de audioguías para personas con discapacidad auditiva.
4. **Continuidad Móvil mediante Código QR Dinámico**:
   - Cada sendero, mapa y audioguía genera un código QR instantáneo para que el visitante pueda transferir la información a su teléfono móvil y continuar la expedición en el sendero sin perder el contexto.

---

## 3. Modo Kiosk en Hardware & Navegador

- **Configuración Kiosk en Navegador**: Ejecutable en modo *Fullscreen Kiosk* (`chrome --kiosk --disable-session-crashed-bubble --incognito`).
- **Bloqueo de Navegación Externa**: La interfaz no contiene enlaces salientes a dominios externos ni permite salir del perímetro de información del parque.
- **Tolerancia a Fallos de Red**: Cacheo local de recursos multimedia para que el kiosco continúe funcionando de forma fluida aun si la conexión a internet sufre intermitencias breves.
