"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useOS } from "@/components/os/OSProvider";
import { useRaiseSelf } from "./Board";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

const card = "glass glass-shine rounded-[32px]";

function useTick(ms = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/** Minutes `tz` is ahead of UTC at `at`. */
function zoneOffset(tz: string, at: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" })
      .formatToParts(at)
      .map((x) => [x.type, +x.value]),
  );
  return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - at.getTime()) / 60_000);
}

/** The visitor's city from their time zone ("Europe/London" is LONDON), or null for UTC and the like. */
function visitorCity() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  if (!tz.includes("/") || tz.startsWith("Etc/")) return null;
  return tz.split("/").pop()!.replace(/_/g, " ").toUpperCase();
}

/** Shortest turn (-180..180] that lands on the same spot on the dial. */
const shortest = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

/**
 * Analog clock on Baghdad time. A click swings the hands to the visitor's own
 * time and says how far ahead or behind Aws is; another click swings back.
 */
export function ClockWidget({ className }: { className?: string }) {
  const now = useTick(1000);
  const still = useReducedMotion();
  const [mine, setMine] = useState(false);
  const [sweep, setSweep] = useState(false);
  const sweepEnd = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(sweepEnd.current), []);

  let h = 0, m = 0, s = 0, gap = 0;
  if (now) {
    const baghdad = zoneOffset(PROFILE.timezone, now);
    const wall = Math.floor(now.getTime() / 1000) + baghdad * 60;
    h = Math.floor(wall / 3600) % 12;
    m = Math.floor(wall / 60) % 60;
    s = wall % 60;
    gap = baghdad + now.getTimezoneOffset(); // minutes Aws is ahead of the visitor
  }
  const city = mine ? visitorCity() : null;

  const a = Math.abs(gap), gh = Math.floor(a / 60), gm = a % 60;
  const span = gm ? `${gh ? `${gh}H ` : ""}${gm}M` : `${gh} ${gh === 1 ? "HR" : "HRS"}`;
  const lines = gap === 0 ? ["SAME TIME", "AS AWS"] : ["AWS IS", `${span} ${gap > 0 ? "AHEAD" : "BEHIND"}`];
  const words = [gh && `${gh} ${gh === 1 ? "hour" : "hours"}`, gm && `${gm} minutes`].filter(Boolean).join(" ");
  const spoken = gap === 0 ? "Your local time matches Aws's" : `Aws is ${words} ${gap > 0 ? "ahead of" : "behind"} you`;

  // the hands only turn as far as the dial needs (a 10-hour gap reads as 2 hours back)
  const hourDeg = h * 30 + m * 0.5 - (mine ? shortest(gap * 0.5) : 0);
  const minDeg = m * 6 - (mine ? shortest(gap * 6) : 0);

  const toggle = () => {
    clearTimeout(sweepEnd.current);
    setSweep(true);
    setMine((v) => !v);
    sweepEnd.current = setTimeout(() => setSweep(false), 800);
  };

  const hand = (len: number, w: number, deg: number, color = "var(--ink)") => (
    <line
      x1="60" y1="60" x2="60" y2={60 - len}
      stroke={color} strokeWidth={w} strokeLinecap="round"
      style={{ transform: `rotate(${deg}deg)`, transformOrigin: "60px 60px", transition: sweep && !still ? "transform .75s cubic-bezier(.3,1.25,.5,1)" : "none" }}
    />
  );
  const label = (text: string, y: number, color = "var(--ink-3)") => (
    <text x="60" y={y} textAnchor="middle" fontSize="7.5" letterSpacing={text.length > 9 ? 0.9 : 1.4} fill={color} fontWeight="600" textLength={text.length > 11 ? 66 : undefined} lengthAdjust="spacingAndGlyphs">
      {text}
    </text>
  );
  return (
    <button
      onClick={toggle}
      aria-pressed={mine}
      aria-label={mine ? `Clock, your time${city ? ` in ${city.toLowerCase()}` : ""}. ${spoken}. Show Baghdad time` : `Clock, ${PROFILE.zoneLabel.toLowerCase()} time. Show your time`}
      className={cn(card, "press grid h-[150px] w-[150px] place-items-center", className)}
    >
      <svg viewBox="0 0 120 120" className="aspect-square w-[82.6%]" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="60" y1="7" x2="60" y2={i % 3 === 0 ? 14 : 11} stroke="var(--ink-3)" strokeWidth={i % 3 === 0 ? 2 : 1.2} strokeLinecap="round" transform={`rotate(${i * 30} 60 60)`} />
        ))}
        {mine ? (
          <g className="clock-label">
            {label(lines[0], 33)}
            {label(lines[1], 42.5, "var(--warm)")}
            {label(city ?? "YOUR TIME", 88)}
          </g>
        ) : (
          <g className="clock-label">{label(PROFILE.zoneLabel, 40)}</g>
        )}
        {hand(30, 3.6, hourDeg)}
        {hand(44, 2.4, minDeg)}
        {hand(48, 1, s * 6, "var(--warm)")}
        <circle cx="60" cy="60" r="3" fill="var(--ink)" />
        <circle cx="60" cy="60" r="1.4" fill="var(--warm)" />
      </svg>
    </button>
  );
}

