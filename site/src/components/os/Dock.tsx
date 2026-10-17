"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { Bug } from "lucide-react";
import { useOS, type WinKind, type WinState } from "./OSProvider";
import { cn } from "@/lib/cn";
import { MacIcon, type MacIconName } from "@/components/ui/MacIcon";
import { PhoneDock } from "@/components/phone/PhoneDock";

const PEAK = 74;
const RANGE = 130;

type Item = {
  id: string;
  label: string;
  win?: WinKind;
  href?: string;
  /** opens in a new tab */
  ext?: string;
  /** Finder window to open: [rootId, nodeId] */
  folder?: [string, string];
  icon: MacIconName;
};

const MAIN: Item[] = [
  { id: "home", label: "Home", href: "/", icon: "home" },
  { id: "explorer", label: "Explore my work", folder: ["root", "root"], icon: "finder" },
  { id: "achievements", label: "Achievements", win: "achievements", icon: "trophy" },
  { id: "about", label: "About me", win: "about", icon: "about" },
  { id: "book", label: "Schedule a conversation", win: "booking", icon: "calendar" },
];

const TOOLS: Item[] = [{ id: "terminal", label: "Terminal", win: "terminal", icon: "terminal" }];

const BIN_ITEM: Item = { id: "bin", label: "Bin", folder: ["bin", "bin"], icon: "binFull" };

const KIND_ICON: Record<WinKind, MacIconName> = { finder: "finder", terminal: "terminal", about: "notes", achievements: "trophy", contact: "mail", bug: "tile", booking: "calendar", sysinfo: "tile", photos: "photos", cv: "docs", settings: "settings" };

/** The app icon for a window kind. */
function KindIcon({ kind, date }: { kind: WinKind; date: Date | null }) {
  return (
    <MacIcon name={KIND_ICON[kind]} date={date}>
      {kind === "sysinfo" && (
        <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 7.6v.2" />
        </svg>
      )}
      {kind === "bug" && <Bug className="h-[56%] w-[56%]" strokeWidth={2.1} />}
    </MacIcon>
  );
}

