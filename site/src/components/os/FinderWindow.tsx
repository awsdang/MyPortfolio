"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, LayoutGrid, List, Search, X } from "lucide-react";
import { useOS } from "./OSProvider";
import { DragRegion, TrafficLights, useWindow } from "./Window";
import { ProjectPage } from "./ProjectPage";
import { QueueLab } from "@/components/apps/QueueLab";
import { SkillPage } from "@/components/apps/SkillPage";
import { FolderIcon, NodeIcon, GLYPHS } from "@/components/ui/Icons";
import { BIN, DESKTOP, ROOT, getNode, pathTo, projectFor, rootOf, searchNodes } from "@/data/fs";
import type { FsNode } from "@/data/types";
import { cn } from "@/lib/cn";

type View = "icons" | "list";

export function FinderWindow() {
  const os = useOS();
  const { win } = useWindow();
  const startId = win.nodeId ?? win.id.split(":")[1] ?? "root";

  const [hist, setHist] = useState<string[]>([startId]);
  const [idx, setIdx] = useState(0);
  const [view, setView] = useState<View>("icons");
  const [query, setQuery] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const current = hist[idx];
  const node = current === "root" ? ROOT : getNode(current) ?? ROOT;

  const go = useCallback(
    (id: string) => {
      setQuery("");
      setHist((h) => [...h.slice(0, idx + 1), id]);
      setIdx((i) => i + 1);
      scroller.current?.scrollTo({ top: 0 });
    },
    [idx],
  );

  // another part of the site asked this window to navigate (terminal `open`, dock, spotlight)
  const lastTick = useRef(win.navTick);
  useEffect(() => {
    if (win.navTick !== lastTick.current && win.nodeId) {
      lastTick.current = win.navTick;
      if (win.nodeId !== hist[idx]) go(win.nodeId);
    }
  }, [win.navTick, win.nodeId, hist, idx, go]);

  useEffect(() => {
    os.setTitle(win.id, node.id === "root" ? "Desktop" : node.name);
  }, [node.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (n: FsNode) => {
    if (n.kind === "file" && n.file) {
      if (n.file.href.startsWith("mailto:")) window.location.href = n.file.href;
      else window.open(n.file.href, "_blank", "noopener,noreferrer");
      return;
    }
    go(n.id);
  };

  const canBack = idx > 0;
  const canFwd = idx < hist.length - 1;
  const back = () => canBack && setIdx(idx - 1);
  const fwd = () => canFwd && setIdx(idx + 1);

  const results = useMemo(() => searchNodes(query), [query]);
  const content = projectFor(node.id);
  const showPage = node.kind === "project" && !!content;
  const crumbs = pathTo(node.id);
  const activeRoot = rootOf(node.id);

  const onKey = (e: KeyboardEvent) => {
    if ((e.altKey && e.key === "ArrowLeft") || (e.metaKey && e.key === "[")) {
      e.preventDefault();
      back();
    } else if ((e.altKey && e.key === "ArrowRight") || (e.metaKey && e.key === "]")) {
      e.preventDefault();
      fwd();
    } else if (e.key === "Backspace" && (e.target as HTMLElement).tagName !== "INPUT") {
      e.preventDefault();
      back();
    }
  };

  const items = node.children ?? [];

  /* ── sidebar ── */
  const Sidebar = (
    <aside className="glass glass-thin m-2 mr-0 hidden w-[208px] shrink-0 flex-col rounded-[22px] md:flex" aria-label="Sidebar">
      <DragRegion className="flex h-12 items-center px-4">
        <TrafficLights />
      </DragRegion>
      <nav className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-3 scroll-thin">
        <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">Favorites</p>
        {[ROOT, ...DESKTOP.filter((d) => d.kind === "folder"), BIN].map((n) => {
          const Glyph = GLYPHS[n.glyph ?? "folder"] ?? GLYPHS.folder;
          const active = n.id === "root" ? current === "root" : activeRoot === n.id && node.id !== "root";
          return (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={cn(
                "press flex items-center gap-2.5 rounded-[14px] px-3 py-2 text-left text-[13.5px] font-medium transition-colors hover:bg-[var(--sidebar-sel)]",
                active && "bg-[var(--sidebar-sel)] text-[var(--accent)]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Glyph size={17} strokeWidth={2} className={active ? "text-[var(--accent)]" : "text-[var(--ink-2)]"} />
              <span className="truncate">{n.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );

  /* ── toolbar ── */
  const Toolbar = (
    <DragRegion className="flex h-14 shrink-0 items-center gap-2 px-3 md:px-3.5">
      {os.mobile ? (
        <button
          data-nodrag
          onClick={() => (canBack ? back() : os.close(win.id))}
          className="glass glass-thin press flex h-9 items-center gap-1 rounded-full pl-2 pr-3.5 text-[13px] font-medium"
        >
          <ArrowLeft size={16} /> {canBack ? "Back" : "Close"}
        </button>
      ) : (
        <div className="glass glass-thin flex rounded-full p-0.5" data-nodrag>
          <button className="toolbar-btn press" disabled={!canBack} onClick={back} aria-label="Back">
            <ChevronLeft size={18} />
          </button>
          <button className="toolbar-btn press" disabled={!canFwd} onClick={fwd} aria-label="Forward">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
      <h2 className="ml-1 min-w-0 flex-1 truncate font-display text-[17px] font-bold tracking-tight">
        {query ? `Search “${query}”` : node.id === "root" ? "Desktop" : node.name}
      </h2>
      {!showPage && node.kind !== "app" && !query && (
        <div className="glass glass-thin hidden rounded-full p-0.5 sm:flex" data-nodrag role="group" aria-label="View">
          <button className={cn("toolbar-btn press", view === "icons" && "bg-[var(--sidebar-sel)] text-[var(--accent)]")} onClick={() => setView("icons")} aria-label="Icon view" aria-pressed={view === "icons"}>
            <LayoutGrid size={16} />
          </button>
          <button className={cn("toolbar-btn press", view === "list" && "bg-[var(--sidebar-sel)] text-[var(--accent)]")} onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"}>
            <List size={16} />
          </button>
        </div>
      )}
      <label className="glass glass-thin flex h-9 w-[132px] items-center gap-1.5 rounded-full px-3 focus-within:w-[190px] md:w-[150px] md:focus-within:w-[210px]" style={{ transition: "width .3s cubic-bezier(.2,.8,.2,1)" }} data-nodrag>
        <Search size={14} className="shrink-0 text-[var(--ink-3)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search projects"
          className="w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-[var(--ink-3)]"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search" className="text-[var(--ink-3)]">
            <X size={13} />
          </button>
        )}
      </label>
    </DragRegion>
  );

  /* ── listing ── */
  const arrow = (e: KeyboardEvent<HTMLElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"];
    if (!keys.includes(e.key)) return;
    const els = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-item]")];
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    const cols = view === "icons" ? Math.max(1, Math.round(e.currentTarget.clientWidth / 150)) : 1;
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? cols : -cols;
    els[Math.min(Math.max(i + step, 0), els.length - 1)]?.focus();
  };

  const Listing = (list: FsNode[]) =>
    list.length === 0 ? (
      <div className="grid h-full place-items-center p-10 text-center text-[14px] text-[var(--ink-3)]">Nothing here yet.</div>
    ) : view === "icons" || query ? (
      query ? (
        <ul className="flex flex-col p-3" onKeyDown={arrow}>
          {list.map((n) => (
            <li key={n.id}>
              <button data-item onClick={() => open(n)} className="press flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-[var(--sidebar-sel)]">
                <NodeIcon node={n} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{n.name}</span>
                  <span className="block truncate text-[12px] text-[var(--ink-3)]">{pathTo(n.id).slice(1, -1).map((p) => p.name).join(" › ") || "Desktop"}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-x-2 gap-y-3 p-4" onKeyDown={arrow} role="list">
          {list.map((n) => (
            <button
              key={n.id}
              data-item
              role="listitem"
              onClick={() => open(n)}
              className="group press flex flex-col items-center gap-2 rounded-[22px] p-3 text-center outline-offset-0 transition-colors hover:bg-[var(--sidebar-sel)] focus-visible:bg-[var(--sidebar-sel)]"
            >
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                <NodeIcon node={n} size={74} />
              </span>
              <span className="w-full">
                <span className="block truncate text-[13px] font-semibold">{n.name}</span>
                {n.summary && <span className="mt-0.5 block line-clamp-2 text-[11.5px] leading-snug text-[var(--ink-3)]">{n.summary}</span>}
              </span>
            </button>
          ))}
        </div>
      )
    ) : (
      <ul className="p-2" onKeyDown={arrow}>
        {list.map((n) => (
          <li key={n.id}>
            <button data-item onClick={() => open(n)} className="press grid w-full grid-cols-[40px_1fr_auto] items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-[var(--sidebar-sel)]">
              <NodeIcon node={n} size={34} />
              <span className="truncate text-[14px] font-semibold">{n.name}</span>
              <span className="hidden truncate text-[12.5px] text-[var(--ink-3)] sm:block">{n.summary ?? (n.kind === "file" ? "Document" : "")}</span>
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="flex h-full min-h-0 outline-none" onKeyDown={onKey} tabIndex={-1}>
      {Sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {Toolbar}
        <div ref={scroller} className="scroll-thin mx-2 mb-2 min-h-0 flex-1 overflow-y-auto rounded-[22px] bg-[var(--surface)] md:mx-2.5">
          {query ? (
            Listing(results)
          ) : node.kind === "app" ? (
            node.app === "queue-lab" ? <QueueLab /> : node.app === "skill" ? <SkillPage id={node.ref} /> : null
          ) : showPage && content ? (
            <ProjectPage node={node} content={content} onOpenChild={open} />
          ) : (
            <>
              {node.intro && (
                <div className="px-6 pb-1 pt-6">
                  <h3 className="font-display text-[24px] font-bold leading-tight tracking-tight">{node.intro.title}</h3>
                  <p className="mt-1.5 max-w-[60ch] text-[14px] leading-relaxed text-[var(--ink-2)]">{node.intro.text}</p>
                </div>
              )}
              {Listing(items)}
            </>
          )}
        </div>
        {/* path bar */}
        <nav aria-label="Path" className="hidden h-8 shrink-0 items-center gap-1 overflow-x-auto px-5 text-[11.5px] text-[var(--ink-3)] md:flex scroll-thin">
          {crumbs.map((c, i) => (
            <span key={c.id} className="flex items-center gap-1 whitespace-nowrap">
              {i > 0 && <ChevronRight size={11} />}
              <button onClick={() => go(c.id)} className={cn("flex items-center gap-1.5 rounded-md px-1 hover:text-[var(--ink)]", i === crumbs.length - 1 && "font-semibold text-[var(--ink-2)]")}>
                {c.kind === "folder" ? <FolderIcon tint={c.tint} size={13} glyph="folder" /> : null}
                {c.id === "root" ? "Desktop" : c.name}
              </button>
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
