"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight, MapPin } from "lucide-react";
import { useOS } from "@/components/os/OSProvider";
import { MacIcon, type MacIconName } from "@/components/ui/MacIcon";
import { ABOUT } from "@/data/about";
import { ACHIEVEMENTS } from "@/data/achievements";
import { rootOf } from "@/data/fs";
import { CHAPTERS, PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

/**
 * The scroll page's sections, as iPhone widgets for the phone home screen:
 * the chapters become a Smart Stack, About / Achievements / the footer become
 * medium widgets. No photo anywhere in here (About on phones has none).
 */

const card = "glass glass-shine h-full w-full !rounded-[22px]";
const kicker = "text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]";

/** The four chapters as an iOS Smart Stack: swipe up and down inside the widget, or tap the dots. */
export function StackWidget() {
  const os = useOS();
  const scroller = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const go = (i: number) => scroller.current?.scrollTo({ top: i * scroller.current.clientHeight, behavior: "smooth" });
  return (
    <div className={cn(card, "phone-stack relative overflow-hidden")}>
      <div
        ref={scroller}
        data-vscroll
        className="phone-noscroll h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
        onScroll={(e) => {
          const i = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight);
          if (i !== at) setAt(i);
        }}
      >
        {CHAPTERS.map((c, i) => (
          <article key={c.id} className="flex h-full snap-start snap-always flex-col py-4 pl-4 pr-8" aria-label={c.tab} aria-hidden={i !== at}>
            <p className={kicker}>{c.kicker}</p>
            <h3 className="mt-1 line-clamp-2 font-display text-[21px] font-bold leading-[1.08] tracking-tight">{c.title}</h3>
            <ul className="mt-3 space-y-2.5">
              {c.notes.map((n) => (
                <li key={n.title}>
                  <p className="truncate text-[13px] font-semibold leading-tight">{n.title}</p>
                  <p className="stack-note mt-0.5 line-clamp-2 text-[12px] leading-snug text-[var(--ink-2)]">{n.text}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={() => os.open("finder", { rootId: rootOf(c.open.node), nodeId: c.open.node })}
              tabIndex={i === at ? 0 : -1}
              className="glass-tint press mt-auto inline-flex items-center gap-1.5 self-start rounded-full px-3.5 py-2 text-[12.5px] font-semibold"
            >
              {c.open.label} <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-1.5">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => go(i)}
            aria-label={`Show ${c.tab}`}
            aria-current={i === at || undefined}
            className={cn("h-1.5 w-1.5 rounded-full transition-colors", i === at ? "bg-[var(--ink-2)]" : "bg-[var(--ink-3)] opacity-50")}
          />
        ))}
      </div>
    </div>
  );
}

/** Medium: who I am in two lines; opens the About window. */
export function AboutWidget() {
  const os = useOS();
  return (
    <button onClick={() => os.open("about")} className={cn(card, "phone-cq flex flex-col p-4 text-left")} aria-label="About me, read the full story">
      <span className="flex items-center justify-between">
        <span className={kicker}>About me</span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-3)]">
          <MapPin size={11} /> Baghdad
        </span>
      </span>
      <span className="mt-1.5 line-clamp-2 font-display text-[18px] font-bold leading-[1.12] tracking-tight">{ABOUT.headline}</span>
      <span className="cq-short mt-1 line-clamp-2 text-[12.5px] leading-snug text-[var(--ink-2)]">{ABOUT.short}</span>
      <span className="mt-auto inline-flex items-center gap-0.5 pt-1 text-[12.5px] font-semibold text-[var(--accent)]">
        More about me <ChevronRight size={14} />
      </span>
    </button>
  );
}

const HIGHLIGHTS = ACHIEVEMENTS.filter((a) => a.highlight).slice(0, 3);

/** Medium: the top highlights, like a Reminders list. Each row opens the Achievements window at it. */
export function AchievementsWidget() {
  const os = useOS();
  const open = (nodeId?: string) => os.open("achievements", nodeId ? { nodeId } : {});
  return (
    <div className={cn(card, "phone-cq flex flex-col px-4 pb-2 pt-3.5")}>
      <button onClick={() => open()} className="flex items-center gap-2 text-left" aria-label={`Achievements, view all ${ACHIEVEMENTS.length}`}>
        <span className="flex h-6 w-6">
          <MacIcon name="trophy" />
        </span>
        <span className="text-[14px] font-semibold">Achievements</span>
        <span className="ml-auto inline-flex items-center text-[12px] text-[var(--ink-3)]">
          {ACHIEVEMENTS.length} <ChevronRight size={14} />
        </span>
      </button>
      <ul className="mt-1.5 divide-y divide-[var(--hairline)]">
        {HIGHLIGHTS.map((a) => (
          <li key={a.id} className="cq-row">
            <button onClick={() => open(a.id)} className="flex w-full items-baseline gap-3 py-[7px] text-left">
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{a.title}</span>
              <span className="shrink-0 font-mono text-[10.5px] text-[var(--ink-3)]">{a.meta}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Medium: the footer's "Let's talk", with the ways to reach me as app buttons. */
export function TalkWidget() {
  const os = useOS();
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const actions: { label: string; icon: MacIconName; run?: () => void; href?: string }[] = [
    { label: "Email me", icon: "mail", run: () => os.open("contact") },
    ...(PROFILE.phone ? [{ label: "Call me", icon: "phone" as const, href: `tel:${PROFILE.phone.replace(/[^\d+]/g, "")}` }] : []),
    { label: "Schedule a conversation", icon: "calendar", run: () => os.open("booking") },
    { label: "LinkedIn", icon: "linkedin", href: PROFILE.links.linkedin },
  ];
  return (
    <div className={cn(card, "phone-cq flex flex-col p-4")}>
      <p className={kicker}>Have a role in mind?</p>
      <p className="mt-1 font-display text-[17px] font-bold leading-[1.12] tracking-tight">Let&apos;s talk about working together.</p>
      <p className="cq-short mt-1 flex items-center gap-1.5 text-[11.5px] text-[var(--ink-2)]">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden /> {PROFILE.availability}
      </p>
      <div className="mt-auto flex gap-3 pt-2">
        {actions.map((a) => {
          const icon = (
            <span className="flex h-9 w-9 transition-transform duration-200 active:scale-90">
              <MacIcon name={a.icon} date={today} />
            </span>
          );
          return a.href ? (
            <a key={a.label} href={a.href} target={a.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" aria-label={a.label}>
              {icon}
            </a>
          ) : (
            <button key={a.label} onClick={a.run} aria-label={a.label}>
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
