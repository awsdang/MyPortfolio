/**
 * Skills offered as free downloads (ZIPs live in public/ai-skills/).
 * Copy carried over from the old /ai-skills page.
 */
export type Skill = {
  id: string;
  name: string;
  file: string;
  category: string;
  description: string;
  tags: string[];
  glyph: string;
  mine?: boolean;
  extra?: string;
};

export const SKILLS: Skill[] = [
  {
    id: "skill-arabic-rtl",
    name: "Arabic RTL UI",
    file: "/ai-skills/arabic-rtl-ui-lite-skill.zip",
    category: "Arabic interfaces, free edition",
    description:
      "Building Arabic interfaces takes more than reversing a layout. I wrote this skill to give AI tools the details I keep checking, including navigation, forms, mixed Arabic and English values, gestures and the wording of the interface. This download is the free edition.",
    tags: ["Web, Flutter and React Native", "Arabic text and LTR values", "RTL interface checks"],
    glyph: "languages",
    mine: true,
  },
  {
    id: "skill-devils-advocate",
    name: "Devil's Advocate",
    file: "/ai-skills/devils-advocate.zip",
    category: "Code review",
    description:
      "A review skill built around a conversation between an author and a reviewer. It gives the AI tool a way to question the changes in a branch, including awkward cases, error handling, performance and missing tests.",
    tags: ["Code review", "Edge cases", "Testing"],
    glyph: "shieldalert",
  },
  {
    id: "skill-react",
    name: "React Best Practices",
    file: "/ai-skills/vercel-react-best-practices.zip",
    category: "React performance",
    description:
      "Vercel's guidance for React and Next.js performance. The instructions help an AI tool look for slow request sequences, unnecessary bundle size, repeated rendering and work that belongs on the server.",
    tags: ["React", "Next.js", "Performance"],
    glyph: "atom",
  },
  {
    id: "skill-cache",
    name: "Cache Invalidation",
    file: "/ai-skills/staff-engineering-skills-cache-invalidation.zip",
    category: "Distributed systems",
    description:
      "A skill for following what happens to a cached copy when the source changes. It covers stale data, cache layers and the places where a write needs to update or discard that copy.",
    tags: ["Caching", "Data consistency", "Cache layers"],
    glyph: "databasezap",
  },
  {
    id: "skill-backend",
    name: "Backend Patterns",
    file: "/ai-skills/backend-pattern.zip",
    category: "Backend development",
    description:
      "Examples for organizing a Node.js backend, from API and database work to validation, caching and background jobs. They give an AI tool a concrete structure to work from when the project needs more than a single route.",
    tags: ["Node.js", "APIs", "Databases"],
    glyph: "server",
  },
  {
    id: "skill-ui-design",
    name: "87 UI Design Skills",
    file: "/ai-skills/design-skills-main.zip",
    category: "Design systems",
    description:
      "A collection of 87 UI skills with different visual directions, inspired by products such as Linear, Stripe, Figma, Apple and Airbnb. Each describes the spacing, type, colors and components behind that direction.",
    tags: ["87 design skills", "Design tokens", "Components"],
    glyph: "palette",
  },
  {
    id: "skill-bun-ts",
    name: "Bun + TypeScript",
    file: "/ai-skills/bun-typescript.zip",
    category: "TypeScript setup",
    description:
      "A short setup guide for TypeScript with Bun. It gives an AI tool the type definitions and compiler settings to start with, including strict mode and module resolution.",
    tags: ["Bun", "TypeScript", "Setup"],
    glyph: "braces",
  },
];

export const skillById = (id?: string) => SKILLS.find((s) => s.id === id);
