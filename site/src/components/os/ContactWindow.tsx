"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Check, Copy, Loader2, Send } from "lucide-react";
import { Titlebar } from "./Window";
import { PROFILE } from "@/data/profile";
import { EMAIL, sendForm } from "@/lib/forms";

export function ContactWindow() {
  const formId = useId();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<{ text: string; offline?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const trap = useRef<HTMLInputElement>(null);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (status === "sending") return;
    if (!EMAIL.test(email.trim())) return setError({ text: "Enter your email address so I can reply." });
    if (!body.trim()) return setError({ text: "Tell me what you'd like to discuss." });
    if (trap.current?.value) return setStatus("sent");
    setStatus("sending");
    setError(null);
    const r = await sendForm("contact", { email: email.trim(), subject: subject.trim(), message: body.trim(), page: location.pathname });
    if (r.ok) return setStatus("sent");
    setStatus("idle");
    setError({ text: r.error, offline: r.offline });
  };
  const reset = () => {
    setSubject("");
    setBody("");
    setStatus("idle");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  const mailto = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject || "Hello Aws")}&body=${encodeURIComponent(body)}`;

  return (
    <div className="flex h-full flex-col">
      <Titlebar
        title="Write to Aws"
        right={
          status !== "sent" && (
            <button type="submit" form={formId} disabled={status === "sending"} className="glass-tint press flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold disabled:opacity-70" aria-label="Send this message to Aws">
              {status === "sending" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {status === "sending" ? "Sending" : "Send"}
            </button>
          )
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-0 px-4 pb-4">
        {status === "sent" ? (
          <Done title="Message sent" body={<>Thanks for getting in touch. I&apos;ll reply to <span className="font-semibold text-[var(--ink)]">{email.trim()}</span>.</>} again="Write another message" onAgain={reset} />
        ) : (
          <form id={formId} onSubmit={send} noValidate className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-[var(--surface)]">
            <Row label="To">
              <span className="truncate rounded-full bg-[var(--sidebar-sel)] px-3 py-0.5 text-[13px] font-medium text-[var(--accent)]">{PROFILE.name} &lt;{PROFILE.email}&gt;</span>
              <button type="button" onClick={copy} className="press ml-auto flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-[var(--ink-2)] hover:bg-[var(--sidebar-sel)]" aria-label={copied ? "Email address copied" : "Copy Aws's email address"}>
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
              </button>
            </Row>
            <Row label="From">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" maxLength={254} className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]" aria-label="Your email address" aria-required />
            </Row>
            <Row label="Subject">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What would you like to talk about?" maxLength={200} className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]" aria-label="Email subject" />
            </Row>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && void send()}
              placeholder={"Tell me about your team or project, and how you think I could help."}
              maxLength={5000}
              className="min-h-0 flex-1 resize-none bg-transparent px-5 py-4 text-[14.5px] leading-relaxed outline-none placeholder:text-[var(--ink-3)]"
              aria-label="Your message to Aws"
              aria-required
            />
            <Trap ref={trap} />
            <div className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] px-5 py-3 text-[12.5px] text-[var(--ink-3)]">
              {error ? (
                <span role="alert" className="text-[var(--warm)]">
                  {error.text}{" "}
                  {error.offline && <a href={mailto} className="font-semibold underline underline-offset-2">Send through your email app</a>}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} /> {PROFILE.availability}
                </span>
              )}
              <span className="hidden shrink-0 gap-3 sm:flex">
                <a className="hover:text-[var(--ink)]" href={PROFILE.links.github} target="_blank" rel="noopener noreferrer" aria-label="Aws's GitHub profile">GitHub</a>
                <a className="hover:text-[var(--ink)]" href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Aws's LinkedIn profile">LinkedIn</a>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-5 py-2.5">
      <span className="w-14 shrink-0 text-[13px] text-[var(--ink-3)]">{label}</span>
      {children}
    </div>
  );
}

/** Honeypot: hidden from people and screen readers, filled in by bots, whose send then goes nowhere. */
export function Trap({ ref }: { ref: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} name="website" tabIndex={-1} autoComplete="off" aria-hidden className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0" />;
}

/** The confirmation that replaces a form once it has been saved. */
export function Done({ title, body, again, onAgain }: { title: string; body: React.ReactNode; again: string; onAgain: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-[22px] bg-[var(--surface)] px-8 text-center" role="status">
      <span className="glass-tint mb-1 grid h-14 w-14 place-items-center rounded-full">
        <Check size={26} strokeWidth={2.4} />
      </span>
      <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
      <p className="max-w-[36ch] text-[14px] leading-relaxed text-[var(--ink-2)]">{body}</p>
      <button onClick={onAgain} className="glass glass-thin press mt-2 rounded-full px-4 py-2 text-[13px] font-semibold">
        {again}
      </button>
    </div>
  );
}
