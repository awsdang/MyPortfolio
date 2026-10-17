import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkPage } from "@/components/os/WorkPage";
import { allNodes, getNode, projectFor } from "@/data/fs";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return allNodes()
    .filter((n) => n.kind === "project" && projectFor(n.id))
    .map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = projectFor(id);
  if (!c) return {};
  return { title: `${c.name} — Aws Abdulfattah`, description: c.tagline ?? c.summary };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const node = getNode(id);
  const content = projectFor(id);
  if (!node || !content) notFound();
  return <WorkPage node={node} content={content} />;
}
