"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Maximize2, Send, Sparkles } from "lucide-react";
import type { FsNode, ProjectContent, Shot } from "@/data/types";
import { NodeIcon } from "@/components/ui/Icons";
import { useOS } from "./OSProvider";
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

const SURFACE: Record<string, string> = {
  app: "The app",
  landing: "Landing pages",
  dashboard: "The dashboard",
  viewer: "The viewer",
  interview: "The interview demo",
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

function Rail({ shots, all, label }: { shots: Shot[]; all: Shot[]; label: string }) {
  const os = useOS();
  const tall = shots[0] && shots[0].height / shots[0].width > 1.3;
  const H = tall ? 340 : 190;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">{label}</h4>
        <span className="text-[12px] text-[var(--ink-3)]">{shots.length} screens</span>
      </div>
      <div className="scroll-thin -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3">
        {shots.map((s) => (
          <button
            key={s.src}
            onClick={() => os.openQuickLook(all, all.indexOf(s))}
            className="group relative shrink-0 snap-start overflow-hidden rounded-[18px] bg-[var(--surface-2)] text-left shadow-[0_1px_2px_rgba(18,26,48,0.1),0_8px_24px_rgba(18,26,48,0.12)] outline-offset-2 transition-transform duration-300 hover:-translate-y-0.5"
            style={{ height: H, aspectRatio: `${s.width} / ${s.height}` }}
            aria-label={`Open ${s.title}`}
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

function AskBox({ content }: { content: ProjectContent }) {
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
              ? "I'm offline right now — email me and I'll answer properly."
              : "Something went wrong on my side. Try again in a moment.",
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
        <div className="mb-2 flex max-h-72 flex-col gap-2 overflow-y-auto px-1 scroll-thin" aria-live="polite">
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
          {busy && <div className="shimmer-text px-3 text-[13px]">thinking…</div>}
          <div ref={endRef} />
        </div>
      )}
      <form onSubmit={submit} className="glass glass-thin flex items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Ask anything about this project"
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]"
          aria-label={`Ask about ${content.name}`}
        />
        <button
          type="submit"
          disabled={!val.trim() || busy}
          aria-label="Send"
          className="glass-tint press grid h-8 w-8 place-items-center rounded-full disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </form>
      <p className="mt-2 px-3 text-[11px] text-[var(--ink-3)]">Demo replies for now — the live model is coming.</p>
    </div>
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
  fullPage,
}: {
  node: FsNode;
  content: ProjectContent;
  onOpenChild?: (n: FsNode) => void;
  fullPage?: boolean;
}) {
  const shots = content.shots ?? [];
  const groups = useMemo(() => groupShots(shots), [shots]);

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
            {content.placeholder && (
              <span className="rounded-full bg-[var(--hairline)] px-2.5 py-0.5 normal-case tracking-normal">Screens coming</span>
            )}
          </div>
          <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-tight md:text-[44px]">{content.name}</h1>
          {content.tagline && <p className="mt-2 max-w-[56ch] text-[17px] leading-snug text-[var(--ink-2)]">{content.tagline}</p>}
        </div>
      </header>

      {(content.links?.length || !fullPage) && (
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
            <Link href={`/work/${content.id}`} className="glass-tint press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium">
              Open full page <Maximize2 size={13} />
            </Link>
          )}
        </div>
      )}

      {content.stats && content.stats.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {content.stats.map((s) => (
            <div key={s.label} className="rounded-[20px] bg-[var(--surface-2)] px-4 py-3.5">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-[26px] font-bold leading-none tracking-tight">{s.value}</dd>
              <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--ink-2)]">{s.label}</p>
            </div>
          ))}
        </dl>
      )}

      {content.summary && <p className="mt-6 max-w-[64ch] text-[16px] leading-relaxed text-[var(--ink-2)]">{content.summary}</p>}

      {node.children && node.children.length > 0 && (
        <section className="mt-8" aria-label="Inside this project">
          <h3 className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Inside</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {node.children.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenChild?.(c)}
                className="press flex items-center gap-3 rounded-[20px] bg-[var(--surface-2)] p-3 text-left transition-colors hover:bg-[var(--sidebar-sel)]"
              >
                <NodeIcon node={c} size={44} />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">{c.name}</span>
                  {c.summary && <span className="block truncate text-[12px] text-[var(--ink-3)]">{c.summary}</span>}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8" aria-label="Screens">
        {groups.length > 0 ? (
          <div className="flex flex-col gap-4">
            {groups.map(([surface, list]) => (
              <Rail key={surface} shots={list} all={shots} label={surfaceLabel(surface)} />
            ))}
          </div>
        ) : (
          <div className="grid place-items-center rounded-[22px] border border-dashed border-[var(--hairline)] px-6 py-10 text-center">
            <p className="text-[14px] font-medium text-[var(--ink-2)]">Screens for this one are still being collected.</p>
            <p className="mt-1 text-[12.5px] text-[var(--ink-3)]">They'll appear here as a swipeable gallery with Quick Look.</p>
          </div>
        )}
      </section>

      {content.sections && content.sections.length > 0 && (
        <section className="mt-8 flex flex-col gap-2.5" aria-label="Case study">
          {content.sections.map((sec, i) => (
            <Accordion key={sec.heading + i} heading={sec.heading} defaultOpen={i < 1}>
              <div className="flex flex-col gap-3.5">
                {sec.lede && <p className="text-[17px] font-semibold leading-snug text-[var(--ink)]">{sec.lede}</p>}
                {sec.body?.split(/\n\n+/).map((p, k) => <p key={k}>{p}</p>)}
                {sec.diagram && (
                  <pre className="scroll-thin overflow-x-auto rounded-2xl bg-[var(--surface-2)] p-4 font-mono text-[11.5px] leading-snug text-[var(--ink-2)]">{sec.diagram}</pre>
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
                <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Role</dt>
                <dd className="mt-0.5">{content.role}</dd>
              </div>
            )}
            {content.period && (
              <div>
                <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">When</dt>
                <dd className="mt-0.5">{content.period}</dd>
              </div>
            )}
          </dl>
          {content.stack && content.stack.length > 0 && (
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Stack</div>
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

      <section className="mt-8">
        <AskBox content={content} />
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
