# MODELO DE DATOS DEL TRUST LAYER

## 1. Colecciones Firestore
- `verifications`: Registro de verificaciones de recursos territoriales con fechas, revisores y tipo.
- `verification_evidence`: Metadatos y referencias seguras a archivos de evidencia fotográfica/documental.
- `trust_claims`: Afirmaciones de sostenibilidad registradas por anfitriones y auditadas por moderadores.
- `certifications`: Certificaciones externas oficiales validadas.
- `integrity_cases`: Casos de fraude, duplicidad o abuso en moderación.
- `trust_appeals`: Solicitudes formales de apelación contra rechazos o suspensiones.
- `trust_audits`: Logs inmutables de auditoría de eventos de confianza.

## 2. Diagrama de Relaciones
```text
[Resource: Place / Destination]
       ▲
       ├── (1:N) ── [VerificationRecord] ── (1:N) ── [VerificationEvidenceRecord]
       ├── (1:N) ── [SustainabilityClaimRecord]
       ├── (1:1) ── [ResponsibleTourismIndexRecord]
       └── (1:N) ── [IntegrityCaseRecord] ── (0:1) ── [TrustAppealRecord]
```
