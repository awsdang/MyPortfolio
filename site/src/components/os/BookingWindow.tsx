"use client";

import { CalendarClock, ExternalLink, Mail } from "lucide-react";
import { Titlebar } from "./Window";
import { useOS } from "./OSProvider";
import { PROFILE } from "@/data/profile";

// Calendly's embed reads these from the URL (the colours only take on paid plans; otherwise it stays white)
const THEME = {
  light: { background_color: "ffffff", text_color: "1d1d1f", primary_color: "2f6fd8" },
  dark: { background_color: "1e1e20", text_color: "f5f5f7", primary_color: "5d9cf5" },
};

/** Calendly in a window. If PROFILE.links.booking is empty, it shows an email fallback. */
export function BookingWindow() {
  const os = useOS();
  const url = PROFILE.links.booking;
  let src = "";
  if (url) {
    const u = new URL(url);
    const params = { embed_domain: typeof window === "undefined" ? "awsdang.com" : window.location.host, embed_type: "Inline", hide_gdpr_banner: "1", hide_landing_page_details: "1", ...THEME[os.theme] };
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    src = u.toString();
  }
  return (
    <div className="flex h-full flex-col">
      <Titlebar
        title="Talk with Aws"
        right={
          url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Aws's calendar in Calendly"
              aria-label="Open Aws's calendar in Calendly"
              className="press ml-auto grid h-9 w-9 place-items-center rounded-full text-[var(--ink-2)] hover:bg-[var(--sidebar-sel)]"
            >
              <ExternalLink size={15} />
            </a>
          )
        }
      />
      <div className="min-h-0 flex-1 px-3 pb-3">
        {src ? (
          <iframe
            key={os.theme}
            src={src}
            title="Talk with Aws"
            className="h-full w-full rounded-[22px]"
            style={{ background: `#${THEME[os.theme].background_color}` }}
          />
        ) : (
          <div className="grid h-full place-items-center rounded-[22px] bg-[var(--surface)] p-8 text-center">
            <div className="max-w-[360px]">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[var(--surface-2)] text-[var(--ink-2)]">
                <CalendarClock size={30} strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 font-display text-[24px] font-bold tracking-tight">Let's talk about the work.</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                Tell me what you'd like to discuss and suggest a couple of times. We can arrange a conversation by email.
              </p>
              <a
                href={`mailto:${PROFILE.email}?subject=${encodeURIComponent("A conversation with Aws")}`}
                aria-label="Write to Aws in your email app"
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
