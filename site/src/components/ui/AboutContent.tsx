"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  ChevronRight,
  Clock3,
  Coffee,
  FileDown,
  GraduationCap,
  Mail,
  MapPin,
  PencilRuler,
  Route,
  Send,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useOS } from "@/components/os/OSProvider";
import { NodeIcon } from "@/components/ui/Icons";
import { MacIcon } from "@/components/ui/MacIcon";
import { ABOUT } from "@/data/about";
import { ACHIEVEMENTS } from "@/data/achievements";
import { getNode, rootOf } from "@/data/fs";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/cn";

type SectionId = "overview" | "now" | "path" | "work" | "lead" | "learning" | "life" | "contact";

export const ABOUT_SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "now", label: "Current work", icon: Clock3 },
  { id: "path", label: "How I got here", icon: Route },
  { id: "work", label: "How I work", icon: PencilRuler },
  { id: "lead", label: "Building with people", icon: UsersRound },
  { id: "learning", label: "My studies", icon: GraduationCap },
  { id: "life", label: "A little more about me", icon: Coffee },
  { id: "contact", label: "Talk with me", icon: Send },
];

const kicker = "text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]";
const pill = "press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium";
/** era dots on the timeline: clay for buildings, blue for software */
const ERA_DOT = ["bg-[var(--warm)]", "bg-[color-mix(in_oklab,var(--warm)_50%,var(--accent))]", "bg-[var(--accent)]"];

