# 🤖 BAQUI — Casos de demostración (extracción de la solicitud de viaje)

## 🎯 POR QUÉ
La evaluación pide que BAQUI entienda una solicitud real (adultos, niños, presupuesto y varios destinos) y que **pregunte los días** cuando no se dicen, en lugar de inventarlos.

## ⚙️ CÓMO
- Motor: `website/js/baqueano-travel-session.js` → `parseTravelIntent()`.
- Página: `baqueano-ia.html` (chat, mapa, itinerario y presupuesto comparten una sola TravelSession).
- Reglas:
  - No se suponen valores: días y viajeros quedan vacíos hasta que la persona los dice.
  - Los montos aceptan formato nicaragüense y anglosajón: `1.500`, `1,500`, `C$ 8,000`, `US$ 1,200`.
  - "Por persona" se multiplica por los viajeros.
  - "Somos…" describe al grupo completo.
  - Los precios solo se suman si tienen ficha vigente y verificable.
- Prueba automática:

  ```bash
  cd website && BASE_URL=http://127.0.0.1:8765/ npm run test:baqui
  ```

  Resultado (2026-10-05): **17/17 OK**, sin errores JS.

## 📦 QUÉ (casos verificados)

| # | El viajero escribe | BAQUI entiende |
|---|---|---|
| 1 | Somos 2 adultos y 3 niños, tenemos 500 dólares y queremos ir a Granada, Masaya y León | 2 adultos · 3 niños · 500 USD · Granada → Masaya → León · **días: pregunta** |
| 2 | Quiero ir a Somoto con mi esposa y mi hijo, presupuesto de C$ 8,000 | 2 adultos · 1 niño · 8 000 NIO · Somoto · días: pregunta |
| 3 | Vamos 4 personas a Estelí por 3 días con $300 | 4 adultos · 300 USD · Estelí · 3 días |
| 4 | dos noches en Granada | 3 días (2 noches) · viajeros: pregunta |
| 5 | Tenemos un presupuesto de 1.500 dólares para León y Chinandega, somos 3 adultos | 3 adultos · 1 500 USD · León → Chinandega |
| 6 | 3 niños y 2 adultos a Masaya con 20000 córdobas | 2 adultos · 3 niños · 20 000 NIO |
| 7 | Viajo sola a Granada por una semana con 700 USD | 1 adulta · 7 días · 700 USD |
| 8 | Somos 5, dos de ellos niños, queremos conocer Managua | 3 adultos · 2 niños |
| 9 | Mi pareja y yo con nuestros dos hijos, US$ 1,200, Granada y Masaya | 2 adultos · 2 niños · 1 200 USD |
| 10 | Somos una familia de 4: 2 adultos y 2 niños, 800 dólares, Estelí | 2 adultos · 2 niños · 800 USD |
| 11 | Quiero ir a León | Solo destino; pregunta días y viajeros |
| 12 | 2 adultos y un bebé, $450, Somoto y Estelí, fin de semana | 2 adultos · 1 niño · 450 USD · 2 días |
| 13 | Tenemos 600 dólares, somos 2 personas mayores y 1 niña, vamos a Granada | 2 adultos · 1 niña · 600 USD |
| 14 | Presupuesto de 50 dólares por persona, somos 4 adultos, Masaya | 4 adultos · **200 USD en total (50 por persona)** |
| 15 | Con mis 3 hijos y mi esposo a Granada, 5 días, 900 dólares | 2 adultos · 3 niños · 5 días · 900 USD |

**Conversación de demostración (guion para el jurado):**

1. **Viajero:** "Somos 2 adultos y 3 niños, tenemos 500 dólares y queremos ir a Granada, Masaya y León".

   **BAQUI:** "Tengo tu ruta con 3 paradas: Granada → Masaya → León para 2 adultos y 3 niños con $500 en total. … Para repartir las paradas por día y afinar el presupuesto me falta saber cuántos días quieren viajar."

2. **Viajero:** "4 días".

   **Resultado:** itinerario de 4 días. Se conservan los viajeros, el presupuesto y la ruta. El mapa y el presupuesto se actualizan con la misma sesión.
