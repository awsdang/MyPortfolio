import { BIN, CV_URL, DESKTOP, allNodes, projectFor } from "@/data/fs";
import type { FsNode } from "@/data/types";
import { PROFILE } from "@/data/profile";
import { ABOUT } from "@/data/about";
import { ACHIEVEMENTS, KIND_LABEL } from "@/data/achievements";
import { skillById } from "@/data/skills";

/**
 * The terminal's shell: a pretend zsh over the desktop's tree (fs.ts), so `ls`,
 * `cd`, `cat`, `grep`, pipes and redirects work on the same projects Finder shows.
 * Files a visitor makes live in memory until the page reloads. Nothing can be
 * deleted: every delete command gets a joke instead.
 */

export type Tone = "dir" | "link" | "dim" | "err" | "ok" | "warn" | "bold";
export type Seg = { t: string; c?: Tone };
/** One output line: plain text, or coloured segments. */
export type Out = string | Seg[];

export type WinInfo = { id: string; kind: string; title: string };
export interface Host {
  self: string;
  cols: number;
  theme: "light" | "dark";
  viewport: { w: number; h: number };
  open: (kind: "about" | "achievements" | "contact" | "bug" | "booking" | "sysinfo") => void;
  openNode: (id: string) => void;
  openHref: (href: string) => void;
  setTheme: (t: "light" | "dark") => void;
  windows: () => WinInfo[];
  close: (id: string) => void;
  clear: () => void;
  ask: (q: string) => Promise<void>;
}
export interface Emit {
  print: (lines: Out[]) => void;
  /** replaces the block printed under the same key (animations, progress) */
  frame: (key: number, lines: Out[]) => void;
}

export const SUDO = "No sudo here. I still need the keys to my own portfolio.";

const seg = (t: string, c?: Tone): Seg => ({ t, c });
const plain = (o: Out) => (typeof o === "string" ? o : o.map((s) => s.t).join(""));
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9+]+/g, "-").replace(/^-+|-+$/g, "");
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/* ---------------------------------------------------------------- the tree */

type WinName = "about" | "achievements" | "contact";
export type VNode = {
  name: string;
  dir?: boolean;
  kids?: VNode[];
  up?: VNode;
  /** the desktop node it stands for (open shows it) */
  node?: FsNode;
  href?: string;
  /** built-in contents, built on read */
  body?: () => string;
  /** a visitor's own file or folder */
  mine?: boolean;
  text?: string;
  hidden?: boolean;
  note?: string;
  win?: WinName;
};

function readme(n: FsNode) {
  const c = projectFor(n.id);
  const out = [`# ${c?.name ?? n.name}`];
  if (n.summary) out.push(n.summary);
  if (c?.tagline) out.push("", c.tagline);
  if (c?.summary) out.push("", c.summary);
  const facts = [
    ["role", c?.role],
    ["when", c?.period],
    ["stack", c?.stack?.join(", ")],
    ["numbers", c?.stats?.map((s) => `${s.value} ${s.label}`).join(", ")],
  ].filter((f): f is [string, string] => !!f[1]);
  if (facts.length) out.push("", ...facts.map(([k, v]) => `${k.padEnd(8)} ${v}`));
  const shots = c?.shots?.length ? ` with ${c.shots.length} ${c.shotsNoun ?? "screens"}` : "";
  out.push("", `\`open ${slug(n.name)}\` shows the full page${shots}.`);
  return out.join("\n");
}

function fromNode(n: FsNode): VNode {
  if (n.kind === "file" && n.file) {
    const f = n.file;
    if (f.type === "pdf") return { name: `${slug(n.name)}.pdf`, node: n, href: f.href, note: n.summary };
    return { name: `${slug(n.name)}.url`, node: n, href: f.href, note: n.summary, body: () => `[InternetShortcut]\nURL=${f.href}` };
  }
  if (n.kind === "app") {
    const k = skillById(n.ref);
    return {
      name: `${slug(n.name)}.md`,
      node: n,
      note: n.summary,
      body: () =>
        k
          ? [`# ${k.name}`, k.category, "", k.description, "", ...k.tags.map((t) => `- ${t}`), "", `Download the ZIP. \`open ${slug(n.name)}.md\` shows it, with the download.`].join("\n")
          : `# ${n.name}`,
    };
  }
  const kids = (n.children ?? []).map(fromNode);
  const text = n.kind === "project" ? readme(n) : n.intro ? `# ${n.intro.title}\n\n${n.intro.text}` : null;
  if (text) kids.unshift({ name: "README.md", node: n, body: () => text });
  return { name: slug(n.name), dir: true, node: n, kids, note: n.summary };
}

const ALIASES: Record<string, string> = { ll: "ls -l", la: "ls -a", l: "ls", "..": "cd ..", "...": "cd ../.." };

const ROOT: VNode = {
  name: "~",
  dir: true,
  kids: [
    ...DESKTOP.map(fromNode),
    {
      name: "about.md",
      win: "about",
      body: () =>
        [`# ${PROFILE.name}`, ABOUT.role, "", ABOUT.headline, "", ABOUT.intro, "", ...ABOUT.facts.map(([k, v]) => `${k.padEnd(9)} ${v}`), "", "`about` opens more about my background and work."].join("\n"),
    },
    {
      name: "achievements.md",
      win: "achievements",
      body: () =>
        [
          "# Achievements",
          ...(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).flatMap((k) => [
            "",
            `## ${KIND_LABEL[k]}`,
            ...ACHIEVEMENTS.filter((a) => a.kind === k).map((a) => `- ${a.title}, ${a.detail} (${a.meta})`),
          ]),
          "",
          "`achievements` opens my awards, degrees and certificates.",
        ].join("\n"),
    },
    {
      name: "contact.txt",
      win: "contact",
      body: () =>
        [
          `Email     ${PROFILE.email}`,
          PROFILE.phone && `Phone     ${PROFILE.phone}`,
          `GitHub    ${PROFILE.links.github}`,
          `LinkedIn  ${PROFILE.links.linkedin}`,
          PROFILE.links.booking && `Calendar  ${PROFILE.links.booking}`,
          PROFILE.availability,
          "",
          "`contact` opens Write to Aws. `hire` opens Schedule a conversation.",
        ]
          .filter(Boolean)
          .join("\n"),
    },
    {
      name: ".zshrc",
      hidden: true,
      body: () =>
        [
          "# ~/.zshrc, visitor edition",
          "export EDITOR=vim",
          `export STATUS="${PROFILE.availability}"`,
          ...Object.entries(ALIASES).map(([k, v]) => `alias ${k}='${v}'`),
          "PROMPT='%n@aws %1~ %# '",
        ].join("\n"),
    },
    { ...fromNode(BIN), name: ".Trash", hidden: true },
  ],
};
(function link(v: VNode) {
  v.kids?.forEach((k) => {
    k.up = v;
    link(k);
  });
})(ROOT);

const state = {
  cwd: ROOT,
  prev: ROOT,
  status: 0,
  history: [] as string[],
  aliases: { ...ALIASES },
  env: {
    USER: "visitor",
    HOME: "/Users/visitor",
    SHELL: "/bin/zsh",
    TERM: "xterm-256color",
    LANG: "en_US.UTF-8",
    EDITOR: "vim",
    HOST: "awsdang.com",
    STATUS: PROFILE.availability,
  } as Record<string, string>,
};

export const history = () => state.history;
export const promptDir = () => (state.cwd === ROOT ? "~" : state.cwd.name);

const pathOf = (v: VNode): string => (v === ROOT || !v.up ? "~" : `${pathOf(v.up)}/${v.name}`);
const label = (v: VNode) => (v.dir ? `${v.name}/` : v.name);
const read = (v: VNode) => v.text ?? v.body?.() ?? null;
const sizeOf = (v: VNode) => {
  if (v.dir) return "-";
  const t = read(v);
  if (t === null) return "92K";
  const n = new Blob([t]).size;
  return n < 1024 ? String(n) : `${(n / 1024).toFixed(1)}K`;
};
const inTrash = (v: VNode) => {
  for (let c: VNode | undefined = v; c; c = c.up) if (c.name === ".Trash" && c.up === ROOT) return true;
  return false;
};

