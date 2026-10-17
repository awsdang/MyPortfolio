"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as RPE,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useOS, type WinState } from "./OSProvider";
import { clampRect, halfRect, menuBarBottom, zoomRect, MENUBAR_H, MIN_H, MIN_W, type Rect } from "@/lib/geometry";
import { cn } from "@/lib/cn";
import { FinderWindow } from "./FinderWindow";
import { TerminalWindow } from "./TerminalWindow";
import { AboutWindow } from "./AboutWindow";
import { AchievementsWindow } from "./AchievementsWindow";
import { ContactWindow } from "./ContactWindow";
import { BugWindow } from "./BugWindow";
import { BookingWindow } from "./BookingWindow";
import { SysInfoWindow } from "./SysInfoWindow";
import { PhotosWindow } from "./PhotosWindow";
import { CVWindow } from "./CVWindow";
import { SettingsWindow } from "./SettingsWindow";

type WinCtx = {
  win: WinState;
  focused: boolean;
  startDrag: (e: RPE) => void;
};
const WCtx = createContext<WinCtx | null>(null);
export const useWindow = () => {
  const c = useContext(WCtx);
  if (!c) throw new Error("useWindow outside Window");
  return c;
};

/* ───────────── Traffic lights ───────────── */
export function TrafficLights({ className }: { className?: string }) {
  const os = useOS();
  const { win } = useWindow();
  const stop = (e: RPE) => e.stopPropagation();
  return (
    <div className={cn("lights", className)} data-nodrag onPointerDown={stop}>
      <button className="light r" aria-label="Close window" onClick={() => os.close(win.id)}>
        <svg viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
        </svg>
      </button>
      <button className="light y" aria-label="Minimize to dock" onClick={() => os.minimize(win.id)}>
        <svg viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M1.2 4h5.6" />
        </svg>
      </button>
      <button
        className="light g"
        aria-label={win.zoomed ? "Restore window size" : "Expand window"}
        onClick={() => os.toggleZoom(win.id)}
      >
        <svg viewBox="0 0 8 8" fill="currentColor">
          {win.zoomed ? (
            <path d="M1 3.3h3.7V7L1 3.3zM7 4.7H3.3V1L7 4.7z" />
          ) : (
            <path d="M1.2 6.8V3.2l3.6 3.6H1.2zM6.8 1.2v3.6L3.2 1.2h3.6z" />
          )}
        </svg>
      </button>
    </div>
  );
}

/** Any element that should drag the window; double-click toggles zoom. */
export function DragRegion({ className, children }: { className?: string; children?: ReactNode }) {
  const { startDrag, win } = useWindow();
  const os = useOS();
  return (
    <div
      className={cn("select-none", className)}
      onPointerDown={startDrag}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest("button, a, input, [data-nodrag]")) return;
        if (!os.mobile) os.toggleZoom(win.id);
      }}
    >
      {children}
    </div>
  );
}

/** Plain titlebar used by terminal / about / contact windows. */
export function Titlebar({ title, right, className }: { title: string; right?: ReactNode; className?: string }) {
  const os = useOS();
  const { win } = useWindow();
  if (os.mobile) {
    return (
      <DragRegion className={cn("flex h-12 shrink-0 items-center justify-between px-3", className)}>
        <button
          data-nodrag
          onClick={() => os.close(win.id)}
          className="glass glass-thin press flex h-9 items-center gap-1 rounded-full pl-2 pr-3 text-[13px] font-medium"
          aria-label="Close"
        >
          <ChevronDown size={16} /> Close
        </button>
        <span className="truncate text-[13px] font-semibold text-[var(--ink-2)]">{title}</span>
        <span className="w-[72px]" data-nodrag>{right}</span>
      </DragRegion>
    );
  }
  return (
    <DragRegion className={cn("relative flex h-12 shrink-0 items-center px-4", className)}>
      <TrafficLights />
      <span className="pointer-events-none absolute inset-x-24 truncate text-center text-[13px] font-semibold text-[var(--ink-2)]">
        {title}
      </span>
      <div className="ml-auto" data-nodrag>{right}</div>
    </DragRegion>
  );
}

