#!/usr/bin/env node
/**
 * WHY
 * Provides a fast local quality gate for production-hardening invariants.
 *
 * HOW
 * Reads source files and verifies security-sensitive contracts without requiring live credentials.
 *
 * WHAT
 * Smoke tests for env placeholders, health route, admin noindex, and known Firestore query regressions.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const envExample = read(".env.example");
const envStaging = read(".env.staging");
const envProduction = read(".env.production");
const firebaseSource = read("packages/firebase/src/index.ts");
const webHealthRoute = read("apps/web/src/app/api/health/route.ts");
const adminLayout = read("apps/admin/src/app/layout.tsx");
const webConfig = read("apps/web/next.config.mjs");
const adminConfig = read("apps/admin/next.config.mjs");

for (const [name, source] of [
  [".env.example", envExample],
  [".env.staging", envStaging],
  [".env.production", envProduction]
]) {
  assert(!source.includes("-----BEGIN"), `${name} must not contain private key material.`);
  assert(!source.includes("AIzaSy"), `${name} must not contain a real-looking Firebase API key.`);
  assert(source.includes("NEXT_PUBLIC_FIREBASE_PROJECT_ID"), `${name} must document Firebase project id.`);
}

assert(firebaseSource.includes('where("userId", "==", userId)'), "Favorites query must use the runtime userId.");
assert(webHealthRoute.includes("validatePublicEnvironment"), "Health route must validate public env.");
assert(adminLayout.includes("index: false") && adminLayout.includes("follow: false"), "Admin metadata must be noindex/nofollow.");
assert(webConfig.includes("Content-Security-Policy"), "Web app must define CSP headers.");
assert(adminConfig.includes("X-Robots-Tag"), "Admin app must emit noindex header.");

const brtiService = read("apps/web/src/services/responsible-tourism.service.ts");
const trustConfig = read("packages/config/src/index.ts");
const trustPublicRoute = read("apps/web/src/app/confianza/metodologia/page.tsx");
const trustAdminRoute = read("apps/admin/src/app/confianza/page.tsx");
const trustOpenApiRoute = read("apps/web/src/app/api/open/v1/places/[id]/trust/route.ts");

assert(brtiService.includes("calculateBrtiScore"), "BRTI service must export calculateBrtiScore.");
assert(brtiService.includes("isRuralSmallholder"), "BRTI engine must include rural smallholder equity safeguard.");
assert(trustConfig.includes("TRUST_BADGES_CATALOG"), "Config must export TRUST_BADGES_CATALOG.");
assert(trustConfig.includes("FIELD_FRESHNESS_THRESHOLDS_DAYS"), "Config must define field freshness thresholds.");
assert(trustPublicRoute.includes("BAQUEANO TRUST LAYER"), "Public trust methodology route must render Trust Layer explanation.");
assert(trustAdminRoute.includes("Gobernanza de Confianza & Sostenibilidad"), "Admin trust page must render governance interface.");
assert(trustOpenApiRoute.includes("getPublicTrustSummary"), "Open Data trust endpoint must resolve sanitized public trust signals.");

const orchestratorService = read("apps/web/src/services/agents/orchestrator.service.ts");
const policyEngineService = read("apps/web/src/services/agents/policy-engine.service.ts");
const toolRegistryService = read("apps/web/src/services/agents/tool-registry.service.ts");
const conciergePageRoute = read("apps/web/src/app/baqueano-ai/page.tsx");

assert(orchestratorService.includes("routeAndExecuteWorkflow"), "Orchestrator must export routeAndExecuteWorkflow.");
assert(policyEngineService.includes("evaluateAgentAction"), "Policy engine must export evaluateAgentAction.");
assert(policyEngineService.includes("isFinancialOperation"), "Policy engine must block autonomous financial operations.");
assert(toolRegistryService.includes("calculateBudgetTool"), "Tool registry must calculate budget deterministically.");
assert(conciergePageRoute.includes("BAQUEANO DIGITAL CONCIERGE"), "Baqueano AI page must render Digital Concierge workspace.");
assert(conciergePageRoute.includes("confirmationModal"), "Digital Concierge must integrate Human-in-the-Loop confirmation modal.");

// ============================================================================
// FASE 16: PREDICTIVE INTELLIGENCE & SIMULATION LAB ASSERTIONS
// ============================================================================
const predictiveEngineService = read("apps/web/src/services/predictive/predictive-engine.service.ts");
const simulationEngineService = read("apps/web/src/services/predictive/simulation-engine.service.ts");
const predictiveToolsService = read("apps/web/src/services/predictive/predictive-tools.service.ts");
const predictiveAdminRoute = read("apps/admin/src/app/predictive/page.tsx");
const simulationAdminRoute = read("apps/admin/src/app/simulation/page.tsx");
const predictiveConfig = read("packages/config/src/index.ts");

assert(predictiveEngineService.includes("evaluateDataReadiness"), "Predictive engine must audit data readiness.");
assert(predictiveEngineService.includes("calculateBaseline"), "Predictive engine must compute baseline moving averages.");
assert(predictiveEngineService.includes("generateDemandForecast"), "Predictive engine must generate demand forecasts.");
assert(predictiveEngineService.includes("estimateCapacityUtilization"), "Predictive engine must estimate capacity utilization.");
assert(predictiveEngineService.includes("calculateTerritorialPressure"), "Predictive engine must calculate territorial pressure.");
assert(predictiveEngineService.includes("setModelKillSwitch"), "Predictive engine must implement a model kill-switch.");

assert(simulationEngineService.includes("runScenario"), "Simulation engine must execute What-If scenarios.");
assert(simulationEngineService.includes("compareScenarios"), "Simulation engine must compare baseline vs candidate scenarios.");
assert(simulationEngineService.includes("isSimulatedData: true"), "Simulation engine must strictly tag simulated outputs.");

assert(predictiveToolsService.includes("getDemandForecastTool"), "Predictive tools must expose getDemandForecastTool.");
assert(predictiveToolsService.includes("getCapacityForecastTool"), "Predictive tools must expose getCapacityForecastTool.");
assert(predictiveToolsService.includes("runSimulationScenarioTool"), "Predictive tools must expose runSimulationScenarioTool.");

assert(predictiveAdminRoute.includes("Inteligencia Predictiva Territorial"), "Admin predictive page must render dashboard.");
assert(predictiveAdminRoute.includes("PRINCIPIO DE TRANSPARENCIA"), "Admin predictive page must render epistemological transparency disclosure.");

assert(simulationAdminRoute.includes("MODO SIMULACIÓN ACTIVO"), "Simulation lab must render prominent simulation banner.");
assert(simulationAdminRoute.includes("Simulation Lab (What-If Studio)"), "Simulation lab must render interactive studio.");

assert(predictiveConfig.includes("PREDICTIVE_MODEL_CATALOG"), "Config must export PREDICTIVE_MODEL_CATALOG.");
assert(predictiveConfig.includes("SIMULATION_BOUNDS_CONFIG"), "Config must export SIMULATION_BOUNDS_CONFIG.");

// ============================================================================
// FASE 17: SPATIAL INTELLIGENCE & ADVANCED GIS ASSERTIONS
// ============================================================================
const spatialEngineService = read("apps/web/src/services/spatial/spatial-engine.service.ts");
const routingEngineService = read("apps/web/src/services/spatial/routing-engine.service.ts");
const spatialToolsService = read("apps/web/src/services/spatial/spatial-tools.service.ts");
const publicCorridorsRoute = read("apps/web/src/app/rutas/page.tsx");
const corridorDetailRoute = read("apps/web/src/app/rutas/[slug]/page.tsx");
const adminSpatialRoute = read("apps/admin/src/app/spatial/page.tsx");
const openCorridorsRoute = read("apps/web/src/app/api/open/v1/spatial/corridors/route.ts");
const openNearbyRoute = read("apps/web/src/app/api/open/v1/spatial/nearby/route.ts");
const openIsochronesRoute = read("apps/web/src/app/api/open/v1/spatial/isochrones/route.ts");
const spatialConfig = read("packages/config/src/index.ts");

assert(spatialEngineService.includes("validateCoordinates"), "Spatial engine must export validateCoordinates.");
assert(spatialEngineService.includes("calculateHaversineDistanceKm"), "Spatial engine must export calculateHaversineDistanceKm.");
assert(spatialEngineService.includes("findNearbyPlaces"), "Spatial engine must export findNearbyPlaces.");
assert(spatialEngineService.includes("evaluateTerritoryAccessibility"), "Spatial engine must evaluate territory accessibility.");
assert(spatialEngineService.includes("detectServiceGaps"), "Spatial engine must detect service gaps.");

assert(routingEngineService.includes("calculateRouteMatrix"), "Routing engine must calculate road distance matrix.");
assert(routingEngineService.includes("buildRouteAlternatives"), "Routing engine must build route alternatives (Fastest vs Scenic).");
assert(routingEngineService.includes("generateIsochronePolygon"), "Routing engine must generate isochrone travel polygons.");

assert(spatialToolsService.includes("findNearbyPlacesTool"), "Spatial tools must export findNearbyPlacesTool.");
assert(spatialToolsService.includes("getTravelTimeTool"), "Spatial tools must export getTravelTimeTool.");
assert(spatialToolsService.includes("calculateIsochroneTool"), "Spatial tools must export calculateIsochroneTool.");
assert(spatialToolsService.includes("findPlacesAlongRouteTool"), "Spatial tools must export findPlacesAlongRouteTool.");
assert(spatialToolsService.includes("getTerritoryForPointTool"), "Spatial tools must export getTerritoryForPointTool.");
assert(spatialToolsService.includes("compareRoutesTool"), "Spatial tools must export compareRoutesTool.");

assert(publicCorridorsRoute.includes("Corredores Turísticos Territoriales"), "Public corridors page must render catalog header.");
assert(corridorDetailRoute.includes("Nodos del Corredor & Paradas Geoespaciales"), "Corridor detail must render geospatial stops.");
assert(adminSpatialRoute.includes("Control Tower GIS & Inteligencia Espacial"), "Admin spatial page must render GIS Control Tower.");
assert(openCorridorsRoute.includes("FeatureCollection"), "Open corridors API must emit GeoJSON FeatureCollection.");
assert(openNearbyRoute.includes("findNearbyPlaces"), "Open nearby API must query spatial engine.");
assert(openIsochronesRoute.includes("generateIsochronePolygon"), "Open isochrones API must compute travel polygon.");
assert(spatialConfig.includes("TOURISM_CORRIDORS_CATALOG"), "Config must export TOURISM_CORRIDORS_CATALOG.");
assert(spatialConfig.includes("NICARAGUA_TERRITORY_BOUNDS"), "Config must export NICARAGUA_TERRITORY_BOUNDS.");

// ============================================================================
// FASE 19: NATIONAL COMMAND & STRATEGIC INTELLIGENCE ASSERTIONS
// ============================================================================
const strategicMetricsService = read("apps/web/src/services/strategic/strategic-metrics.service.ts");
const strategicSignalsService = read("apps/web/src/services/strategic/strategic-signals.service.ts");
const territorialPortfolioService = read("apps/web/src/services/strategic/territorial-portfolio.service.ts");
const scenarioPlanningService = read("apps/web/src/services/strategic/scenario-planning.service.ts");
const strategicToolsService = read("apps/web/src/services/strategic/strategic-tools.service.ts");
const strategicReportingService = read("apps/web/src/services/strategic/strategic-reporting.service.ts");
const strategicAdminRoute = read("apps/admin/src/app/strategic/page.tsx");
const scenariosAdminRoute = read("apps/admin/src/app/strategic/scenarios/page.tsx");
const scorecardAdminRoute = read("apps/admin/src/app/strategic/scorecard/page.tsx");
const briefingAdminRoute = read("apps/admin/src/app/strategic/briefing/page.tsx");
const strategicKpisApiRoute = read("apps/web/src/app/api/internal/strategic/kpis/route.ts");
const strategicSignalsApiRoute = read("apps/web/src/app/api/internal/strategic/signals/route.ts");
const strategicBriefingApiRoute = read("apps/web/src/app/api/internal/strategic/briefing/route.ts");
const strategicCopilotApiRoute = read("apps/web/src/app/api/internal/strategic/copilot/route.ts");
const strategicConfig = read("packages/config/src/index.ts");

assert(strategicMetricsService.includes("getStrategicKpi"), "Strategic metrics service must export getStrategicKpi.");
assert(strategicMetricsService.includes("getAllStrategicKpis"), "Strategic metrics service must export getAllStrategicKpis.");
assert(strategicMetricsService.includes("evaluateMetricConfidence"), "Strategic metrics service must evaluate metric confidence.");
assert(strategicMetricsService.includes("calculatePeriodComparison"), "Strategic metrics service must calculate period comparison.");
assert(strategicMetricsService.includes("applySmallCellPrivacy"), "Strategic metrics service must enforce small-cell privacy.");

assert(strategicSignalsService.includes("getActiveSignals"), "Strategic signals service must export getActiveSignals.");
assert(strategicSignalsService.includes("evaluateSignal"), "Strategic signals service must evaluate strategic signals.");
assert(strategicSignalsService.includes("updateSignalStatus"), "Strategic signals service must update signal status.");

assert(territorialPortfolioService.includes("getTerritoryProfiles"), "Territorial portfolio service must export getTerritoryProfiles.");
assert(territorialPortfolioService.includes("getTerritoryProfileById"), "Territorial portfolio service must export getTerritoryProfileById.");
assert(territorialPortfolioService.includes("evaluateTerritorialOpportunity"), "Territorial portfolio service must evaluate territorial opportunities.");

assert(scenarioPlanningService.includes("runStrategicScenario"), "Scenario planning service must run strategic What-If scenarios.");
assert(scenarioPlanningService.includes("compareStrategicScenario"), "Scenario planning service must compare strategic scenarios.");
assert(scenarioPlanningService.includes("isSimulatedData: true"), "Scenario planning service must strictly isolate simulated data.");

assert(strategicToolsService.includes("getStrategicKPIsTool"), "Strategic tools must export getStrategicKPIsTool.");
assert(strategicToolsService.includes("getTerritoryProfileTool"), "Strategic tools must export getTerritoryProfileTool.");
assert(strategicToolsService.includes("getStrategicSignalsTool"), "Strategic tools must export getStrategicSignalsTool.");
assert(strategicToolsService.includes("getTrustCoverageTool"), "Strategic tools must export getTrustCoverageTool.");
assert(strategicToolsService.includes("getOperationalSummaryTool"), "Strategic tools must export getOperationalSummaryTool.");
assert(strategicToolsService.includes("executeStrategicCopilot"), "Strategic tools must execute grounded Strategic Copilot.");

assert(strategicReportingService.includes("generateReportSnapshot"), "Strategic reporting service must generate report snapshots.");
assert(strategicReportingService.includes("exportReportCsv"), "Strategic reporting service must export report CSV.");
assert(strategicReportingService.includes("markReportAsReviewed"), "Strategic reporting service must record human review sign-off.");

assert(strategicAdminRoute.includes("Centro de Inteligencia Estratégica & Territorial"), "Admin strategic page must render Executive Cockpit.");
assert(strategicAdminRoute.includes("Baqueano Strategic Copilot"), "Admin strategic page must embed Strategic Copilot.");
assert(scenariosAdminRoute.includes("MODO SIMULACIÓN ACTIVO"), "Scenario room must render simulation banner.");
assert(scorecardAdminRoute.includes("Cuadro de Mando Integral & Metas Estratégicas"), "Scorecard page must render Executive Scorecard.");
assert(briefingAdminRoute.includes("¿Qué cambió esta semana?"), "Briefing page must render 6-block executive brief.");

assert(strategicKpisApiRoute.includes("strategicMetricsService"), "Internal KPIs API must query strategic metrics service.");
assert(strategicSignalsApiRoute.includes("strategicSignalsService"), "Internal signals API must query strategic signals service.");
assert(strategicBriefingApiRoute.includes("strategicReportingService"), "Internal briefing API must compile snapshot.");
assert(strategicCopilotApiRoute.includes("executeStrategicCopilot"), "Internal copilot API must execute copilot handler.");

// ============================================================================
// FASE 18: EXPERIENCE OS & OMNICHANNEL CONTINUITY ASSERTIONS
// ============================================================================
const experienceContextService = read("apps/web/src/services/experience/experience-context.service.ts");
const deepLinkResolverService = read("apps/web/src/services/experience/deep-link-resolver.service.ts");
const syncEngineService = read("apps/web/src/services/experience/sync-engine.service.ts");
const tripHubService = read("apps/web/src/services/experience/trip-hub.service.ts");
const passportService = read("apps/web/src/services/experience/passport.service.ts");
const tripPageRoute = read("apps/web/src/app/viaje/[tripId]/page.tsx");
const passportPageRoute = read("apps/web/src/app/pasaporte/page.tsx");
const notificationsPageRoute = read("apps/web/src/app/notificaciones/page.tsx");
const ayudaPageRoute = read("apps/web/src/app/ayuda/page.tsx");
const experienceConfig = read("packages/config/src/index.ts");

assert(experienceContextService.includes("getExperienceContext"), "Experience context service must export getExperienceContext.");
assert(experienceContextService.includes("preserveLoginIntent"), "Experience context service must preserve login intent.");
assert(experienceContextService.includes("detectChannel"), "Experience context service must detect channel safely.");

assert(deepLinkResolverService.includes("resolveExperienceLink"), "Deep link resolver service must export resolveExperienceLink.");
assert(deepLinkResolverService.includes("cleanPath"), "Deep link resolver service must validate canonical URL paths.");
assert(deepLinkResolverService.includes("requiresAuth"), "Deep link resolver service must distinguish private resources.");

assert(syncEngineService.includes("queueOfflineMutation"), "Sync engine service must enqueue optimistic mutations.");
assert(syncEngineService.includes("resolveSyncConflict"), "Sync engine service must handle data conflicts.");

assert(tripHubService.includes("getTripHubData"), "Trip hub service must export getTripHubData.");
assert(tripHubService.includes("getTodayView"), "Trip hub service must synthesize the Today View.");

assert(passportService.includes("getPassportEntries"), "Passport service must export getPassportEntries.");
assert(passportService.includes("recordPassportVisit"), "Passport service must register verified visits.");

assert(tripPageRoute.includes("BAQUEANO ECOSYSTEM — TRIP HUB"), "Trip page route must implement Trip Hub.");
assert(passportPageRoute.includes("PASAPORTE DIGITAL"), "Passport page route must implement Digital Passport.");
assert(notificationsPageRoute.includes("BAQUEANO ECOSYSTEM — NOTIFICATION CENTER"), "Notifications page route must implement Notification Center.");
assert(ayudaPageRoute.includes("BAQUEANO ECOSYSTEM — CONTEXTUAL HELP & SUPPORT"), "Help page route must implement Help & Support.");

assert(experienceConfig.includes("EXPERIENCE_CAPABILITY_MATRIX"), "Config must export EXPERIENCE_CAPABILITY_MATRIX.");
assert(experienceConfig.includes("OFFICIAL_EXPERIENCE_VOCABULARY"), "Config must export OFFICIAL_EXPERIENCE_VOCABULARY.");
assert(experienceConfig.includes('trips: "trips"'), "Config must declare trips collection.");
assert(experienceConfig.includes('passportEntries: "passport_entries"'), "Config must declare passportEntries collection.");

if (failures.length > 0) {
  console.error("Production smoke tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Production smoke tests passed (including Fase 14 Trust, Fase 15 Digital Concierge, Fase 16 Predictive Intelligence, Fase 17 Spatial Intelligence, Fase 18 Experience OS & Fase 19 National Command & Strategic Intelligence).");



