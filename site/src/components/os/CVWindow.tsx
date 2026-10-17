"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import { Titlebar } from "./Window";
import { useOS } from "./OSProvider";
import { CV_URL } from "@/data/fs";
import { cn } from "@/lib/cn";

type Lib = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type Link = { url: string; left: number; top: number; width: number; height: number };

const FILE = CV_URL.split("/").pop()!;
const A4 = 595.276 / 841.89;

// pdf.js is about 1 MB, so it loads only when this window first opens. The legacy build keeps older Safari working.
let lib: Promise<Lib> | null = null;
function loadPdfjs() {
  lib ??= import("pdfjs-dist/legacy/build/pdf.mjs").then(
    (m) => {
      m.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
      return m;
    },
    (e) => {
      lib = null;
      throw e;
    },
  );
  return lib;
}

/** The CV, Preview style: pages drawn with pdf.js (an iframe can't show a PDF on most phones), plus Download. */
export function CVWindow() {
  const os = useOS();
  const [pdf, setPdf] = useState<{ lib: Lib; doc: PDFDocumentProxy } | null>(null);
  const [failed, setFailed] = useState(false);
  const [width, setWidth] = useState(0);
  const column = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dead = false;
    let task: ReturnType<Lib["getDocument"]> | null = null;
    loadPdfjs()
      .then((m) => {
        if (dead) return;
        task = m.getDocument({ url: CV_URL });
        return task.promise.then((doc) => !dead && setPdf({ lib: m, doc }));
      })
      .catch(() => !dead && setFailed(true));
    return () => {
      dead = true;
      task?.destroy();
    };
  }, []);

  // pages follow the window at once through CSS; the sharp re-render waits until resizing settles
  useEffect(() => {
    const el = column.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    let first = true;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      clearTimeout(t);
      if (first) setWidth(w);
      else t = setTimeout(() => setWidth(w), 160);
      first = false;
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [failed]);

  const actions = os.mobile ? (
    <a href={CV_URL} download={FILE} aria-label="Download the CV" className="press ml-auto grid h-9 w-9 place-items-center rounded-full text-[var(--accent)]">
      <Download size={18} />
    </a>
  ) : (
    <div className="flex items-center gap-1">
      <a
        href={CV_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Open in a new tab"
        aria-label="Open the CV in a new tab"
        className="press grid h-9 w-9 place-items-center rounded-full text-[var(--ink-2)] hover:bg-[var(--sidebar-sel)]"
      >
        <ExternalLink size={15} />
      </a>
      <a href={CV_URL} download={FILE} className="glass-tint press inline-flex h-8 items-center gap-1.5 rounded-full pl-3 pr-3.5 text-[13px] font-semibold">
        <Download size={14} strokeWidth={2.2} /> Download
      </a>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <Titlebar title={FILE} right={actions} />
      <div className="min-h-0 flex-1 px-3 pb-3">
        <div className="h-full overflow-y-auto rounded-[22px] bg-[var(--surface-2)]">
          {failed ? (
            <Fallback />
          ) : (
            <div ref={column} className="mx-auto flex max-w-[860px] flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-6 sm:py-6">
              {pdf ? (
                Array.from({ length: pdf.doc.numPages }, (_, i) => <Page key={i} lib={pdf.lib} doc={pdf.doc} n={i + 1} width={width} />)
              ) : (
                <Sheet ratio={A4} busy />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Sheet({ ratio, busy, children }: { ratio: number; busy?: boolean; children?: ReactNode }) {
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-[3px] bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.08),0_12px_32px_-12px_rgba(0,0,0,.22)]", busy && "animate-pulse")}
      style={{ aspectRatio: ratio }}
    >
      {children}
    </div>
  );
}

function Page({ lib, doc, n, width }: { lib: Lib; doc: PDFDocumentProxy; n: number; width: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    let dead = false;
    doc.getPage(n).then(async (p) => {
      if (dead) return;
      setPage(p);
      // link boxes in % of the page, so they track the page at any size
      const vp = p.getViewport({ scale: 1 });
      const notes: { subtype: string; url?: string; rect: number[] }[] = await p.getAnnotations();
      if (dead) return;
      setLinks(
        notes
          .filter((a) => a.subtype === "Link" && a.url)
          .map((a) => {
            const [x1, y1] = vp.convertToViewportPoint(a.rect[0], a.rect[1]);
            const [x2, y2] = vp.convertToViewportPoint(a.rect[2], a.rect[3]);
            return {
              url: a.url!,
              left: (Math.min(x1, x2) / vp.width) * 100,
              top: (Math.min(y1, y2) / vp.height) * 100,
              width: (Math.abs(x2 - x1) / vp.width) * 100,
              height: (Math.abs(y2 - y1) / vp.height) * 100,
            };
          }),
      );
    }, () => {});
    return () => {
      dead = true;
    };
  }, [doc, n]);

  useEffect(() => {
    const out = canvas.current;
    const box = text.current;
    if (!page || !width || !out || !box) return;
    const vp = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    // draw off screen and swap, so the old pages stay up while a resize re-renders
    const off = document.createElement("canvas");
    off.width = Math.floor(vp.width * dpr);
    off.height = Math.floor(vp.height * dpr);
    const job = page.render({ canvas: off, viewport: vp, transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0] });
    job.promise.then(
      () => {
        out.width = off.width;
        out.height = off.height;
        out.getContext("2d")?.drawImage(off, 0, 0);
        setDrawn(true);
      },
      () => {},
    );
    // invisible text over the drawing, so the CV can be selected, copied and searched
    box.replaceChildren();
    box.parentElement?.style.setProperty("--total-scale-factor", String(vp.scale));
    const layer = new lib.TextLayer({ textContentSource: page.streamTextContent(), container: box, viewport: vp });
    layer.render().catch(() => {});
    return () => {
      job.cancel();
      layer.cancel();
    };
  }, [lib, page, width]);

  const vp = page?.getViewport({ scale: 1 });
  return (
    <Sheet ratio={vp ? vp.width / vp.height : A4} busy={!drawn}>
      <canvas ref={canvas} className={cn("absolute inset-0 h-full w-full transition-opacity duration-300", drawn ? "opacity-100" : "opacity-0")} aria-hidden />
      <div className="pdf-page absolute inset-0" aria-label={`Page ${n} of ${doc.numPages}`} role="document">
        <div ref={text} className="textLayer" />
      </div>
      {links.map((l) => {
        const mail = l.url.startsWith("mailto:");
        return (
          <a
            key={`${l.url}${l.left}${l.top}`}
            href={l.url}
            target={mail ? undefined : "_blank"}
            rel={mail ? undefined : "noopener noreferrer"}
            title={l.url.replace(/^mailto:/, "")}
            className="absolute z-[2] rounded-[2px] hover:bg-[color-mix(in_oklab,var(--accent)_16%,transparent)]"
            style={{ left: `${l.left}%`, top: `${l.top}%`, width: `${l.width}%`, height: `${l.height}%` }}
          />
        );
      })}
    </Sheet>
  );
}

function Fallback() {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div className="max-w-[340px]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[var(--surface)] text-[var(--ink-2)]">
          <FileText size={30} strokeWidth={1.6} />
        </span>
        <h3 className="mt-5 font-display text-[22px] font-bold tracking-tight">My CV couldn't be previewed.</h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">Download the PDF to read it, or open it in another tab.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <a href={CV_URL} download={FILE} className="glass-tint press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold">
            <Download size={15} /> Download CV
          </a>
          <a href={CV_URL} target="_blank" rel="noopener noreferrer" className="glass glass-thin press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium">
            Open PDF <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