function resolve(p: string, from = state.cwd): VNode | null {
  let s = p.replace(/^\/Users\/visitor(?=\/|$)/, "~");
  let cur = from;
  if (s === "/" || s.startsWith("/") || s === "~" || s.startsWith("~/")) {
    cur = ROOT;
    s = s.replace(/^~?\/*/, "");
  }
  for (const part of s.split("/").filter(Boolean)) {
    if (part === ".") continue;
    if (part === "..") {
      cur = cur.up ?? cur;
      continue;
    }
    if (!cur.dir || !cur.kids) return null;
    const next = cur.kids.find((k) => k.name === part) ?? cur.kids.find((k) => k.name.toLowerCase() === part.toLowerCase());
    if (!next) return null;
    cur = next;
  }
  return cur;
}

function walk(v: VNode, fn: (v: VNode) => void) {
  fn(v);
  v.kids?.forEach((k) => walk(k, fn));
}

/** Loose lookup for `open cardy` / `cd tasdid`: exact name or id first, then a prefix or substring. */
function fuzzy(q: string, dirsOnly = false): VNode | null {
  const s = norm(q);
  if (!s) return null;
  const all: VNode[] = [];
  walk(ROOT, (v) => v !== ROOT && v.name !== "README.md" && (!dirsOnly || v.dir) && all.push(v));
  const keys = (v: VNode) => [norm(v.name.replace(/\.[a-z]+$/, "")), v.node && norm(v.node.name), v.node && norm(v.node.id)].filter(Boolean) as string[];
  return all.find((v) => keys(v).includes(s)) ?? all.find((v) => keys(v).some((k) => k.startsWith(s))) ?? all.find((v) => keys(v).some((k) => k.includes(s))) ?? null;
}

/** Where a new file would go: the parent folder and the name, or an error. */
function target(p: string): { dir: VNode; name: string; hit: VNode | null } | string {
  const hit = resolve(p);
  if (hit?.dir) return { dir: hit, name: "", hit };
  const cut = p.replace(/\/+$/, "").lastIndexOf("/");
  const dirPath = cut < 0 ? "." : p.slice(0, cut) || "/";
  const name = cut < 0 ? p : p.slice(cut + 1);
  const dir = resolve(dirPath);
  if (!dir) return `no such file or directory: ${p}`;
  if (!dir.dir) return `not a directory: ${dirPath}`;
  if (!name || name === "." || name === "..") return `invalid name: ${p}`;
  return { dir, name, hit };
}

function addKid(dir: VNode, v: VNode) {
  v.up = dir;
  dir.kids = [...(dir.kids ?? []), v];
}

function writeFile(p: string, text: string, append: boolean): string | null {
  const t = target(p);
  if (typeof t === "string") return t;
  if (t.hit?.dir) return `is a directory: ${p}`;
  if (inTrash(t.dir)) return `permission denied: ${p} (the Trash only takes Aws's old work)`;
  if (t.hit && !t.hit.mine) return `permission denied: ${p}`;
  if (t.hit) t.hit.text = append ? (t.hit.text ?? "") + text : text;
  else addKid(t.dir, { name: t.name, mine: true, text });
  return null;
}

/* ------------------------------------------------------------ the parser */

type Tok = { t: string; op?: boolean; quoted?: boolean };

function lex(src: string): Tok[] {
  const out: Tok[] = [];
  let cur = "";
  let has = false;
  let quoted = false;
  const push = () => {
    if (has) out.push({ t: cur, quoted });
    cur = "";
    has = false;
    quoted = false;
  };
  const expand = (s: string) =>
    s.replace(/\$(\{(\w+)\}|\w+|\?)/g, (m, _b, braced) => {
      const k = braced ?? m.slice(1);
      if (k === "?") return String(state.status);
      if (k === "PWD") return pathOf(state.cwd).replace(/^~/, state.env.HOME);
      return state.env[k] ?? "";
    });
  for (let i = 0; i < src.length; ) {
    const ch = src[i];
    if (ch === "'" || ch === '"') {
      const j = src.indexOf(ch, i + 1);
      const end = j < 0 ? src.length : j;
      const body = src.slice(i + 1, end);
      cur += ch === '"' ? expand(body) : body;
      has = quoted = true;
      i = end + 1;
    } else if (ch === "\\" && i + 1 < src.length) {
      cur += src[i + 1];
      has = true;
      i += 2;
    } else if (/\s/.test(ch)) {
      push();
      i++;
    } else if (src.startsWith("&&", i) || src.startsWith("||", i) || src.startsWith(">>", i)) {
      push();
      out.push({ t: src.slice(i, i + 2), op: true });
      i += 2;
    } else if (ch === "|" || ch === ";" || ch === ">") {
      push();
      out.push({ t: ch, op: true });
      i++;
    } else if (ch === "$") {
      const m = /^\$(\{\w+\}|\w+|\?)/.exec(src.slice(i));
      if (m) {
        cur += expand(m[0]);
        has = true;
        i += m[0].length;
      } else {
        cur += ch;
        has = true;
        i++;
      }
    } else {
      cur += ch;
      has = true;
      i++;
    }
  }
  push();
  return out;
}

/** zsh-style globbing in the last path segment: `*.md`, `my-work/*`. */
function glob(pat: string): string[] | null {
  const cut = pat.lastIndexOf("/");
  const dirPart = cut < 0 ? "" : pat.slice(0, cut + 1);
  const dir = resolve(dirPart || ".");
  if (!dir?.dir) return null;
  const last = pat.slice(cut + 1);
  const re = new RegExp(`^${last.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`, "i");
  const hits = (dir.kids ?? []).filter((k) => re.test(k.name) && (!k.hidden || last.startsWith("."))).map((k) => dirPart + k.name);
  return hits.length ? hits : null;
}

/* ---------------------------------------------------------- the commands */

class Abort extends Error {}

interface IO {
  /** the name the command was typed as */
  name: string;
  args: string[];
  /** the arguments before globbing (rm reads these) */
  raw: string[];
  stdin: string[] | null;
  /** output goes into a pipe or a file, not the screen */
  piped: boolean;
  out: (...l: Out[]) => void;
  err: (msg: string) => void;
  /** a dim hint on screen, never piped */
  note: (msg: string) => void;
  frame: (...l: Out[]) => void;
  sleep: (ms: number) => Promise<void>;
  host: Host;
}
type Cmd = { group?: "site" | "files" | "system" | "classics"; usage?: string; desc: string; run: (io: IO) => void | Promise<void> };

function flags(args: string[]) {
  const f = new Set<string>();
  const rest: string[] = [];
  for (const a of args) {
    if (/^-[a-zA-Z0-9]+$/.test(a)) for (const c of a.slice(1)) f.add(c);
    else rest.push(a);
  }
  return { f, rest };
}

/** files named on the command line, or stdin, as [name, lines] pairs */
function inputs(io: IO, files: string[], cmd: string): [string, string[]][] {
  if (!files.length) return io.stdin ? [["", io.stdin]] : [];
  const out: [string, string[]][] = [];
  for (const p of files) {
    const v = resolve(p);
    if (!v) io.err(`${cmd}: ${p}: No such file or directory`);
    else if (v.dir) io.err(`${cmd}: ${p}: Is a directory`);
    else {
      const t = read(v);
      if (t === null) io.err(`${cmd}: ${p}: binary file (try \`open ${p}\`)`);
      else out.push([p, t.replace(/\n$/, "").split("\n")]);
    }
  }
  return out;
}

const NOPE = [
  "I kept this work for a reason. Try `open` to see what I learned from it.",
  "The architect in me would keep this part of the structure.",
  "This work is staying in the portfolio. You can read it with `open`.",
  "I've put the work here for you to explore. `open` is more useful than `rm`.",
  "Older work lives in ~/.Trash. I still like looking back at where I started.",
  "The work stays here. Try `tree` to see where it fits.",
];
function nope(cmd: string, v: VNode | null, name: string) {
  if (v?.mine) return `${cmd}: ${name}: This desktop keeps your files until you reload the page.`;
  if (v?.name === ".Trash") return `${cmd}: .Trash: I kept the older work here too. Try \`ls ~/.Trash\` to have a look.`;
  if (v?.name === "README.md") return `${cmd}: README.md: That file tells the project story. ${pick(NOPE)}`;
  if (v?.node?.id === "cv") return `${cmd}: ${name}: That's my CV. Try \`cv\` to read it.`;
  if (v?.node?.id === "qi-card") return `${cmd}: ${name}: That's my work at Qi. Try \`open qi-card\` to read about my part.`;
  if (v?.node?.id === "cardyiq") return `${cmd}: ${name}: That's my work at Cardy. Try \`open cardyiq\` to read about it.`;
  if (v?.node?.id === "products") return `${cmd}: ${name}: That's where you'll find the products I've worked on.`;
  return `${cmd}: ${name}: ${pick(NOPE)}`;
}

async function wipeEverything(io: IO) {
  const top = (ROOT.kids ?? []).map((k) => `~/${label(k)}`);
  const bar = (p: number) => {
    const w = 24;
    const n = Math.round(p * w);
    return [seg("["), seg("█".repeat(n), "err"), seg("░".repeat(w - n), "dim"), seg(`] ${Math.round(p * 100)}%`)];
  };
  for (let i = 0; i < top.length; i++) {
    io.frame(...top.slice(0, i + 1).map((t) => `removing ${t}`), bar((i + 1) / top.length));
    await io.sleep(260);
  }
  await io.sleep(500);
  io.frame("rm: just kidding. Nothing was deleted.");
  io.note("I had a feeling someone would try that.");
}

function rmLike(cmd: string) {
  return async (io: IO) => {
    const { f, rest } = flags(io.raw);
    if (!rest.length) return io.err(`usage: ${cmd} [-f | -i] [-dIPRrvWx] file ...`);
    const everything = rest.some((a) => /^(\/|~|\.|\*|~\/\*?|\/\*|\.\/\*?)$/.test(a));
    if (everything && (f.has("r") || f.has("R") || cmd !== "rm")) return wipeEverything(io);
    for (const p of io.args.filter((a) => !a.startsWith("-"))) {
      const v = resolve(p);
      if (!v && cmd === "rm" && !f.has("f")) io.err(`${cmd}: ${p}: No such file or directory`);
      else io.err(nope(cmd, v, p));
    }
  };
}

function lsLines(dir: VNode, f: Set<string>): Out[] {
  const all = f.has("a");
  let kids = (dir.kids ?? []).filter((k) => all || !k.hidden);
  if (all) kids = [{ name: ".", dir: true }, { name: "..", dir: true }, ...kids];
  if (f.has("l")) {
    const w = Math.max(...kids.map((k) => label(k).length), 4);
    return kids.map((k) => [
      seg(`${k.dir ? "drwxr-xr-x" : k.mine ? "-rw-r--r--" : "-r--r--r--"}  `),
      seg(`${k.mine ? "visitor" : "aws"}`.padEnd(8)),
      seg(sizeOf(k).padStart(5) + "  "),
      seg(label(k).padEnd(w), k.dir ? "dir" : k.href ? "link" : undefined),
      seg(k.note ? `  ${k.note}` : "", "dim"),
    ]);
  }
  if (!kids.length) return [];
  const segs: Seg[] = [];
  kids.forEach((k, i) => segs.push(seg(label(k), k.dir ? "dir" : k.href ? "link" : undefined), seg(i < kids.length - 1 ? (f.has("1") ? "\n" : "   ") : "")));
  return [segs];
}

function treeLines(v: VNode, all: boolean, depth: number, prefix = "", count = { d: 0, f: 0 }): Out[] {
  const kids = (v.kids ?? []).filter((k) => all || !k.hidden);
  return kids.flatMap((k, i) => {
    const last = i === kids.length - 1;
    k.dir ? count.d++ : count.f++;
    const line: Out = [seg(prefix + (last ? "└── " : "├── "), "dim"), seg(label(k), k.dir ? "dir" : k.href ? "link" : undefined)];
    return k.dir && depth > 1 ? [line, ...treeLines(k, all, depth - 1, prefix + (last ? "    " : "│   "), count)] : [line];
  });
}

const pids = new Map<string, number>();
function procs(host: Host) {
  return host.windows().map((w) => {
    if (!pids.has(w.id)) pids.set(w.id, 301 + pids.size);
    const pid = pids.get(w.id)!;
    const cmd = w.kind === "terminal" ? "-zsh" : w.kind === "finder" ? `Finder (${w.title})` : w.title;
    return { pid, id: w.id, cmd, time: `0:${String(pid % 60).padStart(2, "0")}.${String((pid * 7) % 100).padStart(2, "0")}` };
  });
}
const psTable = (host: Host): Out[] => ["  PID TTY           TIME CMD", ...procs(host).map((p) => `${String(p.pid).padStart(5)} ttys001    ${p.time} ${p.cmd}`)];

function macDate(d: Date, tz?: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23", year: "numeric", timeZoneName: "short", timeZone: tz,
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("weekday")} ${g("month")} ${g("day").padStart(2)} ${g("hour")}:${g("minute")}:${g("second")} ${g("timeZoneName")} ${g("year")}`;
}

function since(ms: number) {
  const m = Math.floor(ms / 60000);
  if (m < 1) return `${Math.max(1, Math.floor(ms / 1000))} secs`;
  if (m < 60) return `${m} min${m === 1 ? "" : "s"}`;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

const BANANA = [
  "  _",
  " ( )",
  " | |",
  " |  \\",
  " |   \\",
  "  \\   `.",
  "   \\    `-.",
  "    `.     `--..__",
  "      `-._        ``--.",
  "          `--.._____..-'",
];

const TRAIN = [
  "      (  ) (@@) ( )  (@)  ()",
  "    ++      ____________________",
  "  __||_____|  []  []  | [] [] [] |",
  " |  _  ___ |__________|__________|",
  " |_(o)_(o)_|_(o)____(o)_(o)___(o)_|",
];

function cowsay(msg: string): Out[] {
  const w = Math.min(Math.max(msg.length, 4), 40);
  const words = msg.split(/\s+/);
  const rows: string[] = [];
  for (const word of words) {
    const last = rows[rows.length - 1];
    if (last !== undefined && (last + " " + word).length <= w) rows[rows.length - 1] = `${last} ${word}`;
    else rows.push(word);
  }
  const len = Math.max(...rows.map((r) => r.length));
  const box =
    rows.length === 1
      ? [`< ${rows[0]} >`]
      : rows.map((r, i) => `${i === 0 ? "/" : i === rows.length - 1 ? "\\" : "|"} ${r.padEnd(len)} ${i === 0 ? "\\" : i === rows.length - 1 ? "/" : "|"}`);
  return [` ${"_".repeat(len + 2)}`, ...box, ` ${"-".repeat(len + 2)}`, "        \\   ^__^", "         \\  (oo)\\_______", "            (__)\\       )\\/\\", "                ||----w |", "                ||     ||"];
}

const FORTUNES = [
  ...PROFILE.principles,
  ...ABOUT.work.items.map((w) => `${w.title} ${w.then}`),
  ABOUT.life.signoff,
  PROFILE.music.note,
  "I like understanding why something went wrong before fixing it.",
];

function editor(name: string) {
  return (io: IO) => {
    const file = io.args[0];
    const v = file ? resolve(file) : null;
    if (name === "nano") return io.err(`nano: read-only in here. Try \`cat ${file ?? "README.md"}\`.`);
    if (name === "emacs") return io.err("emacs: one desktop inside a website is probably enough.");
    if (name === "code") return io.err(`code: this terminal can't launch VS Code. \`open ${file ?? "."}\` works, though.`);
    const t = v && !v.dir ? read(v) : null;
    io.out(...(t ? t.split("\n").slice(0, 8) : ["", "VIM - Vi IMproved"]), [seg("~", "dir")], [seg("~", "dir")], file ? `"${file}" [readonly]` : "");
    io.note(":q! You're out already. This vim lets people leave.");
  };
}

function pkg(pm: string) {
  return async (io: IO) => {
    const [sub, ...rest] = io.args;
    const name = rest.find((a) => !a.startsWith("-"));
    if (["install", "i", "add"].includes(sub ?? "")) {
      const spin = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
      for (let i = 0; i < 12; i++) {
        io.frame([seg(spin[i % spin.length], "ok"), seg(` resolving ${name ?? "dependencies"}...`, "dim")]);
        await io.sleep(70);
      }
      io.frame(name ? `I'm already here. No installation needed.` : "The portfolio is already running. Try `about` to get to know me.");
      io.out("", "That was the browser version of an install. `hire` opens my calendar if you want to talk about working together.");
      return;
    }
    if (pm === "npm" && sub === "test") return io.out("", "> awsdang.com@26.0.0 test", '> echo "Error: no test specified" && exit 1', "", "Error: no test specified");
    if ((sub === "run" && ["dev", "start"].includes(rest[0] ?? "")) || sub === "start" || sub === "dev")
      return io.out("", "> awsdang.com@26.0.0 start", "> next start", "", "ready on awsdang.com. You're looking at it.");
    if (!sub) return io.out(`Usage: ${pm} <command>`, "", "try:", `  ${pm} install aws`);
    io.err(`${pm} error: Unknown command: "${sub}"`);
  };
}

const HERO = [PROFILE.hero.line1, `${PROFILE.hero.line2Before}${PROFILE.hero.line2Org}${PROFILE.hero.line2After}`, "", PROFILE.hero.sub];
const isOurs = (h = "") => /^(https?:\/\/)?(www\.)?(awsdang\.com|localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(h) || /^aws$/i.test(h);

const GIT_REWRITE = "git: I kept the history here for a reason. Try `git log` to see my path from architecture to software.";
const STEPS = ABOUT.path.eras.flatMap((e) => e.steps).reverse();
const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

const SITE_WINDOWS: Record<string, [Parameters<Host["open"]>[0], string]> = {
  about: ["about", "About me"],
  aboutme: ["about", "About me"],
  achievements: ["achievements", "Achievements"],
  certificates: ["achievements", "Achievements"],
  mail: ["contact", "Write to Aws"],
  contact: ["contact", "Write to Aws"],
  email: ["contact", "Write to Aws"],
  bug: ["bug", "Report a bug"],
  reportabug: ["bug", "Report a bug"],
  hire: ["booking", "Schedule a conversation"],
  booking: ["booking", "Schedule a conversation"],
  book: ["booking", "Schedule a conversation"],
  interview: ["booking", "Schedule a conversation"],
  calendar: ["booking", "Schedule a conversation"],
  sysinfo: ["sysinfo", "About This Portfolio"],
};

function openVNode(v: VNode, io: IO, as: string) {
  if (v.win) return io.host.open(v.win), io.out(`opening ${SITE_WINDOWS[v.win][1]}...`);
  if (v === ROOT) return io.host.openNode("root"), io.out("opening Desktop...");
  if (v.node && v.node.kind !== "file") return io.host.openNode(v.node.id), io.out(`opening ${v.node.name}...`);
  if (v.href) return io.host.openHref(v.href), io.out(`opening ${v.name}...`);
  if (v.dir) return io.err(`open: ${as} only lives in this terminal. Try \`ls ${as}\`.`);
  io.err(`This terminal can't open ${pathOf(v)} in a window. Try \`cat ${as}\`.`);
}

const C: Record<string, Cmd> = {
  help: {
    desc: "show the available commands",
    run: (io) =>
      io.out(
        "You can explore my portfolio with commands or ask a question in plain words.",
        "",
        ...(
          [
            ["this site", "site"],
            ["files", "files"],
            ["system", "system"],
            ["classics", "classics"],
          ] as const
        ).flatMap(([title, g]) => {
          // wrap each group under its own column, not back at the left edge
          const rows: string[] = [""];
          for (const k of Object.keys(C).filter((k) => C[k].group === g)) {
            const row = rows[rows.length - 1];
            if (row && 11 + row.length + 2 + k.length > io.host.cols) rows.push(k);
            else rows[rows.length - 1] = row ? `${row}  ${k}` : k;
          }
          return rows.map((r, i): Out => [seg((i ? "" : title).padEnd(11), "bold"), seg(r)]);
        }),
        "",
        [seg("Start with `about`, `open cardy` or `contact`. Use `man <command>` to learn a command. Tab completes commands, the arrow keys recall them, and ctrl+c stops one.", "dim")],
      ),
  },
  man: {
    group: "system",
    usage: "man <command>",
    desc: "explain a command",
    run: (io) => {
      const k = io.args[0]?.toLowerCase();
      if (!k) return io.err("What manual page do you want?\nFor example, try 'man ls'.");
      if (k === "aws") return io.out(`${PROFILE.name.toUpperCase()}(1)`, "", "NAME", `    aws, ${ABOUT.role}`, "", "DESCRIPTION", `    ${ABOUT.intro}`, "", "SEE ALSO", "    about(1), hire(1)");
      const c = C[ALIAS_OF[k] ?? k];
      if (!c) return io.err(`No manual entry for ${k}`);
      io.out(`${k.toUpperCase()}(1)`, "", "NAME", `    ${k}, ${c.desc}`, "", "SYNOPSIS", `    ${c.usage ?? k}`);
    },
  },

  // this site
  open: {
    group: "site",
    usage: "open <project | folder | file | about | achievements | mail | hire>",
    desc: "open anything in its own window",
    run: (io) => {
      const raw = io.args.join(" ");
      if (!raw) return io.err("usage: open <project | folder | file | about | achievements | mail | hire>");
      if (/^(cv|resume|r[ée]sum[ée])$/i.test(raw)) return C.cv.run(io);
      const w = SITE_WINDOWS[norm(raw)];
      if (w) return io.host.open(w[0]), io.out(`opening ${w[1]}...`);
      const v = resolve(raw) ?? fuzzy(raw);
      if (!v) return io.err(`The file ${raw} does not exist. Try \`ls\`, or \`find ${raw}\`.`);
      openVNode(v, io, raw);
    },
  },
  about: { group: "site", desc: "read about my background and work", run: (io) => (io.host.open("about"), io.out("opening About me...")) },
  cv: { group: "site", desc: "read my software engineering CV", run: (io) => (io.host.openHref(CV_URL), io.out("opening software-engineer-cv.pdf...")) },
  contact: { group: "site", desc: "write to me about an opportunity or a project", run: (io) => (io.host.open("contact"), io.out("opening Write to Aws...")) },
  bug: { group: "site", desc: "report something broken on this site", run: (io) => (io.host.open("bug"), io.out("opening Report a bug...")) },
  hire: { group: "site", desc: "schedule a conversation about working together", run: (io) => (io.host.open("booking"), io.out("opening Schedule a conversation...")) },
  achievements: { group: "site", desc: "awards, degrees and certificates", run: (io) => (io.host.open("achievements"), io.out("opening Achievements...")) },
  theme: {
    group: "site",
    usage: "theme [light | dark]",
    desc: "switch between light and dark mode",
    run: (io) => {
      const want = io.args[0]?.toLowerCase();
      const next = want === "light" || want === "dark" ? want : io.host.theme === "dark" ? "light" : "dark";
      io.host.setTheme(next);
      io.out(`Theme set to ${next}.`);
    },
  },
  ask: { group: "site", usage: "ask <question>", desc: "ask about my work, or type a question directly", run: (io) => (io.args.length ? io.host.ask(io.args.join(" ")) : io.err("usage: ask <question>")) },

  // files
  ls: {
    group: "files",
    usage: "ls [-la1] [path ...]",
    desc: "list a folder",
    run: (io) => {
      const { f, rest } = flags(io.args);
      const paths = rest.length ? rest : ["."];
      paths.forEach((p, i) => {
        const v = resolve(p);
        if (!v) return io.err(`ls: ${p}: No such file or directory`);
        if (!v.dir) return io.out([seg(p, v.href ? "link" : undefined)]);
        if (paths.length > 1) io.out(`${i ? "\n" : ""}${p}:`);
        io.out(...lsLines(v, io.piped ? new Set([...f, "1"]) : f));
      });
    },
  },
  cd: {
    group: "files",
    usage: "cd [path | - | ~]",
    desc: "change folder",
    run: (io) => {
      const p = io.args[0];
      const go = (v: VNode) => {
        state.prev = state.cwd;
        state.cwd = v;
      };
      if (!p || p === "~") return go(ROOT);
      if (p === "-") return go(state.prev), io.out(pathOf(state.cwd));
      const v = resolve(p);
      if (v && !v.dir) return io.err(`cd: not a directory: ${p}`);
      if (v) return go(v);
      const jump = fuzzy(p, true);
      if (!jump) return io.err(`cd: no such file or directory: ${p}`);
      go(jump);
      io.note(`(jumped to ${pathOf(jump)})`);
    },
  },
  pwd: { group: "files", desc: "where am I", run: (io) => io.out(pathOf(state.cwd).replace(/^~/, state.env.HOME)) },
  cat: {
    group: "files",
    usage: "cat [-n] file ...",
    desc: "print a file",
    run: (io) => {
      const { f, rest } = flags(io.args);
      for (const p of rest) {
        const v = resolve(p);
        if (v?.dir && v.kids?.some((k) => k.name === "README.md")) {
          io.err(`cat: ${p}: Is a directory`);
          io.note(`try \`cat ${p.replace(/\/$/, "")}/README.md\``);
          return;
        }
      }
      for (const [, lines] of inputs(io, rest, "cat")) io.out(...(f.has("n") ? lines.map((l, i) => `${String(i + 1).padStart(6)}  ${l}`) : lines));
    },
  },
  tree: {
    group: "files",
    usage: "tree [-a] [-L depth] [path]",
    desc: "the whole folder, as a tree",
    run: (io) => {
      const { f, rest } = flags(io.args.filter((a, i, all) => a !== "-L" && all[i - 1] !== "-L"));
      const li = io.args.indexOf("-L");
      const depth = li >= 0 ? Number(io.args[li + 1]) || 1 : 9;
      const v = resolve(rest[0] ?? ".");
      if (!v?.dir) return io.err(`${rest[0]} [error opening dir]`);
      const count = { d: 0, f: 0 };
      io.out([seg(rest[0] ?? ".", "dir")], ...treeLines(v, f.has("a"), depth, "", count), "", `${count.d} directories, ${count.f} files`);
    },
  },
  find: {
    group: "files",
    usage: "find [path] [-name pattern] [-type d|f]",
    desc: "find files by name",
    run: (io) => {
      const a = [...io.args];
      const opt = (k: string) => {
        const i = a.indexOf(k);
        if (i < 0) return undefined;
        const v = a[i + 1];
        a.splice(i, 2);
        return v;
      };
      const name = opt("-name") ?? opt("-iname");
      const type = opt("-type");
      let start = a[0] ?? ".";
      let word: string | undefined;
      if (!resolve(start) && !name) (word = start), (start = ".");
      const root = resolve(start);
      if (!root) return io.err(`find: ${start}: No such file or directory`);
      const re = name ? new RegExp(`^${name.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`, "i") : null;
      const base = pathOf(root);
      const hits: Out[] = [];
      walk(root, (v) => {
        if (type === "d" && !v.dir) return;
        if (type === "f" && v.dir) return;
        if (re && !re.test(v.name)) return;
        if (word && !norm(v.name).includes(norm(word)) && !norm(v.node?.name ?? "").includes(norm(word))) return;
        const p = start + pathOf(v).slice(base.length);
        hits.push([seg(p, v.dir ? "dir" : undefined)]);
      });
      if (!hits.length && word) return io.err(`find: I couldn't find ${word} here. Try \`ls\` or \`tree\`.`);
      io.out(...hits);
    },
  },
  grep: {
    group: "files",
    usage: "grep [-inlv] pattern [path ...]",
    desc: "search inside files (case-insensitive unless you use capitals)",
    run: (io) => {
      const { f, rest } = flags(io.args);
      const [pat, ...paths] = rest;
      if (!pat) return io.err("usage: grep [-inlv] pattern [file ...]");
      const ci = f.has("i") || pat === pat.toLowerCase();
      let re: RegExp;
      try {
        re = new RegExp(pat, ci ? "gi" : "g");
      } catch {
        re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ci ? "gi" : "g");
      }
      const files: [string, string[]][] = [];
      let tree = false;
      if (!paths.length && io.stdin) files.push(["", io.stdin]);
      else
        for (const p of paths.length ? paths : ["."]) {
          const v = resolve(p);
          if (!v) {
            io.err(`grep: ${p}: No such file or directory`);
            continue;
          }
          tree ||= !!v.dir;
          const base = p === "." ? "" : p.replace(/\/$/, "");
          walk(v, (x) => {
            const t = !x.dir && !x.hidden ? read(x) : null;
            const rel = pathOf(x).slice(pathOf(v).length).replace(/^\//, "");
            if (t !== null) files.push([[base, rel].filter(Boolean).join("/") || p, t.split("\n")]);
          });
        }
      const showName = files.length > 1 || tree;
      let found = 0;
      for (const [name, lines] of files) {
        let inFile = 0;
        lines.forEach((line, i) => {
          re.lastIndex = 0;
          if (re.test(line) === f.has("v")) return;
          found++;
          inFile++;
          if (f.has("l")) return;
          const out: Seg[] = [];
          if (showName && name) out.push(seg(name, "link"), seg(":", "dim"));
          if (f.has("n")) out.push(seg(String(i + 1), "ok"), seg(":", "dim"));
          let last = 0;
          re.lastIndex = 0;
          if (!f.has("v"))
            for (const m of line.matchAll(re)) {
              out.push(seg(line.slice(last, m.index)), seg(m[0], "warn"));
              last = (m.index ?? 0) + m[0].length;
            }
          out.push(seg(line.slice(last)));
          io.out(out);
        });
        if (f.has("l") && inFile) io.out([seg(name, "link")]);
      }
      if (!found) state.status = 1;
    },
  },
  head: {
    group: "files",
    usage: "head [-n count] [file ...]",
    desc: "the first lines",
    run: (io) => {
      const n = numArg(io.args, 10);
      for (const [, lines] of inputs(io, fileArgs(io.args), "head")) io.out(...lines.slice(0, n));
    },
  },
  tail: {
    group: "files",
    usage: "tail [-n count] [file ...]",
    desc: "the last lines",
    run: (io) => {
      const n = numArg(io.args, 10);
      for (const [, lines] of inputs(io, fileArgs(io.args), "tail")) io.out(...lines.slice(-n));
    },
  },
  wc: {
    group: "files",
    usage: "wc [-lwc] [file ...]",
    desc: "count lines, words and characters",
    run: (io) => {
      const { f, rest } = flags(io.args);
      const all = !f.has("l") && !f.has("w") && !f.has("c");
      for (const [name, lines] of inputs(io, rest, "wc")) {
        const t = lines.join("\n");
        const cols = [
          (all || f.has("l")) && lines.length,
          (all || f.has("w")) && t.split(/\s+/).filter(Boolean).length,
          (all || f.has("c")) && t.length,
        ].filter((x) => x !== false);
        io.out(cols.map((c) => String(c).padStart(8)).join("") + (name ? ` ${name}` : ""));
      }
    },
  },
  sort: {
    group: "files",
    usage: "sort [-r] [file ...]",
    desc: "sort lines",
    run: (io) => {
      const { f, rest } = flags(io.args);
      const lines = inputs(io, rest, "sort").flatMap(([, l]) => l).sort((a, b) => a.localeCompare(b));
      io.out(...(f.has("r") ? lines.reverse() : lines));
    },
  },
  file: {
    group: "files",
    usage: "file path ...",
    desc: "what kind of file is it",
    run: (io) =>
      io.args.forEach((p) => {
        const v = resolve(p);
        if (!v) return io.out(`${p}: cannot open (No such file or directory)`);
        const kind = v.dir ? "directory" : v.href?.endsWith(".pdf") ? "PDF document, version 1.7" : v.href ? `Internet shortcut to ${v.href}` : v.name.endsWith(".md") ? "Markdown text, UTF-8" : "ASCII text";
        io.out(`${p}: ${kind}`);
      }),
  },
  touch: {
    group: "files",
    usage: "touch file ...",
    desc: "make an empty file (kept until you reload)",
    run: (io) =>
      io.args.forEach((p) => {
        const v = resolve(p);
        if (v) return;
        const e = writeFile(p, "", true);
        if (e) io.err(`touch: ${e}`);
      }),
  },
  mkdir: {
    group: "files",
    usage: "mkdir [-p] dir ...",
    desc: "make a folder (kept until you reload)",
    run: (io) => {
      const { f, rest } = flags(io.args);
      for (const p of rest) {
        if (resolve(p)) {
          if (!f.has("p")) io.err(`mkdir: ${p}: File exists`);
          continue;
        }
        let dir = p.startsWith("~") || p.startsWith("/") ? ROOT : state.cwd;
        const parts = p.replace(/^~?\/*/, "").split("/").filter(Boolean);
        for (const [i, part] of parts.entries()) {
          if (!dir.dir) return io.err(`mkdir: ${p}: Not a directory`);
          const next = part === ".." ? (dir.up ?? dir) : part === "." ? dir : dir.kids?.find((k) => k.name === part);
          if (next) {
            dir = next;
            continue;
          }
          if (i < parts.length - 1 && !f.has("p")) return io.err(`mkdir: ${p}: No such file or directory`);
          if (inTrash(dir)) return io.err(`mkdir: ${p}: the Trash only takes Aws's old work`);
          const made: VNode = { name: part, dir: true, kids: [], mine: true };
          addKid(dir, made);
          dir = made;
        }
      }
    },
  },
  echo: { group: "files", usage: "echo [text]", desc: "print text (try `echo hi > notes.txt`)", run: (io) => io.out(io.args.filter((a) => a !== "-n").join(" ")) },
  cp: {
    group: "files",
    usage: "cp [-r] source target",
    desc: "copy a file",
    run: (io) => {
      const { f, rest } = flags(io.args);
      const [src, dst] = rest;
      if (!src || !dst) return io.err("usage: cp [-R] source_file target_file");
      const v = resolve(src);
      if (!v) return io.err(`cp: ${src}: No such file or directory`);
      if (v.dir && !f.has("r") && !f.has("R")) return io.err(`cp: ${src} is a directory (not copied).`);
      if (v.dir && !v.mine) return io.err(`cp: this folder stays in the portfolio. To talk about the work, try \`hire\`.`);
      const t = target(dst);
      if (typeof t === "string") return io.err(`cp: ${t}`);
      const name = t.name || v.name;
      const clash = t.dir.kids?.find((k) => k.name === name);
      if (clash && !clash.mine) return io.err(`cp: ${dst}: Permission denied`);
      if (inTrash(t.dir)) return io.err("cp: the Trash only takes Aws's old work");
      const clone = (x: VNode): VNode => ({ name: x.name, dir: x.dir, mine: true, text: x.dir ? undefined : (read(x) ?? undefined), href: x.href, kids: x.kids?.map(clone) });
      const copy = { ...clone(v), name };
      if (clash) t.dir.kids = t.dir.kids!.filter((k) => k !== clash);
      addKid(t.dir, copy);
      (function relink(x: VNode) {
        x.kids?.forEach((k) => ((k.up = x), relink(k)));
      })(copy);
    },
  },
  mv: {
    group: "files",
    usage: "mv source target",
    desc: "move or rename your own files",
    run: (io) => {
      const [src, dst] = io.args;
      if (!src || !dst) return io.err("usage: mv source target");
      const v = resolve(src);
      if (!v) return io.err(`mv: rename ${src} to ${dst}: No such file or directory`);
      const t = target(dst);
      if (typeof t !== "string" && inTrash(t.dir)) return io.err(nope("mv", v, src));
      if (/^\/dev\/null/.test(dst)) return io.err(nope("mv", v, src));
      if (!v.mine) return io.err(`mv: ${src}: this file stays where it is in the portfolio.`);
      if (typeof t === "string") return io.err(`mv: ${t}`);
      for (let c: VNode | undefined = t.dir; c; c = c.up) if (c === v) return io.err(`mv: can't move ${src} into itself`);
      const name = t.name || v.name;
      const clash = t.dir.kids?.find((k) => k.name === name);
      if (clash && !clash.mine) return io.err(`mv: ${dst}: Permission denied`);
      if (clash === v) return;
      if (clash) return io.err(nope("mv", clash, dst));
      v.up!.kids = v.up!.kids!.filter((k) => k !== v);
      v.name = name;
      addKid(t.dir, v);
    },
  },

  // system
  whoami: { group: "system", desc: "you", run: (io) => io.out("visitor") },
  id: { group: "system", desc: "you, in numbers", run: (io) => io.out("uid=501(visitor) gid=20(staff) groups=20(staff),12(everyone)") },
  hostname: { desc: "this machine", run: (io) => io.out("awsdang.com") },
  uname: {
    group: "system",
    usage: "uname [-a]",
    desc: "what this runs on",
    run: (io) => io.out(flags(io.args).f.has("a") ? "Darwin awsdang.com 26.0.0 awsOS 26 (Liquid Glass) Next.js 16, React 19 arm64" : "Darwin"),
  },
  date: {
    group: "system",
    desc: "the time here, and in Baghdad",
    run: (io) => {
      const now = new Date();
      io.out(macDate(now));
      const mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (mine !== PROFILE.timezone) io.note(`${macDate(now, PROFILE.timezone)} in Baghdad, where Aws is`);
    },
  },
  cal: {
    group: "system",
    desc: "this month",
    run: (io) => {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const first = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      const title = now.toLocaleString("en-US", { month: "long", year: "numeric" });
      const rows: Out[] = [" ".repeat(Math.floor((20 - title.length) / 2)) + title, "Su Mo Tu We Th Fr Sa"];
      let row: Seg[] = [seg("   ".repeat(first))];
      for (let d = 1; d <= days; d++) {
        row.push(seg(String(d).padStart(2), d === now.getDate() ? "ok" : undefined), seg(" "));
        if ((first + d) % 7 === 0 || d === days) rows.push(row), (row = []);
      }
      io.out(...rows);
    },
  },
  uptime: {
    group: "system",
    desc: "how long you've been here",
    run: (io) => {
      const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      io.out(`${t}  up ${since(performance.now())}, 1 visitor`);
    },
  },
  ps: { group: "system", desc: "open windows, as processes", run: (io) => io.out(...psTable(io.host)) },
  top: {
    desc: "processes, the busy view",
    run: (io) => {
      const n = io.host.windows().length;
      io.out(`Processes: ${n} total, 1 running, ${n - 1} sleeping`, "These processes represent the open portfolio windows.", "", ...psTable(io.host));
    },
  },
  kill: {
    group: "system",
    usage: "kill <pid>",
    desc: "close a window by its pid (see `ps`)",
    run: (io) => {
      const list = procs(io.host);
      const ids = io.args.filter((a) => !a.startsWith("-"));
      if (!ids.length) return io.err("kill: not enough arguments");
      let self = false;
      for (const a of ids) {
        if (a === "1") {
          io.err(`kill: 1: Operation not permitted. ${SUDO}`);
          continue;
        }
        const p = list.find((x) => String(x.pid) === a);
        if (!p) io.err(`kill: kill ${a} failed: no such process`);
        else if (p.id === io.host.self) self = true;
        else io.host.close(p.id);
      }
      if (self) io.host.close(io.host.self);
    },
  },
  killall: {
    usage: "killall <name>",
    desc: "close every window with that name",
    run: (io) => {
      const q = io.args.filter((a) => !a.startsWith("-")).join(" ").toLowerCase();
      if (!q) return io.err("usage: killall [-v] procname");
      const hits = procs(io.host).filter((p) => p.cmd.toLowerCase().includes(q) || p.id.toLowerCase().startsWith(q));
      if (!hits.length) return io.err("No matching processes belonging to you were found");
      hits.filter((p) => p.id !== io.host.self).forEach((p) => io.host.close(p.id));
      if (hits.some((p) => p.id === io.host.self)) io.host.close(io.host.self);
    },
  },
  history: {
    group: "system",
    desc: "what you typed",
    run: (io) => {
      if (flags(io.args).f.has("c")) return io.err("history: your commands stay here until the page reloads. Try `about` to explore my own history.");
      io.out(...state.history.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`));
    },
  },
  neofetch: {
    group: "system",
    desc: "this machine, with a banana",
    run: (io) => {
      const projects = allNodes().filter((n) => n.kind === "project").length;
      const info: Out[] = [
        [seg("visitor", "ok"), seg("@"), seg("awsdang.com", "ok")],
        "-------------------",
        ...(
          [
            ["OS", "awsOS 26 (Liquid Glass)"],
            ["Host", "awsdang.com"],
            ["Kernel", "Next.js 16, React 19"],
            ["Uptime", since(performance.now())],
            ["Shell", "zsh (aws-ai)"],
            ["Display", `${io.host.viewport.w}x${io.host.viewport.h}`],
            ["Theme", io.host.theme === "dark" ? "Dark" : "Light"],
            ["Projects", String(projects)],
            ["Location", "Baghdad, Iraq"],
            ["Status", PROFILE.availability],
          ] as const
        ).map(([k, v]): Out => [seg(`${k}: `, "warn"), seg(v)]),
      ];
      const rows = Math.max(BANANA.length, info.length);
      const w = 27;
      const narrow = io.host.cols < 60;
      if (narrow) return io.out(...BANANA.map((b) => [seg(b, "warn")]), "", ...info);
      io.out(...Array.from({ length: rows }, (_, i): Out => [seg((BANANA[i] ?? "").padEnd(w), "warn"), ...(typeof info[i] === "string" ? [seg(info[i] as string)] : ((info[i] as Seg[]) ?? []))]));
    },
  },
  which: {
    group: "system",
    usage: "which <command>",
    desc: "where a command lives",
    run: (io) =>
      io.args.forEach((a) => {
        if (state.aliases[a]) return io.out(`${a}: aliased to ${state.aliases[a]}`);
        if (["cd", "echo", "history", "pwd", "exit", "which", "export", "alias"].includes(a)) return io.out(`${a}: shell built-in command`);
        if (C[ALIAS_OF[a] ?? a]) return io.out(`/usr/bin/${a}`);
        io.err(`${a} not found`);
      }),
  },
  alias: {
    group: "system",
    usage: "alias [name='command']",
    desc: "shortcuts",
    run: (io) => {
      const def = io.args.join(" ");
      const m = /^([\w.-]+)=(.*)$/.exec(def);
      if (m) return void (state.aliases[m[1]] = m[2]);
      io.out(...Object.entries(state.aliases).map(([k, v]) => `${k}='${v}'`));
    },
  },
  env: { group: "system", desc: "environment variables", run: (io) => io.out(...Object.entries({ ...state.env, PWD: pathOf(state.cwd).replace(/^~/, state.env.HOME) }).map(([k, v]) => `${k}=${v}`)) },
  printenv: { desc: "environment variables", run: (io) => (io.args[0] ? io.out(state.env[io.args[0]] ?? "") : C.env.run(io)) },
  export: {
    desc: "set a variable",
    usage: "export NAME=value",
    run: (io) =>
      io.args.forEach((a) => {
        const m = /^(\w+)=(.*)$/.exec(a);
        if (m) state.env[m[1]] = m[2];
      }),
  },
  clear: { group: "system", desc: "clean the screen (ctrl+l)", run: (io) => io.host.clear() },
  exit: { group: "system", desc: "close this window", run: (io) => io.host.close(io.host.self) },

  // the classics
  git: {
    group: "classics",
    desc: "Aws's career, as a repo",
    run: (io) => {
      const [sub, ...rest] = io.args;
      const all = io.args.join(" ");
      if (/reset\s+--hard|clean\s+-|push\s+(.*\s)?(-f|--force)|rebase|branch\s+-D|filter-branch|checkout\s+--\s|restore/.test(all)) return io.err(GIT_REWRITE);
      switch (sub) {
        case "status":
          return io.out("On branch main", "Your branch is up to date with 'origin/main'.", "", "nothing to commit, working tree clean");
        case "log":
          return io.out(...STEPS.map((s, i): Out => [seg(hash(s.title + s.when), "warn"), seg(i === 0 ? " (HEAD -> main)" : "", "ok"), seg(` ${s.when}  `, "dim"), seg(s.title)]));
        case "blame": {
          const v = rest[0] ? resolve(rest[0]) : null;
          const t = v && !v.dir ? read(v) : null;
          if (!t) return io.err(`fatal: no such path '${rest[0] ?? ""}' in HEAD`);
          return io.out(...t.split("\n").slice(0, 16).map((l): Out => [seg(`${hash(l)} `, "warn"), seg(`(${v!.mine ? "visitor" : PROFILE.name} 2026) `, "dim"), seg(l)]));
        }
        case "push":
          return io.out("Everything up-to-date");
        case "pull":
        case "fetch":
          return io.out("Already up to date.");
        case "commit":
          return io.out("On branch main", "nothing to commit, working tree clean");
        case "branch":
          return io.out([seg("* "), seg("main", "ok")]);
        case "diff":
          return;
        case "remote":
          return io.out(`origin\t${PROFILE.links.github} (fetch)`, `origin\t${PROFILE.links.github} (push)`);
        case "clone":
          return io.out(`Cloning into '${(rest[0] ?? "aws").split("/").pop()?.replace(/\.git$/, "")}'...`), io.err("fatal: I haven't worked out how to clone myself yet. Try `hire` to schedule a conversation.");
        case "--version":
        case "version":
          return io.out("git version 2.51.0");
        case undefined:
          return io.out("usage: git <command>", "", "try: git log, git status, git blame README.md");
      }
      io.err(`git: '${sub}' is not a git command. See 'git --help'.`);
    },
  },
  npm: { group: "classics", desc: "install things (try `npm install aws`)", run: pkg("npm") },
  yarn: { desc: "install things", run: pkg("yarn") },
  pnpm: { desc: "install things", run: pkg("pnpm") },
  bun: { desc: "install things", run: pkg("bun") },
  pip: { desc: "install things", run: pkg("pip") },
  brew: { group: "classics", desc: "Homebrew", run: (io) => io.err("Error: Homebrew can't install packages in this portfolio.") },
  apt: { desc: "not on a Mac", run: (io) => io.err(`zsh: command not found: ${io.name}. This terminal runs inside a website.`) },
  ssh: {
    group: "classics",
    usage: "ssh host",
    desc: "remote shell",
    run: (io) => io.err(`ssh: connect to ${io.args.find((a) => !a.startsWith("-")) ?? "host"} port 22: Permission denied (publickey).\nThis terminal can't connect to another computer. Schedule a conversation with \`hire\`.`),
  },
  ping: {
    group: "classics",
    usage: "ping awsdang.com",
    desc: "is it up?",
    run: async (io) => {
      const host = io.args.find((a) => !a.startsWith("-")) ?? "";
      if (!host) return io.err("usage: ping host");
      if (!isOurs(host)) return io.err(`ping: cannot resolve ${host}: this terminal only knows one website, awsdang.com`);
      const name = host.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      io.note("This ping is simulated. No network request is made.");
      io.out(`PING ${name} (127.0.0.1): 56 data bytes`);
      const times: number[] = [];
      for (let i = 0; i < 4; i++) {
        const t = 8 + Math.random() * 14;
        times.push(t);
        io.out(`64 bytes from 127.0.0.1: icmp_seq=${i} ttl=64 time=${t.toFixed(3)} ms`);
        if (i < 3) await io.sleep(700);
      }
      const avg = times.reduce((a, b) => a + b) / times.length;
      io.out("", `--- ${name} ping statistics ---`, "4 packets transmitted, 4 packets received, 0.0% packet loss", `round-trip min/avg/max = ${Math.min(...times).toFixed(3)}/${avg.toFixed(3)}/${Math.max(...times).toFixed(3)} ms`);
    },
  },
  curl: {
    group: "classics",
    usage: "curl awsdang.com",
    desc: "fetch a page",
    run: (io) => {
      const { f, rest } = flags(io.args);
      const url = rest[0];
      if (!url) return io.err("curl: try 'curl awsdang.com'");
      if (!isOurs(url)) return io.err(`curl: (6) Could not resolve host: ${url.replace(/^https?:\/\//, "")} (this terminal only knows awsdang.com)`);
      if (f.has("I")) return io.out("HTTP/2 200", "content-type: text/html; charset=utf-8", "x-powered-by: Next.js", `x-built-by: ${PROFILE.name}`);
      io.out(...HERO);
    },
  },
  wget: {
    usage: "wget awsdang.com",
    desc: "download a page",
    run: (io) => {
      const url = io.args.find((a) => !a.startsWith("-"));
      if (!url) return io.err("wget: missing URL");
      if (!isOurs(url)) return io.err(`wget: unable to resolve host address '${url.replace(/^https?:\/\//, "")}'`);
      let name = "index.html";
      for (let i = 1; resolve(name); i++) name = `index.html.${i}`;
      const e = writeFile(name, HERO.join("\n"), false);
      if (e) return io.err(`wget: ${e}`);
      io.out("HTTP request sent, awaiting response... 200 OK", `Saving to: '${name}'`, "", `'${name}' saved. Try \`cat ${name}\`.`);
    },
  },
  docker: { group: "classics", desc: "containers", run: (io) => io.err("Cannot connect to the Docker daemon at unix:///var/run/docker.sock.\nThis terminal can't start containers.") },
  vim: { group: "classics", usage: "vim [file]", desc: "the editor you can't leave (you can here)", run: editor("vim") },
  vi: { desc: "vim", run: editor("vim") },
  nvim: { desc: "vim", run: editor("vim") },
  nano: { desc: "an editor", run: editor("nano") },
  emacs: { desc: "an editor", run: editor("emacs") },
  code: { desc: "VS Code", run: editor("code") },
  python: {
    group: "classics",
    desc: "Python",
    run: (io) => {
      io.out("Python 3.13.0 on awsOS", 'Type "help" for more information.', ">>> exit()");
      io.note("This terminal can't run Python. I started using it to automate repetitive tasks in Revit. Try `open before-code` to read how that led me into software.");
    },
  },
  node: { desc: "Node.js", run: (io) => (io.out("Welcome to Node.js v24.", "> .exit"), io.note("This terminal can't run JavaScript.")) },
  cowsay: { group: "classics", usage: "cowsay [text]", desc: "a cow says it", run: (io) => io.out(...cowsay(io.args.join(" ") || (io.stdin?.join(" ") ?? "") || "Moo. Try `cowsay hello`.")) },
  fortune: { group: "classics", desc: "a line from Aws", run: (io) => io.out(pick(FORTUNES)) },
  sl: {
    group: "classics",
    desc: "you meant ls",
    run: async (io) => {
      const w = Math.max(30, Math.min(io.host.cols, 90));
      const tw = Math.max(...TRAIN.map((l) => l.length));
      for (let x = w; x > -tw; x -= 3) {
        io.frame(...TRAIN.map((l) => (x >= 0 ? " ".repeat(x) + l : l.slice(-x)).slice(0, w) || " "));
        await io.sleep(45);
      }
      io.frame("You meant `ls`. It happens to everyone.");
    },
  },
  sudo: { group: "classics", desc: "do it as root", run: (io) => io.err(SUDO) },
  rm: { group: "classics", usage: "rm file ...", desc: "delete a file (good luck)", run: rmLike("rm") },
  rmdir: { desc: "delete a folder", run: rmLike("rmdir") },
  unlink: { desc: "delete a file", run: rmLike("unlink") },
  shred: { desc: "delete a file, thoroughly", run: rmLike("shred") },
  trash: { desc: "move to the Trash", run: rmLike("trash") },
  dd: { desc: "copy blocks", run: (io) => io.err("dd: Aws's disks are not for wiping. Try `cat` instead.") },
  mkfs: { desc: "format a disk", run: (io) => io.err("mkfs: I spent enough time on this layout. Let's keep it.") },
  chmod: { desc: "change permissions", run: (io) => io.err(`chmod: Operation not permitted. ${SUDO}`) },
  chown: { desc: "change owner", run: (io) => io.err(`chown: Operation not permitted. ${SUDO}`) },
  shutdown: { desc: "turn it off", run: (io) => io.err("shutdown: use `exit` to close this window.") },
};

const ALIAS_OF: Record<string, string> = {
  more: "cat", less: "cat", bat: "cat", logout: "exit", quit: "exit", ":q": "exit", ":q!": "exit", ":wq": "exit", ":x": "exit",
  mail: "contact", book: "hire", resume: "cv", fastfetch: "neofetch", htop: "top", ruby: "node", irb: "node", deno: "node",
  python3: "python", pip3: "pip", "apt-get": "apt", yum: "apt", dnf: "apt", pacman: "apt", su: "sudo", doas: "sudo",
  chgrp: "chown", reboot: "shutdown", halt: "shutdown", poweroff: "shutdown", srm: "shred", del: "rm", erase: "rm",
  "rm-rf": "rm", type: "which", info: "man", certificates: "achievements", calendar: "hire",
};

function numArg(args: string[], d: number) {
  const i = args.indexOf("-n");
  if (i >= 0) return Number(args[i + 1]) || d;
  const short = args.find((a) => /^-\d+$/.test(a));
  return short ? Number(short.slice(1)) : d;
}
function fileArgs(args: string[]) {
  return args.filter((a, i) => !a.startsWith("-") && args[i - 1] !== "-n");
}

/* ------------------------------------------------------------- running */

const NO_GLOB = new Set(["find", "grep", "ask", "echo", "cowsay", "git", "alias", "export"]);
const GREETING = /^(hi|hello|hey|yo|salam|marhaba|thanks|thank|thx|sup|hola|howdy)\b/i;
let frameSeq = 0;

export function isCommand(word: string) {
  const w = word.toLowerCase();
  return !!(C[w] || ALIAS_OF[w] || state.aliases[w]);
}

export async function execute(input: string, host: Host, emit: Emit, signal: AbortSignal) {
  let line = input.trim();
  if (!line) return;
  if (line.includes("!!")) {
    const last = state.history[state.history.length - 1];
    if (!last) return emit.print([[seg("zsh: event not found: !!", "err")]]);
    line = line.replaceAll("!!", last);
    emit.print([line]);
  }
  if (state.history[state.history.length - 1] !== line) state.history.push(line);

  const err = (m: string) => emit.print(m.split("\n").map((t) => [seg(t, "err")]));
  if (/:\(\)\s*\{/.test(line)) return err("zsh: fork bomb defused. Nice try, though.");
  if (/^\s*(drop\s+(table|database|schema)|truncate\s|delete\s+from\s)/i.test(line)) return err("This terminal only explores the portfolio. It doesn't connect to a database.");

  const head = line.split(/[\s|;&>]/)[0].toLowerCase();
  if (/\?\s*$/.test(line) && /\s/.test(line)) return host.ask(line);
  if (!isCommand(head)) {
    const word = /^[\w.+-]+$/.test(line);
    if (!word || line.endsWith("?") || GREETING.test(line) || fuzzy(line)) return host.ask(line);
    emit.print([[seg(`zsh: command not found: ${line}`, "err")], [seg("Try `help` for the supported commands, or ask about a project in plain words.", "dim")]]);
    state.status = 127;
    return;
  }

  const sleep = (ms: number) =>
    new Promise<void>((res, rej) => {
      if (signal.aborted) return rej(new Abort());
      const t = setTimeout(res, ms);
      signal.addEventListener("abort", () => (clearTimeout(t), rej(new Abort())), { once: true });
    });

  // split into `a && b ; c` chains of `x | y > file` pipelines
  const toks = lex(line);
  const chains: { op: string; toks: Tok[] }[] = [{ op: ";", toks: [] }];
  for (const t of toks) {
    if (t.op && (t.t === "&&" || t.t === "||" || t.t === ";")) chains.push({ op: t.t, toks: [] });
    else chains[chains.length - 1].toks.push(t);
  }

  try {
    for (const chain of chains) {
      if (!chain.toks.length) continue;
      if (chain.op === "&&" && state.status !== 0) continue;
      if (chain.op === "||" && state.status === 0) continue;
      await pipeline(chain.toks, host, emit, sleep, err);
    }
  } catch (e) {
    if (!(e instanceof Abort)) throw e;
    state.status = 130;
  }
}

async function pipeline(toks: Tok[], host: Host, emit: Emit, sleep: (ms: number) => Promise<void>, err: (m: string) => void) {
  let redirect: { file: string; append: boolean } | null = null;
  const r = toks.findIndex((t) => t.op && (t.t === ">" || t.t === ">>"));
  if (r >= 0) {
    const file = toks[r + 1];
    if (!file || file.op) return err("zsh: parse error near `\\n'");
    redirect = { file: file.t, append: toks[r].t === ">>" };
    toks = toks.slice(0, r);
  }
  const stages: Tok[][] = [[]];
  for (const t of toks) {
    if (t.op && t.t === "|") stages.push([]);
    else stages[stages.length - 1].push(t);
  }

  let stdin: string[] | null = null;
  state.status = 0;
  for (const [i, stage] of stages.entries()) {
    if (!stage.length) return err("zsh: parse error near `|'");
    let words = stage.map((t) => t.t);
    let quoted = stage.map((t) => !!t.quoted);
    const alias = state.aliases[words[0]];
    if (alias) {
      const a = alias.split(/\s+/);
      words = [...a, ...words.slice(1)];
      quoted = [...a.map(() => false), ...quoted.slice(1)];
    }
    const name = words[0].toLowerCase();
    const cmd = C[ALIAS_OF[name] ?? name];
    if (!cmd) {
      err(`zsh: command not found: ${words[0]}`);
      state.status = 127;
      return;
    }
    const raw = words.slice(1);
    // globs that match nothing stay as typed (bash style, kinder than zsh's error)
    const args = raw.flatMap((a, j) => (!quoted[j + 1] && /[*?]/.test(a) && !NO_GLOB.has(name) ? (glob(a) ?? [a]) : [a]));

    const capture = i < stages.length - 1 || !!redirect;
    const buf: Out[] = [];
    let frameAt = -1;
    const key = ++frameSeq;
    const io: IO = {
      name: words[0],
      args,
      raw,
      stdin,
      piped: capture,
      host,
      sleep,
      out: (...l) => (capture ? buf.push(...l) : emit.print(l)),
      err: (m) => {
        state.status = 1;
        err(m);
      },
      note: (m) => emit.print([[seg(m, "dim")]]),
      frame: (...l) => {
        if (!capture) return emit.frame(key, l);
        if (frameAt < 0) frameAt = buf.length;
        buf.splice(frameAt, buf.length - frameAt, ...l);
      },
    };
    await cmd.run(io);
    stdin = buf.map(plain).flatMap((s) => s.split("\n"));
  }
  if (redirect && stdin) {
    const e = writeFile(redirect.file, stdin.join("\n") + (stdin.length ? "\n" : ""), redirect.append);
    if (e) err(`zsh: ${e}`);
  }
}

/* ---------------------------------------------------------- tab complete */

export function complete(input: string): { value: string; options?: string[] } {
  const m = /^(.*?)(\S*)$/.exec(input)!;
  const before = m[1];
  const word = m[2];
  const first = !before.trim() || /(\||&&|;)\s*$/.test(before);
  if (first) {
    const names = [...new Set([...Object.keys(C), ...Object.keys(state.aliases)])].filter((n) => n.startsWith(word.toLowerCase())).sort();
    return finish(before, word, names.map((n) => ({ name: n, full: n, dir: false })));
  }
  const cut = word.lastIndexOf("/");
  const dirPart = cut < 0 ? "" : word.slice(0, cut + 1);
  const stem = word.slice(cut + 1);
  const dir = resolve(dirPart || ".");
  if (!dir?.dir) return { value: input };
  const dirsOnly = /(^|\||&&|;)\s*cd\s+$/.test(before);
  const hits = (dir.kids ?? [])
    .filter((k) => k.name.toLowerCase().startsWith(stem.toLowerCase()) && (!k.hidden || stem.startsWith(".")) && (!dirsOnly || k.dir))
    .map((k) => ({ name: label(k), full: dirPart + k.name, dir: !!k.dir }));
  return finish(before, word, hits);
}

function finish(before: string, word: string, hits: { name: string; full: string; dir: boolean }[]) {
  if (!hits.length) return { value: before + word };
  if (hits.length === 1) return { value: before + hits[0].full + (hits[0].dir ? "/" : " ") };
  let common = hits[0].full;
  for (const h of hits) while (!h.full.toLowerCase().startsWith(common.toLowerCase())) common = common.slice(0, -1);
  if (common.length > word.length) return { value: before + common };
  return { value: before + word, options: hits.map((h) => h.name) };
}
