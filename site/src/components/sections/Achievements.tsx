"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { MacIcon } from "@/components/ui/MacIcon";
import { useOS } from "@/components/os/OSProvider";
import { ACHIEVEMENTS, TOTAL_HOURS } from "@/data/achievements";

const HIGHLIGHTS = ACHIEVEMENTS.filter((a) => a.highlight);
const COURSES = ACHIEVEMENTS.filter((a) => a.kind === "course");
/** Three sheets fanned on the last tile, back to front. */
const FAN = ["project-management", "jhu-web", "threejs-journey"].map((id) => ACHIEVEMENTS.find((a) => a.id === id)!.cert!);
const FAN_POSE = [
  "-rotate-[10deg] -translate-x-3 group-hover:-rotate-[16deg] group-hover:-translate-x-5",
  "rotate-[2deg] group-hover:-rotate-[2deg] group-hover:-translate-y-1",
  "rotate-[12deg] translate-x-3 translate-y-1 group-hover:rotate-[16deg] group-hover:translate-x-6",
];

const tile =
  "glass glass-shine group relative flex h-full w-full gap-4 rounded-[26px] p-5 text-left transition-transform duration-300 hover:-translate-y-1";

/** The short version on the page: highlights only. Every tile opens the Achievements window at that item. */
export function Achievements() {
  const os = useOS();
  const open = (nodeId?: string) => os.open("achievements", nodeId ? { nodeId } : {});
  const years = COURSES.map((a) => Math.floor(a.at));

  return (
    <section id="achievements" className="scroll-mt-28 px-3 py-16 md:py-24">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <h2 className="font-display text-[clamp(36px,5.4vw,64px)] font-extrabold leading-[0.98] tracking-tight">Achievements</h2>
          <button onClick={() => open()} className="glass glass-thin press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium">
            View all {ACHIEVEMENTS.length} <ArrowUpRight size={14} />
          </button>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 80}>
              <button onClick={() => open(a.id)} className={tile}>
                <span className="block h-14 w-14 shrink-0">
                  <MacIcon name={a.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block pr-5 text-[15.5px] font-semibold leading-snug">{a.title}</span>
                  <span className="mt-1 block text-[13.5px] leading-snug text-[var(--ink-2)]">{a.detail}</span>
                  <span className="mt-2 block font-mono text-[11.5px] text-[var(--ink-3)]">{a.meta}</span>
                </span>
                <ArrowUpRight size={15} className="absolute right-4 top-4 text-[var(--ink-3)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            </Reveal>
          ))}

          <Reveal delay={(HIGHLIGHTS.length % 3) * 80}>
            <button onClick={() => open("course")} className={tile} aria-label={`View all ${COURSES.length} certificates`}>
              <span className="relative block h-14 w-[84px] shrink-0" aria-hidden>
                {FAN.map((c, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={c.src}
                    src={c.thumb}
                    width={c.width}
                    height={c.height}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className={`cert-paper absolute left-1/2 top-1/2 -ml-[30px] -mt-[22px] h-[44px] w-[60px] object-cover transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${FAN_POSE[i]}`}
                  />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block pr-5 text-[15.5px] font-semibold leading-snug">{COURSES.length} certificates</span>
                <span className="mt-1 block text-[13.5px] leading-snug text-[var(--ink-2)]">Learning across software, 3D and project management</span>
                <span className="mt-2 block font-mono text-[11.5px] text-[var(--ink-3)]">
                  {Math.min(...years)} to {Math.max(...years)}, {TOTAL_HOURS} recorded hours
                </span>
              </span>
              <ArrowUpRight size={15} className="absolute right-4 top-4 text-[var(--ink-3)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
