# awsdang.com

A focused portfolio for Aws Abdulfattah. The homepage pairs a quiet night
canvas with warm editorial project sheets and a minimal 2D geometric motif.
Static HTML/CSS/JS. **No frameworks, no build step.**

## The concept

The work is the visual focus. Project cards alternate left and right, with the
open half of each section holding a label-free, product-specific visual: a
yellow Qi payment card, Cardy in a gym, Asheerty inside a transparent family
tree UI, a Sadeek mobile shop connected to Telegram, a Maaahr live-interview
screen, a restrained HAWSR building in isometric projection, and a complete
architecture workstation for Origins. NotifyX uses the live,
interactive queue as its single visual rather than a second decorative diagram.
On narrow screens the visuals move onto the dark canvas above their paper
cards. A faint grid gives the dark background structure without competing with
the writing. All content remains plain DOM text and the page uses only small,
purposeful interface motion.

## Files

- `index.html` · homepage and selected work
- `recruiter.html` · fast track for hiring teams
- `work/*.html` · 7 case files (qi-card, cardyiq, notifyx, sadeek, maaahr, asheerty, hawsr)
- `css/site.css` · shared night/paper/signal visual system
- `js/main.js` · reveals, section label, odometers, NotifyX sim + web push, screenshot-slot loader
- `assets/shots/` · drop screenshots here; see **ASSETS.md** (slots auto-fill)
- `cv/` · five role-targeted CV PDFs
- `notifyx-web-sdk.js`, `notifyx-sw.js` · NotifyX web push (fill NOTIFYX_CONFIG to go live)
- `_legacy/` · the previous "career speedrun" site, kept for reference

## Fallbacks (all tested paths)

- `prefers-reduced-motion` → no decorative motion and all content visible
- JavaScript off → all content stays readable
- Mobile → product visuals stack above their panels and remain full-width

## Editing rules

- Numbers stay in the **vetted set** (1M+ users, ~500K txns/mo, 150+ venues ·
  6 cities, 1,500 subscribers, 70M IQD GMV, 99.9%/8mo, 10K+ AI users, 150K+
  requests, 150 msg/s/worker, ~$60K HAWSR). Don't inflate; failure stamps
  (Sadeek dormant, HAWSR decommissioned) stay honest · they're the credibility.
- Tasdid/Jabi/e-Psule copy stays at public-safe altitude: mini-apps,
  tokenization-supported flows. No payment-rail internals.
- One accent per project (`.d-*` classes own `--acc`). The global signal
  green and civic blue are the only cross-project supporting colors.
- Keep decorative visuals sparse and avoid ambient motion that competes with
  project content.

## Dev

`python3 .claude/devserver.py` → http://localhost:4173 (no-cache static server).

## Deploy

Push to GitHub → Settings → Pages. Or Cloudflare Pages / Netlify, zero config.
