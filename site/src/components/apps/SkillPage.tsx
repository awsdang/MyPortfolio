"use client";

import { Download, Mail } from "lucide-react";
import { useOS } from "@/components/os/OSProvider";
import { AppTile } from "@/components/ui/Icons";
import { skillById } from "@/data/skills";

/** One AI skill: what it does, and a direct ZIP download. */
export function SkillPage({ id }: { id?: string }) {
  const os = useOS();
  const k = skillById(id);
  if (!k) return null;
  return (
    <article className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-6 md:px-7">
      <header className="flex flex-col gap-5 md:flex-row md:items-center">
        <AppTile glyph={k.glyph} size={84} />
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">
            <span>{k.category}</span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 normal-case tracking-normal text-emerald-700 dark:text-emerald-300">{k.mine ? "Written by me" : "By other authors"}</span>
          </div>
          <h1 className="font-display text-[32px] font-bold leading-[1.05] tracking-tight md:text-[40px]">{k.name}</h1>
        </div>
      </header>

      <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-[var(--ink-2)]">{k.description}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {k.tags.map((t) => (
          <span key={t} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[12.5px] font-medium">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a href={k.file} download className="glass-tint press inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold">
          <Download size={16} /> Download ZIP
        </a>
        <span className="text-[12.5px] text-[var(--ink-3)]">No account needed</span>
      </div>

      {k.extra && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-[var(--surface-2)] p-4">
          <p className="max-w-[46ch] text-[14px] leading-relaxed text-[var(--ink-2)]">{k.extra}</p>
          <button onClick={() => os.open("contact")} className="glass glass-thin press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold">
            <Mail size={14} /> Ask about the full edition
          </button>
        </div>
      )}

      <section className="mt-8 rounded-[20px] border border-[var(--hairline)] p-5">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Try it in your project</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Download and extract the ZIP into the skills folder your AI tool uses, then mention the skill by name in your task. Read the instructions first so you know what context you're giving it, and review what it produces for your project.
        </p>
      </section>
    </article>
  );
}
