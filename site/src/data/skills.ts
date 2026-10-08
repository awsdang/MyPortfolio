/**
 * Skills offered as free downloads (ZIPs live in public/ai-skills/).
 * Copy carried over from the old /ai-skills page.
 */
export type Skill = {
  id: string;
  name: string;
  file: string;
  size: string;
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
    size: "4.7 KB",
    category: "Arabic product design · free lite edition",
    description:
      "I made this because Arabic interfaces deserve more than a mechanically flipped layout. It gives an AI practical rules for direction, navigation, forms, numbers, gestures, copy and the small details that make RTL feel native.",
    tags: ["Web, Flutter and React Native", "Arabic copy and mixed LTR values", "Release-ready RTL review checklist"],
    glyph: "languages",
    mine: true,
    extra: "There's also a paid version with deeper production guidance, advanced components and complete QA workflows.",
  },
  {
    id: "skill-devils-advocate",
    name: "Devil's Advocate",
    file: "/ai-skills/devils-advocate.zip",
    size: "2.2 KB",
    category: "Code review",
    description:
      "A deliberately skeptical reviewer for branch diffs. It looks for hidden assumptions, incomplete fixes, risk, missing tests and the uncomfortable edge cases polite reviews often miss.",
    tags: ["Review", "Risk", "Testing"],
    glyph: "shieldalert",
  },
  {
    id: "skill-react",
    name: "React Best Practices",
    file: "/ai-skills/vercel-react-best-practices.zip",
    size: "79 KB",
    category: "Best practices",
    description:
      "Vercel's performance guidance distilled into 57 practical rules: waterfalls, bundle size, server work, fetching, re-renders, rendering and JavaScript performance.",
    tags: ["React", "Next.js", "Performance"],
    glyph: "atom",
  },
  {
    id: "skill-cache",
    name: "Cache Invalidation",
    file: "/ai-skills/staff-engineering-skills-cache-invalidation.zip",
    size: "10 KB",
    category: "Distributed systems",
    description:
      "The hard part of caching, treated like engineering instead of a TTL guess. Covers ownership, invalidation strategies, stale data, observability and safe rollout decisions.",
    tags: ["Caching", "Reliability", "Scale"],
    glyph: "databasezap",
  },
  {
    id: "skill-backend",
    name: "Backend Patterns",
    file: "/ai-skills/backend-pattern.zip",
    size: "5.4 KB",
    category: "Server-side",
    description:
      "A practical playbook for API design, service and repository layers, databases, caching, validation, errors, authentication, jobs and production-ready Node.js systems.",
    tags: ["Node.js", "APIs", "Databases"],
    glyph: "server",
  },
  {
    id: "skill-ui-design",
    name: "87 UI Design Skills",
    file: "/ai-skills/design-skills-main.zip",
    size: "258 KB",
    category: "Design systems",
    description:
      "A full collection of opinionated UI constraints inspired by products like Linear, Stripe, Figma, Apple and Airbnb — useful when an agent needs a clear visual language, not vague taste.",
    tags: ["87 styles", "Tokens", "Components"],
    glyph: "palette",
  },
  {
    id: "skill-bun-ts",
    name: "Bun + TypeScript",
    file: "/ai-skills/bun-typescript.zip",
    size: "1.8 KB",
    category: "Runtime",
    description:
      "A compact setup guide for TypeScript on Bun: runtime types, compiler configuration, strict mode and the small defaults that keep a fresh Bun project clean.",
    tags: ["Bun", "TypeScript", "Setup"],
    glyph: "braces",
  },
];

export const skillById = (id?: string) => SKILLS.find((s) => s.id === id);
