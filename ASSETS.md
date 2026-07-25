# ASSETS.md · logo & screenshot production guide

The case-study screenshot slots work with zero images and fall back to labeled
placeholders. A small set of optimized brand files is retained for future
case-study use but is not required by the homepage.

## Retained brand assets

| File | Used for |
|---|---|
| `assets/districts/qi-mark.svg` | Qi Card mark |
| `assets/districts/cardy-mascot.webp` | Original Cardy mascot |
| `assets/districts/cardy-logo.webp` | Cardyiq wordmark |
| `assets/districts/asheerty-icon.webp` | Asheerty app mark |
| `assets/districts/sadeek-mascot.webp` | Sadeek mascot |

These files are intentionally small. Keep the original source artwork outside
the site, and regenerate these web versions if a brand asset changes.

## How the system works

Every case page has `<figure class="shot" data-shot="NAME">` slots.
On load, `js/main.js` tries `assets/shots/NAME.webp`:

- **File exists** → the image replaces the placeholder automatically.
- **File missing** → the labeled placeholder stays. Nothing breaks.

So: produce a file, name it exactly, drop it in `assets/shots/`, reload. Done.
No HTML edits, ever.

---

## 1 · Screenshots · the full slot list (25)

### Format rules (all screenshots)

1. **WebP only**, quality ~82. Convert with [squoosh.app](https://squoosh.app)
   or `cwebp -q 82 in.png -o out.webp`.
2. **Tall slots** (phone) → portrait, ideally 1170×2532 (or your device's native).
   **Wide slots** → landscape, ideally 2400×1500 (or 16:10-ish).
3. Phone shots: use a **clean status bar** (full battery, no notifications ·    iOS Simulator does this automatically; on Android use demo mode:
   `adb shell settings put global sysui_demo_allowed 1`).
4. Dark-mode app themes photograph best against this site.

### Sanitization checklist · run for EVERY shot

- [ ] No real customer names, phones, account numbers, balances, or amounts ·       recreate screens with **synthetic seed data** first.
- [ ] Tasdid+/Jabi+/e-Psule: public-safe framing only · product UI is fine,
      **no payment-rail internals, no provider contract details** (house rule
      carried over from the CV pack).
- [ ] Sadeek product photos: demo/synthetic products only, unless a merchant
      gave explicit permission.
- [ ] Asheerty trees: synthetic family names only.
- [ ] Crop out internal URLs, staging banners, debug overlays.

### Qi Card · `work/qi-card.html`

| File | Shape | What to capture |
|---|---|---|
| `tasdid-bills.webp` | tall | Tasdid+ bill list across providers, amounts due |
| `tasdid-invoice.webp` | tall | Invoice detail → payment method → confirmation state |
| `jabi-transactions.webp` | tall | Jabi+ transaction list with filters open |
| `epsule-langs.webp` | tall | e-Psule showing Kurdish or Arabic UI (RTL visible) |

### Cardyiq · `work/cardyiq.html`

| File | Shape | What to capture |
|---|---|---|
| `cardyiq-home.webp` | tall | Mobile home screen |
| `cardyiq-venue.webp` | tall | Venue detail + subscription/points |
| `cardyiq-dashboard.webp` | wide | Arabic operations dashboard |
| `cardyiq-analytics.webp` | wide | Growth/analytics view (synthetic numbers OK) |

### NotifyX · `work/notifyx.html`

| File | Shape | What to capture |
|---|---|---|
| `notifyx-dashboard.webp` | wide | React ops dashboard · campaigns/delivery states |
| `notifyx-benchmark.webp` | wide | Throughput chart or benchmark run output |

### Sadeek · `work/sadeek.html`

| File | Shape | What to capture |
|---|---|---|
| `sadeek-telegram.webp` | tall | The Telegram flow · photo in, bot responding |
| `sadeek-before-after.webp` | wide | Raw merchant photo next to the AI-processed asset |
| `sadeek-storefront.webp` | wide | The Next.js storefront listing page |
| `sadeek-workflow.webp` | wide | The n8n orchestration graph (zoomed to be readable) |

### Maaahr · `work/maaahr.html`

| File | Shape | What to capture |
|---|---|---|
| `maaahr-roles.webp` | wide | Role selection screen |
| `maaahr-live.webp` | wide | Live voice session with subtitles visible |
| `maaahr-report.webp` | wide | Structured evaluation report |

### Asheerty · `work/asheerty.html`

| File | Shape | What to capture |
|---|---|---|
| `asheerty-editor.webp` | tall | Building the tree on mobile |
| `asheerty-tree.webp` | tall | Generated tree preview (synthetic names) |
| `asheerty-dashboard.webp` | wide | Review & fulfilment dashboard |
| `asheerty-print.webp` | wide | **Photograph** of a framed physical print · the money shot. Natural light, slight angle, wall context |

### HAWSR · `work/hawsr.html`

| File | Shape | What to capture |
|---|---|---|
| `hawsr-viewer.webp` | wide | Browser 3D model viewer (any archived capture) |
| `hawsr-pipeline.webp` | wide | Dynamo graph / Revit→web pipeline screenshot |
| `hawsr-splat.webp` | wide | Gaussian-splatting R&D scene |
| `hawsr-stage.webp` | wide | Photo from The Station presentation (1,000+ crowd) |

**Priority order if you do only five:** `asheerty-print`, `cardyiq-dashboard`,
`tasdid-bills`, `maaahr-live`, `sadeek-before-after`.

---

## 2 · Logos

The site currently uses **hand-drawn geometric glyphs** (inline SVG on every
case page) · it ships fine without any official logo files. To upgrade:

### Collect (official marks · never redraw these)

| File → `assets/logos/` | Source | Note |
|---|---|---|
| `qicard.svg` (or .png @2x) | Qi Card brand/press kit, or ask design team | Get written OK for portfolio use |
| `superqi.svg` | Same | Only if permitted · otherwise the text wordmark stays |
| `cardyiq.svg` | You own this · export from the brand file | |
| `sadeek.svg` | Your product icon | |
| `asheerty.svg` | Your app icon / brand file | |
| `maaahr.svg` | Your app mark | |

Export rules: SVG preferred; if PNG, 512px+ on transparent background.
Monochrome/white variants look best on this palette.

### Produce (custom marks · 30-minute Figma jobs)

1. **Gateway Mark (personal logo)** · already live in the site header as
   inline SVG (nested A-gateway over a baseline). To make it a standalone
   file: copy the `<svg>` from `index.html`'s `.brand`, set stroke to
   `#F3F0E8` on `#07090D`, export `assets/logos/gateway-mark.svg`.
   Use it for social avatars at 480×480.
2. **NotifyX glyph** · three packets converging into one arrow (already
   drawn on `work/notifyx.html`; copy that SVG if you need a file).
3. **HAWSR glyph** · wireframe H (already on `work/hawsr.html`).

### Favicon / social

- Favicon already ships as inline SVG (cyan gateway on void). No file needed.
- **OG image** (link previews): screenshot the homepage hero at 1200×630
  once the composition looks the way you want, save as `assets/og.png`, then add to
  `index.html` and `recruiter.html` `<head>`:
  `<meta property="og:image" content="https://awsdang.com/assets/og.png">`

---

## 3 · NotifyX remote-push activation

The notification button works immediately: it requests permission, registers
`notifyx-sw.js` and displays a real system notification. To route that test
through the hosted NotifyX queue as a remote Web Push, create/select the
`awsdang.com` app in the NotifyX portal, then fill `appId`, `apiKey` and
`vapidPublicKey` in `window.NOTIFYX_CONFIG` in both `index.html` and
`work/notifyx.html`.
