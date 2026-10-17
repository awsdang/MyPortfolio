export type Rect = { x: number; y: number; w: number; h: number };

export const MENUBAR_H = 30;
export const DOCK_SAFE = 104;
export const MIN_W = 440;
export const MIN_H = 320;

/** Keep a window reachable: title strip stays inside the viewport. */
export function clampRect(r: Rect, vw: number, vh: number): Rect {
  const w = Math.min(Math.max(r.w, Math.min(MIN_W, vw - 16)), vw - 8);
  const h = Math.min(Math.max(r.h, Math.min(MIN_H, vh - MENUBAR_H - 16)), vh - MENUBAR_H - 8);
  const x = Math.min(Math.max(r.x, 120 - w), vw - 120);
  const y = Math.min(Math.max(r.y, MENUBAR_H), vh - 52);
  return { x, y, w, h };
}

/** Full size: every pixel below the menu bar, edge to edge (the dock hides meanwhile). `top` is where the menu bar ends. */
export function zoomRect(vw: number, vh: number, top: number = MENUBAR_H): Rect {
  return { x: 0, y: top, w: vw, h: vh - top };
}

/** Bottom edge of the menu bar on screen; 0 once the page has scrolled it away. */
export function menuBarBottom(): number {
  if (typeof document === "undefined") return MENUBAR_H;
  const r = document.querySelector("[data-menubar]")?.getBoundingClientRect();
  return r && r.height > 0 ? Math.max(0, Math.round(r.bottom)) : 0;
}

export function halfRect(side: "left" | "right", vw: number, vh: number): Rect {
  const h = vh - MENUBAR_H - DOCK_SAFE - 8;
  const w = (vw - 28) / 2;
  return { x: side === "left" ? 10 : 18 + w, y: MENUBAR_H + 8, w, h };
}
