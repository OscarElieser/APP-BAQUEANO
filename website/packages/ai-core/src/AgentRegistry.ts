export type AgentRole = 
  | "Destination_AI" 
  | "Business_AI" 
  | "Verification_AI" 
  | "SEO_AI" 
  | "Content_AI" 
  | "Geo_AI" 
  | "Security_AI" 
  | "Media_AI";

export interface AgentContract {
  agentId: string;
  role: AgentRole;
  description: string;
  allowedTools: string[];
  permissions: string[];
  riskLevel: "low" | "medium" | "high";
}

export const AGENT_REGISTRY: Record<AgentRole, AgentContract> = {
  Destination_AI: {
    agentId: "agent-destination-001",
    role: "Destination_AI",
    description: "Especialista en estructuración y completitud de destinos turísticos.",
    allowedTools: ["getDestination", "searchDestinations", "prepareUpdate"],
    permissions: ["read:destinations", "write:destinations"],
    riskLevel: "medium"
  },
  Business_AI: {
    agentId: "agent-business-001",
    role: "Business_AI",
    description: "Evalúa la información comercial, horarios y servicios de negocios.",
    allowedTools: ["getBusiness", "searchBusinesses"],
    permissions: ["read:businesses"],
    riskLevel: "low"
  },
  Verification_AI: {
    agentId: "agent-verify-001",
    role: "Verification_AI",
    description: "Analiza la evidencia documental y certificaciones para verificar negocios.",
    allowedTools: ["getBusiness", "getPendingReviews"],
    permissions: ["read:businesses", "read:verifications"],
    riskLevel: "high"
  },
  SEO_AI: {
    agentId: "agent-seo-001",
    role: "SEO_AI",
    description: "Audita metadata, descriptions, y palabras clave.",
    allowedTools: ["getSEOStatus", "getPageContent"],
    permissions: ["read:content", "read:destinations"],
    riskLevel: "low"
  },
  Content_AI: {
    agentId: "agent-content-001",
    role: "Content_AI",
    description: "Asegura la calidad gramatical, tono y completitud de la redacción.",
    allowedTools: ["getPageContent"],
    permissions: ["read:content"],
    riskLevel: "low"
  },
  Geo_AI: {
    agentId: "agent-geo-001",
    role: "Geo_AI",
    description: "Valida congruencia de coordenadas, departamentos y municipios.",
    allowedTools: ["getDestination", "getBusiness"],
    permissions: ["read:destinations", "read:businesses", "read:territories"],
    riskLevel: "medium"
  },
  Security_AI: {
    agentId: "agent-security-001",
    role: "Security_AI",
    description: "Verifica aspectos de seguridad de la ruta o negocio.",
    allowedTools: ["getBusiness", "getAuditLogs"],
    permissions: ["read:audit_logs", "read:businesses"],
    riskLevel: "high"
  },
  Media_AI: {
    agentId: "agent-media-001",
    role: "Media_AI",
    description: "Revisa dimensiones, peso, texto alternativo (alt text) y calidad de imágenes.",
    allowedTools: ["getMediaIssues"],
    permissions: ["read:multimedia"],
    riskLevel: "medium"
  }
};
