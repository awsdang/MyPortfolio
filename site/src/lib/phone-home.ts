"use client";

import { useSyncExternalStore } from "react";

/**
 * The phone home screen's layout: which item sits on which page, in what
 * order, and whether the screen is in edit ("jiggle") mode. Items are packed
 * into a 4x6 grid per page, first fit, like iOS. A visitor's own arrangement
 * is kept in localStorage; nothing is ever deleted (the minus badge only
 * tells a joke).
 */

export type Size = "app" | "small" | "medium" | "large";
export const COLS = 4;
export const ROWS = 6;
const CELLS: Record<Size, [number, number]> = { app: [1, 1], small: [2, 2], medium: [4, 2], large: [4, 4] };

/** Every item that can live on the home screen, and its size. */
export const SIZE: Record<string, Size> = {
  note: "medium",
  clock: "small",
  products: "app",
  "ai-skills": "app",
  contact: "app",
  cv: "app",
  terminal: "app",
  "app-claude": "app",
  calendar: "small",
  "app-chatgpt": "app",
  bin: "app",
  stack: "large",
  music: "small",
  photos: "small",
  about: "medium",
  achievements: "medium",
  talk: "medium",
};

export const DEFAULT_PAGES: string[][] = [
  ["note", "clock", "products", "ai-skills", "contact", "cv", "terminal", "app-claude", "calendar", "app-chatgpt", "bin"],
  ["stack", "music", "photos"],
  ["about", "achievements", "talk"],
];

export type Placed = { id: string; col: number; row: number; w: number; h: number };

/**
 * Places a page's items in order, each at the first free spot it fits; what
 * doesn't fit overflows. Like iOS, a small widget only sits in the left or the
 * right half, so the icons around it stay in their columns.
 */
export function pack(ids: string[]): { placed: Placed[]; overflow: string[] } {
  const used = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(false));
  const placed: Placed[] = [];
  const overflow: string[] = [];
  for (const id of ids) {
    const [w, h] = CELLS[SIZE[id] ?? "app"];
    let spot: [number, number] | null = null;
    for (let r = 0; r <= ROWS - h && !spot; r++)
      for (let c = 0; c <= COLS - w && !spot; c += w > 1 ? w : 1) {
        let free = true;
        for (let y = r; y < r + h && free; y++) for (let x = c; x < c + w && free; x++) free = !used[y][x];
        if (free) spot = [r, c];
      }
    if (!spot) {
      overflow.push(id);
      continue;
    }
    const [r, c] = spot;
    for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) used[y][x] = true;
    placed.push({ id, col: c, row: r, w, h });
  }
  return { placed, overflow };
}

/**
 * Pushes whatever doesn't fit on a page onto the next one (making pages as
 * needed). `keep` stays on its page: others make room for it.
 */
export function normalize(pages: string[][], keep?: { id: string; page: number }): string[][] {
  const out = pages.map((p) => [...p]);
  for (let i = 0; i < out.length; i++) {
    if (keep && i === keep.page) {
      while (pack(out[i]).overflow.includes(keep.id)) {
        let j = out[i].length - 1;
        while (j >= 0 && out[i][j] === keep.id) j--;
        if (j < 0) break;
        const [moved] = out[i].splice(j, 1);
        (out[i + 1] ??= []).unshift(moved);
      }
    }
    const { overflow } = pack(out[i]);
    if (overflow.length) {
      out[i] = out[i].filter((id) => !overflow.includes(id));
      (out[i + 1] ??= []).unshift(...overflow);
    }
  }
  return out;
}

const dropEmpty = (pages: string[][]) => {
  const p = pages.filter((x) => x.length);
  return p.length ? p : [[]];
};

/** Moves `id` to `page` at `index` (end if omitted); a page one past the last is created. */
export function moveItem(pages: string[][], id: string, page: number, index?: number): string[][] {
  const out = pages.map((p) => p.filter((x) => x !== id));
  while (out.length <= page) out.push([]);
  const at = index === undefined ? out[page].length : Math.min(index, out[page].length);
  out[page].splice(at, 0, id);
  return normalize(out, { id, page });
}

/* ── store ── */

type State = { pages: string[][]; editing: boolean };
const KEY = "aws-phone-home-v1";
const SERVER: State = { pages: DEFAULT_PAGES, editing: false };
let state: State = SERVER;
const subs = new Set<() => void>();
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  subs.forEach((f) => f());
};
const save = (pages: string[][]) => {
  try {
    if (JSON.stringify(pages) === JSON.stringify(DEFAULT_PAGES)) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(pages));
  } catch {}
};

export const phoneHome = {
  subscribe(f: () => void) {
    subs.add(f);
    return () => subs.delete(f);
  },
  /** Reads the visitor's saved layout: unknown ids are dropped, new items are added at the end. */
  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (!Array.isArray(raw)) return;
      const seen = new Set<string>();
      const pages = raw.map((p: unknown) => (Array.isArray(p) ? p : []).filter((id): id is string => typeof id === "string" && id in SIZE && !seen.has(id) && !!seen.add(id)));
      const missing = Object.keys(SIZE).filter((id) => !seen.has(id));
      if (missing.length) pages.push(missing);
      set({ pages: dropEmpty(normalize(pages)) });
    } catch {}
  },
  /** While dragging: not saved yet, empty pages allowed. */
  preview(pages: string[][]) {
    set({ pages });
  },
  commit(pages: string[][]) {
    const p = dropEmpty(normalize(pages));
    set({ pages: p });
    save(p);
  },
  edit(on: boolean) {
    if (on === state.editing) return;
    set(on ? { editing: true } : { editing: false, pages: dropEmpty(state.pages) });
  },
  reset() {
    set({ pages: DEFAULT_PAGES, editing: false });
    save(DEFAULT_PAGES);
  },
  get: () => state,
};

export function usePhoneHome() {
  return useSyncExternalStore(phoneHome.subscribe, phoneHome.get, () => SERVER);
}
