import { loadSkills } from "./load-skills";
import { getSkillContent } from "./get-skill-content";

export function loadSkillContext(
  stage?: string,
  objection?: string
): string {

  const matchedSkills = loadSkills({
    stage,
    objection,
  });

  if (!matchedSkills.length) {
    return "";
  }

  return matchedSkills
    .map((skill) => {
      return `
=================================
SKILL: ${skill.name}
=================================

${getSkillContent(skill.fileName)}
`;
    })
    .join("\n\n");
}