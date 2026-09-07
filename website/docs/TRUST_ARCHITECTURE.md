# ARQUITECTURA DEL BAQUEANO TRUST LAYER

## 1. Visión General
El **Trust Layer** es el subsistema transversal de Baqueano responsable de auditar, verificar y certificar la veracidad, frescura y sostenibilidad de la información territorial.

```text
                            BAQUEANO
                               │
                        TRUST LAYER
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
  VERIFICATION          SUSTAINABILITY            INTEGRITY
       │                       │                       │
       ├─ Evidence (Storage)   ├─ Environment          ├─ Fraud Queue
       ├─ Provenance & Source  ├─ Local Economy        ├─ Abuse & Spam
       ├─ Freshness Rules      ├─ Community Impact     ├─ Duplicates
       ├─ Badges Governance   ├─ Culture & Ethics     ├─ Manipulation
       └─ Certifications       └─ Accessibility        └─ Appeals Workflow
                               │
                               ▼
                 RESPONSIBLE TOURISM ENGINE (BRTI)
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
             BUSINESS      DESTINATION     EXPERIENCE
```

## 2. Componentes Fundamentales
1. **Motor de Verificación**: Validación en dos fases (Four-Eyes Principle) para otorgamiento de insignias.
2. **Motor de Frescura (*Freshness Engine*)**: Umbrales temporales estrictos por campo (precios y horarios a 90 días).
3. **Motor BRTI v1.0.0**: Ponderación de 6 dimensiones de turismo responsable con ajuste de confianza.
4. **Capa Antifraude**: Detección de duplicados, números telefónicos compartidos y patrones de reseñas anómalos.
5. **Capa de Privacidad de Evidencias**: Las pruebas documentales se mantienen en Storage privado con URLs de acceso efímero.
