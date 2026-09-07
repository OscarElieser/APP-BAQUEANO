# MODELO DE SEGURIDAD, AISLAMIENTO MULTI-TENANT & AUTORIZACIÓN REGIONAL (ABAC)

## 1. Principio de Aislamiento Estricto por País

En el modelo multi-país de Baqueano, ningún usuario ni administrador puede acceder a información privada de un país fuera de su ámbito autorizado (*Country Scope*).

### Regla de Control de Acceso Basado en Atributos (ABAC):
Un sujeto $S$ puede realizar la acción $A$ sobre el recurso $R$ si y solo si:

$$\text{User.Role} \in \text{AllowedRoles}(A) \quad \land \quad (R.\text{countryId} \in S.\text{authorizedCountryScopes} \lor S.\text{isSuperAdmin} = \text{true})$$

---

## 2. Pruebas de Intrusión y Fugas Cruzadas

1. **Intento de Acceso No Autorizado**:
   - `Admin NI` intentando acceder a `GET /api/v1/admin/businesses?country=CR` recibe `HTTP 403 Forbidden`.
2. **Aislamiento de Flota IoT**:
   - Técnicos de campo en Nicaragua no pueden comandar gateways o sensores ubicados en Costa Rica o Guatemala.
3. **Aislamiento Financiero**:
   - Las liquidaciones a cooperativas nicaragüenses se procesan exclusivamente en cuentas bancarias locales de Nicaragua (BAC/LAFISE/BANPRO) en moneda `NIO` o `USD` sin mezclar pasarelas internacionales.
