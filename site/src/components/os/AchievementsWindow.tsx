"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Award, Eye, GraduationCap, Ruler, ScrollText, type LucideIcon } from "lucide-react";
import { DragRegion, Titlebar, TrafficLights, useWindow } from "./Window";
import { useOS } from "./OSProvider";
import { MacIcon } from "@/components/ui/MacIcon";
import { cn } from "@/lib/cn";
import { ACHIEVEMENTS, KIND_LABEL, TOTAL_HOURS, type Achievement, type AchievementKind } from "@/data/achievements";
import type { Shot } from "@/data/types";

const KINDS: AchievementKind[] = ["award", "study", "course"];
const DOT: Record<AchievementKind, string> = { award: "var(--warm)", study: "var(--accent)", course: "var(--ink-2)" };
const of = (k: AchievementKind) => ACHIEVEMENTS.filter((a) => a.kind === k);

type SectionId = "timeline" | AchievementKind;
const SECTIONS: { id: SectionId; label: string; icon: LucideIcon; count?: number }[] = [
  { id: "timeline", label: "Timeline", icon: Ruler },
  { id: "award", label: "Awards", icon: Award, count: of("award").length },
  { id: "study", label: "Degrees and programs", icon: GraduationCap, count: of("study").length },
  { id: "course", label: "Certificates", icon: ScrollText, count: of("course").length },
];

/** The scale runs from the first degree to the end of this year. */
const START = 2012;
const END = 2027;
const pct = (year: number) => ((year - START) / (END - START)) * 100;

/** Every item that has a certificate, in page order, so Quick Look can step through them. */
const SHOTS: { id: string; shot: Shot }[] = KINDS.flatMap(of)
  .filter((a) => a.cert)
  .map((a) => ({
    id: a.id,
    shot: {
      src: a.cert!.src,
      width: a.cert!.width,
      height: a.cert!.height,
      title: a.title,
      caption: [a.detail, a.meta, a.hours && `${a.hours} hours`].filter(Boolean).join(", "),
      source: a.note,
    },
  }));

/** Distance from the top of `root`'s content to `el`, unaffected by the window's open animation. */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return y;
}

/** pin: hovered on the scale (outlines its card). card: hovered card (grows its pin). */
type Hover = { pin: string | null; setCard: (id: string | null) => void; flash: string | null; open: (id: string) => void };

