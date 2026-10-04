# Fuentes de traducción (TSV)

Cada archivo es una ronda de frases: **español, inglés, francés, italiano, portugués, alemán** separadas por tabulador.
Ya están fusionadas en `locales/*.json`. Para añadir una ronda nueva:

```bash
node scripts/merge-i18n-phrases.mjs nueva-ronda.tsv ui          # prueba
node scripts/merge-i18n-phrases.mjs nueva-ronda.tsv ui --write  # guarda
node scripts/validate-i18n.mjs                                  # valida los 6 catálogos
node scripts/audit-i18n-pages.mjs --write                       # regenera docs/I18N_AUDIT.md
```

No se publican en producción (`website/scripts` e `i18n-sources` no están en la lista del build).
