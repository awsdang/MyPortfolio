"use client";

import { useOS } from "@/components/os/OSProvider";
import { rootOf } from "@/data/fs";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

/** The hero, written on a sticky note. */
export function StickyNote({ className, compact }: { className?: string; compact?: boolean }) {
  const os = useOS();
  const h = PROFILE.hero;
  return (
    <div className={cn("sticky-note", compact ? "px-7 pb-6 pt-8" : "px-7 pb-6 pt-8", className)}>
      <p className={cn("hero-line font-hand font-bold leading-none text-[#8a6510]", compact ? "text-[34px]" : "text-[clamp(24px,1.9vw,30px)]")} style={{ animationDelay: "40ms" }}>
        Hello, world.
      </p>
      <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-[#211b0c]">
        <span className={cn("hero-line block leading-[1]", compact ? "text-[44px]" : "text-[clamp(30px,2.7vw,42px)]")} style={{ animationDelay: "140ms" }}>
          {h.line1}
        </span>
        <span className={cn("hero-line mt-2 block leading-[1.08]", compact ? "text-[26px]" : "text-[clamp(18px,1.5vw,23px)]")} style={{ animationDelay: "240ms" }}>
          {h.line2Before.replace(/at\s*$/, "")}
          <span className="whitespace-nowrap">
            at{" "}
            <button
              onClick={() => os.open("finder", { rootId: rootOf("qi-card"), nodeId: "qi-card" })}
              className="relative inline-block transition-opacity hover:opacity-70"
              aria-label="Open Qi"
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
        className={cn("hero-line mt-4 font-medium leading-relaxed text-[#3d3420]", compact ? "text-[17px]" : "text-[clamp(14.5px,1.05vw,16px)]")}
        style={{ animationDelay: "340ms" }}
      >
        {h.sub}
      </p>
    </div>
  );
}
