"use client";

import { useEffect, useRef, useState } from "react";
import { DragRegion, Titlebar, TrafficLights } from "./Window";
import { useOS } from "./OSProvider";
import { AboutContent, ABOUT_SECTIONS as SECTIONS } from "@/components/ui/AboutContent";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

/** About me: a sidebar of sections (System Settings style) and one scrolling page. */
export function AboutWindow() {
  const os = useOS();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  // while a sidebar jump is scrolling, keep the clicked item selected
  const jumping = useRef<string | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(settle.current), []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    if (jumping.current) {
      clearTimeout(settle.current);
      settle.current = setTimeout(() => (jumping.current = null), 140);
      return;
    }
    const top = el.getBoundingClientRect().top;
    const nodes = [...el.querySelectorAll<HTMLElement>("[data-about]")];
    let cur = nodes[0]?.dataset.about ?? SECTIONS[0].id;
    for (const n of nodes) if (n.getBoundingClientRect().top - top <= el.clientHeight * 0.3) cur = n.dataset.about ?? cur;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) cur = nodes.at(-1)?.dataset.about ?? cur;
    setActive(cur);
  };

  const go = (id: string) => {
    const el = scroller.current;
    const target = el?.querySelector<HTMLElement>(`[data-about="${id}"]`);
    if (!el || !target) return;
    jumping.current = id;
    setActive(id);
    const y = target.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - (id === SECTIONS[0].id ? 24 : 12);
    el.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    clearTimeout(settle.current);
    settle.current = setTimeout(() => (jumping.current = null), 900);
  };

  const label = SECTIONS.find((s) => s.id === active)?.label ?? "About me";

  return (
    <div className="@container flex h-full">
      <aside className="glass glass-thin m-2 mr-0 hidden w-[212px] shrink-0 flex-col rounded-[22px] @3xl:flex" aria-label="About Aws, section navigation">
        <DragRegion className="flex h-12 shrink-0 items-center px-4">
          <TrafficLights />
        </DragRegion>
        <div className="flex items-center gap-3 px-4 pb-4 pt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PROFILE.photo.src} alt="" className="h-10 w-10 rounded-full object-cover object-[50%_20%]" draggable={false} />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold leading-tight">{PROFILE.name}</p>
            <p className="truncate text-[11.5px] text-[var(--ink-3)]">{PROFILE.menuSubtitle}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-3">
          {SECTIONS.map((s) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={cn(
                  "press flex items-center gap-2.5 rounded-[14px] px-3 py-2 text-left text-[13.5px] font-medium transition-colors hover:bg-[var(--sidebar-sel)]",
                  on && "bg-[var(--sidebar-sel)] text-[var(--accent)]",
                )}
                aria-current={on ? "location" : undefined}
              >
                <s.icon size={16} strokeWidth={2} className={on ? "text-[var(--accent)]" : "text-[var(--ink-2)]"} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </nav>
        <button
          onClick={() => os.open("cv")}
          className="press mx-3 mb-3 mt-auto flex items-center justify-between rounded-[14px] bg-[var(--surface-2)] px-3 py-2.5 text-left text-[12.5px] font-medium hover:bg-[var(--sidebar-sel)]"
        >
          <span>Read my CV</span>
          <span className="text-[11px] text-[var(--ink-3)]">PDF</span>
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {os.mobile ? (
          <Titlebar title="About me" />
        ) : (
          <DragRegion className="flex h-14 shrink-0 items-center gap-4 px-4 @3xl:px-5">
            <TrafficLights className="@3xl:hidden" />
            <h2 className="min-w-0 truncate font-display text-[17px] font-bold tracking-tight">{label}</h2>
          </DragRegion>
        )}
        <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
          <AboutContent />
        </div>
      </div>
    </div>
  );
}
