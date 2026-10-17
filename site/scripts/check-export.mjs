import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(site, "out");

async function files(dir) {
  const paths = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) paths.push(...await files(path));
    else paths.push(path);
  }
  return paths;
}

const homepage = await readFile(join(output, "index.html"), "utf8");
assert(homepage.includes("/_next/static/"), "The Pages artifact must contain the new Next.js portfolio.");
assert(homepage.includes("Aws Abdulfattah"), "The homepage must contain the portfolio content.");
for (const path of ["404.html", ".nojekyll", "CNAME", "cv/Aws_Abdulfattah_CV.pdf"]) await access(join(output, path));
assert.equal((await readFile(join(output, "CNAME"), "utf8")).trim(), (await readFile(join(site, "..", "CNAME"), "utf8")).trim());

const missing = new Set();
const links = new Set();
async function checkUrl(value) {
  if (!value.startsWith("/") || value.startsWith("//")) return;
  const path = decodeURIComponent(new URL(value.replaceAll("&amp;", "&"), "https://awsdang.com").pathname);
  if (links.has(path)) return;
  links.add(path);
  const file = join(output, path);
  try {
    if ((await stat(file)).isDirectory()) await access(join(file, "index.html"));
  } catch {
    missing.add(path);
  }
}

let pages = 0;
for (const path of await files(output)) {
  if (!path.endsWith(".html")) continue;
  pages++;
  const html = await readFile(path, "utf8");
  for (const match of html.matchAll(/(?:href|src|poster)="([^"<>]+)"/g)) await checkUrl(match[1]);
}

// Include images and downloads used only by windows opened after hydration.
for (const path of await files(join(site, "src"))) {
  if (!/\.(?:tsx?|json)$/.test(path)) continue;
  const source = await readFile(path, "utf8");
  for (const match of source.matchAll(/["'`](\/[^"'`\s<>{}]+\.(?:png|jpe?g|webp|svg|pdf|zip|mjs|woff2?|ttf|mp4|webm))["'`]/g)) await checkUrl(match[1]);
  if (path.endsWith("achievements.ts")) {
    for (const match of source.matchAll(/\bcert\("([^"]+)",/g)) {
      await checkUrl(`/certs/${match[1]}.webp`);
      await checkUrl(`/certs/${match[1]}-thumb.webp`);
    }
  }
}

assert.equal(missing.size, 0, `Missing exported files:\n${[...missing].join("\n")}`);
console.log(`Verified ${pages} HTML pages and ${links.size} local routes, images, scripts and downloads.`);
