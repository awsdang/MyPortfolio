"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useOS } from "@/components/os/OSProvider";
import { StickyNote } from "@/components/desktop/StickyNote";
import { CalendarWidget, ClockWidget, MusicWidget, PhotoWidget } from "@/components/desktop/Widgets";
import { FillNodeIcon } from "@/components/ui/Icons";
import { MacIcon } from "@/components/ui/MacIcon";
import { DESKTOP } from "@/data/fs";
import type { FsNode } from "@/data/types";
import { cn } from "@/lib/cn";
import { moveItem, pack, phoneHome, SIZE, usePhoneHome, type Placed } from "@/lib/phone-home";
import { PhoneFolder } from "./PhoneFolder";
import { useDeleteJoke } from "./PhoneMeme";
import { AboutWidget, AchievementsWidget, StackWidget, TalkWidget } from "./PhoneWidgets";

const node = (id: string) => DESKTOP.find((n) => n.id === id)!;
const widget = "!h-full !w-full !rounded-[22px]";

/**
 * A widget's box. No name underneath (only apps have one), so the last row's
 * label space stays empty and the widget lines up with the icons beside it.
 * `fullWidth`: when a short screen scales the page down (--fit), the widget is
 * scaled back up so it keeps the full width and normal-size text; it gets the
 * shrunk page's height, so the rows below don't move.
 */
function WidgetBox({ large, fullWidth, children }: { large?: boolean; fullWidth?: boolean; children: ReactNode }) {
  const h = large ? "--widget-l" : "--widget";
  return (
    // a size container: the note and the text widgets fit their type to it
    <div
      className="w-full origin-top [container-type:size]"
      style={fullWidth ? { height: `calc(var(${h}) * var(--fit, 1))`, transform: "scale(calc(1 / var(--fit, 1)))" } : { height: `var(${h})` }}
    >
      {children}
    </div>
  );
}

function AppCell({ label, aria, onClick, href, children }: { label: string; aria?: string; onClick?: () => void; href?: string; children: ReactNode }) {
  const body = (
    <>
      <span className="flex aspect-square w-[var(--icon)] transition-transform duration-200 group-active:scale-90" aria-hidden>
        {children}
      </span>
      <span className="phone-label">{label}</span>
    </>
  );
  const cls = "group flex min-w-0 flex-col items-center gap-[3px] outline-offset-2";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={aria ?? label} className={cls} draggable={false}>
      {body}
    </a>
  ) : (
    <button onClick={onClick} aria-label={aria ?? label} className={cls}>
      {body}
    </button>
  );
}

/** A file on the desktop (CV, Claude, ChatGPT) as a home screen app. */
function FileCell({ n, label }: { n: FsNode; label?: string }) {
  const os = useOS();
  const href = n.file!.href;
  const external = /^https?:/.test(href);
  return (
    <AppCell label={label ?? n.name} aria={n.summary ?? n.name} href={external ? href : undefined} onClick={external ? undefined : () => os.openHref(href)}>
      {n.icon ? <FillNodeIcon node={n} /> : <MacIcon name="docs" />}
    </AppCell>
  );
}

type Item = { label: string; render: () => ReactNode };

/** Everything that can sit on the home screen. Where each one goes is in lib/phone-home. */
function useItems(): Record<string, Item> {
  const os = useOS();
  const folder = (id: string): Item => ({ label: node(id).name, render: () => <PhoneFolder node={node(id)} /> });
  const file = (id: string, label?: string): Item => ({ label: label ?? node(id).name, render: () => <FileCell n={node(id)} label={label} /> });
  const box = (label: string, el: ReactNode, opts: { large?: boolean; fullWidth?: boolean } = {}): Item => ({
    label,
    render: () => (
      <WidgetBox large={opts.large} fullWidth={opts.fullWidth}>
        {el}
      </WidgetBox>
    ),
  });
  return {
    note: box("Notes", <StickyNote compact className="h-full" />),
    clock: box("Clock", <ClockWidget className={widget} />),
    products: folder("products"),
    "ai-skills": folder("ai-skills"),
    contact: folder("contact"),
    cv: file("cv", "My CV"),
    terminal: {
      label: "Terminal",
      render: () => (
        <AppCell label="Terminal" aria="Terminal, ask about my work" onClick={() => os.open("terminal")}>
          <MacIcon name="terminal" />
        </AppCell>
      ),
    },
    "app-claude": file("app-claude"),
    calendar: box("Calendar", <CalendarWidget className={widget} />),
    "app-chatgpt": file("app-chatgpt"),
    bin: {
      label: "Bin",
      render: () => (
        <AppCell label="Bin" aria="Bin, the architecture work I did before software" onClick={() => os.open("finder", { rootId: "bin", nodeId: "bin" })}>
          <MacIcon name="binFull" />
        </AppCell>
      ),
    },
    stack: box("Smart Stack", <StackWidget />, { large: true, fullWidth: true }),
    music: box("Music", <MusicWidget small className={widget} />),
    photos: box("Photos", <PhotoWidget className={widget} />),
    about: box("About me", <AboutWidget />),
    achievements: box("Achievements", <AchievementsWidget />),
    talk: box("Contact", <TalkWidget />),
  };
}

