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

export function zoomRect(vw: number, vh: number): Rect {
  return { x: 10, y: MENUBAR_H + 8, w: vw - 20, h: vh - MENUBAR_H - DOCK_SAFE - 8 };
}

export function halfRect(side: "left" | "right", vw: number, vh: number): Rect {
  const h = vh - MENUBAR_H - DOCK_SAFE - 8;
  const w = (vw - 28) / 2;
  return { x: side === "left" ? 10 : 18 + w, y: MENUBAR_H + 8, w, h };
}
