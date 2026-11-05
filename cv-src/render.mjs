// Prints Aws_Abdulfattah_CV.html to a tagged A4 PDF with Chrome.
// From the repo root:
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node cv-src/render.mjs [out.pdf]
// Default output is site/public/cv/Aws_Abdulfattah_CV.pdf (what awsdang.com/cv shows).
// Check the result with `pdftotext out.pdf -` (reading order) and `pdfinfo` (2 pages).
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(process.argv[2] ?? join(here, "../site/public/cv/Aws_Abdulfattah_CV.pdf"));
if (!process.env.PLAYWRIGHT_CORE) throw new Error("Set PLAYWRIGHT_CORE to a playwright-core folder.");
const { chromium } = await import(pathToFileURL(join(process.env.PLAYWRIGHT_CORE, "index.mjs")).href);

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(join(here, "Aws_Abdulfattah_CV.html")).href);
  await page.evaluate(() => document.fonts.ready);
  // tagged: a structure tree, so screen readers and ATS parsers read headings and lists in order
  await page.pdf({ path: out, format: "A4", preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
  console.log(out);
} finally {
  await browser.close();
}