/* ───────────── Window ───────────── */
const DIRS = [
  { d: "n", cls: "left-3 right-3 top-0 h-1.5 cursor-ns-resize" },
  { d: "s", cls: "left-3 right-3 bottom-0 h-1.5 cursor-ns-resize" },
  { d: "w", cls: "top-3 bottom-3 left-0 w-1.5 cursor-ew-resize" },
  { d: "e", cls: "top-3 bottom-3 right-0 w-1.5 cursor-ew-resize" },
  { d: "nw", cls: "left-0 top-0 h-3 w-3 cursor-nwse-resize" },
  { d: "ne", cls: "right-0 top-0 h-3 w-3 cursor-nesw-resize" },
  { d: "sw", cls: "left-0 bottom-0 h-3 w-3 cursor-nesw-resize" },
  { d: "se", cls: "right-0 bottom-0 h-3 w-3 cursor-nwse-resize" },
];

function WindowView({
  win,
  onSnap,
}: {
  win: WinState;
  onSnap: (r: Rect | null) => void;
}) {
  const os = useOS();
  const ref = useRef<HTMLDivElement>(null);
  const focused = os.focusedId === win.id;
  const [target, setTarget] = useState({ x: 0, y: 0 });

  // land keyboard focus inside a newly opened window (the terminal focuses its own input)
  useEffect(() => {
    if (win.kind !== "terminal") ref.current?.focus({ preventScroll: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Aim the minimize animation at this window's thumbnail in the dock tray (the tray itself before it has rendered).
  useLayoutEffect(() => {
    if (!win.minimized || os.mobile) return;
    const tray = os.trayRef.current;
    const t = (tray?.querySelector<HTMLElement>(`[data-win="${CSS.escape(win.id)}"]`) ?? tray)?.getBoundingClientRect();
    if (!t) return;
    setTarget({
      x: t.left + t.width / 2 - (win.x + win.w / 2),
      y: t.top + t.height / 2 - (win.y + win.h / 2),
    });
  }, [win.minimized]); // eslint-disable-line react-hooks/exhaustive-deps

  const startDrag = useCallback(
    (e: RPE) => {
      if (os.mobile || e.button !== 0) return;
      if ((e.target as HTMLElement).closest("button, a, input, textarea, select, [data-nodrag]")) return;
      const el = ref.current;
      if (!el) return;
      const handle = e.currentTarget as HTMLElement;
      const start = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
      let cur: Rect = { x: win.x, y: win.y, w: win.w, h: win.h };
      let moved = false;
      let snap: "l" | "r" | "t" | null = null;
      try {
        handle.setPointerCapture(e.pointerId);
      } catch {}

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - start.px;
        const dy = ev.clientY - start.py;
        if (!moved) {
          if (Math.hypot(dx, dy) < 3) return;
          moved = true;
          document.body.classList.add("dragging");
          if (win.zoomed && win.restore) {
            // pull the window out of full size, keeping the pointer on the same relative spot
            const r = win.restore;
            const rel = (start.px - start.x) / start.w;
            start.w = r.w;
            start.h = r.h;
            start.x = start.px - rel * r.w;
            start.y = start.py - 22;
            os.setRect(win.id, { x: start.x, y: start.y, w: r.w, h: r.h }, { zoomed: false, restore: null });
          }
        }
        cur = clampRect({ x: start.x + dx, y: start.y + dy, w: start.w, h: start.h }, os.vw, os.vh);
        el.style.left = `${cur.x}px`;
        el.style.top = `${cur.y}px`;
        el.style.width = `${cur.w}px`;
        el.style.height = `${cur.h}px`;
        const next = ev.clientY <= MENUBAR_H + 2 ? "t" : ev.clientX <= 4 ? "l" : ev.clientX >= os.vw - 5 ? "r" : null;
        if (next !== snap) {
          snap = next;
          onSnap(next === "t" ? zoomRect(os.vw, os.vh, menuBarBottom()) : next === "l" ? halfRect("left", os.vw, os.vh) : next === "r" ? halfRect("right", os.vw, os.vh) : null);
        }
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        document.body.classList.remove("dragging");
        onSnap(null);
        if (!moved) return;
        if (snap === "t") os.toggleZoom(win.id);
        else if (snap === "l") os.setRect(win.id, halfRect("left", os.vw, os.vh), { zoomed: false, restore: { x: cur.x, y: cur.y, w: cur.w, h: cur.h }, animate: true });
        else if (snap === "r") os.setRect(win.id, halfRect("right", os.vw, os.vh), { zoomed: false, restore: { x: cur.x, y: cur.y, w: cur.w, h: cur.h }, animate: true });
        else os.setRect(win.id, cur);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    [os, win, onSnap],
  );

  const startResize = (dir: string) => (e: RPE) => {
    if (os.mobile) return;
    e.stopPropagation();
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const start = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
    let cur: Rect = { ...start };
    const minW = Math.min(MIN_W, os.vw - 16);
    const minH = Math.min(MIN_H, os.vh - MENUBAR_H - 16);
    document.body.classList.add("dragging");
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - start.px;
      const dy = ev.clientY - start.py;
      let { x, y, w, h } = start;
      if (dir.includes("e")) w = Math.min(Math.max(start.w + dx, minW), os.vw - start.x - 4);
      if (dir.includes("s")) h = Math.min(Math.max(start.h + dy, minH), os.vh - start.y - 4);
      if (dir.includes("w")) {
        const nw = Math.max(start.w - dx, minW);
        x = start.x + (start.w - nw);
        w = nw;
        if (x < 4) {
          w -= 4 - x;
          x = 4;
        }
      }
      if (dir.includes("n")) {
        const nh = Math.max(start.h - dy, minH);
        y = start.y + (start.h - nh);
        h = nh;
        if (y < MENUBAR_H) {
          h -= MENUBAR_H - y;
          y = MENUBAR_H;
        }
      }
      cur = { x, y, w, h };
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.body.classList.remove("dragging");
      os.setRect(win.id, cur, { zoomed: false, restore: null });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const mobileStyle = os.mobile
    ? // a sheet that stops just above the phone dock (--dock-h)
      { left: 8, right: 8, top: "max(12px, env(safe-area-inset-top))", bottom: "calc(var(--dock-h) + 8px)", width: "auto", height: "auto" }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  const hiddenOnMobile = os.mobile && !focused;

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={win.title}
      aria-hidden={win.minimized || undefined}
      inert={win.minimized}
      className={cn(
        "win glass glass-thick fixed flex flex-col outline-none",
        !focused && "inactive",
        win.zoomed && !os.mobile && "zoomed",
        win.animating && "animating",
      )}
      style={{
        ...mobileStyle,
        zIndex: win.z,
        pointerEvents: win.minimized || hiddenOnMobile ? "none" : "auto",
        visibility: hiddenOnMobile ? "hidden" : "visible",
      }}
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={
        win.minimized
          ? { opacity: 0, scale: 0.06, x: target.x, y: target.y }
          : { opacity: 1, scale: 1, x: 0, y: 0 }
      }
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.16 } }}
      transition={
        win.minimized
          ? { type: "tween", duration: 0.42, ease: [0.5, 0, 0.75, 0] }
          : { type: "spring", stiffness: 420, damping: 34, mass: 0.9 }
      }
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || win.kind === "terminal") return;
        const t = e.target as HTMLElement;
        if ((t.tagName === "INPUT" || t.tagName === "TEXTAREA") && (t as HTMLInputElement).value) return;
        e.stopPropagation();
        os.close(win.id);
      }}
      onPointerDownCapture={() => os.focus(win.id)}
      onTransitionEnd={(e) => {
        if (win.animating && e.propertyName === "height") os.animEnd(win.id);
      }}
    >
      <WCtx.Provider value={{ win, focused, startDrag }}>
        {win.kind === "finder" && <FinderWindow />}
        {win.kind === "terminal" && <TerminalWindow />}
        {win.kind === "about" && <AboutWindow />}
        {win.kind === "achievements" && <AchievementsWindow />}
        {win.kind === "contact" && <ContactWindow />}
        {win.kind === "bug" && <BugWindow />}
        {win.kind === "booking" && <BookingWindow />}
        {win.kind === "sysinfo" && <SysInfoWindow />}
        {win.kind === "photos" && <PhotosWindow />}
        {win.kind === "cv" && <CVWindow />}
        {win.kind === "settings" && <SettingsWindow />}
        {!os.mobile &&
          DIRS.map((r) => (
            <div key={r.d} className={cn("resize", r.cls)} onPointerDown={startResize(r.d)} aria-hidden />
          ))}
      </WCtx.Provider>
    </motion.div>
  );
}

export function WindowLayer() {
  const os = useOS();
  const [snap, setSnap] = useState<Rect | null>(null);
  return (
    <>
      <AnimatePresence>
        {snap && (
          <motion.div
            key="snap"
            className="glass glass-thin pointer-events-none fixed z-[5] rounded-[28px] !bg-[color-mix(in_oklab,var(--accent)_16%,transparent)]"
            style={{ left: snap.x, top: snap.y, width: snap.w, height: snap.h }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {os.wins.map((w) => (
          <WindowView key={w.id} win={w} onSnap={setSnap} />
        ))}
      </AnimatePresence>
    </>
  );
}
