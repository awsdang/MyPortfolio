"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Search } from "lucide-react";
import { useOS } from "@/components/os/OSProvider";
import { StickyNote } from "@/components/desktop/StickyNote";
import { CalendarWidget, ClockWidget, MusicWidget, PhotoWidget } from "@/components/desktop/Widgets";
import { FillNodeIcon } from "@/components/ui/Icons";
import { MacIcon } from "@/components/ui/MacIcon";
import { DESKTOP } from "@/data/fs";
import type { FsNode } from "@/data/types";
import { cn } from "@/lib/cn";
import { PhoneFolder } from "./PhoneFolder";
import { AboutWidget, AchievementsWidget, StackWidget, TalkWidget } from "./PhoneWidgets";

const node = (id: string) => DESKTOP.find((n) => n.id === id)!;

/** iOS widget sizes: small 2x2 cells, medium 4x2, large 4x4. No name underneath (only apps have one), so the last row's label space stays empty and the widget lines up with the icons beside it. */
const SPAN = { small: "col-span-2 row-span-2", medium: "col-span-4 row-span-2", large: "col-span-4 row-span-4" };
const widget = "!h-full !w-full !rounded-[22px]";

/**
 * `fullWidth`: when a short screen scales the page down (--fit), this widget is
 * scaled back up so it keeps the full width and normal-size text; it gets the
 * shrunk page's height, so the rows below don't move.
 */
function WidgetCell({ size = "small", fullWidth, children }: { size?: keyof typeof SPAN; fullWidth?: boolean; children: ReactNode }) {
  return (
    <div className={SPAN[size]}>
      {/* a size container: the note and the text widgets fit their type to it */}
      <div
        className="w-full origin-top [container-type:size]"
        style={
          fullWidth
            ? { height: `calc(var(${size === "large" ? "--widget-l" : "--widget"}) * var(--fit, 1))`, transform: "scale(calc(1 / var(--fit, 1)))" }
            : { height: size === "large" ? "var(--widget-l)" : "var(--widget)" }
        }
      >
        {children}
      </div>
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
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={aria ?? label} className={cls}>
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

/**
 * The phone version of the site: an iPhone home screen that never scrolls up
 * or down. Three pages side by side (swipe, wheel or tap the dots), each a
 * four-column grid of six rows; on short screens every page shrinks to fit,
 * except the chapters stack, which keeps the full width. The dock is PhoneDock.
 */
export function PhoneHome() {
  const os = useOS();
  const pager = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [fit, setFit] = useState(1);
  const wheelLock = useRef(0);

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
  }, []);

  const go = (i: number) => {
    const el = pager.current;
    if (el) el.scrollTo({ left: Math.max(0, Math.min(i, PAGES.length - 1)) * el.clientWidth, behavior: "smooth" });
  };

  const PAGES: { label: string; body: ReactNode }[] = [
    {
      label: "Home",
      body: (
        <>
          <WidgetCell size="medium">
            <StickyNote compact className="h-full" />
          </WidgetCell>
          <WidgetCell>
            <ClockWidget className={widget} />
          </WidgetCell>
          <PhoneFolder node={node("products")} />
          <PhoneFolder node={node("ai-skills")} />
          <PhoneFolder node={node("contact")} />
          <FileCell n={node("cv")} label="My CV" />
          <AppCell label="Terminal" aria="Terminal, ask about my work" onClick={() => os.open("terminal")}>
            <MacIcon name="terminal" />
          </AppCell>
          <FileCell n={node("app-claude")} />
          <WidgetCell>
            <CalendarWidget className={widget} />
          </WidgetCell>
          <FileCell n={node("app-chatgpt")} />
          <AppCell label="Bin" aria="Bin, the architecture work I did before software" onClick={() => os.open("finder", { rootId: "bin", nodeId: "bin" })}>
            <MacIcon name="binFull" />
          </AppCell>
        </>
      ),
    },
    {
      label: "How I work",
      body: (
        <>
          <WidgetCell size="large" fullWidth>
            <StackWidget />
          </WidgetCell>
          <WidgetCell>
            <MusicWidget small className={widget} />
          </WidgetCell>
          <WidgetCell>
            <PhotoWidget className={widget} />
          </WidgetCell>
        </>
      ),
    },
    {
      label: "About me",
      body: (
        <>
          <WidgetCell size="medium">
            <AboutWidget />
          </WidgetCell>
          <WidgetCell size="medium">
            <AchievementsWidget />
          </WidgetCell>
          <WidgetCell size="medium">
            <TalkWidget />
          </WidgetCell>
        </>
      ),
    },
  ];

  return (
    <div className="phone-screen fixed inset-0 flex flex-col">
      <div
        ref={pager}
        className="phone-pager phone-noscroll flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain"
        aria-label="Home screen"
        onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onWheel={(e) => {
          // a mouse wheel turns pages; trackpads swipe sideways natively, and the Smart Stack scrolls itself
          if (Math.abs(e.deltaX) >= Math.abs(e.deltaY) || Math.abs(e.deltaY) < 6) return;
          if ((e.target as HTMLElement).closest("[data-vscroll]")) return;
          const now = Date.now();
          if (now < wheelLock.current) return;
          wheelLock.current = now + 650;
          go(page + Math.sign(e.deltaY));
        }}
      >
        {PAGES.map((p, i) => (
          <section key={p.label} className="flex w-full shrink-0 snap-start snap-always items-start justify-center" aria-label={`${p.label}, page ${i + 1} of ${PAGES.length}`}>
            <div
              data-page
              className="phone-home origin-top pt-[max(16px,calc(env(safe-area-inset-top)+8px))]"
              style={fit < 1 ? ({ transform: `scale(${fit})`, "--fit": fit } as CSSProperties) : undefined}
            >
              <div className="grid grid-cols-4 grid-rows-[repeat(6,var(--row))] gap-x-[var(--gx)] gap-y-[var(--gy)]">{p.body}</div>
            </div>
          </section>
        ))}
      </div>

      {/* page dots, and Spotlight behind the magnifier (iOS puts Search here) */}
      <div className="phone-dots pointer-events-none absolute inset-x-0 flex justify-center">
        <div className="glass glass-thin pointer-events-auto flex items-center gap-0.5 rounded-full px-1.5 py-1">
          <button onClick={() => os.setSpotlight(true)} aria-label="Search portfolio" className="grid h-6 w-6 place-items-center rounded-full text-white">
            <Search size={13} strokeWidth={2.6} />
          </button>
          {PAGES.map((p, i) => (
            <button key={p.label} onClick={() => go(i)} aria-label={`${p.label}, page ${i + 1}`} aria-current={i === page || undefined} className="grid h-6 w-5 place-items-center">
              <span className={cn("h-[7px] w-[7px] rounded-full bg-white transition-opacity duration-300", i === page ? "opacity-100" : "opacity-40")} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
