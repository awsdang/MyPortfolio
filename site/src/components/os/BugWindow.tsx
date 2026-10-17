"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ChevronDown, Loader2, Send } from "lucide-react";
import { Titlebar } from "./Window";
import { useOS } from "./OSProvider";
import { Done, Row, Trap } from "./ContactWindow";
import { PROFILE } from "@/data/profile";
import { DEVICE_LABELS, deviceInfo, type DeviceInfo } from "@/lib/device";
import { EMAIL, sendForm } from "@/lib/forms";
import { cn } from "@/lib/cn";

export function BugWindow() {
  const os = useOS();
  const formId = useId();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<{ text: string; offline?: boolean } | null>(null);
  const [details, setDetails] = useState(false);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const trap = useRef<HTMLInputElement>(null);

  const others = os.wins.filter((w) => w.kind !== "bug").map((w) => w.title);
  const othersKey = others.join("\n");
  useEffect(() => {
    setDevice(deviceInfo(othersKey ? othersKey.split("\n") : []));
  }, [othersKey, os.vw, os.vh, os.theme]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (status === "sending") return;
    if (!message.trim()) return setError({ text: "Describe what happened before sending the report." });
    if (email.trim() && !EMAIL.test(email.trim())) return setError({ text: "Check your email address, or leave it blank." });
    if (trap.current?.value) return setStatus("sent");
    setStatus("sending");
    setError(null);
    const d = deviceInfo(others);
    const device = [...(Object.keys(DEVICE_LABELS) as (keyof DeviceInfo)[]).map((k) => `${DEVICE_LABELS[k]}: ${d[k].replace(/\n/g, " / ")}`), `User agent: ${navigator.userAgent}`].join(" · ");
    const r = await sendForm("bug", { email: email.trim(), message: message.trim(), device });
    if (r.ok) return setStatus("sent");
    setStatus("idle");
    setError({ text: r.error, offline: r.offline });
  };
  const reset = () => {
    setMessage("");
    setStatus("idle");
  };

  const rows = device ? (Object.keys(DEVICE_LABELS) as (keyof DeviceInfo)[]).map((k) => [DEVICE_LABELS[k], device[k]] as const) : [];
  const summary = device ? [device.browser, device.os, device.viewport, device.theme].filter(Boolean).join(", ") : "";
  const mailto = `mailto:${PROFILE.email}?subject=${encodeURIComponent("Found a bug on your portfolio")}&body=${encodeURIComponent(
    [message, "", ...rows.map(([l, v]) => `${l}: ${v}`)].join("\n"),
  )}`;

  return (
    <div className="flex h-full flex-col">
      <Titlebar
        title="Report a bug"
        right={
          status !== "sent" && (
            <button type="submit" form={formId} disabled={status === "sending"} className="glass-tint press flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold disabled:opacity-70" aria-label="Send this bug report">
              {status === "sending" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {status === "sending" ? "Sending" : "Send"}
            </button>
          )
        }
      />
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
        {status === "sent" ? (
          <Done title="Report sent" body="Thanks for letting me know. Your report helps me understand what happened." again="Report another issue" onAgain={reset} />
        ) : (
          <form id={formId} onSubmit={send} noValidate className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-[var(--surface)]">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && void send()}
              placeholder={"Tell me what you were trying to do, what happened and what you expected."}
              maxLength={5000}
              autoFocus
              className="min-h-[120px] flex-1 resize-none border-b border-[var(--hairline)] bg-transparent px-5 py-4 text-[14.5px] leading-relaxed outline-none placeholder:text-[var(--ink-3)]"
              aria-label="What went wrong"
              aria-required
            />
            <Row label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional, if you'd like to hear back" autoComplete="email" maxLength={254} className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]" aria-label="Your email address, optional" />
            </Row>
            <div className={cn("flex min-h-0 flex-col", details && "max-h-[46%]")}>
              <button
                type="button"
                onClick={() => setDetails((d) => !d)}
                className="press flex w-full items-center gap-3 px-5 py-2.5 text-left text-[13px] hover:bg-[var(--surface-2)]"
                aria-expanded={details}
                aria-controls={`${formId}-device`}
              >
                <span className="shrink-0 text-[var(--ink-3)]">Device details</span>
                <span className="min-w-0 flex-1 truncate text-[var(--ink-2)]">{summary}</span>
                <ChevronDown size={15} className={cn("shrink-0 text-[var(--ink-3)] transition-transform", details && "rotate-180")} />
              </button>
              {details && (
                <dl id={`${formId}-device`} className="grid min-h-0 grid-cols-[minmax(92px,auto)_1fr] gap-x-4 gap-y-1.5 overflow-y-auto px-5 pb-3 text-[12.5px]">
                  {rows.map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-[var(--ink-3)]">{label}</dt>
                      <dd className="min-w-0 whitespace-pre-wrap break-words text-[var(--ink-2)]">{value}</dd>
                    </div>
                  ))}
                  <dt className="text-[var(--ink-3)]">User agent</dt>
                  <dd className="min-w-0 break-words text-[var(--ink-2)]">{typeof navigator !== "undefined" ? navigator.userAgent : ""}</dd>
                </dl>
              )}
            </div>
            <Trap ref={trap} />
            <div className="mt-auto flex items-center gap-3 border-t border-[var(--hairline)] px-5 py-3 text-[12.5px] text-[var(--ink-3)]">
              {error ? (
                <span role="alert" className="text-[var(--warm)]">
                  {error.text}{" "}
                  {error.offline && <a href={mailto} className="font-semibold underline underline-offset-2">Send the report by email</a>}
                </span>
              ) : (
                <span>Your report includes your message and the device details shown here.</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
