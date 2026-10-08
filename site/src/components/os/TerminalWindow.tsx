"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useOS } from "./OSProvider";
import { Titlebar, useWindow } from "./Window";
import { ask, AskOffline, type Msg } from "@/lib/ask";
import { allNodes, rootOf } from "@/data/fs";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

type Line = { kind: "cmd" | "out" | "ai" | "sys"; text: string };

const INTRO: Line[] = [
  { kind: "sys", text: "Last login: just now on ttys001" },
  { kind: "out", text: "aws-ai shell. Ask anything about Aws, or type `help`." },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function TerminalWindow() {
  const os = useOS();
  const { win } = useWindow();
  const [lines, setLines] = useState<Line[]>(INTRO);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const history = useRef<string[]>([]);
  const hIdx = useRef(-1);
  const thread = useRef<Msg[]>([]);

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  useEffect(() => {
    if (!os.mobile) focusInput();
  }, [os.mobile]);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines, busy]);

  const print = (...l: Line[]) => setLines((p) => [...p, ...l]);

  function openTarget(raw: string) {
    const q = norm(raw);
    if (!q) return "usage: open <project | folder | about | mail>";
    if (q === "about" || q === "aboutme") return os.open("about"), "opening about-me.txt…";
    if (q === "mail" || q === "contact") return os.open("contact"), "opening Mail…";
    const hit = allNodes().find((n) => n.kind !== "file" && (norm(n.id) === q || norm(n.name) === q)) ??
      allNodes().find((n) => n.kind !== "file" && (norm(n.name).includes(q) || norm(n.id).includes(q)));
    if (!hit) return `open: no such project “${raw}”. try \`ls\`.`;
    os.open("finder", { rootId: rootOf(hit.id), nodeId: hit.id });
    return `opening ${hit.name}…`;
  }

  async function run(cmdRaw: string) {
    const cmd = cmdRaw.trim();
    print({ kind: "cmd", text: cmd });
    if (!cmd) return;
    history.current.unshift(cmd);
    hIdx.current = -1;
    const [head, ...rest] = cmd.split(/\s+/);
    const h = head.toLowerCase();
    const arg = rest.join(" ");

    if (h === "help") {
      return print({
        kind: "out",
        text: [
          "available commands:",
          "  help               this list",
          "  ls                 look around",
          "  open <name>        open a project, folder, about or mail",
          "  cat contact.txt    how to reach Aws",
          "  whoami             existential check",
          "  theme [light|dark] flip the lights",
          "  clear              clean the screen",
          "  exit               close the window",
          "anything else is a question for aws-ai.",
        ].join("\n"),
      });
    }
    if (h === "clear") return setLines([]);
    if (h === "exit" || h === "logout") return os.close(win.id);
    if (h === "whoami") return print({ kind: "out", text: "visitor. I'm aws-ai, Aws's terminal. Ask me about him." });
    if (h === "ls") {
      return print({
        kind: "out",
        text: "my-work/   ai-skills/   contact/   Software Engineer CV.pdf   Claude   ChatGPT\n\ntip: `open qi`, `open cardy`, `open bin` …",
      });
    }
    if (h === "cat" && /contact/.test(arg)) {
      return print({
        kind: "out",
        text: `Email     ${PROFILE.email}\nGitHub    ${PROFILE.links.github}\nLinkedIn  ${PROFILE.links.linkedin}\n${PROFILE.availability}.`,
      });
    }
    if (h === "open") return print({ kind: "out", text: openTarget(arg) });
    if (h === "theme") {
      const want = arg.toLowerCase();
      if (want === "dark" || want === "light") {
        if (want !== os.theme) os.toggleTheme();
        return print({ kind: "out", text: `theme → ${want}` });
      }
      os.toggleTheme();
      return print({ kind: "out", text: "toggled." });
    }
    if (h === "sudo") {
      return print({
        kind: "out",
        text: /hire/i.test(arg)
          ? "visitor is in the sudoers file. This incident will be reported — to Aws, who'd love to talk: `open mail`."
          : "visitor is not in the sudoers file. This incident will be reported.",
      });
    }

    setBusy(true);
    try {
      const r = await ask(cmd, thread.current, "terminal");
      thread.current = [...thread.current, { role: "user", content: cmd }, { role: "assistant", content: r.answer }];
      setDemo(r.demo);
      print({ kind: "ai", text: r.answer });
    } catch (e) {
      print({ kind: "out", text: e instanceof AskOffline ? "aws-ai is offline. try `open mail`." : "network error." });
    } finally {
      setBusy(false);
      requestAnimationFrame(focusInput);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const v = val;
    setVal("");
    void run(v);
  }

  return (
    <div className="flex h-full flex-col bg-[rgba(11,14,26,0.86)] font-mono text-[13px] leading-relaxed text-white/85" onPointerDown={(e) => { if (!(e.target as HTMLElement).closest("input,button")) setTimeout(focusInput) }}>
      <Titlebar title="visitor@aws — zsh — 80×24" className="[&_span]:!text-white/55" />
      <div ref={bodyRef} className="scroll-thin flex-1 space-y-1.5 overflow-y-auto px-5 pb-3 pt-1" aria-live="polite">
        {lines.map((l, i) => (
          <p
            key={i}
            className={cn(
              "whitespace-pre-wrap break-words",
              l.kind === "sys" && "text-white/40",
              l.kind === "cmd" && "text-white",
              l.kind === "ai" && "rounded-lg border-l-2 border-[var(--accent)] bg-white/5 py-1.5 pl-3 font-sans text-[14px] leading-relaxed",
            )}
          >
            {l.kind === "cmd" && <span className="mr-2 text-emerald-400">visitor@aws ~ %</span>}
            {l.text}
          </p>
        ))}
        {busy && <p className="animate-pulse text-white/50">thinking…</p>}
        <form onSubmit={submit} className="flex items-center gap-2">
          <label htmlFor="term-in" className="shrink-0 text-emerald-400">
            visitor@aws ~ %
          </label>
          <input
            id="term-in"
            ref={inputRef}
            value={val}
            readOnly={busy}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                hIdx.current = Math.min(hIdx.current + 1, history.current.length - 1);
                setVal(history.current[hIdx.current] ?? "");
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                hIdx.current = Math.max(hIdx.current - 1, -1);
                setVal(history.current[hIdx.current] ?? "");
              } else if (e.key === "l" && e.ctrlKey) {
                e.preventDefault();
                setLines([]);
              }
            }}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Terminal input"
            className="min-w-0 flex-1 border-none bg-transparent text-white caret-emerald-400 outline-none"
          />
        </form>
      </div>
      {demo && <div className="border-t border-white/10 px-5 py-1.5 text-[11px] text-white/40">demo replies — live model coming soon</div>}
    </div>
  );
}
