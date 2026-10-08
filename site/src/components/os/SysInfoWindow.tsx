"use client";

import { Titlebar } from "./Window";
import { useOS } from "./OSProvider";
import { allNodes, CV_URL } from "@/data/fs";
import { BananaMark } from "@/components/ui/Banana";
import { PROFILE } from "@/data/profile";

/** "About This Mac", but for the portfolio. */
export function SysInfoWindow() {
  const os = useOS();
  const projects = allNodes().filter((n) => n.kind === "project").length;
  const rows: [string, string][] = [
    ["Role", "Software Engineer · Qi Card"],
    ["Also", "Founding Engineer & Tech Lead · Cardyiq"],
    ["Based in", "Baghdad, Iraq"],
    ["Projects", `${projects} on this desktop`],
    ["Built with", "Next.js 16 · React 19 · Tailwind 4 · motion"],
    ["Status", PROFILE.availability],
  ];
  return (
    <div className="flex h-full flex-col">
      <Titlebar title="" />
      <div className="scroll-thin flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-8 pb-8 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-[var(--surface)] shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <BananaMark size={70} />
        </div>
        <h2 className="mt-5 font-display text-[26px] font-bold tracking-tight">{PROFILE.name}</h2>
        <p className="mt-0.5 text-[13px] text-[var(--ink-3)]">{PROFILE.menuSubtitle} · Portfolio, 2026</p>
        <dl className="mt-6 w-full space-y-2 text-left text-[13px]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[96px_1fr] gap-3">
              <dt className="text-right font-semibold text-[var(--ink-2)]">{k}</dt>
              <dd className="text-[var(--ink)]">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-7 flex gap-2">
          <button onClick={() => os.open("about")} className="glass glass-thin press rounded-full px-4 py-2 text-[13px] font-medium">
            More Info…
          </button>
          <a href={CV_URL} target="_blank" rel="noopener noreferrer" className="glass glass-thin press rounded-full px-4 py-2 text-[13px] font-medium">
            Open CV…
          </a>
        </div>
        <p className="mt-6 text-[11px] text-[var(--ink-3)]">™ and © 2026 {PROFILE.name}. All rights reserved. Bugs are features in disguise.</p>
      </div>
    </div>
  );
}
