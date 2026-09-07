# MODELO DE VERIFICACIÓN TERRITORIAL

## 1. Ciclo de Vida de la Verificación
```text
[UNVERIFIED] ──> [SUBMITTED] ──> [UNDER_REVIEW] ──┬──> [VERIFIED] (Vigencia 12 meses)
                                                  │         │
                                                  │         ├──> [VERIFICATION_EXPIRED]
                                                  │         └──> [SUSPENDED] / [REJECTED]
                                                  └──> [REJECTED]
```

## 2. Tipos de Verificación Admitidos
1. `BAQUEANO_REVIEW`: Inspección directa del equipo técnico territorial.
2. `PARTNER_VERIFIED`: Verificado por cooperativas o cámaras de turismo aliadas.
3. `OFFICIAL_SOURCE`: Respaldado por decretos oficiales en La Gaceta o INETER/MARENA.
4. `COMMUNITY_VALIDATED`: Carta de aval de la directiva comunal o pueblo originario.
5. `DOCUMENT_CHECK`: Revisión exhaustiva de permisos de operación y licencias.
6. `FIELD_VISIT`: Visita presencial con registro fotográfico y coordenadas de entrada.
7. `SYSTEM_VALIDATED`: Verificación criptográfica o de identidad digital autorizada.

## 3. Caducidad Obligatoria
Toda verificación vence a los 12 meses (o 3 meses para datos de alta volatilidad como precios). Al expirar, pasa a `VERIFICATION_EXPIRED` hasta su renovación.
