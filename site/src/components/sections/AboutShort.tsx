"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { useOS } from "@/components/os/OSProvider";
import { Reveal } from "@/components/ui/Reveal";
import { ABOUT } from "@/data/about";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

/** A short About on the scroll page. The full story lives in the About window. */
export function AboutShort() {
  const os = useOS();
  return (
    <section id="about" aria-label="About me" className="scroll-mt-24 px-3 pt-24 md:pt-36">
      <Reveal className="mx-auto max-w-[1100px]">
        <div className="glass glass-thick relative overflow-hidden rounded-[40px] px-6 py-10 md:px-14 md:py-14">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-[0.14] blur-3xl" style={{ background: "var(--accent)" }} aria-hidden />
          <div className="relative grid items-center gap-7 md:grid-cols-[auto_1fr] md:gap-12">
            {/* no photo on phones */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PROFILE.photo.src}
              alt={PROFILE.photo.alt}
              className="h-[168px] w-[168px] rounded-[44px] object-cover object-[50%_20%] shadow-[0_14px_36px_rgba(18,26,48,0.22)] max-md:hidden"
              draggable={false}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]">About me</p>
              <h2 className="mt-2 font-display text-[clamp(32px,4.6vw,56px)] font-extrabold leading-[1] tracking-tight">
                {ABOUT.headline.split(/(?<=\.)\s+/).map((line, i) => (
                  <span key={line} className={cn("block", i === 0 && "text-[var(--ink-3)]")}>
                    {line}
                  </span>
                ))}
              </h2>
              <p className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-[var(--ink-2)]">
                {ABOUT.short}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <button onClick={() => os.open("about")} className="glass-tint press inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold">
                  More about me <ArrowRight size={16} />
                </button>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-2)]">
                  <MapPin size={14} className="text-[var(--ink-3)]" /> Baghdad, Iraq
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
