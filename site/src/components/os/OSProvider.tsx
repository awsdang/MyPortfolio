"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { clampRect, menuBarBottom, zoomRect, type Rect } from "@/lib/geometry";
import type { Shot } from "@/data/types";
import { CV_URL } from "@/data/fs";

export type WinKind = "finder" | "terminal" | "about" | "achievements" | "contact" | "bug" | "booking" | "sysinfo" | "photos" | "cv";

export interface WinState extends Rect {
  id: string;
  kind: WinKind;
  title: string;
  z: number;
  zoomed: boolean;
  minimized: boolean;
  restore?: Rect;
  /** Finder: node to show. Achievements: item or section to jump to. Bumping navTick re-navigates an open window. */
  nodeId?: string;
  navTick: number;
  animating: boolean;
}

type Action =
  | { type: "open"; win: WinState }
  | { type: "close"; id: string }
  | { type: "focus"; id: string }
  | { type: "minimize"; id: string }
  | { type: "restore"; id: string }
  | { type: "rect"; id: string; rect: Rect; zoomed?: boolean; restore?: Rect | null; animate?: boolean }
  | { type: "animEnd"; id: string }
  | { type: "nav"; id: string; nodeId: string }
  | { type: "title"; id: string; title: string }
  | { type: "reclamp"; vw: number; vh: number }
  | { type: "minimizeAll" }
  | { type: "restoreAll" }
  | { type: "closeAll" };

interface State {
  wins: WinState[];
  zTop: number;
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "open": {
      if (s.wins.some((w) => w.id === a.win.id)) return s;
      return { wins: [...s.wins, { ...a.win, z: s.zTop + 1 }], zTop: s.zTop + 1 };
    }
    case "close":
      return { ...s, wins: s.wins.filter((w) => w.id !== a.id) };
    case "focus": {
      const top = s.wins.reduce((m, w) => Math.max(m, w.z), 0);
      const cur = s.wins.find((w) => w.id === a.id);
      if (!cur || cur.z === top) return s;
      return { wins: s.wins.map((w) => (w.id === a.id ? { ...w, z: s.zTop + 1 } : w)), zTop: s.zTop + 1 };
    }
    case "minimize":
      return { ...s, wins: s.wins.map((w) => (w.id === a.id ? { ...w, minimized: true } : w)) };
    case "restore":
      return {
        wins: s.wins.map((w) => (w.id === a.id ? { ...w, minimized: false, z: s.zTop + 1 } : w)),
        zTop: s.zTop + 1,
      };
    case "rect":
      return {
        ...s,
        wins: s.wins.map((w) =>
          w.id === a.id
            ? {
                ...w,
                ...a.rect,
                zoomed: a.zoomed ?? w.zoomed,
                restore: a.restore === null ? undefined : (a.restore ?? w.restore),
                animating: !!a.animate,
              }
            : w,
        ),
      };
    case "animEnd":
      return { ...s, wins: s.wins.map((w) => (w.id === a.id ? { ...w, animating: false } : w)) };
    case "nav":
      return {
        wins: s.wins.map((w) => (w.id === a.id ? { ...w, nodeId: a.nodeId, navTick: w.navTick + 1 } : w)),
        zTop: s.zTop + 1,
      };
    case "title":
      return { ...s, wins: s.wins.map((w) => (w.id === a.id ? { ...w, title: a.title } : w)) };
    case "minimizeAll":
      return { ...s, wins: s.wins.map((w) => ({ ...w, minimized: true })) };
    case "restoreAll":
      return { ...s, wins: s.wins.map((w) => ({ ...w, minimized: false })) };
    case "closeAll":
      return { ...s, wins: [] };
    case "reclamp":
      return {
        ...s,
        wins: s.wins.map((w) =>
          w.zoomed ? { ...w, ...zoomRect(a.vw, a.vh, w.y) } : { ...w, ...clampRect(w, a.vw, a.vh) },
        ),
      };
  }
}

const DEFAULT_SIZE: Record<WinKind, { w: number; h: number; title: string }> = {
  finder: { w: 920, h: 600, title: "Finder" },
  terminal: { w: 700, h: 470, title: "aws-ai, zsh" },
  about: { w: 1000, h: 680, title: "About me" },
  achievements: { w: 1080, h: 720, title: "Achievements" },
  contact: { w: 620, h: 580, title: "Write to Aws" },
  bug: { w: 580, h: 560, title: "Report a bug" },
  booking: { w: 680, h: 720, title: "Schedule a conversation" },
  sysinfo: { w: 420, h: 560, title: "About this portfolio" },
  photos: { w: 640, h: 480, title: "Photos" },
  cv: { w: 780, h: 980, title: "Aws_Abdulfattah_CV.pdf" },
};

