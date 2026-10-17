import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkPage } from "@/components/os/WorkPage";
import { allNodes, getNode, projectFor, workHref, workSlug } from "@/data/fs";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;

/** Sub-projects nest under their parent: /work/qi-card, /work/qi-card/tasdid, /work/before-code/unops. */
export function generateStaticParams() {
  return allNodes()
    .filter((n) => n.kind === "project" && projectFor(n.id))
    .map((n) => ({ slug: workSlug(n.id) }));
}

/** The last segment names the project; the rest must be its parent projects. */
function resolve(slug: string[]) {
  const id = slug[slug.length - 1];
  const node = id ? getNode(id) : undefined;
  const content = id ? projectFor(id) : undefined;
  if (!node || !content) return null;
  const canonical = workSlug(id).join("/") === slug.join("/");
  return { id, node, content, canonical };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) return {};
  return {
    title: `${r.content.name}, Aws Abdulfattah`,
    description: r.content.tagline ?? r.content.summary,
    alternates: { canonical: workHref(r.id) },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r || !r.canonical) notFound();
  // Legacy flat URLs get static redirect files in scripts/prepare-pages.mjs.
  return <WorkPage node={r.node} content={r.content} />;
}