/** Achievements: a sidebar of sections and one scrolling page with the scale, awards, studies and the certificate wall. */
export function AchievementsWindow() {
  const os = useOS();
  const { win } = useWindow();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SectionId>("timeline");
  const [pin, setPin] = useState<string | null>(null);
  const [card, setCard] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const jumping = useRef(false);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(
    () => () => {
      clearTimeout(settle.current);
      clearTimeout(flashTimer.current);
    },
    [],
  );

  const scrollTo = useCallback((target: HTMLElement, center: boolean, smooth = true) => {
    const el = scroller.current;
    if (!el) return;
    const top = offsetWithin(target, el);
    const y = center ? top - (el.clientHeight - target.offsetHeight) / 2 : top - 16;
    jumping.current = true;
    el.scrollTo({ top: Math.max(0, y), behavior: smooth ? "smooth" : "auto" });
    clearTimeout(settle.current);
    settle.current = setTimeout(() => (jumping.current = false), 900);
  }, []);

  /** Jump to a section, or to one item and outline it for a moment. */
  const jump = useCallback(
    (id: string, smooth = true) => {
      const el = scroller.current;
      const sec = el?.querySelector<HTMLElement>(`[data-ach-section="${id}"]`);
      if (sec) {
        setActive(id as SectionId);
        scrollTo(sec, false, smooth);
        return;
      }
      const item = el?.querySelector<HTMLElement>(`[data-ach="${id}"]`);
      if (!item) return;
      const kind = ACHIEVEMENTS.find((a) => a.id === id)?.kind;
      if (kind) setActive(kind);
      scrollTo(item, true, smooth);
      setFlash(id);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), 1800);
    },
    [scrollTo],
  );

  // opened (or re-opened) pointing at an item or a section
  const lastTick = useRef(-1);
  useEffect(() => {
    const target = win.nodeId;
    if (!target || win.navTick === lastTick.current) return;
    const first = lastTick.current < 0;
    const t = setTimeout(() => {
      lastTick.current = win.navTick;
      jump(target, !first);
    }, first ? 80 : 0);
    return () => clearTimeout(t);
  }, [win.navTick, win.nodeId, jump]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el || jumping.current) {
      if (jumping.current) {
        clearTimeout(settle.current);
        settle.current = setTimeout(() => (jumping.current = false), 140);
      }
      return;
    }
    let cur: SectionId = "timeline";
    for (const n of el.querySelectorAll<HTMLElement>("[data-ach-section]"))
      if (offsetWithin(n, el) - el.scrollTop <= el.clientHeight * 0.3) cur = n.dataset.achSection as SectionId;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) cur = "course";
    setActive(cur);
  };

  const open = (id: string) => {
    const i = SHOTS.findIndex((s) => s.id === id);
    if (i >= 0) os.openQuickLook(SHOTS.map((s) => s.shot), i);
  };
  const ctx: Hover = { pin, setCard, flash, open };
  const label = active === "timeline" ? "Achievements" : KIND_LABEL[active];

  return (
    <div className="@container flex h-full">
      <aside className="glass glass-thin m-2 mr-0 hidden w-[232px] shrink-0 flex-col rounded-[22px] @3xl:flex" aria-label="Browse achievements">
        <DragRegion className="flex h-12 shrink-0 items-center px-4">
          <TrafficLights />
        </DragRegion>
        <div className="flex items-center gap-3 px-4 pb-4 pt-1">
          <span className="block h-10 w-10 shrink-0">
            <MacIcon name="trophy" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold leading-tight">Achievements</p>
            <p className="truncate text-[11.5px] text-[var(--ink-3)]">{ACHIEVEMENTS.length} entries since 2012</p>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-3">
          {SECTIONS.map((s) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => jump(s.id)}
                className={cn(
                  "press flex items-center gap-2.5 rounded-[14px] px-3 py-2 text-left text-[13.5px] font-medium transition-colors hover:bg-[var(--sidebar-sel)]",
                  on && "bg-[var(--sidebar-sel)] text-[var(--accent)]",
                )}
                aria-current={on ? "location" : undefined}
              >
                <s.icon size={16} strokeWidth={2} className={on ? "text-[var(--accent)]" : "text-[var(--ink-2)]"} />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                {s.count !== undefined && <span className="font-mono text-[11px] text-[var(--ink-3)]">{s.count}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mx-3 mb-3 mt-auto rounded-[14px] bg-[var(--surface-2)] px-3 py-2.5">
          <p className="font-display text-[20px] font-bold leading-none tracking-tight">{TOTAL_HOURS}</p>
          <p className="mt-1 text-[11.5px] leading-snug text-[var(--ink-3)]">course hours stated on the certificates</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {os.mobile ? (
          <Titlebar title="Achievements" />
        ) : (
          <DragRegion className="flex h-14 shrink-0 items-center gap-4 px-4 @3xl:px-6">
            <TrafficLights className="@3xl:hidden" />
            <h2 className="min-w-0 truncate font-display text-[17px] font-bold tracking-tight">{label}</h2>
          </DragRegion>
        )}
        <div ref={scroller} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-y-auto">
          <div className="@container px-4 pb-12 pt-2 @3xl:px-6">
            <section data-ach-section="timeline">
              <h1 className="font-display text-[clamp(30px,6cqi,48px)] font-extrabold leading-[1] tracking-tight">Achievements</h1>
              <p className="mt-2.5 max-w-[56ch] text-[15px] leading-snug text-[var(--ink-2)]">
                My learning started in architecture and continued as I moved into software and built my own products. This timeline brings together the studies, awards and courses along the way. Select an entry to read more or view its certificate.
              </p>
              <Scale pin={pin} card={card} setPin={setPin} onPick={jump} />
            </section>

            <Group kind="award">
              <div className="grid gap-3 @2xl:grid-cols-2">
                {of("award").map((a) => (
                  <AwardCard key={a.id} a={a} ctx={ctx} />
                ))}
              </div>
            </Group>

            <Group kind="study">
              <div className="grid gap-3 @lg:grid-cols-2 @5xl:grid-cols-4">
                {of("study").map((a) => (
                  <StudyCard key={a.id} a={a} ctx={ctx} />
                ))}
              </div>
            </Group>

            <Group kind="course" aside={`${TOTAL_HOURS} recorded course hours`}>
              <div className="rounded-[26px] bg-[var(--surface-2)] px-2 py-5 @2xl:px-4 @2xl:py-6">
                <ul className="grid grid-cols-2 gap-x-2 gap-y-6 @2xl:grid-cols-3 @2xl:gap-x-4 @5xl:grid-cols-4">
                  {of("course").map((a, i) => (
                    <li key={a.id}>
                      <Sheet a={a} tilt={[-1.6, 1.2, -0.6, 1.8][i % 4]} ctx={ctx} />
                    </li>
                  ))}
                </ul>
              </div>
            </Group>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({ kind, aside, children }: { kind: AchievementKind; aside?: string; children: ReactNode }) {
  return (
    <section data-ach-section={kind} className="mt-10 @2xl:mt-12">
      <div className="mb-4 flex items-center gap-3 px-1">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: DOT[kind] }} />
        <h3 className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[var(--ink-2)]">{KIND_LABEL[kind]}</h3>
        <span className="font-mono text-[11.5px] text-[var(--ink-3)]">{String(of(kind).length).padStart(2, "0")}</span>
        {aside && <span className="ml-auto hidden font-mono text-[11.5px] text-[var(--ink-3)] @xl:inline">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** Hover from the scale outlines the card softly; a click from the scale (or a jump from the page) flashes it. */
const outline = (id: string, ctx: Hover) =>
  cn(
    "outline-2 outline-offset-4 outline-solid transition-[outline-color,translate] duration-300",
    ctx.flash === id ? "outline-[var(--accent)]" : ctx.pin === id ? "outline-[color-mix(in_oklab,var(--accent)_45%,transparent)]" : "outline-transparent",
  );

const hoverProps = (id: string, ctx: Hover) => ({
  "data-ach": id,
  onMouseEnter: () => ctx.setCard(id),
  onMouseLeave: () => ctx.setCard(null),
});

function Pill({ children }: { children: ReactNode }) {
  return <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2.5 py-1 font-mono text-[11.5px] text-[var(--ink-2)]">{children}</span>;
}

function AwardCard({ a, ctx }: { a: Achievement; ctx: Hover }) {
  const year = a.meta.match(/\d{4}/)?.[0];
  return (
    <article
      {...hoverProps(a.id, ctx)}
      className={cn("glass glass-shine group relative flex h-full flex-col overflow-hidden rounded-[28px] p-6 hover:-translate-y-1 @2xl:min-h-[300px]", outline(a.id, ctx))}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="block h-14 w-14 shrink-0">
          <MacIcon name={a.icon} />
        </span>
        <Pill>{a.meta}</Pill>
      </div>
      <h4 className="mt-5 font-display text-[21px] font-bold leading-[1.15] tracking-tight">{a.title}</h4>
      <p className="mt-1.5 text-[14px] leading-snug text-[var(--ink-2)]">{a.detail}</p>
      {a.note && <p className="mt-1 text-[13.5px] leading-snug text-[var(--ink-3)]">{a.note}</p>}

      {/* The stage: a certificate peeking out of the card, or the year drawn in outline. */}
      <div className={cn("relative -mx-6 -mb-6 mt-auto shrink-0 pt-5", a.cert ? "h-[136px]" : "h-[92px] @2xl:h-[136px]")}>
        {a.cert ? (
          <button
            type="button"
            onClick={() => ctx.open(a.id)}
            aria-label={`View certificate for ${a.title}`}
            className="absolute left-1/2 top-5 w-[min(76%,340px)] -translate-x-1/2 cursor-zoom-in rotate-[-3deg] transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4 group-hover:rotate-[-0.5deg] focus-visible:-translate-y-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.cert.thumb} width={a.cert.width} height={a.cert.height} alt="" loading="lazy" draggable={false} className="cert-paper block h-auto w-full" />
            <span className="glass glass-thin absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Eye size={13} /> View certificate
            </span>
          </button>
        ) : (
          year && (
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-[0.2em] right-5 select-none font-display text-[104px] font-extrabold leading-none tracking-tight text-transparent opacity-70 transition-transform duration-500 group-hover:-translate-y-2 @2xl:text-[124px]"
              style={{ WebkitTextStroke: "1.25px var(--ink-3)" }}
            >
              {year}
            </span>
          )
        )}
      </div>
    </article>
  );
}

function StudyCard({ a, ctx }: { a: Achievement; ctx: Hover }) {
  return (
    <article {...hoverProps(a.id, ctx)} className={cn("glass glass-shine flex h-full flex-col rounded-[24px] p-5 hover:-translate-y-1", outline(a.id, ctx))}>
      <div className="flex items-start justify-between gap-3">
        <span className="block h-12 w-12 shrink-0">
          <MacIcon name={a.icon} />
        </span>
        <Pill>{a.meta}</Pill>
      </div>
      <h4 className="mt-4 text-[16px] font-semibold leading-snug">{a.title}</h4>
      <p className="mt-1 text-[13.5px] leading-snug text-[var(--ink-2)]">{a.detail}</p>
      {a.note && <p className="mt-1 text-[13px] leading-snug text-[var(--ink-3)]">{a.note}</p>}
    </article>
  );
}

/** A certificate laid on the board: natural proportions, a slight tilt that straightens on hover. */
function Sheet({ a, tilt, ctx }: { a: Achievement; tilt: number; ctx: Hover }) {
  if (!a.cert) return null;
  return (
    <button
      type="button"
      onClick={() => ctx.open(a.id)}
      {...hoverProps(a.id, ctx)}
      className={cn("group flex w-full cursor-zoom-in flex-col items-center rounded-[22px] px-1.5 pb-2 text-center", outline(a.id, ctx))}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
    >
      <span className="grid aspect-[4/3] w-full place-items-center rounded-[18px] p-2 transition-colors duration-300 group-hover:bg-[var(--surface-2)] @2xl:p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={a.cert.thumb}
          width={a.cert.width}
          height={a.cert.height}
          alt={`Certificate for ${a.title}`}
          loading="lazy"
          draggable={false}
          className="cert-paper h-auto max-h-full w-auto max-w-full rotate-[var(--tilt)] object-contain transition-[rotate,translate,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.04] group-hover:rotate-0"
        />
      </span>
      <span className="mt-2 line-clamp-2 text-[13.5px] font-semibold leading-snug">{a.title}</span>
      <span className="mt-1 text-[12.5px] leading-snug text-[var(--ink-2)]">{a.detail}</span>
      <span className="mt-1.5 font-mono text-[11px] text-[var(--ink-3)]">
        {a.meta}
        {a.hours ? `, ${a.hours} hours` : ""}
      </span>
    </button>
  );
}

/**
 * Every item as a pin on a year scale, drawn like the scale bar on an
 * architectural drawing. Pins that would touch stack into lanes.
 */
function Scale({ pin, card, setPin, onPick }: { pin: string | null; card: string | null; setPin: (id: string | null) => void; onPick: (id: string) => void }) {
  const LANE = 20;
  const { pins, lanes } = useMemo(() => {
    const GAP = 1.7;
    const ends: number[] = [];
    const pins = [...ACHIEVEMENTS]
      .sort((a, b) => a.at - b.at)
      .map((a) => {
        const x = pct(a.at);
        const x2 = pct(a.until ?? a.at);
        let lane = ends.findIndex((e) => e + GAP <= x);
        if (lane < 0) lane = ends.push(-Infinity) - 1;
        ends[lane] = x2;
        return { a, x, x2, lane };
      });
    return { pins, lanes: ends.length };
  }, []);

  const years = Array.from({ length: END - START }, (_, i) => START + i);
  const now = new Date();
  const nowX = pct(now.getFullYear() + now.getMonth() / 12);

  return (
    <div className="glass glass-thin mt-6 rounded-[24px] px-5 pb-4 pt-4 @2xl:px-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {KINDS.map((k) => (
          <span key={k} className="flex items-center gap-2 text-[12.5px] text-[var(--ink-2)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOT[k] }} />
            {KIND_LABEL[k]}
            <span className="font-mono text-[11.5px] text-[var(--ink-3)]">{of(k).length}</span>
          </span>
        ))}
      </div>

      <div className="hidden @2xl:block">
        <div className="relative mt-7" style={{ height: lanes * LANE + 6 }}>
          {nowX < 100 && (
            <span className="pointer-events-none absolute bottom-0 top-[-14px] border-l border-dashed border-[var(--accent)] opacity-70" style={{ left: `${nowX}%` }}>
              <span className="absolute -top-1 left-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">Today</span>
            </span>
          )}
          {pins.map(({ a, x, x2, lane }) => {
            const on = pin === a.id || card === a.id;
            const range = x2 > x;
            const align = x < 12 ? "left-0" : x > 88 ? "right-0" : "left-1/2 -translate-x-1/2";
            return (
              <button
                key={a.id}
                type="button"
                aria-label={`Find ${a.title}, ${a.meta}`}
                onMouseEnter={() => setPin(a.id)}
                onMouseLeave={() => setPin(null)}
                onFocus={() => setPin(a.id)}
                onBlur={() => setPin(null)}
                onClick={() => onPick(a.id)}
                className={cn("absolute grid h-[20px] -translate-x-1/2 place-items-center outline-none", on ? "z-20" : "z-10")}
                style={{ left: `${(x + x2) / 2}%`, width: range ? `calc(${x2 - x}% + 13px)` : 20, bottom: lane * LANE }}
              >
                <span
                  className={cn("block rounded-full transition-transform duration-200", on && "scale-[1.35]")}
                  style={{
                    background: DOT[a.kind],
                    width: range ? "100%" : 12,
                    height: range ? 7 : 12,
                    opacity: range ? 0.75 : 1,
                    boxShadow: "0 0 0 2px var(--surface)",
                  }}
                />
                {pin === a.id && (
                  <span className={cn("glass glass-thick pointer-events-none absolute bottom-[calc(100%+8px)] w-max max-w-[300px] rounded-[14px] px-3 py-2 text-left", range ? "left-1/2 -translate-x-1/2" : align)}>
                    <span className="block text-[13px] font-semibold leading-snug text-[var(--ink)]">{a.title}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-[var(--ink-3)]">
                      {a.detail.split(",")[0]}, {a.meta}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* The bar itself: alternate years filled, like a drawing's scale bar. */}
        <div className="mt-2 flex h-[7px] overflow-hidden rounded-[2px] border border-[color-mix(in_oklab,var(--ink)_55%,transparent)]">
          {years.map((y, i) => (
            <span key={y} className="flex-1" style={{ background: i % 2 ? "transparent" : "color-mix(in oklab, var(--ink) 62%, transparent)" }} />
          ))}
        </div>
        <div className="relative mt-1.5 h-4 font-mono text-[10.5px] text-[var(--ink-3)]">
          {years.map((y, i) => (
            <span key={y} className={cn("absolute -translate-x-1/2", i % 2 === 1 && "@max-4xl:hidden")} style={{ left: `${pct(y)}%` }}>
              {y}
            </span>
          ))}
          <span className="absolute right-0">Years</span>
        </div>
      </div>
    </div>
  );
}
