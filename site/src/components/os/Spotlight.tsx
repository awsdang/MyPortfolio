"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bug, CornerDownLeft, Mail, Moon, NotebookPen, Search, Sparkles, Trophy } from "lucide-react";
import { useOS } from "./OSProvider";
import { allNodes, rootOf } from "@/data/fs";
import { NodeIcon } from "@/components/ui/Icons";
import type { FsNode } from "@/data/types";
import { cn } from "@/lib/cn";

type Result =
  | { type: "node"; node: FsNode; label: string; hint: string }
  | { type: "action"; id: string; label: string; hint: string; icon: React.ReactNode };

export function Spotlight() {
  const os = useOS();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo<Result[]>(() => {
    const s = q.trim().toLowerCase();
    const actions: Result[] = [
      { type: "action", id: "ask", label: "Ask about my work", hint: "Open the terminal", icon: <Sparkles size={18} /> },
      { type: "action", id: "about", label: "About me", hint: "My background and approach", icon: <NotebookPen size={18} /> },
      { type: "action", id: "achievements", label: "Achievements", hint: "Awards, studies and certificates", icon: <Trophy size={18} /> },
      { type: "action", id: "mail", label: "Write to Aws", hint: "Send Aws a message", icon: <Mail size={18} /> },
      { type: "action", id: "bug", label: "Report a bug", hint: "Tell Aws what isn't working", icon: <Bug size={18} /> },
      { type: "action", id: "theme", label: os.theme === "dark" ? "Switch to light appearance" : "Switch to dark appearance", hint: "Appearance", icon: <Moon size={18} /> },
    ];
    const nodes: Result[] = allNodes()
      .filter((n) => n.kind !== "file" || true)
      .filter((n) => !s || n.name.toLowerCase().includes(s) || n.summary?.toLowerCase().includes(s) || n.id.includes(s))
      .map((n) => ({ type: "node", node: n, label: n.name, hint: n.kind === "file" ? "Document" : n.kind === "folder" ? "Folder" : n.kind === "app" ? "App" : (n.summary ?? "Project") }));
    const acts = s ? actions.filter((a) => a.label.toLowerCase().includes(s) || (a.type === "action" && a.hint.toLowerCase().includes(s))) : actions;
    return s ? [...nodes, ...acts].slice(0, 9) : [...nodes.filter((n) => n.type === "node" && n.node.kind === "project").slice(0, 5), ...acts].slice(0, 9);
  }, [q, os.theme]);

  useEffect(() => {
    if (os.spotlight) {
      setQ("");
      setSel(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [os.spotlight]);
  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    listRef.current?.children[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const run = (r: Result | undefined) => {
    if (!r) return;
    os.setSpotlight(false);
    if (r.type === "node") {
      const n = r.node;
      if (n.kind === "file" && n.file) os.openHref(n.file.href);
      else os.open("finder", { rootId: rootOf(n.id), nodeId: n.id });
    } else if (r.id === "ask") os.open("terminal");
    else if (r.id === "about") os.open("about");
    else if (r.id === "achievements") os.open("achievements");
    else if (r.id === "mail") os.open("contact");
    else if (r.id === "bug") os.open("bug");
    else if (r.id === "theme") os.toggleTheme();
  };

  return (
    <AnimatePresence>
      {os.spotlight && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-start justify-center bg-black/25 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => os.setSpotlight(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the portfolio"
            className="glass glass-thick w-full max-w-[600px] overflow-hidden rounded-[28px]"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") os.setSpotlight(false);
              else if (e.key === "ArrowDown") (e.preventDefault(), setSel((i) => Math.min(i + 1, results.length - 1)));
              else if (e.key === "ArrowUp") (e.preventDefault(), setSel((i) => Math.max(i - 1, 0)));
              else if (e.key === "Enter") (e.preventDefault(), run(results[sel]));
            }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-5 py-4">
              <Search size={20} className="text-[var(--ink-3)]" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find a project, document or action"
                className="w-full bg-transparent text-[18px] outline-none placeholder:text-[var(--ink-3)]"
                aria-label="Search projects, documents and actions"
              />
              <kbd className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] text-[var(--ink-3)]">esc</kbd>
            </div>
            <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-2" role="listbox">
              {results.length === 0 && <li className="px-4 py-8 text-center text-[14px] text-[var(--ink-3)]">No matches. Try a project name, such as Cardy.</li>}
              {results.map((r, i) => (
                <li key={(r.type === "node" ? r.node.id : r.id) + i} role="option" aria-selected={i === sel}>
                  <button
                    onMouseMove={() => setSel(i)}
                    onClick={() => run(r)}
                    className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left", i === sel && "bg-[var(--sidebar-sel)]")}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center">
                      {r.type === "node" ? <NodeIcon node={r.node} size={34} /> : <span className="glass-tint grid h-9 w-9 place-items-center rounded-xl">{r.icon}</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold">{r.label}</span>
                      <span className="block truncate text-[12px] text-[var(--ink-3)]">{r.hint}</span>
                    </span>
                    {i === sel && <CornerDownLeft size={15} className="text-[var(--ink-3)]" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
