<!-- ============================================================================
🧭 BAQUEANO ECOSYSTEM — EVIDENCIA FORMAL DE CULMINACIÓN: SPRINT 2
============================================================================

🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Acreditar de forma irrebatible la infraestructura cloud en Microsoft Azure,
  la seguridad perimetral de red, la accesibilidad pública mediante IP y dominio
  canónico, y la conectividad a base de datos de producción para BAQUEANO.
- Garantizar que la máquina virtual cumpla con el principio de mínima exposición:
  únicamente puertos indispensables abiertos y bases de datos aisladas de Internet.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
- Servidor en la nube: Azure Virtual Machine `vm-baqueano-prod` en Ubuntu Linux 6.8.
- Servidor web reverso Nginx con TLS/SSL activo en puertos 80 y 443.
- Seguridad de Red (NSG): Puertos 80, 443 y 22 (restringido) abiertos externamente.
  Puertos críticos 3000 (API interna Node) y 5432 (PostgreSQL) cerrados/filtrados.
- Runtime Node.js v22.23.3 para servicios auxiliares locales y puente de datos.
- Base de datos principal: Supabase PostgreSQL (PostgREST con RLS) conectado.
- Base de datos local: PostgreSQL 127.0.0.1:5432 escuchando exclusivamente en localhost.

📦 3. QUÉ (WHAT / ENTREGABLES & RESULTADOS):
- Dominio canónico activo: https://baqueanonicaragua.com con certificado SSL.
- IP pública de Azure: 20.80.81.65 con resolución DNS directa.
- Auditoría de puertos en vivo: 80 y 443 abiertos; 3000 y 5432 filtrados.
- Verificación de runtime y base de datos con /api/azure/health y /api/azure/db.
- Reporte automatizado en docs/evidencias/sprint-2/resultados/verificacion.json.
============================================================================ -->

# 🧭 EVIDENCIA FORMAL DE CULMINACIÓN: SPRINT 2
**Proyecto:** BAQUEANO Nicaragua — Infraestructura Cloud y Seguridad de Red  
**Estado:** ✅ APROBADO Y CONSOLIDADO AL 100%  
**Servidor Azure:** `vm-baqueano-prod`  
**IP Pública:** `20.80.81.65`  
**Dominio Oficial:** `https://baqueanonicaragua.com`  
**Commit Desplegado:** `6cc4841`  

---

## 1. Resumen Ejecutivo del Sprint 2

El Sprint 2 valida la infraestructura de producción en Microsoft Azure, certificando que el servidor opera de forma segura, con puertos de servicio debidamente controlados por Network Security Groups (NSG) y Nginx, garantizando alta disponibilidad y aislamiento estricto de la capa de persistencia.

| Componente | Configuración en Producción | Estado Técnico | Verificación |
|---|---|---|---|
| **Máquina Virtual** | Azure VM `vm-baqueano-prod` | Activa | Ubuntu Linux `6.8.0-1070-azure` |
| **Runtime** | Node.js `v22.23.3` | Activo | Systemd service en localhost:3000 |
| **Servidor Web** | Nginx con TLS 1.3 / HTTP/2 | Activo | Puertos 80 y 443 operativos |
| **Seguridad de Puertos** | NSG Perimetral Azure | Protegido | 3000 y 5432 cerrados / filtrados |
| **Base de Datos Cloud** | Supabase PostgreSQL | Conectada | 17 departamentos, 249ms latencia |
| **Base de Datos Local** | PostgreSQL en `127.0.0.1:5432` | Operativa | Solo localhost (`accepting connections`) |

---

## 2. Auditoría Perimetral de Puertos y Seguridad

Se ejecutó un escaneo de sockets TCP directo a la IP pública de Azure (`20.80.81.65`) arrojando los siguientes resultados en vivo:

```text
[AUDITORÍA DE PUERTOS AZURE — 20.80.81.65]
Puerto 80   (HTTP)        --> ABIERTO   (Nginx redirige / atiende peticiones web)
Puerto 443  (HTTPS)       --> ABIERTO   (Nginx con cifrado TLS activo)
Puerto 22   (SSH)         --> PROTEGIDO (Acceso por par de claves RSA/ed25519)
Puerto 3000 (API interna) --> CERRADO / FILTRADO (Aislado de Internet, solo localhost)
Puerto 5432 (PostgreSQL)  --> CERRADO / FILTRADO (Base de datos nunca expuesta a Internet)
```

> [!IMPORTANT]
> **Cumplimiento del Principio de Mínima Exposición:**  
> Ninguna base de datos ni servicio interno tiene puertos expuestos al público. Los clientes se comunican exclusivamente a través del puerto seguro HTTPS (443).

---

## 3. Comprobaciones de Endpoints de Infraestructura Azure

### 3.1 Endpoint de Salud y Paridad de Código (`/health`)
- **URL:** `https://baqueanonicaragua.com/health`
- **Respuesta JSON:**
  ```json
  {
    "status": "ok",
    "service": "baqueano-website",
    "host": "azure",
    "commit": "6cc4841",
    "deployedAt": "2026-10-04T03:19:55Z"
  }
  ```
- **Conclusión:** El servidor Azure reporta paridad exacta con el commit `6cc4841` de la rama `main` de GitHub.

### 3.2 Endpoint de Runtime de Azure (`/api/azure/health`)
- **URL:** `https://baqueanonicaragua.com/api/azure/health`
- **Respuesta JSON:**
  ```json
  {
    "status": "ok",
    "service": "baqueano-azure-api",
    "hostname": "vm-baqueano-prod",
    "platform": "Linux 6.8.0-1070-azure",
    "node": "v22.23.3",
    "uptimeSeconds": 49266,
    "release": {
      "status": "ok",
      "service": "baqueano-website",
      "host": "azure",
      "commit": "6cc4841"
    }
  }
  ```

### 3.3 Endpoint de Conectividad a Bases de Datos (`/api/azure/db`)
- **URL:** `https://baqueanonicaragua.com/api/azure/db`
- **Respuesta JSON:**
  ```json
  {
    "primaryDatabase": {
      "provider": "supabase-postgresql",
      "ok": true,
      "status": 200,
      "departments": 17,
      "latencyMs": 249
    },
    "azureLocalPostgres": {
      "role": "evidencia-rubrica (solo localhost, sin datos productivos)",
      "ok": true,
      "detail": "127.0.0.1:5432 - accepting connections"
    }
  }
  ```

---

## 4. Archivo de Evidencias Técnicas

El informe JSON completo de la ejecución se ubica en:
`docs/evidencias/sprint-2/resultados/verificacion.json`
- **Total de pruebas ejecutadas:** 15
- **Pruebas aprobadas:** 15 (100%)
- **Pruebas fallidas:** 0 (0%)
