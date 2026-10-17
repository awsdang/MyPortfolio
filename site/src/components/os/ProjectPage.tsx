"use client";

import { useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronRight, Maximize2, Send, Sparkles } from "lucide-react";
import type { BeforeAfter, CompareTable, FsNode, ProjectContent, Shot } from "@/data/types";
import { FolderIcon, NodeIcon } from "@/components/ui/Icons";
import { useOS } from "./OSProvider";
import { workHref } from "@/data/fs";
import { ask, AskOffline, type Msg } from "@/lib/ask";
import { cn } from "@/lib/cn";

const STATUS_STYLE: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  wip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  closed: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};
function statusTone(s?: string) {
  const v = (s ?? "").toLowerCase();
  if (/closed|archive|dormant/.test(v)) return STATUS_STYLE.closed;
  if (/prototype|building|soon/.test(v)) return STATUS_STYLE.wip;
  return STATUS_STYLE.live;
}

// labels for the screenshot groups, keyed by Shot.surface
const SURFACE: Record<string, string> = {
  app: "The app",
  telegram: "The Telegram bot",
  "mobile-app": "The mobile app, unreleased",
  landing: "Landing pages",
  rent: "The rent explorer, in Arabic",
  dashboard: "The dashboard",
  viewer: "The viewer",
  interview: "The interview demo",
  "prep-start": "Interviewee app, sign in and library",
  "prep-practice": "Interviewee app, practice and results",
  "prep-profile": "Interviewee app, profile and credits",
  "prep-arabic": "Interviewee app, in Arabic",
  "hr-start": "HR dashboard, sign in and positions",
  "hr-position": "HR dashboard, creating a position",
  "hr-candidates": "HR dashboard, candidates and results",
  "hr-company": "HR dashboard, company and team",
  "hr-arabic": "HR dashboard, in Arabic",
  "store-archive": "Store archive",
  screens: "Screens",
};
const surfaceLabel = (k: string) => SURFACE[k] ?? k;

function groupShots(shots: Shot[]) {
  const map = new Map<string, Shot[]>();
  for (const s of shots) {
    const k = s.surface ?? "screens";
    map.set(k, [...(map.get(k) ?? []), s]);
  }
  return [...map.entries()];
}