/** Rough content of each window kind, drawn inside the thumbnail body (x 3..97, y 28..81). */
const SKETCH: Record<WinKind, ReactNode> = {
  finder: (
    <>
      <rect x="3" y="28" width="26" height="53" fill="var(--surface-2)" />
      <rect x="8" y="35" width="15" height="3" rx="1.5" />
      <rect x="8" y="42" width="12" height="3" rx="1.5" />
      <rect x="8" y="49" width="14" height="3" rx="1.5" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={37 + i * 20} y="37" width="14" height="11" rx="2.5" fill="#86b6f2" />
      ))}
      {[0, 1].map((i) => (
        <rect key={i} x={37 + i * 20} y="58" width="14" height="11" rx="2.5" fill="#86b6f2" />
      ))}
    </>
  ),
  terminal: (
    <>
      <rect x="10" y="35" width="7" height="3" rx="1.5" fill="#34d399" />
      <rect x="20" y="35" width="28" height="3" rx="1.5" />
      <rect x="10" y="43" width="46" height="3" rx="1.5" opacity=".7" />
      <rect x="10" y="51" width="32" height="3" rx="1.5" opacity=".7" />
      <rect x="10" y="59" width="7" height="3" rx="1.5" fill="#34d399" />
      <rect x="20" y="58" width="2.5" height="5" fill="#34d399" />
    </>
  ),
  about: (
    <>
      <rect x="12" y="36" width="40" height="4" rx="2" opacity=".9" />
      <rect x="12" y="46" width="76" height="3" rx="1.5" />
      <rect x="12" y="53" width="70" height="3" rx="1.5" />
      <rect x="12" y="60" width="74" height="3" rx="1.5" />
      <rect x="12" y="67" width="48" height="3" rx="1.5" />
    </>
  ),
  achievements: (
    <>
      <rect x="3" y="28" width="22" height="53" fill="var(--surface-2)" />
      <rect x="31" y="34" width="34" height="4" rx="2" opacity=".9" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={31 + i * 10} y="44" width="10" height="2.5" opacity={i % 2 ? 0.25 : 0.8} />
      ))}
      <circle cx="44" cy="41" r="1.6" fill="var(--warm)" />
      <circle cx="58" cy="41" r="1.6" fill="var(--accent)" />
      {[0, 1].map((i) => (
        <rect key={i} x={31 + i * 31} y="52" width="27" height="22" rx="3" fill="var(--surface-2)" />
      ))}
      <rect x="37" y="61" width="15" height="11" rx="1" fill="#fff" stroke="var(--hairline)" strokeWidth=".6" transform="rotate(-6 44 66)" />
      <rect x="68" y="61" width="15" height="11" rx="1" fill="#fff" stroke="var(--hairline)" strokeWidth=".6" transform="rotate(5 75 66)" />
    </>
  ),
  contact: (
    <>
      <rect x="10" y="35" width="10" height="3" rx="1.5" opacity=".6" />
      <rect x="24" y="34.5" width="30" height="4" rx="2" fill="var(--accent)" opacity=".8" />
      <rect x="3" y="42" width="94" height="1" fill="var(--hairline)" />
      <rect x="10" y="46" width="14" height="3" rx="1.5" opacity=".6" />
      <rect x="28" y="46" width="40" height="3" rx="1.5" />
      <rect x="3" y="53" width="94" height="1" fill="var(--hairline)" />
      <rect x="10" y="59" width="60" height="3" rx="1.5" />
      <rect x="10" y="66" width="44" height="3" rx="1.5" />
    </>
  ),
  bug: (
    <>
      <rect x="10" y="35" width="70" height="3" rx="1.5" />
      <rect x="10" y="42" width="52" height="3" rx="1.5" />
      <rect x="3" y="52" width="94" height="1" fill="var(--hairline)" />
      <rect x="10" y="57" width="14" height="3" rx="1.5" opacity=".6" />
      <rect x="28" y="57" width="36" height="3" rx="1.5" opacity=".6" />
      <rect x="3" y="64" width="94" height="1" fill="var(--hairline)" />
      <rect x="10" y="69" width="18" height="3" rx="1.5" opacity=".6" />
      <rect x="32" y="69" width="44" height="3" rx="1.5" fill="var(--accent)" opacity=".7" />
    </>
  ),
  booking: (
    <>
      <rect x="10" y="34" width="26" height="3" rx="1.5" />
      {Array.from({ length: 21 }).map((_, i) => (
        <rect
          key={i}
          x={10 + (i % 7) * 11.5}
          y={42 + Math.floor(i / 7) * 10}
          width="7.5"
          height="6.5"
          rx="1.5"
          fill={i === 9 ? "var(--accent)" : undefined}
          opacity={i === 9 ? 0.9 : 0.35}
        />
      ))}
    </>
  ),
  photos: (
    <>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={10 + (i % 4) * 21} y={34 + Math.floor(i / 4) * 21} width="17" height="17" rx="3" fill={i ? undefined : "#86b6f2"} opacity={i ? 0.3 : 0.9} />
      ))}
    </>
  ),
  cv: (
    <>
      <rect x="3" y="28" width="94" height="53" fill="var(--surface-2)" />
      <rect x="31" y="32" width="38" height="54" rx="1.5" fill="#fff" stroke="var(--hairline)" strokeWidth=".6" />
      <rect x="36" y="38" width="18" height="3" rx="1.5" opacity=".9" />
      <rect x="36" y="45" width="28" height="2" rx="1" opacity=".45" />
      <rect x="36" y="50" width="25" height="2" rx="1" opacity=".45" />
      <rect x="36" y="55" width="27" height="2" rx="1" opacity=".45" />
      <rect x="36" y="62" width="14" height="2.5" rx="1.25" fill="var(--accent)" opacity=".7" />
      <rect x="36" y="68" width="28" height="2" rx="1" opacity=".45" />
      <rect x="36" y="73" width="22" height="2" rx="1" opacity=".45" />
    </>
  ),
  settings: (
    <>
      <rect x="10" y="34" width="34" height="4" rx="2" opacity=".9" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="10" y={44 + i * 9} width="80" height="6" rx="2" fill="var(--surface-2)" />
      ))}
    </>
  ),
  sysinfo: (
    <>
      <circle cx="50" cy="46" r="10" opacity=".5" />
      <rect x="30" y="61" width="40" height="3.5" rx="1.75" />
      <rect x="36" y="69" width="28" height="3" rx="1.5" opacity=".6" />
    </>
  ),
};

