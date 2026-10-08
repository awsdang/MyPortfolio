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
        summary: "Fintech · since 2024",
        children: [
          { id: "tasdid", name: "Tasdid", kind: "project", tint: "violet", glyph: "wallet", summary: "Make the bill understandable" },
          { id: "jabi", name: "Jabi / Jabi+", kind: "project", tint: "lapis", glyph: "bank", summary: "The phone is the back office" },
          { id: "jabi-dsl", name: "Jabi+ DSL", kind: "project", tint: "slate", glyph: "phone", summary: "Native mini program" },
          { id: "oil-stations", name: "Oil stations", kind: "project", tint: "terracotta", glyph: "fuel", summary: "Operational web app" },
          { id: "aml", name: "AML dashboard", kind: "project", tint: "teal", glyph: "shield", summary: "Internal dashboard" },
          { id: "service-provider", name: "Service providers", kind: "project", tint: "lapis", glyph: "layers", summary: "SuperQi mini-app" },
          { id: "hawala", name: "Qi Hawala", kind: "project", tint: "sand", glyph: "bank", summary: "Remittance mini-app" },
          { id: "krg", name: "KRG / e-Psule", kind: "project", tint: "teal", glyph: "card", summary: "Regional billing" },
          { id: "basmayah", name: "Basmayah", kind: "project", tint: "terracotta", glyph: "fingerprint", summary: "Housing-loan mini-app" },
        ],
      },
      { id: "cardyiq", name: "Cardy", kind: "project", tint: "terracotta", glyph: "card", appIcon: "/brand/cardy-icon.svg", summary: "Sportstech · since 2025" },
      { id: "asheerty", name: "Asheerty", kind: "project", tint: "teal", glyph: "tree", appIcon: "/brand/asheerty-icon.webp", summary: "Familytech · since 2026" },
      { id: "notifyx", name: "NotifyX", kind: "project", tint: "lapis", glyph: "bell", appIcon: "/brand/notifyx-icon.svg", summary: "Infra · created 2026" },
      { id: "sadeek", name: "Sadeek", kind: "project", tint: "terracotta", glyph: "send", logo: "/brand/sadeek-icon.webp", summary: "Retail · created 2024" },
      { id: "maaahr", name: "Maaahr", kind: "project", tint: "violet", glyph: "mic", appIcon: "/brand/maaahr-icon.svg", summary: "Voice AI · created 2024" },
      { id: "hawsr", name: "HAWSR", kind: "project", tint: "slate", glyph: "box", appIcon: "/brand/hawsr-icon.svg", summary: "Spatial · created 2021" },
    ],
  },
  {
    id: "ai-skills",
    name: "AI Skills",
    kind: "folder",
    tint: "lapis",
    glyph: "sparkles",
    summary: "Free skill packs for coding agents",
    intro: {
      title: "Selected AI skills I use in my daily life.",
      text: "Small instruction packs that help coding agents make better decisions. Each ZIP is ready to read: add one to your agent, call it by name and give it a real problem.",
    },
    children: SKILLS.map((k) => ({ id: k.id, name: k.name, kind: "app" as const, app: "skill" as const, ref: k.id, glyph: k.glyph, summary: k.category })),
  },
  {
    id: "contact",
    name: "Contact",
    kind: "folder",
    tint: "lapis",
    glyph: "mail",
    summary: "Email and socials",
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
  summary: "Kept, not shown",
  intro: { title: "The Bin.", text: "Not deleted — just moved out of the way. Nine years of buildings came before the code." },
  children: [{ id: "before-code", name: "Before code", kind: "project", tint: "sand", glyph: "ruler", summary: "Nine years of architecture" }],
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
