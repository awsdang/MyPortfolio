"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { ProjectPage } from "./ProjectPage";
import type { FsNode, ProjectContent } from "@/data/types";

/** Full-page version of a project (same component as inside the Finder window). */
export function WorkPage({ node, content }: { node: FsNode; content: ProjectContent }) {
  const router = useRouter();
  return (
    <main className="relative min-h-[100dvh]">
      <MenuBar />
      <Dock mode="fixed" />
      <div className="mx-auto max-w-[980px] px-3 pb-40 pt-28">
        <Link href="/" className="glass glass-thin press mb-4 inline-flex items-center gap-1.5 rounded-full py-2 pl-3 pr-4 text-[13px] font-medium">
          <ArrowLeft size={15} /> Back to the desktop
        </Link>
        <div className="glass glass-thick overflow-hidden rounded-[36px] p-2 md:p-3">
          <div className="rounded-[28px] bg-[var(--surface)]">
            <ProjectPage node={node} content={content} fullPage onOpenChild={(c) => router.push(`/work/${c.id}`)} />
          </div>
        </div>
      </div>
    </main>
  );
}
