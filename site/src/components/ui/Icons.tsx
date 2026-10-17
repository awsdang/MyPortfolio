import {
  Archive,
  Trash2,
  Atom,
  Braces,
  DatabaseZap,
  Languages,
  Palette,
  Server,
  ShieldAlert,
  Bell,
  Box,
  Briefcase,
  CreditCard,
  FileText,
  Fingerprint,
  Folder,
  Globe,
  Hammer,
  Home,
  Landmark,
  Layers,
  LayoutDashboard,
  Mail,
  Mic,
  Network,
  Rocket,
  Ruler,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Trees,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { FsNode, Tint } from "@/data/types";
import { cn } from "@/lib/cn";
import { MacIcon } from "./MacIcon";

export const GLYPHS: Record<string, LucideIcon> = {
  folder: Folder,
  products: Rocket,
  systems: Network,
  archive: Archive,
  documents: FileText,
  home: Home,
  mail: Mail,
  terminal: Terminal,
  sparkles: Sparkles,
  bell: Bell,
  mic: Mic,
  box: Box,
  send: Send,
  card: CreditCard,
  shield: ShieldCheck,
  bank: Landmark,
  wallet: Wallet,
  tree: Trees,
  phone: Smartphone,
  dash: LayoutDashboard,
  globe: Globe,
  fingerprint: Fingerprint,
  ruler: Ruler,
  hammer: Hammer,
  layers: Layers,
  work: Briefcase,
  languages: Languages,
  shieldalert: ShieldAlert,
  atom: Atom,
  databasezap: DatabaseZap,
  server: Server,
  palette: Palette,
  braces: Braces,
  trash: Trash2,
};

export const TINTS: Record<Tint, { a: string; b: string; deep: string }> = {
  lapis: { a: "#c4d8f2", b: "#6f97d0", deep: "#4a6ba3" },
  terracotta: { a: "#e8c9b8", b: "#bd8369", deep: "#8c5a44" },
  teal: { a: "#bfdcd6", b: "#6fa59a", deep: "#487a70" },
  violet: { a: "#d3cbe8", b: "#8f82bd", deep: "#625794" },
  slate: { a: "#c9cfdc", b: "#7d869c", deep: "#4c556b" },
  sand: { a: "#eadcc0", b: "#bfa77a", deep: "#8a7448" },
};

/** iOS-26 style glass folder, drawn in SVG so it scales crisply. */
/**
 * macOS 26 style folder: flat sky-blue, a slightly lighter front sheet, a tab,
 * and the folder's symbol debossed into the front in a deeper blue.
 */
export function FolderIcon({
  glyph = "folder",
  size = 64,
  open = false,
  className,
}: {
  tint?: Tint;
  glyph?: string;
  size?: number;
  open?: boolean;
  className?: string;
}) {
  const Glyph = GLYPHS[glyph] ?? Folder;
  const showGlyph = glyph !== "folder";
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size * 0.8, filter: "drop-shadow(0 1px 1px rgba(20,60,110,.18)) drop-shadow(0 4px 8px rgba(20,60,110,.14))" }}
      aria-hidden
    >
      <svg viewBox="0 0 100 80" width="100%" height="100%" style={{ overflow: "visible" }}>
        <path
          d="M6 10a6 6 0 0 1 6-6h22.5a6 6 0 0 1 4.6 2.1l3.2 3.8A6 6 0 0 0 46.9 12H88a6 6 0 0 1 6 6v54a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6V10Z"
          fill="url(#fi-back)"
        />
        <g transform={open ? "translate(0 3)" : undefined} style={{ transition: "transform .3s" }}>
          <path d="M6 22a6 6 0 0 1 6-6h76a6 6 0 0 1 6 6v50a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6V22Z" fill="url(#fi-front)" />
          <path d="M12 16.5h76a5.5 5.5 0 0 1 5.5 5.5" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth=".9" />
          <path d="M9 72.2h82M9 74.8h82" stroke="#fff" strokeOpacity=".28" strokeWidth=".7" />
        </g>
      </svg>
      {showGlyph && (
        <Glyph
          className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2"
          style={{ color: "#4f9ad6", opacity: 0.8, filter: "drop-shadow(0 1px 0 rgba(255,255,255,.5))" }}
          size={size * 0.34}
          strokeWidth={1.5}
        />
      )}
    </div>
  );
}

