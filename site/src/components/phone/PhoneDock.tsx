"use client";

import { useOS, type WinKind } from "@/components/os/OSProvider";
import { MacIcon, type MacIconName } from "@/components/ui/MacIcon";
import { cn } from "@/lib/cn";
import { usePhoneHome } from "@/lib/phone-home";
import { useDeleteJoke } from "./PhoneMeme";

type Item = { id: string; label: string; name: string; icon: MacIconName; win: WinKind; folder?: [string, string] };

/**
 * Four apps, like the iPhone's own dock. Everything else lives on the home
 * screen (booking a call is the Calendar widget and the Contact widget).
 */
const ITEMS: Item[] = [
  { id: "explorer", label: "Explore my work", name: "Files", icon: "finder", win: "finder", folder: ["root", "root"] },
  { id: "achievements", label: "Achievements", name: "Achievements", icon: "trophy", win: "achievements" },
  { id: "about", label: "About me", name: "About me", icon: "about", win: "about" },
  { id: "settings", label: "Settings, appearance and the home screen", name: "Settings", icon: "settings", win: "settings" },
];

/** The phone's dock: a glass shelf pinned to the bottom of the screen (phones only). It jiggles with the home screen in edit mode. */
export function PhoneDock() {
  const os = useOS();
  const { editing } = usePhoneHome();
  const joke = useDeleteJoke();

  return (
    <nav aria-label="Dock" className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden", editing && "phone-editing")}>
      <div className="glass lens pointer-events-auto mx-auto flex max-w-[420px] items-center justify-around rounded-[34px] px-2 py-3">
        {ITEMS.map((it) => (
          <div key={it.id} className="relative">
            <button
              onClick={() => {
                if (editing) return; // apps don't open while the home screen is being edited
                if (it.folder) os.open("finder", { rootId: it.folder[0], nodeId: it.folder[1] });
                else os.open(it.win);
              }}
              aria-label={it.label}
              className={cn("flex aspect-square w-[var(--dock-icon)] transition-transform duration-200 active:scale-90", editing && "jiggle")}
            >
              <MacIcon name={it.icon} />
            </button>
            {editing && <button onClick={() => joke.ask(it.name)} aria-label={`Remove ${it.name}`} className="phone-minus absolute left-[-7px] top-[-7px]" />}
          </div>
        ))}
      </div>
      {joke.ui}
    </nav>
  );
}
