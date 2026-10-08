"use client";

import { useEffect, useRef, useState } from "react";
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

/** Analog clock on Baghdad time. */
export function ClockWidget({ className }: { className?: string }) {
  const now = useTick(1000);
  let h = 0, m = 0, s = 0;
  if (now) {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: PROFILE.timezone, hour: "numeric", minute: "numeric", second: "numeric", hour12: false }).formatToParts(now);
    h = +(parts.find((p) => p.type === "hour")?.value ?? 0) % 12;
    m = +(parts.find((p) => p.type === "minute")?.value ?? 0);
    s = +(parts.find((p) => p.type === "second")?.value ?? 0);
  }
  const hand = (len: number, w: number, deg: number, color = "var(--ink)") => (
    <line x1="60" y1="60" x2="60" y2={60 - len} stroke={color} strokeWidth={w} strokeLinecap="round" transform={`rotate(${deg} 60 60)`} />
  );
  return (
    <div className={cn(card, "grid h-[150px] w-[150px] place-items-center", className)} role="img" aria-label={`Clock, ${PROFILE.zoneLabel} time`}>
      <svg viewBox="0 0 120 120" className="h-[124px] w-[124px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="60" y1="7" x2="60" y2={i % 3 === 0 ? 14 : 11} stroke="var(--ink-3)" strokeWidth={i % 3 === 0 ? 2 : 1.2} strokeLinecap="round" transform={`rotate(${i * 30} 60 60)`} />
        ))}
        <text x="60" y="40" textAnchor="middle" fontSize="7.5" letterSpacing="1.4" fill="var(--ink-3)" fontWeight="600">
          {PROFILE.zoneLabel}
        </text>
        {hand(30, 3.6, h * 30 + m * 0.5)}
        {hand(44, 2.4, m * 6)}
        {hand(48, 1, s * 6, "var(--warm)")}
        <circle cx="60" cy="60" r="3" fill="var(--ink)" />
        <circle cx="60" cy="60" r="1.4" fill="var(--warm)" />
      </svg>
    </div>
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
      onClick={() => os.open("contact")}
      className={cn(card, "press h-[150px] w-[150px] p-4 text-left", className)}
      aria-label="Calendar — write to Aws"
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

/** Apple Music style mini player — streams the official 30-second preview. */
export function MusicWidget({ className, stacked }: { className?: string; stacked?: boolean }) {
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

  return (
    <>
      <div className={cn(card, "h-[150px] w-[320px] p-4", className)}>
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
        <div className="flex gap-3.5">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.22)]">
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
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-[15px] font-semibold leading-tight">{m.title}</p>
            <a href={m.link} target="_blank" rel="noopener noreferrer" draggable={false} className="block truncate text-[12.5px] text-[var(--ink-2)] hover:underline">
              {m.artist} — {m.album}
            </a>
            <div className="mt-2 flex items-center gap-4 text-[var(--ink)]">
              <button onClick={() => skip(-10)} aria-label="Back 10 seconds" className="press opacity-75 hover:opacity-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 6v12l-8.5-6L11 6Zm9.5 0v12L12 12l8.5-6Z" /></svg>
              </button>
              <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="press grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--sidebar-sel)]">
                {playing ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8Z" /></svg>
                )}
              </button>
              <button onClick={() => skip(10)} aria-label="Forward 10 seconds" className="press opacity-75 hover:opacity-100">
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
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(dur)}
            aria-valuenow={Math.round(t)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") skip(5);
              if (e.key === "ArrowLeft") skip(-5);
            }}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--ink-2)]" style={{ width: `${(t / (dur || 30)) * 100}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[10.5px] tabular-nums text-[var(--ink-3)]">
            <span>{fmt(t)}</span>
            <span>{failed ? "preview unavailable" : `-${fmt((dur || 30) - t)}`}</span>
          </div>
        </div>
      </div>
      <AnimatePresence>{playing && <PlayingNote key="note" text={m.note} stacked={stacked} />}</AnimatePresence>
    </>
  );
}

/**
 * Slides out from under the music player while it plays. Floats over the
 * desktop (moves with the player when dragged); in the mobile stack it opens
 * in place instead.
 */
function PlayingNote({ text, stacked }: { text: string; stacked?: boolean }) {
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
        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">Now fixing</p>
        <p className="mt-0.5 font-display text-[15px] font-semibold leading-snug tracking-tight">{text}</p>
      </div>
    </div>
  );

  if (stacked)
    return (
      <motion.div
        // clip only while the height animates, so the card's shadow isn't cut off once open
        initial={{ height: 0, opacity: 0, overflow: "hidden" }}
        animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
        exit={{ height: 0, opacity: 0, overflow: "hidden" }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
      >
        <div className="pt-3">{body}</div>
      </motion.div>
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

export function PrinciplesWidget({ className, square }: { className?: string; square?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % PROFILE.principles.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={cn(card, square ? "h-[150px] w-[150px] p-4" : "h-[108px] w-[320px] p-5", className)}>
      <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">{square ? "I believe" : "Things I believe in"}</p>
      <div className={cn("relative mt-2", square ? "h-[88px]" : "h-[44px]")} aria-live="off">
        {PROFILE.principles.map((p, k) => (
          <p
            key={p}
            className={cn("absolute inset-0 font-display font-bold leading-[1.15] tracking-tight transition-all duration-700", square ? "text-[17px]" : "text-[19px]")}
            style={{ opacity: k === i ? 1 : 0, transform: `translateY(${k === i ? 0 : k < i ? -10 : 10}px)`, filter: k === i ? "none" : "blur(4px)" }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

export function PhotoWidget({ className }: { className?: string }) {
  return (
    <figure className={cn(card, "relative h-[150px] w-[150px] overflow-hidden !rounded-[32px] p-0", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={PROFILE.photo.src} alt={PROFILE.photo.alt} className="h-full w-full object-cover object-[50%_20%]" draggable={false} />
    </figure>
  );
}
