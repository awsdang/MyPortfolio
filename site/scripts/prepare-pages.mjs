import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(site, "out");
const domain = (await readFile(join(site, "..", "CNAME"), "utf8")).trim();
await writeFile(join(output, "CNAME"), `${domain}\n`);
await writeFile(join(output, ".nojekyll"), "");

async function projectRoutes(dir) {
  const routes = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) routes.push(...await projectRoutes(path));
    else if (entry.name === "index.html") routes.push(dirname(path));
  }
  return routes;
}

const projects = await projectRoutes(join(output, "work"));
const redirects = new Map([
  ["cv.html", "/#cv"],
  ["recruiter.html", "/#about"],
  ["ai-skills/index.html", "/#ai-skills"],
]);
for (const dir of projects) {
  const route = relative(output, dir).split(sep).join("/");
  const id = route.split("/").at(-1);
  const target = `/${route}/`;
  redirects.set(`${route}.html`, target);
  redirects.set(`work/${id}.html`, target);
  if (route !== `work/${id}`) redirects.set(`work/${id}/index.html`, target);
}

for (const [path, target] of redirects) {
  const file = join(output, path);
  await mkdir(dirname(file), { recursive: true });
  // These URLs are generated only from known routes, not visitor input.
  await writeFile(file, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Page moved, Aws Abdulfattah</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://${domain}${target}">
<meta http-equiv="refresh" content="0;url=${target}">
<script>const target=new URL(${JSON.stringify(target)},location.origin);target.search=location.search;if(!target.hash)target.hash=location.hash;location.replace(target.href);</script>
</head><body><p>This page has moved. <a href="${target}">Continue to the portfolio.</a></p></body></html>\n`);
}

// Keep downloads linked from the previous site available at their existing URLs.
await cp(join(site, "..", "cv"), join(output, "cv"), { recursive: true });
await cp(join(site, "..", "downloads"), join(output, "downloads"), { recursive: true });
console.log(`Prepared ${projects.length} project pages and ${redirects.size} legacy redirects for ${domain}.`);
