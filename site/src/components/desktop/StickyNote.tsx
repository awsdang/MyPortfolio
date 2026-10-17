"use client";

import { useOS } from "@/components/os/OSProvider";
import { rootOf } from "@/data/fs";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

/** The hero, written on a sticky note. `compact` is the phone's medium widget: it sizes its type to the widget box (a size container) */
export function StickyNote({ className, compact }: { className?: string; compact?: boolean }) {
  const os = useOS();
  const h = PROFILE.hero;
  return (
    <div className={cn("sticky-note", compact ? "px-[5.5cqw] pb-[6cqh] pt-[9cqh]" : "px-7 pb-6 pt-8", className)}>
      <p className={cn("hero-line font-hand font-bold leading-none text-[#8a6510]", compact ? "text-[12cqh]" : "text-[clamp(24px,1.9vw,30px)]")} style={{ animationDelay: "40ms" }}>
        Hello, world.
      </p>
      <h1 className={cn("font-display font-extrabold tracking-[-0.03em] text-[#211b0c]", compact ? "mt-[3cqh]" : "mt-3")}>
        <span className={cn("hero-line block leading-[1]", compact ? "text-[17.5cqh]" : "text-[clamp(30px,2.7vw,42px)]")} style={{ animationDelay: "140ms" }}>
          {h.line1}
        </span>
        <span className={cn("hero-line block leading-[1.08]", compact ? "mt-[2cqh] text-[10cqh]" : "mt-2 text-[clamp(18px,1.5vw,23px)]")} style={{ animationDelay: "240ms" }}>
          {h.line2Before.replace(/at\s*$/, "")}
          <span className="whitespace-nowrap">
            at{" "}
            <button
              onClick={() => os.open("finder", { rootId: rootOf("qi-card"), nodeId: "qi-card" })}
              className="relative inline-block transition-opacity hover:opacity-70"
              aria-label="See my work at Qi"
            >
              {h.line2Org}
              <svg className="absolute -bottom-[0.08em] left-0 h-[0.26em] w-full text-[#c0502a]" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" aria-hidden>
                <path d="M3 12c18-7 40-8 60-4s25 4 34-2" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </button>
            {h.line2After}
          </span>
        </span>
      </h1>
      <p
        className={cn("hero-line font-medium text-[#3d3420]", compact ? "mt-[4cqh] text-[7.9cqh] leading-[1.3]" : "mt-4 text-[clamp(14.5px,1.05vw,16px)] leading-relaxed")}
        style={{ animationDelay: "340ms" }}
      >
        {h.sub}
      </p>
    </div>
  );
}
