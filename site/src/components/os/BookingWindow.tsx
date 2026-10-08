"use client";

import { CalendarClock, Mail } from "lucide-react";
import { Titlebar } from "./Window";
import { PROFILE } from "@/data/profile";

/** Calendly (or any scheduler) in a window. Until PROFILE.links.booking is set, it shows a friendly fallback. */
export function BookingWindow() {
  const url = PROFILE.links.booking;
  const src = url
    ? `${url}${url.includes("?") ? "&" : "?"}hide_gdpr_banner=1&hide_landing_page_details=1&background_color=ffffff&text_color=1d1d1f&primary_color=2f6fd8`
    : "";
  return (
    <div className="flex h-full flex-col">
      <Titlebar title="Book an interview — Aws Abdulfattah" />
      <div className="min-h-0 flex-1 px-3 pb-3">
        {src ? (
          <iframe src={src} title="Book an interview with Aws" className="h-full w-full rounded-[22px] bg-white" />
        ) : (
          <div className="grid h-full place-items-center rounded-[22px] bg-[var(--surface)] p-8 text-center">
            <div className="max-w-[360px]">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[var(--surface-2)] text-[var(--ink-2)]">
                <CalendarClock size={30} strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 font-display text-[24px] font-bold tracking-tight">The booking link is on its way.</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                Until then, email me with a couple of times that work for you and I'll send an invite.
              </p>
              <a
                href={`mailto:${PROFILE.email}?subject=${encodeURIComponent("Interview with Aws")}`}
                className="glass-tint press mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold"
              >
                <Mail size={15} /> {PROFILE.email}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
