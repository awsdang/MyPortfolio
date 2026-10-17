"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { ProjectPage } from "./ProjectPage";
import type { FsNode, ProjectContent } from "@/data/types";
import { workBack, workHref } from "@/data/fs";

/** Full-page version of a project (same component as inside the Finder window).
 *  Back goes to the parent project (Tasdid+ to Qi), or to the desktop for top-level ones. */
export function WorkPage({ node, content }: { node: FsNode; content: ProjectContent }) {
  const router = useRouter();
  const back = workBack(node.id);
  return (
    <main className="relative min-h-[100dvh]">
      {/* the Mac menu bar is desktop only; phones get the iPhone dock */}
      <div className="max-md:hidden">
        <MenuBar />
      </div>
      <Dock mode="fixed" />
      <div className="mx-auto max-w-[980px] px-3 pb-40 pt-[max(20px,env(safe-area-inset-top))] md:pt-28">
        <Link href={back.href} className="glass glass-thin press mb-4 inline-flex items-center gap-1.5 rounded-full py-2 pl-3 pr-4 text-[13px] font-medium">
          <ArrowLeft size={15} />{" "}
          {back.href === "/" ? (
            // phones have a home screen, not a desktop
            <>
              <span className="md:hidden">Back to home</span>
              <span className="max-md:hidden">{back.label}</span>
            </>
          ) : (
            back.label
          )}
        </Link>
        <div className="glass glass-thick overflow-hidden rounded-[36px] p-2 md:p-3">
          <div className="rounded-[28px] bg-[var(--surface)]">
            <ProjectPage node={node} content={content} fullPage onOpenChild={(c) => router.push(workHref(c.id))} />
          </div>
        </div>
      </div>
    </main>
  );
}
