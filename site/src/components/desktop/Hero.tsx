"use client";

import { Board, Draggable } from "./Board";
import { DesktopFolder } from "./DesktopFolder";
import { StickyNote } from "./StickyNote";
import { CalendarWidget, ClockWidget, MusicWidget, PhotoWidget, PrinciplesWidget } from "./Widgets";
import { MenuBar } from "@/components/os/MenuBar";
import { PhoneHome } from "@/components/phone/PhoneHome";
import { useOS } from "@/components/os/OSProvider";
import { DESKTOP } from "@/data/fs";

/**
 * Desktop layout: widgets on the left (photo + clock, principles + calendar,
 * then the player), the sticky note beside them, folders on the right.
 * Positions follow the viewport; everything stays draggable inside the hero.
 */
function useLayout(vw: number, vh: number) {
  const lg = vw >= 1024;
  const showPrinciples = lg && vh >= 760;
  // the note sits beside the widget column, top-aligned with it
  const besideWidgets = 190 + 150 + 24;
  const folderCol = vw * 0.025 + 104 + 112 + 24; // two icon columns on the right
  const roomBeside = vw - besideWidgets - folderCol;
  const beside = roomBeside >= 380;
  return {
    lg,
    showPrinciples,
    // the calendar takes the left slot when the principles card is hidden
    calLeft: showPrinciples ? 190 : 24,
    note: beside
      ? { left: besideWidgets, top: 82, w: Math.min(420, roomBeside - 16) }
      : { left: 24, top: lg ? 580 : 414, w: Math.min(420, vw - 24 - folderCol) },
  };
}

export function Hero() {
  const os = useOS();
  const L = useLayout(os.vw, os.vh);

  return (
    <section id="top" className="relative md:h-[100dvh] md:min-h-[560px]">
      {/* ───── desktop board (md+) ───── */}
      <div className="hidden md:block">
        <MenuBar />
        <Board key={os.desktopKey}>
          <Draggable id="photo" style={{ left: 24, top: 82 }} label="My photo">
            <PhotoWidget />
          </Draggable>
          <Draggable id="clock" style={{ left: 190, top: 82 }} label="Clock">
            <ClockWidget />
          </Draggable>
          {L.showPrinciples && (
            <Draggable id="principles" style={{ left: 24, top: 248 }} label="Principles">
              <PrinciplesWidget square />
            </Draggable>
          )}
          <Draggable id="cal" style={{ left: L.calLeft, top: 248 }} label="Calendar">
            <CalendarWidget />
          </Draggable>
          {L.lg && (
            <Draggable id="music" style={{ left: 24, top: 414 }} label="Music preview">
              <MusicWidget className="!w-[316px]" />
            </Draggable>
          )}

          <Draggable id="note" style={{ left: L.note.left, top: L.note.top, width: L.note.w }} label="Meet Aws">
            <StickyNote className="-rotate-[1.6deg]" />
          </Draggable>

          {DESKTOP.map((f, i) => (
            <Draggable key={f.id} id={f.id} style={{ right: i < 4 ? "2.5%" : "calc(2.5% + 112px)", top: 82 + (i % 4) * 110 }} label={f.name}>
              <DesktopFolder node={f} />
            </Draggable>
          ))}
        </Board>
      </div>

      {/* ───── phone (<768px): an iPhone home screen ───── */}
      <div className="md:hidden">
        <PhoneHome />
      </div>
    </section>
  );
}
