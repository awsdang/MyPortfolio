# awsdang.com

The workbench of Aws Abdulfattah: software engineer, former architect, and builder.
A warm paper portfolio with oversized type, a collage of project imagery,
individual product studies, and a working notification queue demonstration.
Static HTML/CSS/JavaScript, with no framework or build step.

## Files

- `index.html` — seven projects, interactive lab, background, and contact
- `css/workbench.css` — homepage design and responsive layouts
- `js/workbench.js` — project filters, image dialogs, desk rearrangement,
  email copying, and the local queue simulation
- `work/*.html` — seven detailed case studies
- `css/notebook.css` — the case studies' matching editorial design
- `css/site.css`, `js/main.js` — underlying case/recruiter layouts and NotifyX demonstration
- `assets/images/` — downloaded project imagery and credited reference photos
- `assets/districts/` — product marks and mascots
- `cv.html`, `cv/` — CV viewer and five role-specific PDFs
- `ai-skills/` — downloadable AI skills

## Project screenshots and personal video

Every project has two authentic screen previews on the homepage (Sadeek’s store previews are in a secondary disclosure) and a numbered,
captioned gallery in its case study: Cardyiq 19, Qi/Tasdid 12, Asheerty 15,
NotifyX 12, Sadeek 11, HAWSR 15, and Maaahr 10 (94 screens total).
Cardyiq separates App, Landing, Dashboard, and Backend. Its current Bun/TypeScript and PostgreSQL implementation is documented with architecture notes and a real idempotency source excerpt; the Laravel recovery account remains historical. Asheerty separates app and dashboard. HAWSR separates landing source and archived viewer. Sadeek leads with its Telegram workflow; its store captures are a secondary archive. Actual Telegram conversation captures and the Maaahr landing source are still needed.

`assets/project-media.json` records image dimensions, captions, surfaces, and origins.
Static HTML keeps the screens available without JavaScript. The gallery adds
previous/next controls, arrow keys, Escape, and focus restoration.

Qi is a collection of work across the ecosystem, featuring Tasdid and Jabi.
Its product inventory also names oil stations, AML, service-provider mini-apps,
Qi Hawala, the Tasdid container, KRG / e-Psule, Basmayah, and Jabi+ native DSL.
The twelve existing Qi gallery images document Tasdid specifically; they do
not represent screenshots of the other products. Descriptions stay at product
level until personal ownership details and additional screen captures are supplied.

The personal intro uses typography while awaiting personal media. The HAWSR portrait previously selected belongs to Aws Al-Saigh and was removed. **The talking video is
still awaiting the actual recording.** Set `src` in `assets/media/intro.json` to
its local site path, e.g. `assets/media/aws-intro.mp4`. Optional caption tracks
use `{ "src": "assets/media/intro-en.vtt", "language": "en", "label": "English",
"default": true }`. The player uses native controls, plays inline, and loads
metadata only. With no recording configured, the typographic intro remains visible. A poster is optional.
No generated voice or avatar substitutes for the recording.

Run `python3 scripts/check-media.py` to verify screenshot counts, unique files,
homepage previews, and local media paths.

## Imagery

Cardyiq’s mascots come from its public website. The screenshot galleries come
from original project archives and real locally running interfaces; their
capture context is documented in `ASSETS.md`. Asheerty’s framed artwork comes
from its public product website. Architecture and electronics reference
photographs come from Unsplash and are identified as inspiration.

Images are served locally, with lazy loading below the first screen. Typography
loads from Google Fonts with local fallbacks. See `ASSETS.md` for sources and
how to add your own photography or product screenshots.

## Interaction and accessibility

- Project filters update both the visible projects and the announced count.
- Image dialogs support keyboard focus, Escape, and backdrop dismissal.
- The queue is a local simulation, with no network requests. Flaky mode fails
  every third first attempt and retries recover. Reset restores the baseline.
- Reduced motion disables the ticker and transitions, and processes message
  batches immediately. The queue pauses in background tabs.
- Core content and project links remain readable without JavaScript.

## Content rules

Use the existing vetted numbers: 1M+ users, 150+ venues in 6 cities, 1,500 active
subscribers, 70M IQD GMV, 99.9% uptime over 8 months, 10K+ AI users, 150K+
requests, ~150 messages/sec/worker, and ~$60K HAWSR revenue. Do not inflate.
Keep Sadeek's dormant status and HAWSR's closure explicit.
Payment product descriptions stay public-safe; do not add payment-rail internals.

## Preview

Run `python3 -m http.server 4173 --bind 127.0.0.1` from this directory,
then visit http://127.0.0.1:4173.

## Deploy

The site works on GitHub Pages, Cloudflare Pages, or Netlify without a build step.
