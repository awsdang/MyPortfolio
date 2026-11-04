import type { MetadataRoute } from "next";
import { CV_URL, allNodes, projectFor, workHref } from "@/data/fs";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** Every page the static export ships, with trailing slashes to match next.config's trailingSlash. */
export default function sitemap(): MetadataRoute.Sitemap {
  const work = allNodes()
    .filter((n) => n.kind === "project" && projectFor(n.id))
    .map((n) => ({ url: `${SITE_URL}${workHref(n.id)}/`, changeFrequency: "monthly" as const, priority: 0.6 }));
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/cv/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}${CV_URL}`, changeFrequency: "monthly", priority: 0.8 },
    ...work,
  ];
}
