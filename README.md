# awsdang.com · THE LIVING ATLAS

An explorable city where every district is a production system Aws designed,
rescued, scaled, or shipped. The interface moves between a living night city
and warm editorial case sheets. Static HTML/CSS/JS + vendored Three.js.
**No frameworks, no build step.**

## The concept

Scroll-driven 3D city (architect → systems engineer, so the portfolio is a
city). The camera travels district to district as you scroll; every project's
full story is plain DOM text · nothing requires a click, hover, or WebGL.
The visual system combines daylight field notes, high-contrast night scenes,
an acid-green human signal, civic blue, bold Inter typography, and a strict
4px rhythm. Each project district has its own low-poly landmark: Qi Card and a
Tasdid bill, Cardy and its wordmark, a spatial family graph, the NotifyX server
stack, Sadeek's storefront, a live interview, and a HAWSR apartment interior.

## Files

- `index.html` · the city (scroll experience, all districts inline)
- `recruiter.html` · fast track: conventional, fast, zero WebGL
- `work/*.html` · 7 case files (qi-card, cardyiq, notifyx, sadeek, maaahr, asheerty, hawsr)
- `css/site.css` · the whole Living Atlas design system (night/paper/signal + one accent per district)
- `js/city.js` · procedural Three.js city, scroll camera, intro rise (ES module, lazy)
- `js/main.js` · intro overlay, reveals, signals HUD, odometers, NotifyX sim + web push, screenshot-slot loader
- `vendor/three.module.min.js` · Three.js r170, vendored (no CDN dependency)
- `assets/districts/` · optimized brand textures used by the 3D landmarks
- `assets/shots/` · drop screenshots here; see **ASSETS.md** (slots auto-fill)
- `cv/` · five role-targeted CV PDFs
- `notifyx-web-sdk.js`, `notifyx-sw.js` · NotifyX web push (fill NOTIFYX_CONFIG to go live)
- `_legacy/` · the previous "career speedrun" site, kept for reference

## Fallbacks (all tested paths)

- `prefers-reduced-motion` → no intro, no animation, one static city frame, all content visible
- No WebGL / JS off → content fully readable on the void background
- Mobile → lower scene density, DPR clamp, panels full-width, signals HUD hidden
- Tab hidden → render loop pauses

## Editing rules

- Numbers stay in the **vetted set** (1M+ users, ~500K txns/mo, 150+ venues ·
  6 cities, 1,500 subscribers, 70M IQD GMV, 99.9%/8mo, 10K+ AI users, 150K+
  requests, 150 msg/s/worker, ~$60K HAWSR). Don't inflate; failure stamps
  (Sadeek dormant, HAWSR decommissioned) stay honest · they're the credibility.
- Tasdid/Jabi/e-Psule copy stays at public-safe altitude: mini-apps,
  tokenization-supported flows. No payment-rail internals.
- One accent per district (`.d-*` classes own `--acc`). The global signal
  green and civic blue are the only cross-district supporting colors.
- The blueprint intro + district activations are the signature; don't add
  more ambient motion elsewhere.

## Dev

`python3 .claude/devserver.py` → http://localhost:4173 (no-cache static server).

## Deploy

Push to GitHub → Settings → Pages. Or Cloudflare Pages / Netlify, zero config.