/** A window in the dock, macOS style: a miniature of the window with the app icon badged at the bottom right. Dimmed while minimized. */
function WindowThumb({ kind, date, dim }: { kind: WinKind; date: Date | null; dim?: boolean }) {
  const uid = useId();
  const clip = `dock-thumb-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const dark = kind === "terminal";
  const frame = dark ? "#171a26" : "var(--surface)";
  const edge = dark ? "rgba(255,255,255,.16)" : "var(--hairline)";
  const bar = dark ? "rgba(255,255,255,.34)" : "var(--ink-3)";
  return (
    <span className={cn("relative block h-full w-full transition-opacity duration-300", dim && "opacity-55")} aria-hidden>
      <svg
        viewBox="0 0 100 100"
        className="block h-full w-full"
        style={{ overflow: "visible", filter: "drop-shadow(0 1px 1.5px rgba(10,16,34,.28)) drop-shadow(0 6px 10px rgba(10,16,34,.16))" }}
      >
        <defs>
          <clipPath id={clip}>
            <rect x="3" y="9" width="94" height="72" rx="11" />
          </clipPath>
        </defs>
        <rect x="3" y="9" width="94" height="72" rx="11" fill={frame} />
        <g clipPath={`url(#${clip})`}>
          <rect x="3" y="9" width="94" height="19" fill={dark ? "rgba(255,255,255,.05)" : "var(--surface-2)"} />
          <rect x="3" y="27.5" width="94" height="1" fill={edge} />
          <circle cx="13" cy="18.5" r="3.2" fill="#ff5f57" />
          <circle cx="22.5" cy="18.5" r="3.2" fill="#febc2e" />
          <circle cx="32" cy="18.5" r="3.2" fill="#28c840" />
          <g fill={bar}>{SKETCH[kind]}</g>
        </g>
        <rect x="3.5" y="9.5" width="93" height="71" rx="10.5" fill="none" stroke={edge} strokeWidth="1" />
      </svg>
      <span className="absolute -bottom-[3%] -right-[3%] h-[48%] w-[48%]">
        <KindIcon kind={kind} date={date} />
      </span>
    </span>
  );
}

function DockTile({
  label,
  ariaLabel,
  mouseX,
  active,
  onPress,
  onHover,
  rest,
  enter,
  winId,
  className,
  children,
}: {
  label: string;
  ariaLabel?: string;
  rest: number;
  mouseX: MotionValue<number>;
  /** running indicator dot */
  active: boolean;
  onPress: () => void;
  onHover: (label: string | null, el: HTMLElement | null) => void;
  /** pop in on mount, after this many seconds */
  enter?: number;
  /** the window this tile stands for (the minimize animation aims at it) */
  winId?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const dist = useTransform(mouseX, (v) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? v - (r.left + r.width / 2) : Infinity;
  });
  const raw = useTransform(dist, [-RANGE, 0, RANGE], [rest, Math.max(PEAK, rest), rest]);
  const size = useSpring(raw, { mass: 0.1, stiffness: 190, damping: 14 });

  return (
    <motion.div
      className={cn("flex flex-col items-center", className)}
      initial={enter === undefined ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: enter ?? 0, type: "spring", stiffness: 420, damping: 24 }}
    >
      <motion.button
        ref={ref}
        style={{ width: size, height: size }}
        className="press block"
        data-win={winId}
        onClick={onPress}
        onFocus={(e) => onHover(label, e.currentTarget)}
        onBlur={() => onHover(null, null)}
        onMouseEnter={(e) => onHover(label, e.currentTarget)}
        onMouseLeave={() => onHover(null, null)}
        aria-label={ariaLabel ?? label}
      >
        {children}
      </motion.button>
      <span className={cn("mt-1 h-1 w-1 rounded-full bg-[var(--ink-2)] transition-opacity", active ? "opacity-70" : "opacity-0")} aria-hidden />
    </motion.div>
  );
}

