"use client";

import { useEffect, useState } from "react";
import { useOS, type WinKind } from "@/components/os/OSProvider";
import { MacIcon, type MacIconName } from "@/components/ui/MacIcon";

type Item = { id: string; label: string; icon: MacIconName; win: WinKind; folder?: [string, string] };

/** Four apps, like the iPhone's own dock. Everything else lives on the home screen. */
const ITEMS: Item[] = [
  { id: "explorer", label: "Explore my work", icon: "finder", win: "finder", folder: ["root", "root"] },
  { id: "achievements", label: "Achievements", icon: "trophy", win: "achievements" },
  { id: "about", label: "About me", icon: "about", win: "about" },
  { id: "book", label: "Schedule a conversation", icon: "calendar", win: "booking" },
];

/** The phone's dock: a glass shelf pinned to the bottom of the screen (phones only). */
export function PhoneDock() {
  const os = useOS();
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
    const t = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <nav aria-label="Dock" className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
      <div className="glass lens pointer-events-auto mx-auto flex max-w-[420px] items-center justify-around rounded-[34px] px-2 py-3">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            onClick={() => (it.folder ? os.open("finder", { rootId: it.folder[0], nodeId: it.folder[1] }) : os.open(it.win))}
            aria-label={it.label}
            className="flex aspect-square w-[var(--dock-icon)] transition-transform duration-200 active:scale-90"
          >
            <MacIcon name={it.icon} date={today} />
          </button>
        ))}
      </div>
    </nav>
  );
}
