"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Check, Moon, Search, Sun } from "lucide-react";
import { useOS } from "./OSProvider";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";
import { BananaMark } from "@/components/ui/Banana";

type Item =
  | { label: string; run?: () => void; href?: string; disabled?: boolean; checked?: boolean; shortcut?: string }
  | { sep: true }
  | { header: string };
type Menu = { id: string; title: React.ReactNode; label: string; items: Item[]; bold?: boolean };

const isAction = (i: Item): i is Extract<Item, { label: string }> => "label" in i;
const q = encodeURIComponent(PROFILE.aiPrompt);

function visibleAudio(): HTMLAudioElement | null {
  const list = [...document.querySelectorAll("audio")];
  return list.find((a) => (a.parentElement as HTMLElement | null)?.offsetParent !== null) ?? list[0] ?? null;
}

export function MenuBar() {
  const os = useOS();
  const router = useRouter();
  const path = usePathname();
  const [now, setNow] = useState<Date | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(-1);
  const [anchor, setAnchor] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    const fs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fs);
    return () => {
      clearInterval(t);
      document.removeEventListener("fullscreenchange", fs);
    };
  }, []);

  const focused = os.wins.find((w) => w.id === os.focusedId);
  const go = useCallback(
    (id: string) => {
      if (path === "/") document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      else router.push(`/#${id}`);
    },
    [path, router],
  );
  const copy = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      os.notify({ title, body: text });
    } catch {
      os.notify({ title: "Couldn't copy to the clipboard", body: text });
    }
  };
  const folder = (id: string) => os.open("finder", { rootId: id, nodeId: id });

  const menus: Menu[] = [
    {
      id: "system",
      label: "System menu",
      title: <BananaMark size={19} className="-my-1" />,
      items: [
        { label: "About this portfolio", run: () => os.open("sysinfo") },
        { sep: true },
        { label: "Light appearance", checked: os.theme === "light", run: () => os.theme !== "light" && os.toggleTheme() },
        { label: "Dark appearance", checked: os.theme === "dark", run: () => os.theme !== "dark" && os.toggleTheme() },
        { sep: true },
        { label: "Tidy up desktop", run: () => (os.resetDesktop(), os.notify({ title: "Desktop tidied", body: "Desktop items are back in their original places." })) },
        { label: "Show desktop", disabled: !os.wins.some((w) => !w.minimized), run: os.minimizeAll },
      ],
    },
    {
      id: "app",
      label: PROFILE.name,
      bold: true,
      title: PROFILE.name,
      items: [
        { label: `About ${PROFILE.short}`, run: () => os.open("about") },
        { sep: true },
        { label: `Ask Claude about ${PROFILE.short}`, href: `https://claude.ai/new?q=${q}` },
        { label: `Ask ChatGPT about ${PROFILE.short}`, href: `https://chatgpt.com/?q=${q}` },
        { sep: true },
        { label: "Schedule a conversation", run: () => os.open("booking") },
        { label: `Write to ${PROFILE.short}`, run: () => os.open("contact") },
      ],
    },
    {
      id: "file",
      label: "File",
      title: "File",
      items: [
        { label: "Write to Aws", run: () => os.open("contact") },
        { label: "Open terminal", run: () => os.open("terminal") },
        { label: "Search portfolio", shortcut: "⌘K", run: () => os.setSpotlight(true) },
        { sep: true },
        { header: "Projects" },
        { label: "Qi", run: () => os.open("finder", { rootId: "products", nodeId: "qi-card" }) },
        { label: "Cardy", run: () => os.open("finder", { rootId: "products", nodeId: "cardyiq" }) },
        { label: "NotifyX", run: () => os.open("finder", { rootId: "products", nodeId: "notifyx" }) },
        { sep: true },
        { label: "View my CV", run: () => os.open("cv") },
        { label: "Close window", shortcut: "esc", disabled: !focused, run: () => focused && os.close(focused.id) },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      title: "Edit",
      items: [
        { label: "Undo", run: () => os.notify({ title: "Nothing to undo", body: "There's nothing to undo here." }) },
        { label: "Redo", disabled: true },
        { sep: true },
        { label: "Copy email address", run: () => copy(PROFILE.email, "Email copied") },
        { label: "Copy portfolio link", run: () => copy(window.location.origin, "Link copied") },
        { label: "Write to Aws", run: () => os.open("contact") },
        { sep: true },
        { label: "Search portfolio", shortcut: "⌘K", run: () => os.setSpotlight(true) },
      ],
    },
    {
      id: "view",
      label: "View",
      title: "View",
      items: [
        { label: fullscreen ? "Exit full screen" : "Enter full screen", run: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()) },
        { label: focused?.zoomed ? "Restore window size" : "Expand window", disabled: !focused, run: () => focused && os.toggleZoom(focused.id) },
        { label: "Show desktop", disabled: !os.wins.some((w) => !w.minimized), run: os.minimizeAll },
        { sep: true },
        { header: "Now playing" },
        {
          label: playing ? `Pause “${PROFILE.music.title}”` : `Play “${PROFILE.music.title}”`,
          run: () => {
            const a = visibleAudio();
            if (!a) return;
            if (a.paused) void a.play().catch(() => os.notify({ title: "Couldn't play the preview" }));
            else a.pause();
          },
        },
      ],
    },
    {
      id: "go",
      label: "Go",
      title: "Go",
      items: [
        { label: "Desktop", run: () => (path === "/" ? window.scrollTo({ top: 0, behavior: "smooth" }) : router.push("/")) },
        { label: "Explore my work", run: () => os.open("finder", { rootId: "root", nodeId: "root" }) },
        { sep: true },
        { label: "My work", run: () => folder("products") },
        { label: "AI skills", run: () => folder("ai-skills") },
        { label: "Contact", run: () => folder("contact") },
        { label: "Bin", run: () => folder("bin") },
        { sep: true },
        { label: "Achievements", run: () => os.open("achievements") },
        { label: "About me", run: () => os.open("about") },
        { label: "Get in touch", run: () => go("contact") },
      ],
    },
    {
      id: "window",
      label: "Window",
      title: "Window",
      items: [
        { label: "Minimize", disabled: !focused, run: () => focused && os.minimize(focused.id) },
        { label: focused?.zoomed ? "Restore window size" : "Expand window", disabled: !focused, run: () => focused && os.toggleZoom(focused.id) },
        { label: "Restore all windows", disabled: !os.wins.some((w) => w.minimized), run: os.restoreAll },
        { label: "Close all windows", disabled: os.wins.length === 0, run: os.closeAll },
        { sep: true },
        ...(os.wins.length
          ? os.wins.map<Item>((w) => ({
              label: `${w.title}${w.minimized ? "  (minimized)" : ""}`,
              checked: w.id === os.focusedId,
              run: () => (w.minimized ? os.restore(w.id) : os.focus(w.id)),
            }))
          : [{ label: "No windows open", disabled: true } as Item]),
      ],
    },
    {
      id: "help",
      label: "Help",
      title: "Help",
      items: [
        { label: "Search portfolio", shortcut: "⌘K", run: () => os.setSpotlight(true) },
        {
          label: "Keyboard shortcuts",
          run: () =>
            os.notify({
              title: "Shortcuts",
              body: "⌘K opens search. Esc closes most windows. Double-click a title bar to expand it. Use ← and → to browse screenshots.",
            }),
        },
        { label: "Terminal commands", run: () => (os.open("terminal"), os.notify({ title: "Terminal", body: "Type help to see the available commands." })) },
        { sep: true },
        { label: "Ask about my work", run: () => os.open("terminal") },
        { label: "Report a bug", run: () => os.open("bug") },
        { label: "GitHub profile", href: PROFILE.links.github },
      ],
    },
  ];

  const openMenu = (i: number) => {
    const el = titleRefs.current[i];
    if (el) setAnchor(el.getBoundingClientRect().left);
    if (menus[i].id === "view") setPlaying(!!visibleAudio() && !visibleAudio()!.paused);
    setOpen(i);
    setActive(-1);
    requestAnimationFrame(() => dropRef.current?.focus({ preventScroll: true }));
  };
  const close = () => {
    setOpen(null);
    setActive(-1);
  };
  const runItem = (it: Item) => {
    if (!isAction(it) || it.disabled) return;
    close();
    if (it.href) window.open(it.href, it.href.startsWith("mailto:") ? "_self" : "_blank", "noopener,noreferrer");
    else it.run?.();
  };

  // click-away
  useEffect(() => {
    if (open === null) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (barRef.current?.contains(t) || dropRef.current?.contains(t)) return;
      close();
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  const items = open !== null ? menus[open].items : [];
  const actionable = items.map((it, i) => (isAction(it) && !it.disabled ? i : -1)).filter((i) => i >= 0);
  // (the portalled dropdown's key events bubble here through the React tree, so this is the only handler)
  const onKey = (e: React.KeyboardEvent) => {
    if (open === null) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      titleRefs.current[open]?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const pos = actionable.indexOf(active);
      const next = e.key === "ArrowDown" ? actionable[(pos + 1) % actionable.length] : actionable[(pos - 1 + actionable.length) % actionable.length];
      setActive(next ?? -1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      openMenu((open + (e.key === "ArrowRight" ? 1 : -1) + menus.length) % menus.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (active >= 0) runItem(items[active]);
    }
  };

  const date = now?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <header
      data-menubar
      className="absolute inset-x-0 top-0 z-10 flex h-[var(--menubar-h)] items-center justify-between px-2.5 text-[12.5px] font-medium text-[var(--ink)] backdrop-blur-md [background:linear-gradient(180deg,rgba(255,255,255,0.32),rgba(255,255,255,0.12))] dark:[background:none]"
      onKeyDown={onKey}
    >
      <div ref={barRef} className="flex items-center" role="menubar" aria-label="Menu bar">
        {menus.map((m, i) => (
          <button
            key={m.id}
            ref={(el) => {
              titleRefs.current[i] = el;
            }}
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === i}
            aria-label={m.label}
            onClick={() => (open === i ? close() : openMenu(i))}
            onMouseEnter={() => open !== null && open !== i && openMenu(i)}
            className={cn(
              "flex h-[22px] items-center rounded-[6px] px-2.5 transition-colors",
              m.bold && "font-semibold",
              m.id === "help" && "mr-1",
              open === i ? "bg-black/10 dark:bg-white/15" : "hover:bg-black/5 dark:hover:bg-white/10",
              ["view", "go", "window"].includes(m.id) && "max-lg:hidden",
            )}
          >
            {m.title}
          </button>
        ))}
        <span className="ml-2 hidden text-[var(--ink-3)] xl:inline">{PROFILE.menuSubtitle}</span>
      </div>

      <div className="flex items-center gap-2.5 pr-1.5 text-[var(--ink-2)]">
        <button
          onClick={() => os.setSpotlight(true)}
          className="press hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] hover:bg-white/30 sm:flex"
          aria-label="Search portfolio (Command or Control K)"
        >
          <Search size={13} /> Search <kbd className="rounded-md bg-white/40 px-1.5 font-sans text-[10.5px] dark:bg-white/10">⌘K</kbd>
        </button>
        <button onClick={os.toggleTheme} className="press grid h-6 w-6 place-items-center rounded-full hover:bg-white/30" aria-label={os.theme === "dark" ? "Switch to light appearance" : "Switch to dark appearance"}>
          {os.theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <span className="min-w-[112px] text-right tabular-nums">{date && `${date}  ${time}`}</span>
      </div>

      {open !== null &&
        createPortal(
          <div
            ref={dropRef}
            role="menu"
            aria-label={menus[open].label}
            tabIndex={-1}
            className="glass glass-thick fixed z-[600] min-w-[240px] rounded-[12px] p-1.5 text-[13px] text-[var(--ink)] outline-none"
            style={{ left: Math.max(6, anchor - 2), top: 30 }}
          >
            {items.map((it, i) =>
              "sep" in it ? (
                <div key={i} className="mx-2.5 my-1 h-px bg-[var(--hairline)]" role="separator" />
              ) : "header" in it ? (
                <div key={i} className="px-2.5 pb-0.5 pt-1.5 text-[11px] font-semibold text-[var(--ink-3)]">
                  {it.header}
                </div>
              ) : (
                <button
                  key={i}
                  role="menuitem"
                  disabled={it.disabled}
                  onMouseEnter={() => !it.disabled && setActive(i)}
                  onMouseLeave={() => setActive(-1)}
                  onClick={() => runItem(it)}
                  className={cn(
                    "flex w-full items-center gap-1 rounded-[7px] py-[4px] pl-1.5 pr-2.5 text-left",
                    it.disabled ? "cursor-default text-[var(--ink-3)]" : active === i ? "bg-[var(--accent)] text-white" : "",
                  )}
                >
                  <span className="grid w-4 shrink-0 place-items-center">{it.checked && <Check size={12} strokeWidth={3} />}</span>
                  <span className="flex-1 truncate">{it.label}</span>
                  {it.shortcut && <span className={cn("ml-6 text-[12px]", active === i ? "text-white/80" : "text-[var(--ink-3)]")}>{it.shortcut}</span>}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </header>
  );
}