export function Dock({ mode }: { mode: "hero" | "fixed" }) {
  const os = useOS();
  const router = useRouter();
  const path = usePathname();
  const mouseX = useMotionValue(Infinity);
  const rest = 50;
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
    const t = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const [tip, setTip] = useState<{ label: string; x: number; below: boolean } | null>(null);
  // a full-size window owns the screen: the dock steps aside (fade only, so the minimize animation still finds the tray)
  const away = os.fullSize;
  useEffect(() => {
    if (away) setTip(null);
  }, [away]);

  const onHover = (label: string | null, el: HTMLElement | null) => {
    if (!label || !el) return setTip(null);
    const r = el.getBoundingClientRect();
    setTip({ label, x: r.left + r.width / 2, below: r.top < window.innerHeight / 2 });
  };

  const press = (item: Item) => {
    if (item.folder) {
      os.open("finder", { rootId: item.folder[0], nodeId: item.folder[1] });
    } else if (item.ext) {
      window.open(item.ext, "_blank", "noopener,noreferrer");
    } else if (item.win) {
      os.open(item.win);
    } else if (item.href) {
      if (item.href === "/") {
        if (path === "/") window.scrollTo({ top: 0, behavior: "smooth" });
        else router.push("/");
      } else if (item.href.startsWith("/#")) {
        if (path === "/") document.getElementById(item.href.slice(2))?.scrollIntoView({ behavior: "smooth" });
        else router.push(item.href);
      }
    }
  };
  /** a window tile: bring the window forward, un-minimizing it if needed */
  const pressWin = (w: WinState) => (w.minimized ? os.restore(w.id) : os.focus(w.id));

  const isActive = (it: Item) => {
    if (it.id === "home") return path === "/";
    // Explorer is the Finder: any folder window (the Bin has its own tile) lights it up
    if (it.folder) return os.wins.some((w) => (it.folder![0] === "root" ? w.kind === "finder" && w.id !== "finder:bin" : w.id === `finder:${it.folder![0]}`));
    if (it.win) return os.wins.some((w) => w.kind === it.win);
    return false;
  };

  const tile = (it: Item, className?: string) => (
    <DockTile key={it.id} label={it.label} rest={rest} mouseX={mouseX} active={isActive(it)} onPress={() => press(it)} onHover={onHover} className={className}>
      <MacIcon name={it.icon} date={today} />
    </DockTile>
  );

  const bar = (
    <nav
      aria-label="Dock"
      inert={away}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "glass lens flex items-end gap-2.5 rounded-[28px] px-3 pb-2 pt-2.5 transition-opacity duration-300",
        away ? "pointer-events-none opacity-0" : "pointer-events-auto",
      )}
    >
      {MAIN.map((it) => tile(it))}
      <div className="mx-0.5 mb-2 h-9 w-px self-center bg-[var(--hairline)]" aria-hidden />
      {TOOLS.map((it) => tile(it))}
      <div className="mx-0.5 mb-2 h-9 w-px self-center bg-[var(--hairline)]" aria-hidden />
      {/* every window, open or minimized, sits here as a thumbnail */}
      <div
        ref={(el) => {
          os.trayRef.current = el;
        }}
        className={cn("flex items-end gap-2.5", os.wins.length === 0 && "-ml-2.5 w-0")}
        aria-label="Open windows"
        role="group"
      >
        {os.wins.map((w) => (
          <DockTile
            key={w.id}
            label={w.title}
            ariaLabel={`${w.minimized ? "Restore" : "Show"} ${w.title}`}
            rest={rest}
            mouseX={mouseX}
            active={!w.minimized}
            onPress={() => pressWin(w)}
            onHover={onHover}
            enter={0}
            winId={w.id}
          >
            <WindowThumb kind={w.kind} date={today} dim={w.minimized} />
          </DockTile>
        ))}
      </div>
      {tile(BIN_ITEM)}
    </nav>
  );

  const tooltip = tip && (
    <div
      className="glass glass-thin pointer-events-none fixed z-[70] -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold"
      style={{ left: tip.x, ...(tip.below ? { top: 92 } : { bottom: 112 }) }}
      role="tooltip"
    >
      {tip.label}
    </div>
  );

  // desktop home: rides up from the bottom of the hero then sticks near the top. Phones get the iPhone dock instead.
  if (mode === "hero") {
    return (
      <>
        <div className="pointer-events-none sticky top-4 z-[60] -mt-32 flex h-32 items-start justify-center px-3 max-md:hidden">{bar}</div>
        {tooltip}
        <PhoneDock />
      </>
    );
  }
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-3 max-md:hidden">{bar}</div>
      {tooltip}
      <PhoneDock />
    </>
  );
}
