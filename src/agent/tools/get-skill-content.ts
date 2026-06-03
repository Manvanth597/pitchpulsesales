import fs from "fs";
import path from "path";

export function getSkillContent(
    fileName: string
): string {

    const filePath = path.join(
        process.cwd(),
        "src",
        "agent",
        "skills",
        fileName
    );

    return fs.readFileSync(
        filePath,
        "utf8"
    );
}