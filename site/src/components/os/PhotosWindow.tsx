"use client";

import { Titlebar } from "./Window";
import { useOS } from "./OSProvider";
import { GALLERY } from "@/data/gallery";

/** Photos: a grid of my photos; a photo opens in Quick Look, where the arrows step through the rest. */
export function PhotosWindow() {
  const os = useOS();
  return (
    <div className="flex h-full flex-col">
      <Titlebar
        title="Photos"
        right={<span className="text-[12.5px] font-medium tabular-nums text-[var(--ink-3)]">{GALLERY.length === 1 ? "1 photo" : `${GALLERY.length} photos`}</span>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1.5">
          {GALLERY.map((p, i) => (
            <li key={p.src}>
              <button
                onClick={() => os.openQuickLook(GALLERY, i)}
                className="press block aspect-square w-full overflow-hidden rounded-[14px] bg-[var(--surface-2)]"
                aria-label={`Open photo, ${p.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" className="h-full w-full object-cover object-[50%_20%]" draggable={false} loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
