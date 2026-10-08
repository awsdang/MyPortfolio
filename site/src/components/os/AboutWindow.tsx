"use client";

import { Titlebar } from "./Window";
import { AboutContent } from "@/components/ui/AboutContent";

export function AboutWindow() {
  return (
    <div className="flex h-full flex-col">
      <Titlebar title="about-me.txt" />
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="mx-auto max-w-[780px]">
          <AboutContent />
        </div>
      </div>
    </div>
  );
}
