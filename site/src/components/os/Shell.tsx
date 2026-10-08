"use client";

import { Defs } from "./Defs";
import { GlassLight } from "./GlassLight";
import { QuickLook } from "./QuickLook";
import { Spotlight } from "./Spotlight";
import { Toast } from "./Toast";
import { WindowLayer } from "./Window";

/** Everything that floats above the page: windows, Quick Look, Spotlight. */
export function Shell() {
  return (
    <>
      <Defs />
      <GlassLight />
      <WindowLayer />
      <QuickLook />
      <Spotlight />
      <Toast />
    </>
  );
}
