"use client";

import { FolderIcon, NodeIcon } from "@/components/ui/Icons";
import { useOS } from "@/components/os/OSProvider";
import type { FsNode } from "@/data/types";
import { cn } from "@/lib/cn";

/** Anything sitting on the desktop: folders open a Finder window, files open or link out. */
export function DesktopFolder({ node, className, size = 68 }: { node: FsNode; className?: string; size?: number }) {
  const os = useOS();
  const isFolder = node.kind === "folder";
  const isOpen = isFolder && os.wins.some((w) => w.id === `finder:${node.id}`);
  const activate = () => {
    if (isFolder) return os.open("finder", { rootId: node.id, nodeId: node.id });
    if (node.file) os.openHref(node.file.href);
  };
  return (
    <button
      onClick={activate}
      className={cn("group flex w-[104px] flex-col items-center gap-1.5 rounded-2xl p-1 outline-offset-2", className)}
      aria-label={isFolder ? `Open ${node.name}` : node.summary ? `${node.name}, ${node.summary}` : node.name}
      title={!isFolder ? node.summary : undefined}
      draggable={false}
    >
      <span className="grid place-items-center transition-transform duration-300 group-hover:scale-105 group-active:scale-95" style={{ height: size * 0.82 }}>
        {isFolder ? <FolderIcon tint={node.tint} glyph={node.glyph} size={size} open={isOpen} /> : <NodeIcon node={node} size={size * 0.86} />}
      </span>
      <span className="label-chip max-w-full rounded-[7px] px-2 py-0.5 text-center text-[12px] font-semibold leading-tight">{node.name}</span>
    </button>
  );
}
