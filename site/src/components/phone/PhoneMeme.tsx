"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * What the minus badge does in edit mode: an iOS "Remove?" alert, and if the
 * visitor goes through with it, a meme. Nothing is ever deleted (the same rule
 * as the terminal's rm).
 */

const MEMES: { face: string; top: (n: string) => string; bottom: (n: string) => string }[] = [
  { face: "🤨", top: (n) => `Delete “${n}”?`, bottom: () => "In this economy?" },
  { face: "🧙", top: () => "One does not simply", bottom: () => "Delete a portfolio" },
  { face: "😎", top: () => "Want delete rights?", bottom: () => "Hire me and get the sudo" },
  { face: "🥲", top: () => "I spent years building this", bottom: () => "You tried to delete it in one tap" },
  { face: "🔥", top: () => "This is fine", bottom: () => "Nothing was deleted" },
  { face: "✅", top: () => "Task failed successfully", bottom: (n) => `“${n}” is still here` },
  { face: "🛑", top: (n) => `rm -rf ${n.toLowerCase().replace(/\s+/g, "-")}`, bottom: () => "Permission denied, nicely" },
];

const noop = () => () => {};

export function useDeleteJoke() {
  const [asking, setAsking] = useState<{ name: string; widget: boolean } | null>(null);
  const [meme, setMeme] = useState<{ name: string; i: number } | null>(null);
  const ask = (name: string, widget = false) => setAsking({ name, widget });
  const go = () => {
    if (!asking) return;
    setMeme((m) => {
      // never the same meme twice in a row
      let i = Math.floor(Math.random() * MEMES.length);
      if (m && i === m.i) i = (i + 1) % MEMES.length;
      return { name: asking.name, i };
    });
    setAsking(null);
  };
  const ui = <DeleteJoke asking={asking} meme={meme} onCancel={() => setAsking(null)} onDelete={go} onDone={() => setMeme(null)} />;
  return { ask, ui };
}

function DeleteJoke({
  asking,
  meme,
  onCancel,
  onDelete,
  onDone,
}: {
  asking: { name: string; widget: boolean } | null;
  meme: { name: string; i: number } | null;
  onCancel: () => void;
  onDelete: () => void;
  onDone: () => void;
}) {
  const still = useReducedMotion();
  const client = useSyncExternalStore(noop, () => true, () => false); // portals wait for hydration
  const pop = still ? { duration: 0 } : { type: "spring" as const, stiffness: 460, damping: 30 };
  if (!client) return null;
  const m = meme && MEMES[meme.i];
  return createPortal(
    <AnimatePresence>
      {asking && (
        <motion.div key="ask" className="fixed inset-0 z-[600] grid place-items-center bg-black/25 px-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={`Remove ${asking.name}?`}
            className="ios-alert w-full max-w-[270px] overflow-hidden rounded-[14px] text-center"
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={pop}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pb-4 pt-5">
              <p className="text-[17px] font-semibold leading-snug">Remove “{asking.name}”?</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--ink-2)]">
                {asking.widget ? "This widget will be removed from your Home Screen." : "Removing it from the Home Screen keeps it in the App Library."}
              </p>
            </div>
            {asking.widget ? (
              <>
                <button autoFocus onClick={onDelete} className="ios-alert-btn text-[#ff3b30]">Remove Widget</button>
                <button onClick={onCancel} className="ios-alert-btn font-semibold text-[#0a84ff]">Cancel</button>
              </>
            ) : (
              <>
                <button autoFocus onClick={onDelete} className="ios-alert-btn text-[#ff3b30]">Delete App</button>
                <button onClick={onDelete} className="ios-alert-btn text-[#0a84ff]">Remove from Home Screen</button>
                <button onClick={onCancel} className="ios-alert-btn font-semibold text-[#0a84ff]">Cancel</button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
      {meme && m && (
        <motion.div key="meme" className="fixed inset-0 z-[600] grid place-items-center bg-black/45 px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onDone}>
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={`${m.top(meme.name)} ${m.bottom(meme.name)}`}
            className="w-full max-w-[320px]"
            initial={{ scale: 0.6, rotate: -6, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={pop}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="meme relative aspect-square overflow-hidden rounded-[18px]">
              <span className="absolute inset-0 grid place-items-center text-[120px] leading-none" aria-hidden>
                {m.face}
              </span>
              <p className="meme-text absolute inset-x-3 top-3">{m.top(meme.name)}</p>
              <p className="meme-text absolute inset-x-3 bottom-3">{m.bottom(meme.name)}</p>
            </div>
            <p className="mt-3 text-center text-[13px] font-medium text-white/80">Nothing was deleted. Your Home Screen is safe.</p>
            <button autoFocus onClick={onDone} className="glass press mx-auto mt-3 block rounded-full px-6 py-2.5 text-[15px] font-semibold text-white">
              Fine, keep it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
