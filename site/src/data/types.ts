export type Shot = {
  src: string;
  width: number;
  height: number;
  title: string;
  caption: string;
  source?: string;
  surface?: string;
};

export type Stat = { value: string; label: string };
export type LinkItem = { label: string; href: string };
export type Section = {
  heading: string;
  lede?: string;
  body?: string;
  bullets?: string[];
  items?: { title: string; text: string }[];
  diagram?: string;
  quote?: string;
};

export type Tint = "lapis" | "terracotta" | "teal" | "violet" | "slate" | "sand";

/** Everything a project "page" needs. Rendered by <ProjectPage/> in a window or on /work/... */
export type ProjectContent = {
  id: string;
  name: string;
  category?: string;
  status?: string;
  tagline?: string;
  summary?: string;
  role?: string;
  period?: string;
  stack?: string[];
  stats?: Stat[];
  links?: LinkItem[];
  sections?: Section[];
  shots?: Shot[];
  logo?: string | null;
  disclaimers?: string[];
  /** true while the project still needs real screens / copy */
  placeholder?: boolean;
};

export type FileMeta = { href: string; type: "pdf" | "link" | "text"; note?: string };

export type FsNode = {
  id: string;
  name: string;
  /** folder = listing, project = page (may also contain children), file = external/pdf, app = interactive toy */
  kind: "folder" | "project" | "file" | "app";
  /** app nodes: which in-window app to run */
  app?: "queue-lab" | "skill";
  /** app nodes: which record the app shows (e.g. a skill id) */
  ref?: string;
  /** folders: a short heading shown above the icons */
  intro?: { title: string; text: string };
  tint?: Tint;
  glyph?: string;
  /** a macOS-style app icon instead of the generic file/folder look */
  icon?: import("@/components/ui/MacIcon").MacIconName;
  logo?: string;
  /** a full-bleed square app icon (fills the whole squircle); wins over logo */
  appIcon?: string;
  summary?: string;
  children?: FsNode[];
  file?: FileMeta;
};
