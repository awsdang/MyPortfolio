"use client";

import type { ReactNode } from "react";
import { Check, ChevronRight, LayoutGrid, RotateCcw } from "lucide-react";
import { Titlebar, useWindow } from "./Window";
import { useOS } from "./OSProvider";
import { MacIcon, type MacIconName } from "@/components/ui/MacIcon";
import { phoneHome } from "@/lib/phone-home";
import { cn } from "@/lib/cn";

/** A small iPhone home screen, drawn for the Appearance choice. */
function Preview({ dark }: { dark: boolean }) {
  return (
    <span
      className="relative block h-[118px] w-[62px] overflow-hidden rounded-[13px] shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_6px_14px_rgba(0,0,0,0.16)]"
      style={{ background: dark ? "linear-gradient(172deg,#2c2e33,#121214)" : "linear-gradient(172deg,#aab0ba,#5b616c)" }}
      aria-hidden
    >
      <span className="absolute inset-x-[7px] top-[9px] block h-[18px] rounded-[4px] bg-[#f8d24d]" />
      <span className="absolute left-[7px] top-[32px] grid grid-cols-4 gap-[3px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="block h-[9px] w-[9px] rounded-[2.5px]" style={{ background: dark ? "rgba(255,255,255,.28)" : "rgba(255,255,255,.85)" }} />
        ))}
      </span>
      <span className="absolute inset-x-[5px] bottom-[5px] block h-[14px] rounded-[6px]" style={{ background: dark ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.5)" }} />
    </span>
  );
}

/** `icon`: an app icon by name, or a glyph to put on a grey tile */
function Row({ icon, label, onClick, className }: { icon: MacIconName | ReactNode; label: string; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cn("flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-[var(--sidebar-sel)] active:bg-[var(--sidebar-sel)]", className)}>
      <span className="flex h-[29px] w-[29px] shrink-0">
        {typeof icon === "string" ? <MacIcon name={icon as MacIconName} /> : <MacIcon name="tile">{icon}</MacIcon>}
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px]">{label}</span>
      <ChevronRight size={16} className="text-[var(--ink-3)]" />
    </button>
  );
}

const Group = ({ title, children, className }: { title?: string; children: ReactNode; className?: string }) => (
  <section className={cn("mt-6", className)}>
    {title && <h3 className="mb-1.5 px-4 text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-3)]">{title}</h3>}
    <div className="divide-y divide-[var(--hairline)] overflow-hidden rounded-[14px] bg-[var(--surface)]">{children}</div>
  </section>
);

/** Settings, iOS style: appearance, the home screen, and the help windows. */
export function SettingsWindow() {
  const os = useOS();
  const { win } = useWindow();
  const choose = (t: "light" | "dark") => t !== os.theme && os.toggleTheme();
  const then = (fn: () => void) => () => {
    os.close(win.id);
    fn();
  };
  return (
    <div className="flex h-full flex-col">
      <Titlebar title="Settings" />
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface-2)] px-4 pb-8">
        <h2 className="px-1 pt-2 font-display text-[32px] font-bold tracking-tight">Settings</h2>

        <Group title="Appearance">
          <div className="flex justify-center gap-10 px-4 pb-4 pt-5">
            {(["light", "dark"] as const).map((t) => (
              <button key={t} onClick={() => choose(t)} className="flex flex-col items-center gap-2" aria-pressed={os.theme === t}>
                <Preview dark={t === "dark"} />
                <span className="text-[14px]">{t === "light" ? "Light" : "Dark"}</span>
                <span
                  className={cn(
                    "grid h-[22px] w-[22px] place-items-center rounded-full border-[1.5px]",
                    os.theme === t ? "border-[#0a84ff] bg-[#0a84ff] text-white" : "border-[var(--ink-3)]",
                  )}
                >
                  {os.theme === t && <Check size={14} strokeWidth={3} />}
                </span>
              </button>
            ))}
          </div>
        </Group>

        {/* the home screen only exists on phones */}
        <Group title="Home Screen" className="md:hidden">
          <Row icon={<LayoutGrid size={16} strokeWidth={2.2} />} label="Edit Home Screen" onClick={then(() => phoneHome.edit(true))} />
          <Row
            icon={<RotateCcw size={16} strokeWidth={2.4} />}
            label="Reset Home Screen"
            onClick={then(() => {
              phoneHome.reset();
              os.notify({ title: "Home Screen reset", body: "Everything is back where it started." });
            })}
          />
        </Group>

        <Group>
          <Row icon="mail" label="Report a bug" onClick={then(() => os.open("bug"))} />
          <Row icon="about" label="About this portfolio" onClick={then(() => os.open("sysinfo"))} />
        </Group>

        <p className="mt-4 px-4 text-[12.5px] leading-snug text-[var(--ink-3)] md:hidden">
          Swipe up or down on the Home Screen to search. Touch and hold anything on it to move things around, or drag one to the edge of the screen to make a new page.
        </p>
      </div>
    </div>
  );
}