export function CalendarWidget({ className }: { className?: string }) {
  const os = useOS();
  const now = useTick(60_000);
  const d = now ?? new Date(2026, 0, 1);
  const y = d.getFullYear(), mo = d.getMonth(), today = d.getDate();
  const first = new Date(y, mo, 1).getDay();
  const days = new Date(y, mo + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <button
      onClick={() => os.open("booking")}
      className={cn(card, "press h-[150px] w-[150px] p-4 text-left", className)}
      aria-label="Calendar, schedule a conversation with Aws"
    >
      <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--warm)]">{now ? d.toLocaleDateString("en-US", { weekday: "long" }) : " "}</p>
      <p className="font-display text-[26px] font-bold leading-none tracking-tight">{now ? today : ""}</p>
      <div className="mt-1.5 grid grid-cols-7 gap-x-[3px] gap-y-[1px] text-center text-[7.5px] leading-[10px] text-[var(--ink-3)]" aria-hidden>
        {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
          <span key={i}>{l}</span>
        ))}
        {cells.map((c, i) => (
          <span key={i} className={cn(c === today && now && "rounded-full bg-[var(--ink)] font-bold text-[var(--surface)]")}>
            {c}
          </span>
        ))}
      </div>
    </button>
  );
}

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
}

/**
 * Apple Music style mini player, streams the official 30-second preview.
 * `small` is the square iPhone widget (artwork, play button, title, progress).
 */
export function MusicWidget({ className, small }: { className?: string; small?: boolean }) {
  const m = PROFILE.music;
  const raiseSelf = useRaiseSelf();
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(30);
  const [failed, setFailed] = useState(false);

  const toggle = async () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      // pause any other player on the page first
      document.querySelectorAll("audio").forEach((x) => x !== a && x.pause());
      try {
        await a.play();
      } catch {
        setFailed(true);
      }
    } else a.pause();
  };
  const skip = (d: number) => {
    const a = audio.current;
    if (a) a.currentTime = Math.min(Math.max(a.currentTime + d, 0), a.duration || 30);
  };
  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = audio.current;
    if (!a) return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    a.currentTime = p * (a.duration || 30);
  };

  const player = (
    <audio
      ref={audio}
      src={m.preview}
      preload="none"
      onPlay={() => {
        setPlaying(true);
        raiseSelf(); // keep the note below the player above neighbouring widgets
      }}
      onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)}
      onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 30)}
      onError={() => setFailed(true)}
    />
  );
  const artwork = (cls: string) => (
    <div className={cn("relative shrink-0 overflow-hidden shadow-[0_6px_16px_rgba(0,0,0,0.22)]", cls)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.artwork} alt={`${m.album} cover`} draggable={false} className="h-full w-full object-cover" />
      {playing && (
        <span className="absolute bottom-1.5 right-1.5 flex h-3 items-end gap-[2px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <i key={i} className="w-[3px] rounded-full bg-white" style={{ height: "100%", animation: `eq .9s ${i * 0.15}s ease-in-out infinite alternate` }} />
          ))}
        </span>
      )}
    </div>
  );
  const playIcon = playing ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8Z" /></svg>
  );
  const progress = (
    <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--ink-2)]" style={{ width: `${(t / (dur || 30)) * 100}%` }} />
  );

  if (small)
    return (
      <>
        <div className={cn(card, "flex flex-col p-3.5", className)}>
          {player}
          <div className="flex items-start justify-between">
            {artwork("aspect-square w-[46%] rounded-[12px]")}
            <button onClick={toggle} aria-label={playing ? "Pause preview" : "Play preview"} className="press grid h-9 w-9 place-items-center rounded-full bg-[var(--sidebar-sel)]">
              {playIcon}
            </button>
          </div>
          <div className="mt-auto min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight">{m.title}</p>
            <a href={m.link} target="_blank" rel="noopener noreferrer" draggable={false} className="block truncate text-[11.5px] text-[var(--ink-2)]">
              {failed ? "Preview unavailable" : m.artist}
            </a>
            <div className="relative mt-2 h-[4px] rounded-full bg-[var(--hairline)]" aria-hidden>
              {progress}
            </div>
          </div>
        </div>
        <AnimatePresence>{playing && <PlayingNote key="note" text={m.note} banner />}</AnimatePresence>
      </>
    );

  return (
    <>
      <div className={cn(card, "h-[150px] w-[320px] p-4", className)}>
        {player}
        <div className="flex gap-3.5">
          {artwork("h-[72px] w-[72px] rounded-[14px]")}
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-[15px] font-semibold leading-tight">{m.title}</p>
            <a href={m.link} target="_blank" rel="noopener noreferrer" draggable={false} className="block truncate text-[12.5px] text-[var(--ink-2)] hover:underline">
              {m.artist}, {m.album}
            </a>
            <div className="mt-2 flex items-center gap-4 text-[var(--ink)]">
              <button onClick={() => skip(-10)} aria-label="Rewind preview 10 seconds" className="press opacity-75 hover:opacity-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 6v12l-8.5-6L11 6Zm9.5 0v12L12 12l8.5-6Z" /></svg>
              </button>
              <button onClick={toggle} aria-label={playing ? "Pause preview" : "Play preview"} className="press grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--sidebar-sel)]">
                {playIcon}
              </button>
              <button onClick={() => skip(10)} aria-label="Skip ahead 10 seconds" className="press opacity-75 hover:opacity-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 6v12l8.5-6L13 6ZM3.5 6v12L12 12 3.5 6Z" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div
            className="group relative h-[5px] cursor-pointer rounded-full bg-[var(--hairline)]"
            onPointerDown={seek}
            role="slider"
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={Math.round(dur)}
            aria-valuenow={Math.round(t)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") skip(5);
              if (e.key === "ArrowLeft") skip(-5);
            }}
          >
            {progress}
          </div>
          <div className="mt-1.5 flex justify-between text-[10.5px] tabular-nums text-[var(--ink-3)]">
            <span>{fmt(t)}</span>
            <span>{failed ? "Preview unavailable" : `-${fmt((dur || 30) - t)}`}</span>
          </div>
        </div>
      </div>
      <AnimatePresence>{playing && <PlayingNote key="note" text={m.note} />}</AnimatePresence>
    </>
  );
}