/** Shared gradients for FolderIcon and FileIcon (rendered once in the Shell). */
export function FolderDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        <linearGradient id="fi-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#80c6f6" />
          <stop offset="1" stopColor="#68b6ef" />
        </linearGradient>
        <linearGradient id="fi-file" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#e9edf6" />
        </linearGradient>
        <linearGradient id="fi-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8dcfd" />
          <stop offset="1" stopColor="#86ccf9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** macOS-26 squircle tile: a logo on white glass, or a white glyph on slate glass. */
export function AppTile({
  glyph = "box",
  logo,
  appIcon,
  size = 56,
  className,
  label,
}: {
  tint?: Tint;
  glyph?: string;
  logo?: string;
  appIcon?: string;
  size?: number;
  className?: string;
  label?: string;
}) {
  const Glyph = GLYPHS[glyph] ?? Box;
  return (
    <span className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {appIcon ? (
        <MacIcon name="blank" image={appIcon} size={size} />
      ) : logo ? (
        <MacIcon name="blank" logo={logo} size={size} />
      ) : (
        <MacIcon name="tile" size={size}>
          <Glyph size={size * 0.46} strokeWidth={2} className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
        </MacIcon>
      )}
    </span>
  );
}

export function FileIcon({ type = "pdf", size = 56 }: { type?: "pdf" | "link" | "text"; size?: number }) {
  const label = type === "pdf" ? "PDF" : type === "link" ? "URL" : "TXT";
  const color = type === "pdf" ? "#e2603a" : type === "link" ? "#2b6df0" : "#6a728c";
  return (
    <div className="relative shrink-0" style={{ width: size * 0.8, height: size }} aria-hidden>
      <svg viewBox="0 0 80 100" width="100%" height="100%" style={{ overflow: "visible", filter: "drop-shadow(0 4px 8px rgba(18,26,48,.18))" }}>
        {/* the sheet's gradient lives in FolderDefs: a copy defined here could sit in a hidden subtree (the desktop on phones) and paint nothing */}
        <path d="M8 10a8 8 0 0 1 8-8h34l22 22v66a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8V10Z" fill="url(#fi-file)" stroke="rgba(20,22,28,.12)" />
        <path d="M50 2l22 22H58a8 8 0 0 1-8-8V2Z" fill="#d7dcea" />
        <rect x="14" y="62" width="40" height="18" rx="5" fill={color} />
        <text x="34" y="75" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="system-ui">
          {label}
        </text>
        <rect x="16" y="32" width="36" height="4" rx="2" fill="rgba(20,22,28,.14)" />
        <rect x="16" y="42" width="28" height="4" rx="2" fill="rgba(20,22,28,.1)" />
      </svg>
    </div>
  );
}

/** A node's app icon, filling its box (the phone home screen and its folders). */
export function FillNodeIcon({ node }: { node: FsNode }) {
  if (node.icon) return <MacIcon name={node.icon} />;
  if (node.appIcon) return <MacIcon name="blank" image={node.appIcon} />;
  if (node.logo) return <MacIcon name="blank" logo={node.logo} />;
  const Glyph = GLYPHS[node.glyph ?? "box"] ?? Box;
  return (
    <MacIcon name="tile">
      <Glyph size="46%" strokeWidth={2} className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
    </MacIcon>
  );
}

/** Pick the right icon for any tree node. */
export function NodeIcon({ node, size = 64 }: { node: FsNode; size?: number }) {
  if (node.icon) return <MacIcon name={node.icon} size={size * 0.9} />;
  if (node.kind === "file") return <FileIcon type={node.file?.type} size={size * 0.9} />;
  if (node.kind === "folder") return <FolderIcon tint={node.tint} glyph={node.glyph} size={size} />;
  if (node.kind === "app" && node.app === "skill") return <AppTile glyph={node.glyph} size={size * 0.9} />;
  if (node.kind === "app") return <MacIcon name="lab" size={size * 0.9} />;
  return <AppTile tint={node.tint} glyph={node.glyph} logo={node.logo} appIcon={node.appIcon} size={size * 0.9} />;
}
