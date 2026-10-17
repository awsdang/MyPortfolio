"use client";

import { ArrowRight } from "lucide-react";
import { CHAPTERS } from "@/data/profile";
import { rootOf } from "@/data/fs";
import { useOS } from "@/components/os/OSProvider";

const TAB = 40;

export function ChapterStack() {
  const os = useOS();
  return (
    <section id="pillar-stack" aria-label="How I work" className="chapters scroll-mt-24 pt-10 md:pt-14">
      <div className="relative">
        {CHAPTERS.map((c, i) => (
          <div
            key={c.id}
            className="relative max-md:mt-3 max-md:!top-auto md:sticky"
            style={{ top: `calc(6rem + ${i * TAB}px)`, zIndex: 10 + i, height: undefined }}
          >
            <div className="md:h-[calc(100dvh-6rem-var(--stack-offset))]" style={{ ["--stack-offset" as string]: `${i * TAB}px` }}>
              <div
                className="glass glass-thin absolute -top-[34px] left-0 flex h-[36px] items-center rounded-t-[22px] pl-8 pr-10 text-[11.5px] font-bold uppercase tracking-[0.16em] text-[var(--ink-2)] max-md:left-0"
                style={{ clipPath: "polygon(0 0, calc(100% - 26px) 0, 100% 100%, 0 100%)" }}
              >
                {c.tab}
              </div>
              <div className="glass glass-thick relative h-full overflow-hidden rounded-[36px] rounded-tl-[8px] max-md:rounded-tl-[8px]">
                <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "radial-gradient(60% 80% at 100% 0%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 70%)" }} />
                <div className="mx-auto grid h-full max-w-[1100px] items-center gap-8 px-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-12">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]">{c.kicker}</p>
                    <h3 className="mt-3 font-display text-[clamp(30px,4.4vw,54px)] font-extrabold leading-[1.02] tracking-tight">{c.title}</h3>
                    <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-[var(--ink-2)]">{c.body}</p>
                    <button
                      onClick={() => os.open("finder", { rootId: rootOf(c.open.node), nodeId: c.open.node })}
                      className="glass-tint press mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold"
                    >
                      {c.open.label} <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="glass glass-thin relative overflow-hidden rounded-[28px]">
                    <div className="h-8" style={{ background: "linear-gradient(180deg,color-mix(in oklab,var(--accent) 70%,white 10%),color-mix(in oklab,var(--accent) 40%,transparent))" }} />
                    <ul className="divide-y divide-[var(--hairline)] px-6 py-2">
                      {c.notes.map((n) => (
                        <li key={n.title} className="py-4">
                          <p className="font-display text-[19px] font-bold leading-tight tracking-tight">{n.title}</p>
                          <p className="mt-0.5 text-[14px] text-[var(--ink-2)]">{n.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
