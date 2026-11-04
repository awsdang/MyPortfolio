// Renders the share cards public/og/home.jpg and public/og/cv.jpg (1200x630) from card.html.
// Remake them when the CV or the role changes. From site/, with the built site being served:
//   npm run build && python3 -m http.server 3101 --bind 127.0.0.1 --directory out
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node scripts/og/render.mjs
// Needs Google Chrome and poppler's pdftoppm (brew install poppler).
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, "../..");
const SITE = process.env.SITE ?? "http://127.0.0.1:3101/";
if (!process.env.PLAYWRIGHT_CORE) throw new Error("Set PLAYWRIGHT_CORE to a playwright-core folder.");
const { chromium } = await import(pathToFileURL(join(process.env.PLAYWRIGHT_CORE, "index.mjs")).href);

const svg = await readFile(join(site, "public/brand/banana-mono.svg"), "utf8");
const banana = svg.match(/ d="([^"]+)"/)[1];
const tmp = await mkdtemp(join(tmpdir(), "og-"));

// the CV's first page, as the paper on the CV card
execFileSync("pdftoppm", ["-png", "-r", "160", "-f", "1", "-l", "1", "-singlefile", join(site, "public/cv/Aws_Abdulfattah_CV.pdf"), join(tmp, "cv")]);

const browser = await chromium.launch({ channel: "chrome" });
try {
  // the desktop in light mode, as the window on the home card
  const shot = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await shot.addInitScript(() => localStorage.setItem("theme", "light"));
  await shot.goto(SITE, { waitUntil: "networkidle" });
  await shot.waitForTimeout(2500);
  await shot.screenshot({ path: join(tmp, "desktop.png") });

  const cards = {
    home: {
      kicker: "Portfolio",
      role: "Software Engineer at Qi, Founding Engineer and Technical Lead at Cardy",
      tags: "Payments · full-stack TypeScript · applied AI",
      url: "awsdang.com",
      art: "screen",
      img: pathToFileURL(join(tmp, "desktop.png")).href,
    },
    cv: {
      kicker: "Curriculum vitae",
      role: "Senior Software Engineer and Technical Lead",
      tags: "Payments · full-stack TypeScript · applied AI",
      url: "awsdang.com/cv",
      art: "paper",
      img: pathToFileURL(join(tmp, "cv.png")).href,
    },
  };
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [name, card] of Object.entries(cards)) {
    await page.goto(pathToFileURL(join(here, "card.html")).href);
    await page.evaluate((c) => window.render(c), { ...card, banana });
    // JPEG keeps each card well under WhatsApp's ~300 KB limit for link previews
    await page.screenshot({ path: join(site, "public/og", `${name}.jpg`), type: "jpeg", quality: 86 });
    console.log(`public/og/${name}.jpg`);
  }
} finally {
  await browser.close();
  await rm(tmp, { recursive: true, force: true });
}
