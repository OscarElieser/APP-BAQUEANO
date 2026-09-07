# ESTRATEGIA DE DOMINIOS & ARQUITECTURA DE ENRUTAMIENTO REGIONAL

## 1. Evaluación de Alternativas de Dominio

| Modelo | Ejemplo | Ventajas | Desventajas | Decisión Baqueano |
| :--- | :--- | :--- | :--- | :---: |
| **Subdirectorios (ccTLD/Folder)** | `baqueano.app/ni`, `baqueano.app/cr` | Máxima consolidación de autoridad SEO, único certificado SSL, bajo costo FinOps. | Requiere manejo fino de cookies y routing. | **✅ SELECCIONADA** |
| **Subdominios** | `ni.baqueano.app`, `cr.baqueano.app` | Aislamiento claro. | Fragmenta el PageRank y autoridad de dominio en Google. | Descartada |
| **ccTLDs Nacionales** | `baqueano.com.ni`, `baqueano.cr` | Geolocalización fuerte. | Muy alto costo de gestión, dispersión de marca y complejidad DNS. | Descartada |

---

## 2. Decisión Arquitectónica

Baqueano opera bajo un **único dominio global de alto rendimiento (`baqueano.app`)**, utilizando subdirectorios de país para mercados internacionales y preservando las rutas directas para Nicaragua.
