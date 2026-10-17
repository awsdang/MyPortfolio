"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useOS } from "@/components/os/OSProvider";
import { FillNodeIcon } from "@/components/ui/Icons";
import { rootOf } from "@/data/fs";
import type { FsNode } from "@/data/types";

type Origin = { x: number; y: number; scale: number };

const noop = () => () => {};
/** false while rendering on the server and hydrating, true after: portals wait for it */
const useClient = () => useSyncExternalStore(noop, () => true, () => false);

/**
 * An iPhone folder: a frosted tile previewing the first nine apps. A tap opens
 * it over a blurred home screen, grown out of the tile; a tap outside (or Escape)
 * closes it again.
 */
export function PhoneFolder({ node }: { node: FsNode }) {
  const os = useOS();
  const tile = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const client = useClient();
  const kids = node.children ?? [];

  const open = () => {
    const r = tile.current!.getBoundingClientRect();
    const panel = Math.min(window.innerWidth - 48, 340);
    // the panel sits a little below the middle of the screen, under the folder's name
    setOrigin({ x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 - 25, scale: r.width / panel });
  };
  const close = useCallback(() => setOrigin(null), []);

  const launch = (n: FsNode) => {
    close();
    if (n.kind === "file" && n.file) os.openHref(n.file.href);
    else os.open("finder", { rootId: rootOf(n.id), nodeId: n.id });
  };

  return (
    <>
      <button ref={tile} onClick={open} className="group flex flex-col items-center gap-[3px] outline-offset-2" aria-label={`${node.name} folder, ${kids.length} items`} aria-haspopup="dialog">
        <span className="ios-folder grid aspect-square w-[var(--icon)] grid-cols-3 content-start gap-[6%] p-[13%] transition-transform duration-200 group-active:scale-90" aria-hidden>
          {kids.slice(0, 9).map((k) => (
            <span key={k.id} className="flex aspect-square">
              <FillNodeIcon node={k} />
            </span>
          ))}
        </span>
        <span className="phone-label">{node.name}</span>
      </button>
      {client &&
        createPortal(
          <AnimatePresence>{origin && <FolderOverlay key={node.id} node={node} origin={origin} onClose={close} onLaunch={launch} returnTo={tile} />}</AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function FolderOverlay({
  node,
  origin,
  onClose,
  onLaunch,
  returnTo,
}: {
  node: FsNode;
  origin: Origin;
  onClose: () => void;
  onLaunch: (n: FsNode) => void;
  returnTo: React.RefObject<HTMLButtonElement | null>;
}) {
  const still = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const back = returnTo.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prev;
      // back to the folder, unless something else (a window opened from it) took focus
      const at = document.activeElement;
      if (!at || at === document.body) back?.focus({ preventScroll: true });
    };
  }, [returnTo, onClose]);

  const spring = still ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.9 };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label={node.name}
      onClick={onClose}
    >
      <motion.div
        className="ios-folder-backdrop absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: still ? 0 : 0.28 }}
        aria-hidden
      />
      <motion.h2
        className="relative mb-5 w-full max-w-[340px] px-2 font-display text-[30px] font-bold leading-none tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.25)]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
        transition={spring}
      >
        {node.name}
      </motion.h2>
      <motion.div
        ref={panel}
        className="ios-folder-panel relative grid w-full max-w-[340px] grid-cols-3 gap-x-2 gap-y-5 rounded-[38px] px-4 py-6"
        initial={{ x: origin.x, y: origin.y, scale: origin.scale, opacity: 0.4 }}
        animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        exit={{ x: origin.x, y: origin.y, scale: origin.scale, opacity: 0 }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
      >
        {(node.children ?? []).map((k) => (
          <button key={k.id} onClick={() => onLaunch(k)} className="group flex min-w-0 flex-col items-center gap-1.5 outline-offset-2" aria-label={k.summary ? `${k.name}, ${k.summary}` : k.name}>
            <span className="flex aspect-square w-[60px] transition-transform duration-200 group-active:scale-90" aria-hidden>
              <FillNodeIcon node={k} />
            </span>
            <span className="phone-label">{k.name}</span>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
