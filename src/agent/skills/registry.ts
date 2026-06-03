export interface Skill {
  id: string;
  name: string;
  fileName: string;
  triggers: string[];
  stages?: string[];
}

export const skills: Skill[] = [
  {
    id: "pricing-objection",
    name: "Pricing Objection",
    fileName: "pricing-objection.md",
    triggers: ["pricing", "expensive", "budget", "cost"],
  },

  {
    id: "discovery-calls",
    name: "Discovery Calls",
    fileName: "discovery-calls.md",
    triggers: ["discovery"],
    stages: ["discovery"],
  },

  {
    id: "qualification",
    name: "Qualification",
    fileName: "qualification.md",
    triggers: ["qualification"],
    stages: ["qualification"],
  },

  {
    id: "proposal",
    name: "Proposal",
    fileName: "proposal.md",
    triggers: ["proposal"],
    stages: ["proposal"],
  },

  {
    id: "negotiation",
    name: "Negotiation",
    fileName: "negotiation.md",
    triggers: ["negotiation"],
    stages: ["negotiation"],
  },

  {
    id: "stakeholder-mapping",
    name: "Stakeholder Mapping",
    fileName: "stakeholder-mapping.md",
    triggers: ["stakeholder", "decision-maker"],
  },

  {
    id: "roi-conversations",
    name: "ROI Conversations",
    fileName: "roi-conversations.md",
    triggers: ["roi", "value", "business-case"],
  },

  {
    id: "enterprise-procurement",
    name: "Enterprise Procurement",
    fileName: "enterprise-procurement.md",
    triggers: ["procurement", "legal", "security"],
  },
];