/** Shared links, including redirects from the earlier static portfolio. */
const HASH_WINDOWS: Record<string, WinKind> = { "#about": "about", "#cv": "cv", "#contact": "contact", "#ai-skills": "finder" };

export interface OpenOpts {
  nodeId?: string;
  rootId?: string;
  title?: string;
}

interface QuickLook {
  items: Shot[];
  index: number;
}

export type Toast = { id: number; title: string; body?: string };

interface OSContext {
  wins: WinState[];
  focusedId: string | null;
  mobile: boolean;
  /** a full-size window is on screen: the dock hides and the page stops scrolling */
  fullSize: boolean;
  vw: number;
  vh: number;
  open: (kind: WinKind, opts?: OpenOpts) => string;
  /** Opens a file link: the CV in its own window, mailto in the mail app, anything else in a new tab. */
  openHref: (href: string) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  toggleZoom: (id: string) => void;
  setRect: (id: string, rect: Rect, extra?: { zoomed?: boolean; restore?: Rect | null; animate?: boolean }) => void;
  animEnd: (id: string) => void;
  setTitle: (id: string, title: string) => void;
  trayRef: RefObject<HTMLElement | null>;
  quickLook: QuickLook | null;
  openQuickLook: (items: Shot[], index: number) => void;
  stepQuickLook: (d: number) => void;
  closeQuickLook: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  spotlight: boolean;
  setSpotlight: (v: boolean) => void;
  minimizeAll: () => void;
  restoreAll: () => void;
  closeAll: () => void;
  /** bump to put every desktop widget back where it started */
  desktopKey: number;
  resetDesktop: () => void;
  toast: Toast | null;
  notify: (t: Omit<Toast, "id">) => void;
}

const Ctx = createContext<OSContext | null>(null);

export function useOS() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useOS outside OSProvider");
  return c;
}

