"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useOS } from "@/components/os/OSProvider";
import { PROFILE } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { BananaMark } from "@/components/ui/Banana";
import { MacIcon, type MacIconName } from "@/components/ui/MacIcon";

export function Footer() {
  const os = useOS();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <footer id="contact" className="scroll-mt-24 px-3 pb-40 pt-16 md:pb-32 md:pt-20">
      <Reveal className="mx-auto max-w-[1100px]">
        <div className="glass glass-thick relative overflow-hidden rounded-[40px] px-6 py-12 md:px-14 md:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: "var(--warm)" }} aria-hidden />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]">Let's work together</p>
          <h2 className="relative mt-3 max-w-[14ch] font-display text-[clamp(40px,7vw,92px)] font-extrabold leading-[0.95] tracking-tight">
            Have something <span className="text-[var(--warm)]">I can help build</span>?
          </h2>
          <ul className="relative mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <li className="glass glass-thin flex items-center rounded-[24px]">
              <ContactLink icon="mail" label="Write to me" value={PROFILE.email} onClick={() => os.open("contact")} arrow={false} />
              <button onClick={copy} className="press mr-3 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-[var(--ink-2)] hover:bg-[var(--sidebar-sel)] hover:text-[var(--ink)]" aria-label={copied ? "Email address copied" : "Copy my email address"} aria-live="polite">
                {copied ? <Check size={14} /> : <Copy size={14} />} <span className="hidden sm:inline">{copied ? "Email copied" : "Copy email"}</span>
              </button>
            </li>
            {PROFILE.phone && (
              <li className="glass glass-thin flex rounded-[24px]">
                <ContactLink icon="phone" label="Call me" value={<span dir="ltr">{PROFILE.phone}</span>} href={`tel:${PROFILE.phone.replace(/[^\d+]/g, "")}`} />
              </li>
            )}
            <li className="glass glass-thin flex rounded-[24px]">
              <ContactLink icon="github" label="GitHub" value={PROFILE.links.github.replace("https://github.com/", "")} href={PROFILE.links.github} external />
            </li>
            <li className="glass glass-thin flex rounded-[24px]">
              <ContactLink icon="linkedin" label="LinkedIn" value={PROFILE.links.linkedin.replace("https://www.linkedin.com/", "")} href={PROFILE.links.linkedin} external />
            </li>
          </ul>
          <p className="relative mt-6 text-[13px] text-[var(--ink-2)]">{PROFILE.availability}</p>
        </div>
        <p className="mt-6 flex items-center gap-2 px-3 text-[13px] font-semibold text-[var(--ink-2)]">
          <BananaMark size={18} className="text-[var(--ink)]" /> {PROFILE.name}
        </p>
      </Reveal>
    </footer>
  );
}

/** One row of the contact card: an app icon, a small label and the value. A link when given href, else a button. */
function ContactLink({
  icon,
  label,
  value,
  href,
  external,
  onClick,
  arrow = true,
}: {
  icon: MacIconName;
  label: string;
  value: ReactNode;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  arrow?: boolean;
}) {
  const body = (
    <>
      <MacIcon name={icon} size={44} />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">{label}</span>
        <span className="block truncate text-[15px] font-semibold text-[var(--ink)]">{value}</span>
      </span>
      {arrow && <ArrowUpRight size={16} className="shrink-0 text-[var(--ink-3)] transition-colors group-hover:text-[var(--ink)]" />}
    </>
  );
  const cls = "group press flex min-w-0 flex-1 items-center gap-3.5 rounded-[24px] p-3 pr-4 text-left";
  if (href) {
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {body}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {body}
    </button>
  );
}