type Drag = { id: string; x: number; y: number; gx: number; gy: number; w: number; h: number };
type Press = {
  pointerId: number;
  x: number;
  y: number;
  id: string | null;
  el: HTMLElement | null;
  timer?: ReturnType<typeof setTimeout>;
  /** a hold, or an edit-mode press on an item: moving now drags it */
  armed: boolean;
  swiped: boolean;
};

/**
 * The phone version of the site: an iPhone home screen that never scrolls up
 * or down. Pages sit side by side (swipe, wheel or tap the dots), each a
 * four-column grid of six rows; on short screens every page shrinks to fit,
 * except the chapters stack, which keeps the full width. A vertical swipe opens
 * Search. Touch and hold for edit mode: everything jiggles, items can be
 * dragged around and onto a new page, and the minus badge tells a joke. The
 * dock is PhoneDock.
 */
export function PhoneHome() {
  const os = useOS();
  const items = useItems();
  const { pages, editing } = usePhoneHome();
  const pager = useRef<HTMLDivElement>(null);
  const clone = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [fit, setFit] = useState(1);
  const [drag, setDrag] = useState<Drag | null>(null);
  const joke = useDeleteJoke();
  const wheelLock = useRef(0);
  const press = useRef<Press | null>(null);
  /** `page`: the page the drag is on, kept here rather than read from scroll events, which can lag behind a turn */
  const dragRef = useRef<(Drag & { page: number; hover: string | null; hoverAt: number; movedAt: number; edgeAt: number }) | null>(null);
  const swallowClick = useRef(false);
  // the gesture handlers live on window, so they read the latest state from here
  const live = useRef({ pages, editing, page, fit });
  live.current = { pages, editing, page, fit };

  useEffect(() => phoneHome.load(), []);

  // shrink the pages (all by the same amount) when six rows don't fit above the dock
  useLayoutEffect(() => {
    const el = pager.current!;
    const inners = [...el.querySelectorAll<HTMLElement>("[data-page]")];
    const measure = () => {
      const need = Math.max(...inners.map((n) => n.offsetHeight));
      if (need && el.clientHeight) setFit(Math.min(1, (el.clientHeight - 10) / need)); // 0 while hidden on desktop; 10px clear of the dots
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    inners.forEach((n) => ro.observe(n));
    return () => ro.disconnect();
  }, [pages.length]);

  // a hold that turns into a drag must not scroll the pages (touch-action was settled at touchstart)
  useEffect(() => {
    const el = pager.current!;
    const stop = (e: TouchEvent) => {
      if ((press.current?.armed || dragRef.current) && e.cancelable) e.preventDefault();
    };
    el.addEventListener("touchmove", stop, { passive: false });
    return () => el.removeEventListener("touchmove", stop);
  }, []);

  // Escape leaves edit mode
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && phoneHome.edit(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  const go = (i: number) => {
    const el = pager.current;
    if (el) el.scrollTo({ left: Math.max(0, i) * el.clientWidth, behavior: "smooth" });
  };

  // empty pages go when edit mode ends, so stay on one that exists
  useEffect(() => {
    if (page > pages.length - 1) go(pages.length - 1);
  }, [pages.length, page]);

  /* ── dragging ── */
  const startDrag = (p: Press, x: number, y: number) => {
    const el = p.el!;
    const r = el.getBoundingClientRect();
    const f = live.current.fit;
    const d = { id: p.id!, x, y, gx: (p.x - r.left) / f, gy: (p.y - r.top) / f, w: el.offsetWidth, h: el.offsetHeight };
    const pg = pager.current!;
    dragRef.current = { ...d, page: Math.round(pg.scrollLeft / pg.clientWidth), hover: null, hoverAt: 0, movedAt: 0, edgeAt: 0 };
    swallowClick.current = true;
    setDrag(d);
  };

  const moveDrag = (x: number, y: number) => {
    const d = dragRef.current!;
    const now = performance.now();
    const { pages, fit } = live.current;
    const page = d.page;
    if (clone.current) clone.current.style.transform = `translate(${x - d.gx}px, ${y - d.gy}px) scale(${fit * 1.08})`;

    // hold at a screen edge to turn the page; past the last page, a new one is made
    const edge = x < 28 ? -1 : x > window.innerWidth - 28 ? 1 : 0;
    if (!edge) d.edgeAt = 0;
    else if (!d.edgeAt) d.edgeAt = now;
    else if (now - d.edgeAt > 520 && page + edge >= 0) {
      d.edgeAt = now + 600; // a pause before it turns again
      const to = Math.min(page + edge, pages.length);
      d.page = to;
      d.hover = null;
      phoneHome.preview(moveItem(pages, d.id, to));
      requestAnimationFrame(() => go(to));
      return;
    }

    // over another item for a moment: take its place
    const section = pager.current?.children[page] as HTMLElement | undefined;
    if (!section) return;
    let over: string | null = null;
    let lastBottom = 0;
    for (const c of section.querySelectorAll<HTMLElement>("[data-cell]")) {
      const r = c.getBoundingClientRect();
      lastBottom = Math.max(lastBottom, r.bottom);
      if (c.dataset.cell === d.id) continue;
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) over = c.dataset.cell!;
    }
    if (!over && y > lastBottom) over = "@end";
    if (over !== d.hover) {
      d.hover = over;
      d.hoverAt = now;
    } else if (over && now - d.hoverAt > 160 && now - d.movedAt > 280) {
      const ids = pages[page] ?? [];
      if (over === "@end" && ids[ids.length - 1] === d.id) return;
      phoneHome.preview(moveItem(pages, d.id, page, over === "@end" ? undefined : ids.indexOf(over)));
      d.movedAt = now;
      d.hoverAt = now;
    }
  };

  const endDrag = () => {
    dragRef.current = null;
    setDrag(null);
    phoneHome.commit(live.current.pages);
  };

  /* ── press, hold, swipe ── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || press.current) return;
    const t = e.target as HTMLElement;
    if (t.closest("[data-edit]")) return;
    const el = t.closest<HTMLElement>("[data-cell]");
    const p: Press = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, id: el?.dataset.cell ?? null, el, armed: live.current.editing && !!el, swiped: false };
    press.current = p;
    if (!live.current.editing)
      p.timer = setTimeout(() => {
        phoneHome.edit(true);
        navigator.vibrate?.(12);
        p.armed = !!el;
        swallowClick.current = true; // the release after a hold isn't a tap
      }, 480);

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== p.pointerId) return;
      if (dragRef.current) return moveDrag(ev.clientX, ev.clientY);
      const dx = ev.clientX - p.x;
      const dy = ev.clientY - p.y;
      if (Math.hypot(dx, dy) < 8) return;
      clearTimeout(p.timer);
      if (p.armed && p.id) return startDrag(p, ev.clientX, ev.clientY);
      // a swipe up or down on the home screen opens Search
      if (!live.current.editing && !p.swiped && Math.abs(dy) > 46 && Math.abs(dy) > Math.abs(dx) * 1.4) {
        p.swiped = true;
        os.setSpotlight(true);
      }
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== p.pointerId) return;
      clearTimeout(p.timer);
      if (dragRef.current) endDrag();
      press.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setTimeout(() => (swallowClick.current = false), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-edit]")) return;
    if (swallowClick.current || live.current.editing) {
      e.preventDefault();
      e.stopPropagation();
      // in edit mode, a tap on the wallpaper is "Done"
      if (!swallowClick.current && !t.closest("[data-cell]")) phoneHome.edit(false);
    }
  };

  const cell = (p: Placed) => {
    const it = items[p.id];
    if (!it) return null;
    const isWidget = SIZE[p.id] !== "app";
    return (
      <motion.div
        key={p.id}
        layout="position"
        transition={{ type: "spring", stiffness: 520, damping: 42 }}
        data-cell={p.id}
        className="relative"
        style={{ gridColumn: `${p.col + 1} / span ${p.w}`, gridRow: `${p.row + 1} / span ${p.h}`, opacity: drag?.id === p.id ? 0 : 1 }}
      >
        <div className={cn("h-full", editing && (isWidget ? "jiggle-w" : "jiggle"))}>{it.render()}</div>
        {editing && (
          <button
            data-edit
            onClick={() => joke.ask(it.label, isWidget)}
            aria-label={`Remove ${it.label}`}
            className={cn("phone-minus absolute top-[-7px] z-10", isWidget ? "left-[-7px]" : "left-[calc((100%-var(--icon))/2-7px)]")}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn("phone-screen fixed inset-0 flex flex-col", editing && "phone-editing")}>
      <div
        ref={pager}
        className={cn(
          "phone-pager phone-noscroll flex min-h-0 flex-1 snap-x snap-mandatory overflow-y-hidden overscroll-x-contain",
          drag ? "overflow-x-hidden" : "overflow-x-auto",
        )}
        aria-label="Home screen"
        onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={(e) => {
          // a mouse wheel turns pages; trackpads swipe sideways natively, and the Smart Stack scrolls itself
          if (Math.abs(e.deltaX) >= Math.abs(e.deltaY) || Math.abs(e.deltaY) < 6) return;
          if ((e.target as HTMLElement).closest("[data-vscroll]")) return;
          const now = Date.now();
          if (now < wheelLock.current) return;
          wheelLock.current = now + 650;
          go(Math.min(Math.max(page + Math.sign(e.deltaY), 0), pages.length - 1));
        }}
      >
        {pages.map((ids, i) => (
          <section key={i} className="flex w-full shrink-0 snap-start snap-always items-start justify-center" aria-label={`Home screen page ${i + 1} of ${pages.length}`}>
            <div
              data-page
              className="phone-home origin-top pt-[max(16px,calc(env(safe-area-inset-top)+8px))]"
              style={fit < 1 ? ({ transform: `scale(${fit})`, "--fit": fit } as CSSProperties) : undefined}
            >
              <div className="grid grid-cols-4 grid-rows-[repeat(6,var(--row))] gap-x-[var(--gx)] gap-y-[var(--gy)]">{pack(ids).placed.map(cell)}</div>
            </div>
          </section>
        ))}
      </div>

      {/* page dots, and Search behind the magnifier; in edit mode, Done beside them */}
      <div className="phone-dots pointer-events-none absolute inset-x-0 flex justify-center gap-2">
        <div className="glass glass-thin pointer-events-auto flex items-center gap-0.5 rounded-full px-1.5 py-1">
          <button onClick={() => os.setSpotlight(true)} aria-label="Search portfolio" className="grid h-6 w-6 place-items-center rounded-full text-white">
            <Search size={13} strokeWidth={2.6} />
          </button>
          {pages.map((_, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`Page ${i + 1}`} aria-current={i === page || undefined} className="grid h-6 w-5 place-items-center">
              <span className={cn("h-[7px] w-[7px] rounded-full bg-white transition-opacity duration-300", i === page ? "opacity-100" : "opacity-40")} />
            </button>
          ))}
        </div>
        {editing && (
          <button onClick={() => phoneHome.edit(false)} className="glass glass-thin press pointer-events-auto rounded-full px-4 text-[14px] font-semibold text-white">
            Done
          </button>
        )}
      </div>

      {drag &&
        items[drag.id] &&
        createPortal(
          <div
            ref={clone}
            className="phone-home phone-lift pointer-events-none fixed left-0 top-0 z-[95]"
            style={
              {
                width: drag.w,
                height: drag.h,
                transformOrigin: `${drag.gx}px ${drag.gy}px`,
                transform: `translate(${drag.x - drag.gx}px, ${drag.y - drag.gy}px) scale(${fit * 1.08})`,
                "--fit": fit,
              } as CSSProperties
            }
            aria-hidden
          >
            {items[drag.id].render()}
          </div>,
          document.body,
        )}
      {joke.ui}
    </div>
  );
}