function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
function useViewport() {
  const w = useSyncExternalStore(subscribeResize, () => window.innerWidth, () => 1280);
  const h = useSyncExternalStore(subscribeResize, () => window.innerHeight, () => 800);
  return { vw: w, vh: h };
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { wins: [], zTop: 100 });
  const { vw, vh } = useViewport();
  const mobile = vw < 768;
  const trayRef = useRef<HTMLElement | null>(null);
  const cascade = useRef(0);
  const lastFocus = useRef<HTMLElement | null>(null);

  const [quickLook, setQuickLook] = useState<QuickLook | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [spotlight, setSpotlight] = useState(false);
  const [desktopKey, setDesktopKey] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((t: Omit<Toast, "id">) => {
    setToast({ ...t, id: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);
  const resetDesktop = useCallback(() => setDesktopKey((k) => k + 1), []);
  const minimizeAll = useCallback(() => dispatch({ type: "minimizeAll" }), []);
  const restoreAll = useCallback(() => dispatch({ type: "restoreAll" }), []);
  const closeAll = useCallback(() => dispatch({ type: "closeAll" }), []);

  // theme: the inline script in <head> already set data-theme before paint
  useEffect(() => {
    const t = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(t);
    // SVG-lens refraction in backdrop-filter only works on Chromium; Safari/Firefox keep the plain blur.
    const brands = (navigator as unknown as { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
    const isChromium = !!brands?.some((b) => /Chromium/.test(b.brand));
    if (isChromium) document.documentElement.classList.add("refract");
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const n = t === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = n;
      try {
        localStorage.setItem("theme", n);
      } catch {}
      return n;
    });
  }, []);

  // keep windows reachable on resize
  useEffect(() => {
    dispatch({ type: "reclamp", vw, vh });
  }, [vw, vh]);

  const stateRef = useRef(state);
  stateRef.current = state;

  const open = useCallback(
    (kind: WinKind, opts: OpenOpts = {}) => {
      const id = kind === "finder" ? `finder:${opts.rootId ?? "root"}` : kind;
      const existing = stateRef.current.wins.find((w) => w.id === id);
      lastFocus.current = (document.activeElement as HTMLElement) ?? null;
      if (existing) {
        if (existing.minimized) dispatch({ type: "restore", id });
        else dispatch({ type: "focus", id });
        if ((kind === "finder" || kind === "achievements") && opts.nodeId) dispatch({ type: "nav", id, nodeId: opts.nodeId });
        return id;
      }
      const d = DEFAULT_SIZE[kind];
      const w = Math.min(d.w, vw - 24);
      const h = Math.min(d.h, vh - 150);
      const n = cascade.current++ % 6;
      const base = clampRect(
        {
          x: Math.min(Math.max(Math.round((vw - w) / 2) + (n - 2) * 30, 8), Math.max(8, vw - w - 8)),
          y: Math.max(48, Math.round((vh - h) / 2) - 40) + n * 26,
          w,
          h,
        },
        vw,
        vh,
      );
      dispatch({
        type: "open",
        win: {
          id,
          kind,
          title: opts.title ?? d.title,
          ...base,
          z: 0,
          zoomed: false,
          minimized: false,
          nodeId: opts.nodeId,
          navTick: 0,
          animating: false,
        },
      });
      return id;
    },
    [vw, vh],
  );

  const openHref = useCallback(
    (href: string) => {
      if (href === CV_URL) open("cv");
      else if (href.startsWith("mailto:")) window.location.href = href;
      else window.open(href, "_blank", "noopener,noreferrer");
    },
    [open],
  );

  // About is a window, not a page section: old /#about links open it, and /#cv opens the CV
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const onHash = () => {
      const kind = HASH_WINDOWS[window.location.hash];
      if (!kind) return;
      openRef.current(kind, kind === "finder" ? { nodeId: "ai-skills" } : undefined);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const close = useCallback((id: string) => {
    dispatch({ type: "close", id });
    const el = lastFocus.current;
    if (el && document.contains(el)) requestAnimationFrame(() => el.focus?.());
  }, []);
  const focus = useCallback((id: string) => dispatch({ type: "focus", id }), []);
  const minimize = useCallback((id: string) => dispatch({ type: "minimize", id }), []);
  const restore = useCallback((id: string) => dispatch({ type: "restore", id }), []);
  const setRect = useCallback<OSContext["setRect"]>((id, rect, extra) => dispatch({ type: "rect", id, rect, ...extra }), []);
  const animEnd = useCallback((id: string) => dispatch({ type: "animEnd", id }), []);
  const setTitle = useCallback((id: string, title: string) => dispatch({ type: "title", id, title }), []);

  const toggleZoom = useCallback(
    (id: string) => {
      const w = stateRef.current.wins.find((x) => x.id === id);
      if (!w) return;
      if (w.zoomed && w.restore) {
        dispatch({ type: "rect", id, rect: clampRect(w.restore, vw, vh), zoomed: false, restore: null, animate: true });
      } else {
        dispatch({
          type: "rect",
          id,
          rect: zoomRect(vw, vh, menuBarBottom()),
          zoomed: true,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          animate: true,
        });
      }
      dispatch({ type: "focus", id });
    },
    [vw, vh],
  );

  const openQuickLook = useCallback((items: Shot[], index: number) => setQuickLook({ items, index }), []);
  const stepQuickLook = useCallback(
    (d: number) =>
      setQuickLook((q) => (q ? { ...q, index: (q.index + d + q.items.length) % q.items.length } : q)),
    [],
  );
  const closeQuickLook = useCallback(() => setQuickLook(null), []);

  const fullSize = !mobile && state.wins.some((w) => w.zoomed && !w.minimized);
  useEffect(() => {
    document.documentElement.toggleAttribute("data-full-size", fullSize);
  }, [fullSize]);

  const focusedId = useMemo(() => {
    const vis = state.wins.filter((w) => !w.minimized);
    if (!vis.length) return null;
    return vis.reduce((a, b) => (b.z > a.z ? b : a)).id;
  }, [state.wins]);

  // global keys: Cmd/Ctrl+W closes focused, Cmd/Ctrl+K opens Spotlight
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpotlight((v) => !v);
      } else if (mod && e.key.toLowerCase() === "w" && focusedId) {
        // Browsers reserve Cmd+W; this only fires where the page gets it (e.g. PWA / Ctrl+W on some setups).
        e.preventDefault();
        close(focusedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedId, close]);

  const value = useMemo<OSContext>(
    () => ({
      wins: state.wins,
      focusedId,
      mobile,
      fullSize,
      vw,
      vh,
      open,
      openHref,
      close,
      focus,
      minimize,
      restore,
      toggleZoom,
      setRect,
      animEnd,
      setTitle,
      trayRef,
      quickLook,
      openQuickLook,
      stepQuickLook,
      closeQuickLook,
      theme,
      toggleTheme,
      spotlight,
      setSpotlight,
      minimizeAll,
      restoreAll,
      closeAll,
      desktopKey,
      resetDesktop,
      toast,
      notify,
    }),
    [state.wins, focusedId, mobile, fullSize, vw, vh, open, openHref, close, focus, minimize, restore, toggleZoom, setRect, animEnd, setTitle, quickLook, openQuickLook, stepQuickLook, closeQuickLook, theme, toggleTheme, spotlight, minimizeAll, restoreAll, closeAll, desktopKey, resetDesktop, toast, notify],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