function Rail({ shots, all, label, noun = "screens", height }: { shots: Shot[]; all: Shot[]; label: string; noun?: string; height?: number }) {
  const os = useOS();
  const tall = shots[0] && shots[0].height / shots[0].width > 1.3;
  const H = height ?? (tall ? 340 : 190);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">{label}</h4>
        <span className="text-[12px] text-[var(--ink-3)]">
          {shots.length} {shots.length === 1 ? noun.replace(/s$/, "") : noun}
        </span>
      </div>
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3">
        {shots.map((s) => (
          <button
            key={s.src}
            onClick={() => os.openQuickLook(all, all.indexOf(s))}
            className="group relative shrink-0 snap-start overflow-hidden rounded-[18px] bg-[var(--surface-2)] text-left shadow-[0_1px_2px_rgba(18,26,48,0.1),0_8px_24px_rgba(18,26,48,0.12)] outline-offset-2 transition-transform duration-300 hover:-translate-y-0.5"
            style={{ height: H, aspectRatio: `${s.width} / ${s.height}` }}
            aria-label={`Enlarge image, ${s.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.title} loading="lazy" draggable={false} className="h-full w-full object-cover" />
            <span className="glass glass-thin absolute inset-x-2 bottom-2 flex items-center justify-between rounded-full px-3 py-1 text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="truncate">{s.title}</span>
              <Maximize2 size={11} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** One "before / after" pair: the same screen, old and new, side by side. */
function BeforeAfterRow({ pair, all }: { pair: BeforeAfter; all: Shot[] }) {
  const os = useOS();
  const sides = [
    { label: "Before", shot: pair.before, chip: "bg-black/60 text-white" },
    { label: "After", shot: pair.after, chip: "bg-[var(--accent)] text-[var(--accent-ink)]" },
  ];
  return (
    <figure>
      <figcaption className="mb-2 px-1 text-[13px] font-semibold text-[var(--ink)]">{pair.title}</figcaption>
      <div className="grid gap-3 sm:grid-cols-2">
        {sides.map(({ label, shot, chip }) => (
          <button
            key={label}
            onClick={() => os.openQuickLook(all, all.indexOf(shot))}
            aria-label={`Enlarge ${label.toLowerCase()} image, ${shot.title}`}
            className="group relative overflow-hidden rounded-[16px] bg-[var(--surface-2)] text-left shadow-[0_1px_2px_rgba(18,26,48,0.1),0_8px_24px_rgba(18,26,48,0.1)] outline-offset-2 transition-transform duration-300 hover:-translate-y-0.5"
            style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.src} alt={shot.title} loading="lazy" draggable={false} className="h-full w-full object-cover" />
            <span className={cn("absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur", chip)}>
              {label}
            </span>
            <span className="glass glass-thin absolute inset-x-2 bottom-2 flex items-center justify-between rounded-full px-3 py-1 text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="truncate">{shot.caption}</span>
              <Maximize2 size={11} className="shrink-0" />
            </span>
          </button>
        ))}
      </div>
    </figure>
  );
}

function CompareTableView({ table }: { table: CompareTable }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-[var(--surface)] shadow-[0_1px_2px_rgba(18,26,48,0.06)]">
      <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px] leading-snug">
        <thead>
          <tr className="border-b border-[var(--hairline)]">
            {table.head.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r} className="border-b border-[var(--hairline)] align-top last:border-b-0">
              {row.map((cell, c) => (
                <td key={c} className={cn("px-4 py-3", c === 0 ? "w-[22%] font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AskBox({ content, inputRef }: { content: ProjectContent; inputRef?: RefObject<HTMLInputElement | null> }) {
  const [thread, setThread] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [val, setVal] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const q = val.trim();
    if (!q || busy) return;
    setVal("");
    const next: Msg[] = [...thread, { role: "user", content: q }];
    setThread(next);
    setBusy(true);
    try {
      const r = await ask(q, thread, content.id);
      setThread([...next, { role: "assistant", content: r.answer }]);
    } catch (err) {
      setThread([
        ...next,
        {
          role: "assistant",
          content:
            err instanceof AskOffline
              ? "I can't answer right now. You can write to Aws about this project."
              : "I couldn't load the reply. Try sending your question again.",
        },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  }

  return (
    <div className="rounded-[22px] bg-[var(--surface-2)] p-3">
      <div className="mb-2 flex items-center gap-2 px-2 pt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">
        <Sparkles size={13} /> Ask about {content.name}
      </div>
      {thread.length > 0 && (
        <div className="mb-2 flex max-h-72 flex-col gap-2 overflow-y-auto px-1" aria-live="polite">
          {thread.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[88%] whitespace-pre-line rounded-[18px] px-3.5 py-2 text-[14px] leading-relaxed",
                m.role === "user" ? "glass-tint ml-auto" : "bg-[var(--surface)] text-[var(--ink)] shadow-sm",
              )}
            >
              {m.content}
            </div>
          ))}
          {busy && <div className="shimmer-text px-3 text-[13px]">Looking through the project.</div>}
          <div ref={endRef} />
        </div>
      )}
      <form onSubmit={submit} className="glass glass-thin flex items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5">
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="What would you like to know about this work?"
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]"
          aria-label={`Ask about ${content.name}`}
        />
        <button
          type="submit"
          disabled={!val.trim() || busy}
          aria-label="Send your question"
          className="glass-tint press grid h-8 w-8 place-items-center rounded-full disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

/** A Finder list: folder, name, chevron, item count at the foot. */
function ProjectColumn({ items, onOpen }: { items: FsNode[]; onOpen?: (n: FsNode) => void }) {
  return (
    <section aria-label="Projects" className="overflow-hidden rounded-[20px] bg-[var(--surface-2)]">
      <h3 className="px-4 pb-1.5 pt-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Projects</h3>
      <ul className="flex flex-col px-1.5 pb-1.5">
        {items.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onOpen?.(c)}
              title={c.summary}
              className="group flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left text-[15px] font-medium outline-offset-0 hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] focus-visible:bg-[var(--accent)] focus-visible:text-[var(--accent-ink)]"
            >
              <FolderIcon size={32} />
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <ChevronRight size={14} className="shrink-0 text-[var(--ink-3)] group-hover:text-current group-focus-visible:text-current" />
            </button>
          </li>
        ))}
      </ul>
      <p className="border-t border-[var(--hairline)] px-4 py-2 text-center text-[11.5px] text-[var(--ink-3)]">
        {items.length} {items.length === 1 ? "project" : "projects"}
      </p>
    </section>
  );
}

function Accordion({ heading, children, defaultOpen }: { heading: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-[20px] bg-[var(--surface-2)]">
      <button
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold">{heading}</span>
        <ChevronDown size={16} className={cn("text-[var(--ink-3)] transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-500", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ProjectPage({
  node,
  content,
  onOpenChild,
  onOpenFullPage,
  fullPage,
}: {
  node: FsNode;
  content: ProjectContent;
  onOpenChild?: (n: FsNode) => void;
  /** Called when "Read the full story" navigates in this tab, so the host window can get out of the way. */
  onOpenFullPage?: () => void;
  fullPage?: boolean;
}) {
  const shots = content.shots ?? [];
  const groups = useMemo(() => groupShots(shots), [shots]);
  const children = node.children ?? [];
  const askSection = useRef<HTMLElement>(null);
  const askInput = useRef<HTMLInputElement>(null);

  const jumpToAsk = () => {
    askSection.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    askInput.current?.focus({ preventScroll: true });
  };

  const stats = content.stats && content.stats.length > 0 && (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {content.stats.map((s) => (
        <div key={s.label} className="rounded-[20px] bg-[var(--surface-2)] px-4 py-3.5">
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-display text-[26px] font-bold leading-none tracking-tight">{s.value}</dd>
          <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--ink-2)]">{s.label}</p>
        </div>
      ))}
    </dl>
  );
  const summary = content.summary && <p className="max-w-[64ch] text-[16px] leading-relaxed text-[var(--ink-2)]">{content.summary}</p>;

  return (
    <article className={cn("mx-auto w-full max-w-[880px]", fullPage ? "px-5 pb-24 pt-8 md:px-8" : "px-5 pb-8 pt-6 md:px-7")}>
      <header className="flex flex-col gap-5 md:flex-row md:items-center">
        <NodeIcon node={node} size={fullPage ? 104 : 88} />
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">
            {content.category && <span>{content.category}</span>}
            {content.status && (
              <span className={cn("rounded-full px-2.5 py-0.5 normal-case tracking-normal", statusTone(content.status))}>
                {content.status}
              </span>
            )}
          </div>
          <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-tight md:text-[44px]">{content.name}</h1>
          {content.tagline && <p className="mt-2 max-w-[56ch] text-[17px] leading-snug text-[var(--ink-2)]">{content.tagline}</p>}
        </div>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        {content.links?.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-thin press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium"
          >
            {l.label} <ArrowUpRight size={14} />
          </a>
        ))}
        {!fullPage && (
          <Link
            href={workHref(content.id)}
            onClick={(e) => {
              // cmd/ctrl/shift/middle click opens a new tab; keep the window in that case
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              onOpenFullPage?.();
            }}
            className="glass-tint press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium"
          >
            Read the full story <Maximize2 size={13} />
          </Link>
        )}
        <button onClick={jumpToAsk} className="glass glass-thin press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium">
          Ask about my work <Sparkles size={13} />
        </button>
      </div>

      {stats && <div className="mt-6">{stats}</div>}
      {summary && <div className="mt-6">{summary}</div>}
      {children.length > 0 && (
        <div className="mt-6">
          <ProjectColumn items={children} onOpen={onOpenChild} />
        </div>
      )}

      {groups.length > 0 && (
        <section className="mt-8" aria-label="Project images">
          <div className="flex flex-col gap-4">
            {groups.map(([surface, list]) => (
              <Rail key={surface} shots={list} all={shots} label={surfaceLabel(surface)} noun={content.shotsNoun} height={content.shotsHeight} />
            ))}
          </div>
        </section>
      )}

      {content.sections && content.sections.length > 0 && (
        <section className="mt-8 flex flex-col gap-2.5" aria-label="Case study">
          {content.sections.map((sec, i) => (
            <Accordion key={sec.heading + i} heading={sec.heading} defaultOpen={i < 1}>
              <div className="flex flex-col gap-3.5">
                {sec.lede && <p className="text-[17px] font-semibold leading-snug text-[var(--ink)]">{sec.lede}</p>}
                {sec.body?.split(/\n\n+/).map((p, k) => <p key={k}>{p}</p>)}
                {sec.table && <CompareTableView table={sec.table} />}
                {sec.diagram && (
                  <pre className="overflow-x-auto rounded-2xl bg-[var(--surface-2)] p-4 font-mono text-[11.5px] leading-snug text-[var(--ink-2)]">{sec.diagram}</pre>
                )}
                {sec.bullets && (
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-[var(--ink-3)]">
                    {sec.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                {sec.items && (
                  <ol className="grid gap-2.5 md:grid-cols-2">
                    {sec.items.map((it, k) => (
                      <li key={it.title} className="rounded-2xl bg-[var(--surface)] p-4 shadow-[0_1px_2px_rgba(18,26,48,0.06)]">
                        <span className="font-mono text-[11px] text-[var(--ink-3)]">{String(k + 1).padStart(2, "0")}</span>
                        <p className="mt-0.5 text-[14.5px] font-semibold leading-snug text-[var(--ink)]">{it.title}</p>
                        <p className="mt-1 text-[13.5px] leading-relaxed">{it.text}</p>
                      </li>
                    ))}
                  </ol>
                )}
                {sec.pairs && sec.pairs.length > 0 && (
                  <div className="flex flex-col gap-5">
                    {sec.pairs.map((pr) => (
                      <BeforeAfterRow key={pr.title} pair={pr} all={sec.pairs!.flatMap((x) => [x.before, x.after])} />
                    ))}
                  </div>
                )}
                {sec.shots && sec.shots.length > 0 && (
                  <Rail shots={sec.shots} all={sec.shots} label={sec.shotsLabel ?? "More examples"} noun={content.shotsNoun} height={content.shotsHeight} />
                )}
                {sec.quote && (
                  <blockquote dir="auto" className="border-l-2 border-[var(--accent)] pl-4 text-[15px] italic leading-relaxed text-[var(--ink)]">
                    {sec.quote}
                  </blockquote>
                )}
              </div>
            </Accordion>
          ))}
        </section>
      )}

      {(content.role || content.period || content.stack?.length) && (
        <section className="mt-8 grid gap-4 md:grid-cols-[1fr_2fr]">
          <dl className="flex flex-col gap-3 text-[14px]">
            {content.role && (
              <div>
                <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">My role</dt>
                <dd className="mt-0.5">{content.role}</dd>
              </div>
            )}
            {content.period && (
              <div>
                <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Period</dt>
                <dd className="mt-0.5">{content.period}</dd>
              </div>
            )}
          </dl>
          {content.stack && content.stack.length > 0 && (
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Built with</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {content.stack.map((s) => (
                  <span key={s} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[12.5px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section ref={askSection} className="mt-8">
        <AskBox content={content} inputRef={askInput} />
      </section>

      {content.disclaimers && content.disclaimers.length > 0 && (
        <footer className="mt-6 space-y-1 px-2 text-[11.5px] leading-relaxed text-[var(--ink-3)]">
          {content.disclaimers.map((d) => (
            <p key={d}>{d}</p>
          ))}
        </footer>
      )}
    </article>
  );
}
