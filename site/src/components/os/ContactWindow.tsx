"use client";

import { useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import { Titlebar } from "./Window";
import { PROFILE } from "@/data/profile";

export function ContactWindow() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  const send = () => {
    const href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject || "Hello from your portfolio")}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="flex h-full flex-col">
      <Titlebar
        title="New Message"
        right={
          <button onClick={send} className="glass-tint press flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold" aria-label="Send">
            <Send size={14} /> Send
          </button>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-0 px-4 pb-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-[var(--surface)]">
          <Row label="To">
            <span className="rounded-full bg-[var(--sidebar-sel)] px-3 py-0.5 text-[13px] font-medium text-[var(--accent)]">{PROFILE.name} &lt;{PROFILE.email}&gt;</span>
            <button onClick={copy} className="press ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-[var(--ink-2)] hover:bg-[var(--sidebar-sel)]" aria-label="Copy email">
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
            </button>
          </Row>
          <Row label="Subject">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Let's build something real" className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]" aria-label="Subject" />
          </Row>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"A hard problem. A wild idea. A good team.\nThat's usually where it starts."}
            className="min-h-0 flex-1 resize-none bg-transparent px-5 py-4 text-[14.5px] leading-relaxed outline-none placeholder:text-[var(--ink-3)]"
            aria-label="Message"
          />
          <div className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] px-5 py-3 text-[12.5px] text-[var(--ink-3)]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} /> {PROFILE.availability}
            </span>
            <span className="hidden gap-3 sm:flex">
              <a className="hover:text-[var(--ink)]" href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              <a className="hover:text-[var(--ink)]" href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-5 py-2.5">
      <span className="w-14 shrink-0 text-[13px] text-[var(--ink-3)]">{label}</span>
      {children}
    </div>
  );
}