/**
 * Slides out from under the music player while it plays and floats over the
 * desktop (moves with the player when dragged). On the phone it drops in from
 * the top of the screen instead, like an iOS notification.
 */
function PlayingNote({ text, banner }: { text: string; banner?: boolean }) {
  const still = useReducedMotion();
  const body = (
    <div className={cn(card, "flex items-start gap-3 !rounded-[26px] px-4 py-3.5")} role="status">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[var(--sidebar-sel)]" aria-hidden>
        <span className="flex h-3.5 items-end gap-[2.5px]">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className="w-[3px] origin-bottom rounded-full bg-[var(--ink-2)]" style={{ height: "100%", animation: `eq .9s ${i * 0.15}s ease-in-out infinite alternate` }} />
          ))}
        </span>
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">A little Coldplay</p>
        <p className="mt-0.5 font-display text-[15px] font-semibold leading-snug tracking-tight">{text}</p>
      </div>
    </div>
  );

  if (banner)
    // portalled: the widget's glass (backdrop-filter) would otherwise trap position:fixed
    return createPortal(
      <motion.div
        className="fixed inset-x-3 top-[max(10px,env(safe-area-inset-top))] z-[80] mx-auto max-w-[420px]"
        initial={{ opacity: 0, y: -28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -28, scale: 0.96 }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
      >
        {body}
      </motion.div>,
      document.body,
    );

  return (
    <motion.div
      className="absolute inset-x-0 top-[calc(100%+10px)]"
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.96 }}
      transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
    >
      {body}
    </motion.div>
  );
}

/** Holds one belief; a click (the easter egg) moves on to the next. */
export function PrinciplesWidget({ className, square }: { className?: string; square?: boolean }) {
  const [i, setI] = useState(0);
  return (
    <button
      onClick={() => setI((v) => (v + 1) % PROFILE.principles.length)}
      className={cn(card, "block text-left", square ? "h-[150px] w-[150px] p-4" : "h-[108px] w-[320px] p-5", className)}
    >
      <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">{square ? "I believe" : "What I believe in"}</p>
      <div className={cn("relative mt-2", square ? "h-[88px]" : "h-[44px]")} aria-live="polite">
        {PROFILE.principles.map((p, k) => (
          <p
            key={p}
            aria-hidden={k !== i}
            className={cn("absolute inset-0 font-display font-bold leading-[1.15] tracking-tight transition-all duration-700", square ? "text-[17px]" : "text-[19px]")}
            style={{ opacity: k === i ? 1 : 0, transform: `translateY(${k === i ? 0 : k < i ? -10 : 10}px)`, filter: k === i ? "none" : "blur(4px)" }}
          >
            {p}
          </p>
        ))}
      </div>
    </button>
  );
}

/** My photo. A click opens the Photos window. */
export function PhotoWidget({ className }: { className?: string }) {
  const os = useOS();
  return (
    <button
      onClick={() => os.open("photos")}
      className={cn(card, "press relative block h-[150px] w-[150px] overflow-hidden p-0", className)}
      aria-label="My photos, open the gallery"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={PROFILE.photo.src} alt={PROFILE.photo.alt} className="h-full w-full object-cover object-[50%_20%]" draggable={false} />
    </button>
  );
}
