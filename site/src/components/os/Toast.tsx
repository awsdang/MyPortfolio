"use client";

import { AnimatePresence, motion } from "motion/react";
import { useOS } from "./OSProvider";
import { BananaMark } from "@/components/ui/Banana";

/** macOS-style notification banner, top-right. */
export function Toast() {
  const { toast } = useOS();
  return (
    <div className="pointer-events-none fixed right-3 top-[38px] z-[650] w-[min(340px,calc(100vw-24px))]" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="glass glass-thick flex gap-3 rounded-[20px] p-3.5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[var(--surface)]"><BananaMark size={20} /></span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">{toast.title}</span>
              {toast.body && <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--ink-2)]">{toast.body}</span>}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