function Block({ id, title, lede, children }: { id: SectionId; title: string; lede?: string; children: ReactNode }) {
  return (
    <section data-about={id} aria-label={title} className="border-t border-[var(--hairline)] pt-9">
      <h2 className="font-display text-[24px] font-bold leading-tight tracking-tight @2xl:text-[28px]">{title}</h2>
      {lede && <p className="mt-1.5 max-w-[60ch] text-[15.5px] leading-snug text-[var(--ink-2)]">{lede}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AboutContent() {
  const os = useOS();
  const openNode = (id: string) => os.open("finder", { rootId: rootOf(id), nodeId: id });

  const actions = (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => os.open("booking")} className={cn("glass-tint", pill)}>
        <CalendarPlus size={14} /> Talk with me
      </button>
      <button onClick={() => os.open("contact")} className={cn("glass glass-thin", pill)}>
        <Mail size={14} /> Write to me
      </button>
      <button onClick={() => os.open("cv")} className={cn("glass glass-thin", pill)}>
        <FileDown size={14} /> Read my CV
      </button>
      <a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer" className={cn("glass glass-thin", pill)}>
        LinkedIn <ArrowUpRight size={13} />
      </a>
    </div>
  );

  return (
    <div className="@container">
      <div className="mx-auto flex max-w-[800px] flex-col gap-10 px-5 pb-12 pt-4 @2xl:px-8">
        {/* ── Overview: a contact card, then the one-paragraph version ── */}
        <section data-about="overview" aria-label="Overview">
          <div className="flex flex-col gap-5 @xl:flex-row @xl:items-center">
            {/* no photo on phones */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PROFILE.photo.src}
              alt={PROFILE.photo.alt}
              className="h-[104px] w-[104px] shrink-0 rounded-[30px] object-cover object-[50%_20%] shadow-[0_10px_30px_rgba(18,26,48,0.18)] max-md:hidden"
              draggable={false}
            />
            <div className="min-w-0">
              <p className={kicker}>About me</p>
              <h1 className="mt-1 font-display text-[34px] font-bold leading-[1.04] tracking-tight @2xl:text-[42px]">{PROFILE.name}</h1>
              <p className="mt-1 text-[16px] leading-snug text-[var(--ink-2)]">{ABOUT.role}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-[var(--ink-2)]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--ink-3)]" /> Baghdad, Iraq
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
                  {PROFILE.availability}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-8 font-display text-[30px] font-extrabold leading-[1.04] tracking-tight @2xl:text-[40px]">
            {ABOUT.headline.split(/(?<=\.)\s+/).map((line, i) => (
              <span key={line} className={cn("block", i === 0 && "text-[var(--ink-3)]")}>
                {line}
              </span>
            ))}
          </p>
          <p className="mt-4 max-w-[62ch] text-[16.5px] leading-relaxed text-[var(--ink-2)]">{ABOUT.intro}</p>
          <div className="mt-5">{actions}</div>

          <dl className="mt-7 grid gap-x-8 gap-y-2.5 rounded-[22px] bg-[var(--surface-2)] px-5 py-4 text-[13.5px] @2xl:grid-cols-2">
            {ABOUT.facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[72px_1fr] gap-3">
                <dt className="font-semibold text-[var(--ink-3)]">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Right now ── */}
        <Block id="now" title={ABOUT.now.title} lede={ABOUT.now.lede}>
          <div className="grid gap-3 @3xl:grid-cols-3">
            {ABOUT.now.items.map((it) => {
              const n = getNode(it.node);
              if (!n) return null;
              return (
                <button
                  key={it.node}
                  onClick={() => openNode(it.node)}
                  className="group flex flex-col rounded-[22px] bg-[var(--surface)] p-4 text-left shadow-[0_1px_2px_rgba(18,26,48,0.06)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-3">
                    <NodeIcon node={n} size={50} />
                    <span>
                      <span className="block font-display text-[19px] font-bold leading-tight tracking-tight">{n.name}</span>
                      <span className="block text-[12px] text-[var(--ink-3)]">{it.since}</span>
                    </span>
                  </span>
                  <span className="mt-3 block text-[13.5px] leading-relaxed text-[var(--ink-2)]">{it.text}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[12.5px] font-semibold text-[var(--accent)]">
                    Open {n.name} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>
          <p className={cn(kicker, "mb-2 mt-6")}>{ABOUT.now.sideLabel}</p>
          <ul className="grid gap-1 @3xl:grid-cols-3">
            {ABOUT.now.side.map((it) => {
              const n = getNode(it.node);
              if (!n) return null;
              return (
                <li key={it.node}>
                  <button onClick={() => openNode(it.node)} className="press flex w-full items-start gap-3 rounded-[16px] p-2 text-left hover:bg-[var(--sidebar-sel)]">
                    <span className="shrink-0">
                      <NodeIcon node={n} size={38} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold leading-tight">{n.name}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--ink-2)]">{it.text}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Block>

        {/* ── How I got here: one timeline, three eras ── */}
        <Block id="path" title={ABOUT.path.title} lede={ABOUT.path.lede}>
          <div className="flex flex-col gap-2">
            {ABOUT.path.eras.map((era, e) => (
              <div key={era.name}>
                {era.name && (
                  <p className="mb-2 pl-5 @lg:grid @lg:grid-cols-[112px_1fr] @lg:gap-4 @lg:pl-0">
                    <span className="hidden @lg:block" />
                    <span className={cn(kicker, "-ml-px")}>{era.name}</span>
                  </p>
                )}
                <ol>
                  {era.steps.map((st) => (
                    <li key={st.title} className="@lg:grid @lg:grid-cols-[112px_1fr] @lg:gap-4">
                      <span className="hidden pt-[3px] text-right font-mono text-[11.5px] leading-snug text-[var(--ink-3)] @lg:block">{st.when}</span>
                      <div className="relative border-l border-[var(--hairline)] pb-5 pl-5">
                        <span className={cn("absolute -left-[4.5px] top-[7px] h-2 w-2 rounded-full ring-4 ring-[var(--glass-thick-a)]", ERA_DOT[e] ?? ERA_DOT[2])} />
                        {st.when && <span className="mb-0.5 block font-mono text-[11px] leading-snug text-[var(--ink-3)] @lg:hidden">{st.when}</span>}
                        {st.node ? (
                          <button onClick={() => openNode(st.node!)} className="group inline-flex items-center gap-1 text-left text-[15px] font-semibold leading-snug hover:text-[var(--accent)]">
                            {st.title}
                            <ChevronRight size={14} className="text-[var(--ink-3)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                          </button>
                        ) : (
                          <p className="text-[15px] font-semibold leading-snug">{st.title}</p>
                        )}
                        <p className="mt-1 max-w-[58ch] text-[14px] leading-relaxed text-[var(--ink-2)]">{st.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Block>

        {/* ── How I work: the habit on site, and what it became ── */}
        <Block id="work" title={ABOUT.work.title} lede={ABOUT.work.lede}>
          <ol className="grid gap-3 @2xl:grid-cols-2">
            {ABOUT.work.items.map((it, i) => (
              <li key={it.title ?? it.now} className="rounded-[22px] bg-[var(--surface-2)] p-5">
                <span className="font-mono text-[11px] text-[var(--ink-3)]">{String(i + 1).padStart(2, "0")}</span>
                {it.title && <p className="mt-0.5 font-display text-[19px] font-bold leading-tight tracking-tight">{it.title}</p>}
                <dl className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed">
                  {it.then && <div>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--warm)]">In architecture</dt>
                    <dd className="text-[var(--ink-2)]">{it.then}</dd>
                  </div>}
                  <div>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">In software</dt>
                    <dd>{it.now}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </Block>

        {/* ── Leading people ── */}
        <Block id="lead" title={ABOUT.lead.title} lede={ABOUT.lead.lede}>
          <ol className="grid grid-cols-2 gap-2.5 @2xl:grid-cols-3">
            {ABOUT.lead.items.map((it) => (
              <li key={it.label} className="flex flex-col rounded-[20px] bg-[var(--surface-2)] px-4 py-3.5">
                <span className="font-display text-[28px] font-bold leading-none tracking-tight">{it.value}</span>
                <span className="mt-1.5 text-[12.5px] leading-snug text-[var(--ink-2)]">{it.label}</span>
                <span className="mt-auto pt-2 font-mono text-[11px] text-[var(--ink-3)]">{it.when}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-[var(--ink-2)]">{ABOUT.lead.body}</p>
          <button onClick={() => openNode("before-code")} className={cn("glass glass-thin mt-4", pill)}>
            Read about my architecture work <ArrowRight size={14} />
          </button>
        </Block>

        {/* ── What I studied ── */}
        <Block id="learning" title={ABOUT.learning.title} lede={ABOUT.learning.lede}>
          <ul className="grid gap-2 @2xl:grid-cols-2">
            {ACHIEVEMENTS.filter((a) => a.kind === "study").map((a) => (
              <li key={a.id} className="flex gap-3 rounded-[18px] bg-[var(--surface-2)] p-3">
                <span className="block h-11 w-11 shrink-0">
                  <MacIcon name={a.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold leading-snug">{a.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--ink-2)]">
                    {a.detail}
                    {a.note && `. ${a.note}`}
                  </span>
                  {a.meta && <span className="mt-1 block font-mono text-[11px] text-[var(--ink-3)]">{a.meta}</span>}
                </span>
              </li>
            ))}
          </ul>
          <button onClick={() => os.open("achievements", { nodeId: "study" })} className={cn("glass glass-thin mt-4", pill)}>
            See my studies and certificates <ArrowRight size={14} />
          </button>
        </Block>

        {/* ── Off the clock ── */}
        <Block id="life" title={ABOUT.life.title}>
          <ul className="grid gap-3 @2xl:grid-cols-3">
            {ABOUT.life.items.map((it) => (
              <li key={it.title} className="rounded-[20px] bg-[var(--surface-2)] px-4 py-3.5">
                <p className="text-[14px] font-semibold">{it.title}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{it.text}</p>
              </li>
            ))}
          </ul>
          <figure className="mt-8">
            <blockquote className="max-w-[34ch] font-hand text-[27px] font-semibold leading-[1.15] text-[var(--ink)] @2xl:text-[31px]">
              {ABOUT.life.signoff}
            </blockquote>
            <figcaption className="mt-2 font-hand text-[24px] font-bold text-[var(--warm)]">{PROFILE.short}</figcaption>
          </figure>
        </Block>

        {/* ── Get in touch ── */}
        <section
          data-about="contact"
          aria-label="Contact Aws"
          className="rounded-[26px] p-6 @2xl:p-8"
          style={{ background: "linear-gradient(150deg, color-mix(in oklab, var(--accent) 12%, transparent), color-mix(in oklab, var(--accent) 4%, transparent))" }}
        >
          <h2 className="font-display text-[26px] font-bold leading-tight tracking-tight @2xl:text-[30px]">{ABOUT.contact.title}</h2>
          <p className="mt-1.5 max-w-[56ch] text-[15px] leading-relaxed text-[var(--ink-2)]">{ABOUT.contact.text}</p>
          <div className="mt-5">{actions}</div>
        </section>
      </div>
    </div>
  );
}
