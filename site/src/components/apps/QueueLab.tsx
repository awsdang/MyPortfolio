"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

type Msg = { id: number; attempt: number };
const MAX_PENDING = 240;

/** A browser demonstration of queueing and retries. No network calls or performance measurements. */
export function QueueLab() {
  const [pending, setPending] = useState<Msg[]>([]);
  const [delivered, setDelivered] = useState(0);
  const [retries, setRetries] = useState(0);
  const [flaky, setFlaky] = useState(false);
  const [active, setActive] = useState(false);
  const nextId = useRef(0);
  const flakyRef = useRef(false);
  flakyRef.current = flaky;

  useEffect(() => {
    if (!pending.length) {
      setActive(false);
      return;
    }
    const t = setTimeout(() => {
      if (document.hidden) return setPending((p) => [...p]);
      setActive(true);
      const batch = pending.slice(0, 3);
      const rest = pending.slice(3);
      let d = 0;
      let r = 0;
      const again: Msg[] = [];
      for (const m of batch) {
        if (flakyRef.current && m.id % 3 === 0 && m.attempt === 0) {
          again.push({ ...m, attempt: 1 });
          r++;
        } else d++;
      }
      setDelivered((v) => v + d);
      setRetries((v) => v + r);
      setPending([...rest, ...again]);
    }, 190);
    return () => clearTimeout(t);
  }, [pending]);

  const burst = () => {
    const size = Math.min(24, MAX_PENDING - pending.length);
    if (size <= 0) return;
    setPending((p) => [...p, ...Array.from({ length: size }, () => ({ id: nextId.current++, attempt: 0 }))]);
  };
  const reset = () => {
    setPending([]);
    setDelivered(0);
    setRetries(0);
    setFlaky(false);
    nextId.current = 0;
  };

  const stages = [
    { n: "Receive", name: "Message input", desc: "Add a batch to the queue.", on: pending.length > 0 },
    { n: "Wait", name: "Queue", desc: `${pending.length} messages waiting to be processed`, on: pending.length > 0 },
    { n: "Process", name: "Background worker", desc: "Process messages and retry failed attempts.", on: active },
    { n: "Send", name: "Demo provider", desc: flaky ? "Some first attempts fail." : "First attempts succeed.", on: active, warn: flaky },
  ];

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 pb-8 pt-6 md:px-7">
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Queue demonstration</p>
      <h1 className="mt-1.5 font-display text-[32px] font-bold leading-[1.05] tracking-tight md:text-[40px]">Follow a message from the queue to delivery.</h1>
      <p className="mt-2 max-w-[52ch] text-[16px] text-[var(--ink-2)]">Add a batch and watch the worker process it. Then turn on failures to see how a message returns to the queue for another attempt.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((s) => (
          <div
            key={s.name}
            className={cn(
              "rounded-[22px] bg-[var(--surface-2)] p-4 transition-all duration-300",
              s.on && "bg-[var(--sidebar-sel)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_40%,transparent)]",
              s.warn && "!bg-[color-mix(in_oklab,var(--warm)_18%,transparent)]",
            )}
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">{s.n}</p>
            <p className="mt-2 font-display text-[22px] font-bold leading-none tracking-tight">{s.name}</p>
            <p className="mt-1.5 text-[12.5px] text-[var(--ink-2)]">{s.desc}</p>
            {s.name === "Queue" && (
              <div className="mt-3 flex min-h-3 flex-wrap gap-1" aria-hidden>
                {Array.from({ length: Math.min(18, pending.length) }).map((_, k) => (
                  <i key={k} className="h-2 w-2 rounded-full bg-[var(--accent)]" style={{ animation: "pulse-dot 1s ease-in-out infinite", animationDelay: `${k * 40}ms` }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={burst} disabled={pending.length >= MAX_PENDING} className="glass-tint press rounded-full px-5 py-2.5 text-[14px] font-semibold disabled:opacity-50">
          Add a batch
        </button>
        <button
          onClick={() => setFlaky((f) => !f)}
          aria-pressed={flaky}
          className={cn("glass glass-thin press rounded-full px-5 py-2.5 text-[14px] font-semibold", flaky && "!bg-[color-mix(in_oklab,var(--warm)_28%,transparent)]")}
        >
          {flaky ? "Turn failures off" : "Simulate failures"}
        </button>
        <button onClick={reset} className="press inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-[13px] font-medium text-[var(--ink-2)] hover:bg-[var(--sidebar-sel)]">
          <RotateCcw size={14} /> Start over
        </button>
        <dl className="ml-auto flex gap-6" aria-live="off">
          <div>
            <dd className="font-display text-[26px] font-bold leading-none tabular-nums">{delivered}</dd>
            <dt className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">messages completed</dt>
          </div>
          <div>
            <dd className="font-display text-[26px] font-bold leading-none tabular-nums text-[var(--warm)]">{retries}</dd>
            <dt className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">attempts retried</dt>
          </div>
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4 text-[11.5px] text-[var(--ink-3)]">
        <span>This is a simulation. Each batch adds up to 24 messages. With failures enabled, every third message fails once and succeeds on the next attempt.</span>
        <a href={PROFILE.links.notifyx} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-[var(--accent)]">
          See the NotifyX source <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}
