"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useOS } from "./OSProvider";

export function QuickLook() {
  const os = useOS();
  const q = os.quickLook;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        os.closeQuickLook();
      } else if (e.key === "ArrowRight") os.stepQuickLook(1);
      else if (e.key === "ArrowLeft") os.stepQuickLook(-1);
    };
    window.addEventListener("keydown", onKey, true);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.documentElement.style.overflow = "";
      prev?.focus?.();
    };
  }, [!!q]); // eslint-disable-line react-hooks/exhaustive-deps

  const shot = q?.items[q.index];
  return (
    <AnimatePresence>
      {q && shot && (
        <motion.div
          key="ql"
          ref={ref}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Quick Look: ${shot.title}`}
          className="fixed inset-0 z-[400] grid place-items-center bg-black/45 p-4 outline-none backdrop-blur-xl md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={os.closeQuickLook}
        >
          <motion.figure
            key={shot.src}
            className="flex max-h-full max-w-full flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt={shot.title}
              draggable={false}
              className="max-h-[74vh] max-w-[92vw] rounded-[22px] object-contain shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
            />
            <figcaption className="glass glass-thin max-w-[min(640px,92vw)] rounded-[22px] px-5 py-3 text-center">
              <p className="text-[14px] font-semibold text-[var(--ink)]">{shot.title}</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--ink-2)]">{shot.caption}</p>
              {shot.source && <p className="mt-1 text-[11px] text-[var(--ink-3)]">{shot.source}</p>}
            </figcaption>
          </motion.figure>

          <button className="glass glass-thin press absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full" onClick={(e) => { e.stopPropagation(); os.closeQuickLook(); }} aria-label="Close">
            <X size={18} />
          </button>
          {q.items.length > 1 && (
            <>
              <button className="glass glass-thin press absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full" onClick={(e) => { e.stopPropagation(); os.stepQuickLook(-1); }} aria-label="Previous">
                <ChevronLeft size={20} />
              </button>
              <button className="glass glass-thin press absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full" onClick={(e) => { e.stopPropagation(); os.stepQuickLook(1); }} aria-label="Next">
                <ChevronRight size={20} />
              </button>
              <div className="glass glass-thin absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[12px] font-medium tabular-nums">
                {q.index + 1} / {q.items.length}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
