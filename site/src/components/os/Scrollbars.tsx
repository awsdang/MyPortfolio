"use client";

import { useEffect, useRef } from "react";

const IDLE_MS = 900;
const EDGE_PX = 16;
const MIN_THUMB = 36;

/**
 * Overlay scrollbars (styles in globals.css). Inner scrollers get
 * [data-scrolling] while they move. The page gets its own glass pill,
 * since its native bar is hidden: it fades in on scroll or when the mouse
 * reaches the right edge, can be dragged, and a click on the rail pages.
 */
export function Scrollbars() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!rail || !thumb) return;
    const root = document.documentElement;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const timers = new WeakMap<Element, number>();
    let raf = 0;
    let idle = 0;
    let near = false;
    let drag: { y: number; top: number; ratio: number } | null = null;
    let thumbH = 0;

    const layout = () => {
      raf = 0;
      const view = root.clientHeight;
      const full = root.scrollHeight;
      const track = rail.clientHeight;
      if (full - view < 2) {
        rail.removeAttribute("data-show");
        return;
      }
      thumbH = Math.max(MIN_THUMB, Math.round((track * view) / full));
      const y = ((track - thumbH) * window.scrollY) / (full - view);
      thumb.style.height = `${thumbH}px`;
      thumb.style.transform = `translateY(${Math.min(track - thumbH, Math.max(0, y))}px)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(layout);
    };

    const hideLater = () => {
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (!near && !drag && !rail.hasAttribute("data-hover")) rail.removeAttribute("data-show");
      }, IDLE_MS);
    };
    const show = () => {
      if (!fine.matches || root.scrollHeight - root.clientHeight < 2) return;
      if (!rail.hasAttribute("data-show")) {
        layout();
        rail.setAttribute("data-show", "");
      }
      hideLater();
    };

    const onScroll = (e: Event) => {
      if (e.target === document) {
        schedule();
        show();
        return;
      }
      const el = e.target;
      if (!(el instanceof Element)) return;
      if (!el.hasAttribute("data-scrolling")) el.setAttribute("data-scrolling", "");
      clearTimeout(timers.get(el));
      timers.set(el, window.setTimeout(() => el.removeAttribute("data-scrolling"), IDLE_MS));
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || drag) return;
      const isNear = e.clientX >= root.clientWidth - EDGE_PX;
      if (isNear === near) return;
      near = isNear;
      if (near) show();
      else hideLater();
    };
    const onLeaveDoc = () => {
      near = false;
      hideLater();
    };
    const onEnter = () => rail.setAttribute("data-hover", "");
    const onLeave = () => {
      rail.removeAttribute("data-hover");
      hideLater();
    };

    const onThumbDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const travel = rail.clientHeight - thumbH;
      drag = { y: e.clientY, top: window.scrollY, ratio: travel > 0 ? (root.scrollHeight - root.clientHeight) / travel : 0 };
      thumb.setPointerCapture(e.pointerId);
      rail.setAttribute("data-drag", "");
    };
    const onThumbMove = (e: PointerEvent) => {
      if (!drag) return;
      window.scrollTo({ top: drag.top + (e.clientY - drag.y) * drag.ratio, behavior: "instant" });
    };
    const onThumbUp = () => {
      if (!drag) return;
      drag = null;
      rail.removeAttribute("data-drag");
      hideLater();
    };
    // A click on the rail itself pages up or down, like macOS.
    const onRailDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.target !== rail) return;
      e.preventDefault();
      const above = e.clientY < thumb.getBoundingClientRect().top;
      window.scrollBy({ top: (above ? -1 : 1) * root.clientHeight * 0.9, behavior: "smooth" });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", schedule);
    document.documentElement.addEventListener("pointerleave", onLeaveDoc);
    rail.addEventListener("pointerenter", onEnter);
    rail.addEventListener("pointerleave", onLeave);
    rail.addEventListener("pointerdown", onRailDown);
    thumb.addEventListener("pointerdown", onThumbDown);
    thumb.addEventListener("pointermove", onThumbMove);
    thumb.addEventListener("pointerup", onThumbUp);
    thumb.addEventListener("pointercancel", onThumbUp);
    schedule();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", schedule);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
      rail.removeEventListener("pointerenter", onEnter);
      rail.removeEventListener("pointerleave", onLeave);
      rail.removeEventListener("pointerdown", onRailDown);
      thumb.removeEventListener("pointerdown", onThumbDown);
      thumb.removeEventListener("pointermove", onThumbMove);
      thumb.removeEventListener("pointerup", onThumbUp);
      thumb.removeEventListener("pointercancel", onThumbUp);
    };
  }, []);

  return (
    <div ref={railRef} className="page-scroll" aria-hidden>
      <div ref={thumbRef} className="page-scroll-thumb" />
    </div>
  );
}
