import type { FsNode, ProjectContent } from "./types";
import { PROJECTS } from "./projects";
import { PROFILE } from "./profile";
import { SKILLS } from "./skills";

/**
 * The "tree map". Edit this file to reshape the desktop:
 *  - top level = what sits on the desktop (folders open a Finder window, files open/link out)
 *  - BIN = the dock's bin
 *  - kind "project" = opens that project's page (content lives in projects.ts)
 *  - a project may also have children (e.g. Qi → its products)
 */
const q = encodeURIComponent(PROFILE.aiPrompt);
export const CV_URL = "/cv/Aws_Abdulfattah_CV.pdf";

export const DESKTOP: FsNode[] = [
  {
    id: "products",
    name: "My work",
    kind: "folder",
    tint: "lapis",
    glyph: "products",
    summary: "Things I've built, run or led",
    children: [
      {
        id: "qi-card",
        name: "Qi",
        kind: "project",
        tint: "violet",
        glyph: "wallet",
        logo: "/brand/qi-mark.svg",
        summary: "Mini-apps and interfaces I build with the team at Qi",
        children: [
          { id: "tasdid", name: "Tasdid+", kind: "project", tint: "violet", glyph: "wallet", summary: "My work on bill payments inside SuperQi" },
          { id: "jabi", name: "Jabi+", kind: "project", tint: "lapis", glyph: "bank", summary: "My work on tools for Qi merchants" },
          { id: "basmayah", name: "Basmayah", kind: "project", tint: "terracotta", glyph: "fingerprint", summary: "The housing loan frontend I built" },
          { id: "aml", name: "Staff dashboard", kind: "project", tint: "teal", glyph: "shield", summary: "My contribution to internal staff tools" },
          { id: "service-provider", name: "Tasdid Merchant", kind: "project", tint: "lapis", glyph: "layers", summary: "The bill payment interface I built for merchants" },
          { id: "hawala", name: "Qi Hawala", kind: "project", tint: "sand", glyph: "bank", summary: "The app foundation I built with a teammate" },
          { id: "krg", name: "KRG / e-Psule", kind: "project", tint: "teal", glyph: "card", summary: "My work on a multilingual billing app" },
        ],
      },
      { id: "cardyiq", name: "Cardy", kind: "project", tint: "terracotta", glyph: "card", appIcon: "/brand/cardy-icon.svg", summary: "The sports app I helped rebuild and the technical team I built" },
      { id: "asheerty", name: "Asheerty", kind: "project", tint: "teal", glyph: "tree", appIcon: "/brand/asheerty-icon.webp", summary: "The family tree product I build on my own" },
      { id: "notifyx", name: "NotifyX", kind: "project", tint: "lapis", glyph: "bell", appIcon: "/brand/notifyx-icon.svg", summary: "Notifications I built once and reuse across my apps" },
      { id: "sadeek", name: "Sadeek", kind: "project", tint: "terracotta", glyph: "send", logo: "/brand/sadeek-icon.webp", summary: "From a merchant's photo to a store listing, now dormant" },
      { id: "maaahr", name: "Maaahr", kind: "project", tint: "violet", glyph: "mic", appIcon: "/brand/maaahr-icon.svg", summary: "Interview practice in Arabic and English, through voice or text" },
      { id: "hawsr", name: "HAWSR", kind: "project", tint: "slate", glyph: "box", appIcon: "/brand/hawsr-icon.svg", summary: "My property tour company, now closed" },
    ],
  },
  {
    id: "ai-skills",
    name: "AI Skills",
    kind: "folder",
    tint: "lapis",
    glyph: "sparkles",
    summary: "Skills I use with coding agents",
    intro: {
      title: "The instructions I use with AI tools",
      text: "I use these skills to give AI tools context for the work, from reviewing code to building Arabic interfaces. Most are collected from others. Arabic RTL UI is my own. Download a skill to read the instructions and try it in your project.",
    },
    children: SKILLS.map((k) => ({ id: k.id, name: k.name, kind: "app" as const, app: "skill" as const, ref: k.id, glyph: k.glyph, summary: k.category })),
  },
  {
    id: "contact",
    name: "Contact",
    kind: "folder",
    tint: "lapis",
    glyph: "mail",
    summary: "Ways to reach me and see more of my work",
    children: [
      { id: "c-email", name: "Email", kind: "file", icon: "mail", summary: PROFILE.email, file: { href: `mailto:${PROFILE.email}`, type: "link" } },
      { id: "c-github", name: "GitHub", kind: "file", icon: "github", summary: "@awsdang", file: { href: PROFILE.links.github, type: "link" } },
      { id: "c-linkedin", name: "LinkedIn", kind: "file", icon: "linkedin", summary: "in/awsdang", file: { href: PROFILE.links.linkedin, type: "link" } },
      { id: "c-instagram", name: "Instagram", kind: "file", icon: "instagram", summary: "@awsdang", file: { href: PROFILE.links.instagram, type: "link" } },
      { id: "c-x", name: "X", kind: "file", icon: "x", summary: "@awsdang", file: { href: PROFILE.links.x, type: "link" } },
    ],
  },
  { id: "cv", name: "Software Engineer CV", kind: "file", summary: "PDF", file: { href: CV_URL, type: "pdf" } },
  { id: "app-claude", name: "Claude", kind: "file", icon: "claude", summary: "Ask Claude about me", file: { href: `https://claude.ai/new?q=${q}`, type: "link" } },
  { id: "app-chatgpt", name: "ChatGPT", kind: "file", icon: "openai", summary: "Ask ChatGPT about me", file: { href: `https://chatgpt.com/?q=${q}`, type: "link" } },
];

