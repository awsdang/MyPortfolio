"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useOS } from "@/components/os/OSProvider";
import { MacIcon, type MacIconName } from "@/components/ui/MacIcon";
import { PROFILE } from "@/data/profile";
import { CV_URL } from "@/data/fs";
import { cn } from "@/lib/cn";

type Tile = { id: string; label: string; icon: MacIconName; href?: string; act?: () => void };

const q = encodeURIComponent(PROFILE.aiPrompt);

/** The glass app shelf on the desktop: links out, plus a few in-site apps. */
export function AppGrid({ className, vertical }: { className?: string; vertical?: boolean }) {
  const os = useOS();
  // tooltip is portalled to <body> so no widget (or window) can cover it
  const [tip, setTip] = useState<{ label: string; x: number; y: number } | null>(null);
  const show = (label: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setTip(vertical ? { label, x: r.right + 12, y: r.top + r.height / 2 } : { label, x: r.left + r.width / 2, y: r.top - 8 });
  };
  const hide = () => setTip(null);
  const tiles: Tile[] = [
    { id: "term", label: "Terminal", act: () => os.open("terminal"), icon: "terminal" },
    { id: "cv", label: "CV", href: CV_URL, icon: "docs" },
    { id: "skills", label: "AI skills", act: () => os.open("finder", { rootId: "ai-skills", nodeId: "ai-skills" }), icon: "code" },
    { id: "claude", label: "Ask Claude about me", href: `https://claude.ai/new?q=${q}`, icon: "claude" },
    { id: "gpt", label: "Ask ChatGPT about me", href: `https://chatgpt.com/?q=${q}`, icon: "openai" },
  ];

  return (
    <div className={cn("glass glass-shine", vertical ? "rounded-[26px] p-2.5" : "rounded-[30px] p-3.5", className)} role="group" aria-label="Apps and links">
      <div className={vertical ? "flex flex-col gap-2 [@media(max-height:820px)]:gap-1.5" : "grid grid-cols-5 gap-x-3 gap-y-3"}>
        {tiles.map((t) => {
          const inner = (
            <>
              <span
                className={cn(
                  "block aspect-square transition-transform duration-200 ease-out group-active:scale-95",
                  vertical ? "w-[44px] group-hover:translate-x-1 [@media(max-height:820px)]:w-[38px]" : "w-full group-hover:-translate-y-1 md:w-[50px]",
                )}
              >
                <MacIcon name={t.icon} />
              </span>
            </>
          );
          const cls = "group relative grid place-items-center rounded-[14px] outline-offset-2";
          const hover = {
            onMouseEnter: (e: React.MouseEvent<HTMLElement>) => show(t.label, e.currentTarget),
            onMouseLeave: hide,
            onFocus: (e: React.FocusEvent<HTMLElement>) => show(t.label, e.currentTarget),
            onBlur: hide,
          };
          return t.href ? (
            <a key={t.id} href={t.href} target="_blank" rel="noopener noreferrer" aria-label={t.label} draggable={false} className={cls} {...hover}>
              {inner}
            </a>
          ) : (
            <button key={t.id} onClick={t.act} aria-label={t.label} className={cls} {...hover}>
              {inner}
            </button>
          );
        })}
      </div>
      {tip &&
        createPortal(
          <div
            role="tooltip"
            className={cn(
              "glass glass-thin pointer-events-none fixed z-[90] whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
              vertical ? "-translate-y-1/2" : "-translate-x-1/2 -translate-y-full",
            )}
            style={{ left: tip.x, top: tip.y }}
          >
            {tip.label}
          </div>,
          document.body,
        )}
    </div>
  );
}
