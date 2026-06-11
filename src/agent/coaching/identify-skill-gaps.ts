import { RepPerformanceAnalysis, SkillGap } from "./types";

/**
 * Maps performance weaknesses to explicitly defined sales skills.
 * Automatically generates severity scoring, evidence logging, and actionable recommendations.
 */
export function identifySkillGaps(analysis: RepPerformanceAnalysis): SkillGap[] {
    const gaps: SkillGap[] = [];

    // Helper to evaluate keyword triggers within a weakness description
    const matches = (text: string, keywords: string[]) => {
        const lower = text.toLowerCase();
        return keywords.some(kw => lower.includes(kw));
    };

    // Analyze each extracted weakness
    for (const weakness of analysis.weaknesses) {
        
        // Pricing Objections
        if (matches(weakness, ["pricing", "cost", "expensive", "budget", "price"])) {
            gaps.push({
                skill: "pricing-objection",
                severity: "high",
                evidence: [weakness],
                recommendation: "Focus on value-based framing before discussing commercial terms."
            });
        }
        
        // Enterprise Procurement
        if (matches(weakness, ["procurement", "legal", "security", "vendor", "contract"])) {
            gaps.push({
                skill: "enterprise-procurement",
                severity: "high",
                evidence: [weakness],
                recommendation: "Engage enterprise procurement teams earlier in the deal cycle to map requirements."
            });
        }
        
        // Qualification
        if (matches(weakness, ["qualification", "fit", "ideal customer", "timeline", "needs", "lost"])) {
            gaps.push({
                skill: "qualification",
                severity: "medium",
                evidence: [weakness],
                recommendation: "Implement strict MEDDPICC qualification criteria to eliminate weak pipeline early."
            });
        }
        
        // Stakeholder Mapping
        if (matches(weakness, ["stakeholder", "champion", "decision maker", "executive", "ghosted"])) {
            gaps.push({
                skill: "stakeholder-mapping",
                severity: "high",
                evidence: [weakness],
                recommendation: "Multi-thread accounts proactively to avoid single points of failure."
            });
        }

        // Proposal / Velocity
        if (matches(weakness, ["stalled", "velocity", "stuck", "proposal"])) {
            gaps.push({
                skill: "proposal",
                severity: "medium",
                evidence: [weakness],
                recommendation: "Drive urgency by tying proposals directly to the client's compelling event."
            });
        }
        
        // ROI Conversations
        if (matches(weakness, ["roi", "value", "business case", "justification", "impact"])) {
            gaps.push({
                skill: "roi-conversations",
                severity: "medium",
                evidence: [weakness],
                recommendation: "Build collaborative business cases with champions to mathematically validate ROI."
            });
        }

        // Negotiation
        if (matches(weakness, ["discount", "terms", "negotiation", "margin"])) {
            gaps.push({
                skill: "negotiation",
                severity: "high",
                evidence: [weakness],
                recommendation: "Trade concessions rather than giving them away freely to protect margins."
            });
        }
    }

    // Baseline gap generation based on aggregate metrics
    if (gaps.length === 0 && analysis.winRate < 40) {
        gaps.push({
            skill: "discovery-calls",
            severity: "high",
            evidence: [`Critically low overall win-rate (${analysis.winRate}%).`],
            recommendation: "Revisit discovery fundamentals to uncover deeper technical and business pain."
        });
    }

    // Deduplicate gaps by skill, aggregating evidence where applicable
    const uniqueGaps = new Map<string, SkillGap>();
    for (const gap of gaps) {
        if (!uniqueGaps.has(gap.skill)) {
            uniqueGaps.set(gap.skill, gap);
        } else {
            const existing = uniqueGaps.get(gap.skill)!;
            // Append evidence if it is unique
            if (gap.evidence[0] && !existing.evidence.includes(gap.evidence[0])) {
                existing.evidence.push(gap.evidence[0]);
            }
            // Elevate severity if multiple weaknesses trigger the same gap
            if (gap.severity === "high" || existing.evidence.length > 1) {
                existing.severity = "high";
            }
        }
    }

    return Array.from(uniqueGaps.values());
}
