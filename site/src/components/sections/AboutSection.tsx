"use client";

import { Reveal } from "@/components/ui/Reveal";
import { AboutContent } from "@/components/ui/AboutContent";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24 px-3 py-16 md:py-24">
      <Reveal className="mx-auto max-w-[1000px]">
        <div className="glass glass-thick overflow-hidden rounded-[32px]">
          <div className="relative flex h-12 items-center px-5">
            <div className="lights" aria-hidden>
              <span className="light r" />
              <span className="light y" />
              <span className="light g" />
            </div>
            <span className="absolute inset-x-0 text-center text-[13px] font-semibold text-[var(--ink-2)]">about-me.txt</span>
          </div>
          <div className="px-3 pb-3 md:px-4 md:pb-4">
            <AboutContent />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
