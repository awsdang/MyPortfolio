import type { ProjectContent } from "./types";
import generated from "./projects.generated.json";
import beforeCode from "./before-code.json";

/**
 * Project pages. `projects.generated.json` was seeded from the old portfolio's
 * case studies: edit it (or override entries below) as projects get fixed.
 * `before-code.json` holds the architecture years (the Bin): the "Before code" page
 * and the pages for UNOPS, Mutaa Al-Hashimi, Al-Riyad, Freelance, School and Volunteering.
 */
export const PROJECTS = {
  ...(generated as unknown as Record<string, ProjectContent>),
  ...(beforeCode as unknown as Record<string, ProjectContent>),
};
