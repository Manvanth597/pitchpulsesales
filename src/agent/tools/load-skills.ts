import { skills, Skill } from "../skills";

interface LoadSkillsInput {
  stage?: string;
  objection?: string;
}

export function loadSkills({
  stage,
  objection,
}: LoadSkillsInput): Skill[] {
  let normalizedStage = stage;
  if (stage) {
    const s = stage.toLowerCase();
    if (s === "awareness" || s === "discovery") {
      normalizedStage = "discovery";
    } else if (s === "interest" || s === "qualification") {
      normalizedStage = "qualification";
    } else if (s === "desire" || s === "proposal") {
      normalizedStage = "proposal";
    } else if (s === "action" || s === "negotiation") {
      normalizedStage = "negotiation";
    }
  }

  return skills.filter((skill) => {
    const stageMatch =
      normalizedStage &&
      skill.stages?.includes(normalizedStage);

    const triggerMatch =
      objection &&
      skill.triggers.some((trigger) =>
        objection.toLowerCase().includes(trigger.toLowerCase())
      );

    return stageMatch || triggerMatch;
  });
}
