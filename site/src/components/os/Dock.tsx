"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useOS, type WinKind } from "./OSProvider";
import { cn } from "@/lib/cn";
import { MacIcon, type MacIconName } from "@/components/ui/MacIcon";

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
  { id: "explorer", label: "Explorer", folder: ["root", "root"], icon: "finder" },
  { id: "achievements", label: "Achievements", href: "/#achievements", icon: "trophy" },
  { id: "about", label: "About", href: "/#about", icon: "about" },
  { id: "book", label: "Book an interview", win: "booking", icon: "calendar" },
];

const TOOLS: Item[] = [{ id: "terminal", label: "Terminal", win: "terminal", icon: "terminal" }];

const BIN_ITEM: Item = { id: "bin", label: "Bin", folder: ["bin", "bin"], icon: "binFull" };

const KIND_ICON: Record<WinKind, MacIconName> = { finder: "finder", terminal: "terminal", about: "notes", contact: "mail", booking: "calendar", sysinfo: "home" };

function DockTile({
  item,
  mouseX,
  active,
  onPress,
  onHover,
  rest,
  date,
}: {
  rest: number;
  date: Date | null;
  item: Item;
  mouseX: MotionValue<number>;
  active: boolean;
  onPress: () => void;
  onHover: (label: string | null, el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const dist = useTransform(mouseX, (v) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? v - (r.left + r.width / 2) : Infinity;
  });
  const raw = useTransform(dist, [-RANGE, 0, RANGE], [rest, Math.max(PEAK, rest), rest]);
  const size = useSpring(raw, { mass: 0.1, stiffness: 190, damping: 14 });

  return (
    <div className="flex flex-col items-center">
      <motion.button
        ref={ref}
        style={{ width: size, height: size }}
        className="press block"
        onClick={onPress}
        onFocus={(e) => onHover(item.label, e.currentTarget)}
        onBlur={() => onHover(null, null)}
        onMouseEnter={(e) => onHover(item.label, e.currentTarget)}
        onMouseLeave={() => onHover(null, null)}
        aria-label={item.label}
      >
        <MacIcon name={item.icon} date={date} />
      </motion.button>
      <span className={cn("mt-1 h-1 w-1 rounded-full bg-[var(--ink-2)] transition-opacity", active ? "opacity-70" : "opacity-0")} aria-hidden />
    </div>
  );
}

export function Dock({ mode }: { mode: "hero" | "fixed" }) {
  const os = useOS();
  const router = useRouter();
  const path = usePathname();
  const mouseX = useMotionValue(Infinity);
  const rest = os.vw < 440 ? 42 : 50;
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
    const t = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const [tip, setTip] = useState<{ label: string; x: number; below: boolean } | null>(null);
  const trayHost = useRef<HTMLDivElement>(null);

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

  const minimized = os.wins.filter((w) => w.minimized);
  const isActive = (it: Item) =>
    (it.id === "home" && path === "/") ||
    (it.folder ? os.wins.some((w) => w.id === `finder:${it.folder![0]}`) : false) ||
    (it.win ? os.wins.some((w) => w.kind === it.win) : false);

  const bar = (
    <nav
      aria-label="Dock"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="glass lens pointer-events-auto flex items-end gap-2.5 rounded-[28px] px-3 pb-2 pt-2.5 max-sm:gap-1.5 max-sm:px-2.5"
    >
      {MAIN.map((it) => (
        <DockTile
          key={it.id}
          item={it}
          rest={rest}
          date={today}
          mouseX={mouseX}
          active={isActive(it)}
          onPress={() => press(it)}
          onHover={onHover}
        />
      ))}
      <div className="mx-0.5 mb-2 h-9 w-px self-center bg-[var(--hairline)] max-sm:hidden" aria-hidden />
      {TOOLS.map((it) => (
        <div key={it.id} className="max-sm:hidden">
          <DockTile item={it} rest={rest} date={today} mouseX={mouseX} active={isActive(it)} onPress={() => press(it)} onHover={onHover} />
        </div>
      ))}
      {minimized.length > 0 && <div className="mx-0.5 mb-2 h-9 w-px self-center bg-[var(--hairline)]" aria-hidden />}
      <div ref={(el) => { trayHost.current = el; os.trayRef.current = el; }} className={cn("flex items-end gap-2", minimized.length === 0 && "-ml-2.5 w-0")} aria-label="Minimized windows" role="group">
        {minimized.map((w) => (
          <motion.button
            key={w.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 420, damping: 24 }}
            onClick={() => os.restore(w.id)}
            onMouseEnter={(e) => onHover(w.title, e.currentTarget)}
            onMouseLeave={() => onHover(null, null)}
            aria-label={`Restore ${w.title}`}
            className="press mb-1.5 block"
            style={{ width: 40, height: 40 }}
          >
            <MacIcon name={KIND_ICON[w.kind]} date={today} />
          </motion.button>
        ))}
      </div>
      {minimized.length === 0 && <div className="mx-0.5 mb-2 h-9 w-px self-center bg-[var(--hairline)]" aria-hidden />}
      <DockTile item={BIN_ITEM} rest={rest} date={today} mouseX={mouseX} active={isActive(BIN_ITEM)} onPress={() => press(BIN_ITEM)} onHover={onHover} />
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

  // desktop home: rides up from the bottom of the hero then sticks near the top. Phones: bottom bar.
  if (mode === "hero") {
    return (
      <>
        <div className="pointer-events-none sticky top-4 z-[60] flex justify-center px-3 max-md:fixed max-md:inset-x-0 max-md:bottom-3 max-md:top-auto md:-mt-32 md:h-32 md:items-start">
          {bar}
        </div>
        {tooltip}
      </>
    );
  }
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-3 max-md:top-auto max-md:bottom-3">{bar}</div>
      {tooltip}
    </>
  );
}
