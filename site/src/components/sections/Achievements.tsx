"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { MacIcon } from "@/components/ui/MacIcon";
import { ACHIEVEMENTS, PROOF } from "@/data/achievements";

export function Achievements() {
  return (
    <section id="achievements" className="scroll-mt-28 px-3 py-16 md:py-24">
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]">01 / Achievements</p>
          <h2 className="mt-2 font-display text-[clamp(36px,5.4vw,64px)] font-extrabold leading-[0.98] tracking-tight">Achievements</h2>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a, i) => {
            const body = (
              <>
                <span className="block h-14 w-14 shrink-0">
                  <MacIcon name={a.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-[15.5px] font-semibold leading-snug">{a.title}</span>
                    {a.href && <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-[var(--ink-3)]" />}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-snug text-[var(--ink-2)]">{a.detail}</span>
                  {a.meta && <span className="mt-2 block font-mono text-[11.5px] text-[var(--ink-3)]">{a.meta}</span>}
                </span>
              </>
            );
            const cls = "glass glass-shine flex h-full gap-4 rounded-[26px] p-5 transition-transform duration-300 hover:-translate-y-1";
            return (
              <Reveal key={a.title} delay={(i % 3) * 80}>
                {a.href ? (
                  <a href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {PROOF.map((p) => (
              <div key={p.label} className="rounded-[22px] bg-[var(--surface-2)] px-4 py-4">
                <dd className="font-display text-[28px] font-bold leading-none tracking-tight">{p.value}</dd>
                <dt className="mt-1.5 text-[12.5px] leading-snug text-[var(--ink-2)]">{p.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
