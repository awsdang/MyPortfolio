import type { ProjectContent } from "./types";
import generated from "./projects.generated.json";

/**
 * Project pages. `projects.generated.json` was seeded from the old portfolio's
 * case studies — edit it (or override entries below) as projects get fixed.
 */
export const PROJECTS = generated as unknown as Record<string, ProjectContent>;
