"use client";

import { useEffect, useRef } from "react";
import { useOS, type WinKind } from "./OSProvider";

/** Opens a window once the page loads, so a route like /cv lands on the desktop with that window up. */
export function OpenOnLoad({ kind }: { kind: WinKind }) {
  const { open } = useOS();
  // Through a ref, like OSProvider's #cv handler: the first render's open() still sizes
  // windows for the 1280x800 server viewport, and the effect must use the measured one.
  const openRef = useRef(open);
  openRef.current = open;
  // once on load only: reopening on later renders would fight the visitor closing it
  useEffect(() => void openRef.current(kind), [kind]);
  return null;
}
