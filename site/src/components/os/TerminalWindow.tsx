"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useOS } from "./OSProvider";
import { Titlebar, useWindow } from "./Window";
import { ask, AskOffline, type Msg } from "@/lib/ask";
import { rootOf } from "@/data/fs";
import { complete, execute, history, promptDir, type Host, type Out, type Seg, type Tone } from "@/lib/shell";
import { cn } from "@/lib/cn";

type Line =
  | { kind: "cmd"; text: string; dir: string }
  | { kind: "out"; parts: Seg[]; frame?: number }
  | { kind: "ai"; text: string };

const TONE: Record<Tone, string> = {
  dir: "font-semibold text-sky-300",
  link: "text-fuchsia-300",
  dim: "text-white/45",
  err: "text-rose-300",
  ok: "text-emerald-400",
  warn: "text-amber-300",
  bold: "font-semibold text-white",
};

const toLine = (o: Out, frame?: number): Line => ({ kind: "out", parts: typeof o === "string" ? [{ t: o }] : o, frame });

function lastLogin() {
  const d = new Date();
  const p = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `Last login: ${g("weekday")} ${g("month")} ${g("day")} ${g("hour")}:${g("minute")}:${g("second")} on ttys001`;
}

const MAX_LINES = 600;

export function TerminalWindow() {
  const os = useOS();
  const { win } = useWindow();
  const [lines, setLines] = useState<Line[]>(() => [
    toLine([{ t: lastLogin(), c: "dim" }]),
    toLine("Welcome to my portfolio. Ask about a project, try `about` for my background, or type `help` to explore with commands."),
  ]);
  const [val, setVal] = useState("");
  const [running, setRunning] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [demo, setDemo] = useState(false);
  const [cols, setCols] = useState(80);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hIdx = useRef(-1);
  const thread = useRef<Msg[]>([]);
  const abort = useRef<AbortController | null>(null);

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  // focus the prompt whenever this window comes to the front (dock, menu, another window closing)
  const front = os.focusedId === win.id;
  const frontRef = useRef(front);
  frontRef.current = front;
  useEffect(() => {
    if (front && !os.mobile) focusInput();
  }, [front, os.mobile]);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines, thinking]);
  // characters per row, for output that lays itself out (sl, neofetch)
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCols(Math.floor((el.clientWidth - 40) / 7.8)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const push = (...l: Line[]) => setLines((p) => [...p, ...l].slice(-MAX_LINES));

  const host = (): Host => ({
    self: win.id,
    cols,
    theme: os.theme,
    viewport: { w: os.vw, h: os.vh },
    open: (kind) => os.open(kind),
    openNode: (id) => os.open("finder", { rootId: rootOf(id), nodeId: id }),
    openHref: (href) => os.openHref(href),
    setTheme: (t) => t !== os.theme && os.toggleTheme(),
    windows: () => os.wins.map((w) => ({ id: w.id, kind: w.kind, title: w.title })),
    close: (id) => os.close(id),
    clear: () => setLines([]),
    ask: async (q) => {
      const signal = abort.current?.signal;
      setThinking(true);
      try {
        const r = await ask(q, thread.current, "terminal");
        if (signal?.aborted) return;
        thread.current = [...thread.current, { role: "user", content: q }, { role: "assistant", content: r.answer }];
        setDemo(r.demo);
        push({ kind: "ai", text: r.answer });
      } catch (e) {
        if (!signal?.aborted) push(toLine([{ t: e instanceof AskOffline ? "The assistant is unavailable. You can still explore with `help`, or use `contact` to write to me." : "I couldn't load the reply. Try again, or use `contact` to write to me.", c: "err" }]));
      } finally {
        setThinking(false);
      }
    },
  });

  async function run(cmd: string) {
    push({ kind: "cmd", text: cmd, dir: promptDir() });
    if (!cmd.trim()) return;
    hIdx.current = -1;
    const ctl = new AbortController();
    abort.current = ctl;
    setRunning(true);
    try {
      await execute(
        cmd,
        host(),
        {
          print: (l) => push(...l.map((o) => toLine(o))),
          frame: (key, l) => setLines((p) => [...p.filter((x) => x.kind !== "out" || x.frame !== key), ...l.map((o) => toLine(o, key))]),
        },
        ctl.signal,
      );
    } catch {
      push(toLine([{ t: "I couldn't complete that command. Try `help` for the commands this terminal supports.", c: "err" }]));
    } finally {
      abort.current = null;
      setRunning(false);
      // `open` may have put another window in front; leave the focus with it
      requestAnimationFrame(() => frontRef.current && focusInput());
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (running) return;
    const v = val;
    setVal("");
    void run(v);
  }

  /** `backticked` commands in the output run when clicked */
  const runnable = (text: string, key: string): ReactNode[] =>
    text.split(/(`[^`\n]+`)/g).map((s, i) =>
      /^`[^`<]+`$/.test(s) ? (
        <button
          key={`${key}-${i}`}
          type="button"
          disabled={running}
          onClick={() => void run(s.slice(1, -1))}
          className="rounded-sm text-emerald-300 underline decoration-emerald-300/30 underline-offset-2 hover:decoration-emerald-300 disabled:no-underline"
        >
          {s}
        </button>
      ) : (
        s
      ),
    );

  return (
    <div className="flex h-full flex-col bg-[rgba(11,14,26,0.86)] font-mono text-[13px] leading-relaxed text-white/85" onPointerDown={(e) => { if (!(e.target as HTMLElement).closest("input,button") && !window.getSelection()?.toString()) setTimeout(focusInput) }}>
      <Titlebar title={`visitor@aws: ${promptDir()}, zsh, 80×24`} className="[&_span]:!text-white/55" />
      <div ref={bodyRef} className="flex-1 space-y-0.5 overflow-y-auto px-5 pb-3 pt-1" aria-live="polite">
        {lines.map((l, i) =>
          l.kind === "cmd" ? (
            <p key={i} className="whitespace-pre-wrap break-words pt-1 text-white">
              <span className="mr-2 text-emerald-400">visitor@aws {l.dir} %</span>
              {l.text}
            </p>
          ) : l.kind === "ai" ? (
            <p key={i} className="my-1 whitespace-pre-wrap break-words rounded-lg border-l-2 border-[var(--accent)] bg-white/5 py-1.5 pl-3 font-sans text-[14px] leading-relaxed">
              {l.text}
            </p>
          ) : (
            <p key={i} className={cn("break-words", l.frame ? "whitespace-pre" : "whitespace-pre-wrap")}>
              {l.parts.map((s, j) => (
                <span key={j} className={s.c && TONE[s.c]}>
                  {!s.c || s.c === "dim" ? runnable(s.t, `${i}-${j}`) : s.t}
                </span>
              ))}
              {!l.parts.some((s) => s.t) && " "}
            </p>
          ),
        )}
        {thinking && <p className="animate-pulse text-white/50">Looking through the portfolio...</p>}
        <form onSubmit={submit} className="flex items-center gap-2 pt-1">
          {!running && (
            <label htmlFor="term-in" className="shrink-0 text-emerald-400">
              visitor@aws {promptDir()} %
            </label>
          )}
          <input
            id="term-in"
            ref={inputRef}
            value={val}
            readOnly={running}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              const h = history();
              if (e.key === "c" && e.ctrlKey && !window.getSelection()?.toString()) {
                e.preventDefault();
                if (running) abort.current?.abort();
                push(running ? toLine("^C") : { kind: "cmd", text: `${val}^C`, dir: promptDir() });
                setVal("");
              } else if (running) {
                return;
              } else if (e.key === "Tab") {
                e.preventDefault();
                const r = complete(val);
                setVal(r.value);
                if (r.options) push(toLine(r.options.join("   ")));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                hIdx.current = Math.min(hIdx.current + 1, h.length - 1);
                setVal(h[h.length - 1 - hIdx.current] ?? "");
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                hIdx.current = Math.max(hIdx.current - 1, -1);
                setVal(hIdx.current < 0 ? "" : (h[h.length - 1 - hIdx.current] ?? ""));
              } else if (e.key === "l" && e.ctrlKey) {
                e.preventDefault();
                setLines([]);
              }
            }}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Type a command or ask about my work"
            className="min-w-0 flex-1 border-none bg-transparent text-white caret-emerald-400 outline-none"
          />
        </form>
      </div>
      {demo && <div className="border-t border-white/10 px-5 py-1.5 text-[11px] text-white/40">Answers come from the information published in this portfolio.</div>}
    </div>
  );
}
