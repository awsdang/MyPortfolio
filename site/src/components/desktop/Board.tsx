"use client";

import { createContext, useCallback, useContext, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

type BoardCtx = { ref: RefObject<HTMLDivElement | null>; order: string[]; raise: (id: string) => void };
const Ctx = createContext<BoardCtx | null>(null);
const ItemCtx = createContext<() => void>(() => {});

/** Brings the enclosing Draggable to the front (no-op outside a Board). */
export const useRaiseSelf = () => useContext(ItemCtx);

/**
 * The drag surface behind the desktop widgets. Items are clamped to this box
 * (with a little elastic give), never persist, and the last-touched one is
 * always on top.
 */
export function Board({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<string[]>([]);
  const raise = useCallback((id: string) => setOrder((o) => (o[o.length - 1] === id ? o : [...o.filter((x) => x !== id), id])), []);
  return (
    <Ctx.Provider value={{ ref, order, raise }}>
      <div ref={ref} className={cn("absolute inset-0", className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function Draggable({
  id,
  className,
  style,
  children,
  label,
}: {
  id: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  label?: string;
}) {
  const board = useContext(Ctx)!;
  const dragged = useRef(false);
  const rank = board.order.indexOf(id);
  const { raise } = board;
  const raiseSelf = useCallback(() => raise(id), [raise, id]);
  return (
    <motion.div
      className={cn("grabbable absolute", className)}
      style={{ ...style, zIndex: 20 + (rank + 1) }}
      drag
      dragConstraints={board.ref}
      dragElastic={0.12}
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 200, bounceDamping: 40 }}
      whileDrag={{ scale: 1.04 }}
      onPointerDown={() => board.raise(id)}
      onDragStart={() => {
        dragged.current = true;
        board.raise(id);
      }}
      onDragEnd={() => setTimeout(() => (dragged.current = false), 0)}
      onClickCapture={(e) => {
        if (dragged.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      aria-label={label}
    >
      <ItemCtx.Provider value={raiseSelf}>{children}</ItemCtx.Provider>
    </motion.div>
  );
}