/** The Bin lives in the dock, not on the desktop. */
export const BIN: FsNode = {
  id: "bin",
  name: "Bin",
  kind: "folder",
  glyph: "trash",
  summary: "My architecture and construction work before software",
  intro: { title: "Where I started", text: "I spent nine years designing buildings, coordinating teams and managing construction. Writing scripts to automate that work led me into software. These projects show where I learned to plan the work and take it through to people using it." },
  children: [
    {
      id: "before-code",
      name: "Architecture",
      kind: "project",
      tint: "sand",
      glyph: "ruler",
      summary: "My background in architecture and construction",
      children: [
        { id: "unops", name: "UNOPS, Anbar", kind: "project", tint: "slate", glyph: "hammer", summary: "Reconstruction and BIM work in Anbar" },
        { id: "mutaa", name: "Mutaa Al-Hashimi", kind: "project", tint: "sand", glyph: "ruler", summary: "Architecture, team leadership and my first scripts" },
        { id: "alriyad", name: "Al-Riyad Group", kind: "project", tint: "terracotta", glyph: "box", summary: "The showrooms I designed and coordinated" },
        { id: "freelance", name: "Freelance", kind: "project", tint: "teal", glyph: "home", summary: "Homes and interiors I designed for clients" },
        { id: "school", name: "School and BIM", kind: "project", tint: "lapis", glyph: "atom", summary: "Architecture studies and learning to automate" },
        { id: "volunteering", name: "Volunteering", kind: "project", tint: "violet", glyph: "globe", summary: "Workshops and housing work I volunteered for" },
      ],
    },
  ],
};

export const ROOT: FsNode = { id: "root", name: "Desktop", kind: "folder", glyph: "home", children: DESKTOP };

const byId = new Map<string, FsNode>();
const parents = new Map<string, string>();
(function index(n: FsNode, parent?: string) {
  byId.set(n.id, n);
  if (parent) parents.set(n.id, parent);
  n.children?.forEach((c) => index(c, n.id));
})(ROOT);
(function indexBin(n: FsNode, parent?: string) {
  byId.set(n.id, n);
  if (parent) parents.set(n.id, parent);
  n.children?.forEach((c) => indexBin(c, n.id));
})(BIN);

export const getNode = (id: string) => byId.get(id);
export const parentOf = (id: string) => parents.get(id);
export const projectFor = (id: string): ProjectContent | undefined => PROJECTS[id];

export function pathTo(id: string): FsNode[] {
  const out: FsNode[] = [];
  let cur: string | undefined = id;
  while (cur) {
    const n = byId.get(cur);
    if (!n) break;
    out.unshift(n);
    cur = parents.get(cur);
  }
  return out;
}

/**
 * The full-page URL of a project. Sub-projects nest under their parent project,
 * so Tasdid+ lives at /work/qi-card/tasdid and UNOPS at /work/before-code/unops.
 */
export function workSlug(id: string): string[] {
  return pathTo(id)
    .filter((n) => n.kind === "project")
    .map((n) => n.id);
}
export const workHref = (id: string) => `/work/${workSlug(id).join("/")}`;

/** Where "Back" goes from a project's full page: its parent project, or the desktop. */
export function workBack(id: string): { href: string; label: string } {
  const pid = parents.get(id);
  const parent = pid ? byId.get(pid) : undefined;
  if (parent?.kind === "project") return { href: workHref(parent.id), label: `Back to ${parent.name}` };
  return { href: "/", label: "Back to the desktop" };
}

/** top-level desktop folder that contains a node (or the node itself) */
export function rootOf(id: string): string {
  const p = pathTo(id);
  if (p[0]?.id === "bin") return "bin";
  return p[1]?.id ?? "root";
}

export function allNodes(): FsNode[] {
  return [...byId.values()].filter((n) => n.id !== "root");
}

export function searchNodes(q: string): FsNode[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return allNodes().filter(
    (n) => n.kind !== "folder" && (n.name.toLowerCase().includes(s) || n.summary?.toLowerCase().includes(s)),
  );
}
