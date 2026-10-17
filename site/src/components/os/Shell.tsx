"use client";

import { useEffect } from "react";
import { Defs } from "./Defs";
import { GlassLight } from "./GlassLight";
import { QuickLook } from "./QuickLook";
import { Scrollbars } from "./Scrollbars";
import { Spotlight } from "./Spotlight";
import { Toast } from "./Toast";
import { WindowLayer } from "./Window";
import { trackErrors } from "@/lib/device";

/** Everything that floats above the page: windows, Quick Look, Spotlight. */
export function Shell() {
  useEffect(trackErrors, []);
  return (
    <>
      <Defs />
      <GlassLight />
      <Scrollbars />
      <WindowLayer />
      <QuickLook />
      <Spotlight />
      <Toast />
    </>
  );
}
