"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useOS } from "@/components/os/OSProvider";
import { PROFILE } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { BananaMark } from "@/components/ui/Banana";
import { CV_URL } from "@/data/fs";

export function Footer() {
  const os = useOS();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <footer id="contact" className="scroll-mt-24 px-3 pb-40 pt-10 md:pb-32">
      <Reveal className="mx-auto max-w-[1100px]">
        <div className="glass glass-thick relative overflow-hidden rounded-[40px] px-6 py-12 md:px-14 md:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: "var(--warm)" }} aria-hidden />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]">03 / Got something interesting?</p>
          <h2 className="relative mt-3 max-w-[14ch] font-display text-[clamp(40px,7vw,92px)] font-extrabold leading-[0.95] tracking-tight">
            Let's make something <span className="text-[var(--warm)]">real</span>.
          </h2>
          <p className="relative mt-5 max-w-[44ch] text-[17px] text-[var(--ink-2)]">A hard problem. A wild idea. A good team. That's usually where it starts.</p>
          <div className="relative mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => os.open("contact")} className="glass-tint press inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold">
              {PROFILE.email} <ArrowUpRight size={16} />
            </button>
            <button onClick={copy} className="glass glass-thin press inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-semibold" aria-live="polite">
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy email"}
            </button>
          </div>
          <p className="relative mt-6 flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} /> {PROFILE.availability}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 px-3 text-[13px] text-[var(--ink-2)]">
          <p className="flex items-center gap-2 font-semibold">
            <BananaMark size={18} className="text-[var(--ink)]" /> {PROFILE.name} <span className="font-normal text-[var(--ink-3)]">· built with intent, always a work in progress</span>
          </p>
          <nav className="flex gap-5" aria-label="Elsewhere">
            <a className="hover:text-[var(--ink)]" href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a className="hover:text-[var(--ink)]" href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a className="hover:text-[var(--ink)]" href={CV_URL} target="_blank" rel="noopener noreferrer">CV ↗</a>
            <button className="hover:text-[var(--ink)]" onClick={() => os.open("finder", { rootId: "ai-skills", nodeId: "ai-skills" })}>AI skills →</button>
          </nav>
        </div>
        <p className="mt-4 px-3 text-[11px] text-[var(--ink-3)]">Architecture photograph — Chris Johnson / Unsplash, used as a visual reference.</p>
      </Reveal>
    </footer>
  );
}
