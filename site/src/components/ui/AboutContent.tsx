import { PROFILE } from "@/data/profile";

export function AboutContent() {
  return (
    <div className="rounded-[22px] bg-[var(--surface)] p-6 md:p-9">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]">The person behind the products</p>
      <h2 className="mt-2 font-display text-[34px] font-bold leading-[1.05] tracking-tight md:text-[44px]">
        I used to build <span className="text-[var(--warm)]">buildings</span>.
      </h2>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]">Then</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{PROFILE.then}</p>
        </section>
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]">In between</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{PROFILE.between}</p>
        </section>
        <section className="md:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]">Now</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{PROFILE.nowText}</p>
        </section>
      </div>
      <ol className="mt-8 grid gap-3 md:grid-cols-3">
        {PROFILE.principles.map((p, i) => (
          <li key={p} className="rounded-[18px] bg-[var(--surface-2)] px-4 py-3.5">
            <span className="font-mono text-[11px] text-[var(--ink-3)]">0{i + 1}</span>
            <p className="mt-1 text-[14.5px] font-semibold leading-snug">{p}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
