# Plan: replicate the interaction design of elenagonci.com

Audit date: 2026-10-07. Reference site: https://elenagonci.com/ (7 routes + 404).
Detailed machine-read specs live next to this file:
[`reference/elenagonci-home-behaviour.md`](reference/elenagonci-home-behaviour.md) and
[`reference/elenagonci-subpages-and-design.md`](reference/elenagonci-subpages-and-design.md).

How each fact below was established: **live** = observed in headless Chrome (desktop, iPad and iPhone emulation, real mouse/keyboard/CDP touch events); **code** = read from the shipped JS/CSS bundles; **inferred** = reasoned, not seen.

---

## 1. What the site actually is

A portfolio disguised as a **macOS desktop**, with one "case study" experience that is a **scripted AI chat**.

| Route | What it is |
|---|---|
| `/` | Desktop hero (menu bar, draggable widgets, folders, app grid, floating dock), then scrolling sections: achievements, press marquee, 4 stacked "superpower" panels, venture list, Playground teaser, `about-me.txt` window, footer |
| `/work/qa-agent-loop`, `/eleyyva`, `/engineering`, `/product-management`, `/customer-success` | Same chat engine, 5 scripted conversations (35 turns total) + free-form questions |
| `/playground` | Infinite pan board (dot grid, one sticky note) + an auto-opened terminal |
| 404 | "Finder" alert window ("Error code -404", "Back to the desktop →") |

Stack: Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · framer-motion (`motion`) · lucide icons · Bricolage Grotesque + one custom display font (only for the "E" monogram) · Netlify. One backend endpoint: `POST /api/ask`. No analytics, no cookies, no localStorage, no dark mode, no keyboard shortcuts (code).

Not used (checked): GSAP, Lenis, react-draggable, dnd-kit, Howler, scroll-snap, any scroll-linked JS, a custom cursor, a preloader.

---

## 2. Feature inventory

### 2.1 Global
- Breakpoint switch is **pure CSS at `md` = 768px**; both trees (desktop board and mobile stack) are in the DOM and one is `display:none` (code, live). Consequence: the Terminal and Calendly triggers exist twice.
- `html{scroll-behavior:smooth}`, `scroll-mt-24` on anchor sections, `overflow-x:hidden`, `-webkit-tap-highlight-color:transparent`.
- Hover rules are wrapped in `@media (hover:hover)`; `prefers-reduced-motion` zeroes CSS transitions/animations (framer-motion is not reduced).
- Palette is almost monochrome: `#000`, `#1e1e1e` text, `#f9f9f9` light, accent `#ff3700` (selection + second hand); glass = `bg-white/30` + `backdrop-blur-2xl` + `inset 0 1px 0 rgba(255,255,255,.6), 0 8px 32px rgba(0,0,0,.12)`.
- z-index scale: hero 0 · panels 10–13 · composer 40 · dock 60 · cursor video 65 · Calendly/Terminal 70.

### 2.2 Homepage hero (desktop, ≥768px) — the "desktop"
Hero is `100dvh`; everything is absolutely positioned with fixed pixel offsets (live, 1440×900):

| Element | Position / size | Behaviour |
|---|---|---|
| Menu bar | top, h=28px, `bg-white/70 blur-md` | `EG · Elena Gonci · Head of Product … Wed, Oct 7  12:38 PM`; visitor-local 12 h clock, ticks 1 s; static otherwise |
| Analog clock | (24, 90) 150² | "MIAMI", `America/New_York`, DST-aware, 1 s tick; hour/minute/second hands, second hand `#FF3700` |
| Calendar widget | (194, 90) 150² | Real month grid, today highlighted; click opens the booking window |
| Music player | (364, 90) 320×150 | Native `<audio>` (iTunes 30 s preview), `preload=none`; −10 s / play-pause / +10 s; 3 px display-only progress bar, `0:00 / -0:29` labels. No seek, no volume |
| Weather | (24, 264) 320×108 | **Hard-coded** "Madrid" 7-day strip, no API |
| Photo | (24, 404) 150² | Decoration |
| 5 folder icons | right 2.5 %, tops 90/198/306/414/522, 80 px wide | Click → `/work/<slug>` (client nav). 56 px icon, `group-hover:scale-105`, glass label |
| App grid | `bottom:120; right:48`, 262×118, 5×2 | Notion (CV, new tab), cmux & Granola (inert), **Terminal** (opens window), Claude / ChatGPT (open with a prefilled "tell me about…" prompt), LinkedIn, Gmail (`mailto:`), **Calendar** (opens booking window), X. 2 px hover lift, native `title` tooltips |
| Hero copy | centred | H1 "I'm Elena. I lead product at **Arrive**." (underlined link) + subcopy; 3 CSS fade-ups, 0.7 s `cubic-bezier(.22,1,.36,1)`, delays 50/180/340 ms; staggered entrance of widgets (0.05 s stagger, `y:8→0`) |
| Floating dock (section nav) | starts ≈128 px above hero bottom, `sticky top-4`, z 60 | Tiles (40 px): Home `/` · Work `#pillar-stack` · Achievements `#achievements` · About `#about` · **Book a meeting** (live date tile, red "1" badge when window minimised) · Contact `#contact`. Rides up with the page, then sticks 16 px from the top. **Magnification** (live: hovered 60 px, neighbours ≈45–49): spring `mass .1 / stiffness 180 / damping 13`, range 100 px, grows downward. Tooltip below if tile is in top half, else above |

### 2.3 Drag and drop (desktop board + tablets)
Implemented with framer-motion drag, not HTML5 DnD (code); values confirmed live.
- Draggable: **all 5 folders, clock, calendar, music, photo, weather, app grid**. Everything else is static. Menu bar, headline, dock not draggable.
- `dragConstraints = board`, `dragElastic .12`, `dragMomentum false` (release velocity 0 → no inertia), `whileDrag {scale:1.04}`. Release outside the bounds springs back (`bounceStiffness 200`, `bounceDamping 40`, `timeConstant 750`).
- **Live check:** dragging the clock to (-200,-200) ends at (0,0) (under the menu bar); to (3000,3000) ends ≈2 px past bottom-right. Position is a `translateX/Y`, so wrapper `top/left` never change.
- Drag starts after **3 px**; can start on `<a>`, `<button>`, `<img>`; not on input/select/textarea. A click is **suppressed** right after a drag, so dragging a folder never navigates and a plain click does (live).
- Stacking: pointer-down appends the item to an order array → `z = 20 + index` (range 20–30). Live: dragging the clock *under* the later widgets keeps it behind them; the first item touched is not actually raised (bug, code).
- **No persistence** (reload resets), no snapping, no drop targets, no cursor change besides `grab` / `grabbing`. Positions rescale on resize.
- Touch: `touch-action:none` + pointer events. iPad (live, CDP touch): finger-drag on the clock moved it exactly (+200, +250); **a swipe that starts on a widget does not scroll the page** (scrollY stayed 0) while a swipe on empty hero scrolled it (0 → 405).

### 2.4 Windows (macOS chrome: traffic lights `#ff5f57 / #febc2e / #28c840`)
**Booking window ("Book a meeting — Elena Gonci")** — iframe of a Calendly page (`hide_gdpr_banner`, white bg, black primary).
- Opened from: calendar widget, app-grid calendar, dock date tile, footer "Book a meeting". State `closed | open | minimised` lives in the root layout, so it survives route changes.
- 640 px wide (≤94 vw), height = 80 % of the viewport (live 640×720 at 900 high), centred, **no backdrop**, z 70.
- Red closes and unmounts the iframe; yellow hides it (iframe kept) and puts a red "1" on the dock tile; green zooms to 1.2×/1.18× and back.
- Drag by title bar, **unbounded** (live: dragged to x = −700, off-screen). 8 resize handles (6 px edges, 12 px corners); min ≈420 × 380.
- **Esc does nothing** (live).

**Terminal "elena-5"** — `visitor@elenagonci — zsh — 80×24`, `#1d1e26`, 640×440 (`h-[440px] w-[min(92vw,640px)]`).
- Local commands (case-insensitive): `help`, `ls` / `ls -la`, `cat contact.txt` / `contact`, `whoami`, `clear`, `exit` / `logout`, `sudo hire elena` / `hire elena` (text only), any other `sudo …` (joke).
- Anything else → `POST /api/ask {question, history: last 6, page: "home" | "playground"}` → `{answer}`. Pulsing "thinking…" line, no streaming. `503` → "offline" text; other errors → "network error".
- Auto-focused input. Red dot (`aria-label="Close terminal"`) or `exit` closes; **Esc does not** (live). Title-bar drag.
- Live quirks to *not* copy: after an API answer the input loses focus, so typed spaces scroll the page; dragging it can move it off-screen.
- Placement: desktop home `absolute` over the hero; mobile `fixed`; on `/playground` it **auto-opens** at ≥768 px (470×380, offset +385/+30) and is a bottom-right `>_` launcher on mobile.

### 2.5 Scroll experience (all CSS unless noted)
| Effect | Spec |
|---|---|
| Dock rides then sticks | `sticky top-4` inside a container with `md:-mt-32 md:h-32` |
| **Stacked "superpower" panels** | 4 panels, `md:sticky md:top-24 md:h-[calc(100dvh-6rem)]`, z 10 → 13. Each has a clipped **folder-tab** header ("AI SYSTEMS", "PRODUCT", …) and slides over the previous; earlier tabs stay visible as a stack. Below 768 px they are `static` and the stat descriptions are hidden |
| Reveal on scroll | IntersectionObserver `rootMargin 0 0 -12% 0`, `threshold .05`, once; `translate-y-5 opacity-0 → 0/1`, 700 ms ease-out; achievement cards stagger 0/80/160/240/320 ms. Server HTML is invisible until hydrated |
| Press marquee | 4 articles ×6 = 24 cards, 250 px + 16 gap, `translateX(0 → −50%)`, **96 s linear infinite = 33.3 px/s** (live), **pauses on hover** (live: 0 px/s), edge fade `mask-image` (8 % / 92 %). Cards after the first four are `aria-hidden`, `tabindex=-1` |
| Achievements | 5 icon cards (gradient squircle icons: thesis, Figma, research, books, trophy). Three are outbound links (thesis, Friends of Figma, Packt); two are plain (live Tab order) |
| Venture list | 14 rows: name left, one-liner right, hairline dividers |
| Playground teaser | "The [folder] Playground". Hover: folder flap `rotateX(-24deg)` (perspective 700, 300 ms) and 3 cards rise (42/52/68 %) with a "View" pill. **Touch devices: auto-toggles open every 2.5 s forever** |
| `about-me.txt` window | THEN / NOW columns + "THE FUTURE +" expander (grid rows `0fr→1fr`, 500 ms, `+` rotates 45°). **Desktop:** system cursor hidden inside the window and a 150 px muted looping video follows the pointer (z 65, direct transform writes, hides on leave / over the button / on scroll when outside). **Mobile:** video inline in the expander |
| Hash nav | Next `<Link>` hash → `scrollIntoView()` + CSS smooth scroll |
| Footer | logo + tagline, icon row, text links with arrow-swap hover (300 ms), 4 award badges (one link), © year |
Page height at 1440×900 ≈ 7 220 px; 8 085 px on iPhone 15 Pro.

### 2.6 Homepage mobile (<768px, live iPhone 15 Pro)
No menu bar, no draggable board. Stacked cards: (1) headline card, (2) calendar tile ("Tap to book a meeting") beside the photo, (3) five folders in one row (labels truncated "Customer Succ…"), (4) app grid, then the dock in flow which sticks to the top once scrolled. Tapping a tile opens the same booking window sized to the viewport (live 369×527). Terminal opens `fixed`. Panels become plain stacked cards with visible folder tabs.

### 2.7 Tablet / iPad (live, Chrome engine emulating iPad)
Anything ≥768 px (iPad portrait 810/834, landscape 1024/1194) gets the **desktop board**, driven by touch: finger-drag works, tap opens the terminal and focuses the input, hover-only effects fall back (`hover:none` → Playground teaser auto-toggles). The sticky stack works. Defects: in iPad-landscape and any ≤1280×720 window the app grid overlaps the lower folders (live: apps (970,482) vs "Customer Success" (1168,522) at 1280×720).

### 2.8 `/playground` (live + code)
Full-screen `fixed inset-0 touch-none select-none`, `cursor:grab/grabbing`. Dot grid = `radial-gradient(rgba(0,0,0,.12) 1px, transparent 1px)` at 22 px and **its `background-position` is moved with the pan**. Pan is 1:1 pointer delta on a `translate()` "world" layer: **no bounds, inertia, wheel, keyboard, zoom, or reset** (live: wheel/arrow keys do nothing). Dragging the sticky note pans the board, it is not its own draggable. The heading, hint "Drag to pan. More coming to this board soon." and dock are fixed overlays. Mobile: the sticky note overlaps the intro text (defect).

### 2.9 `/work/*` — scripted chat engine
One shared component `ChatWindow({title, subtitle, intro, turns[]})`; a turn is `{q, thought, a, card, cardLabel, after, more}`.
- **Landing**: eyebrow "Case study", H1 + `elena-5` chip, subtitle, composer (placeholder "Ask anything about this project"), disclaimer, two mode cards.
- **"Chat through it"**: intro bubble + one pill = next scripted question + " →". Click → timeline: 0 ms shimmer "Thinking…", **950 ms** "Thought for {2 + i%3}s" (collapsed) + answer, if a card: **1750 ms** shimmer "Generating {cardLabel}…", **3150 ms** card + `after` text + "Explain more" expander; no-card turns settle at 1500 ms. Auto `scrollIntoView({smooth, block:end})` after 60 ms. Live check of timings matched (text growth at ≈1.0 s and ≈1.8 s). No streaming/typewriter.
- **"Read the full case study"**: all turns rendered at once, no pill, no animation.
- Free-form question → `POST /api/ask {question, history: last 6 free-form, page: <slug>}`. Empty → "Sorry, I lost that thought…"; **503** opens `claude.ai/new?q=…` in a new tab + a bot line; other → "Something went wrong… email me".
- End of each study: "Next case study →" chain (qa → eleyyva → engineering → pm → cs → start over) and "← All case studies" → `/#pillar-stack`.
- Card library (≈20 kinds): featureTriple, beforeAfter, statGrid, bigStat, quote, numberedList, titleDescList, sourceGrid, statusPipeline chips, flow (linear + branching), funnel, barCompare, tables, images + captions, SVG charts, PR cards, UI mock "empty state", mono chip cloud, and one interactive card (repo heat-map with filter chips, 24 weeks × 7). Bubbles fade in once on scroll (`rootMargin 0 0 -10% 0`, 500 ms).
- Chrome: only the top dock; fixed bottom composer (`z-40`, fade gradient), `max-w-[720px]`, `pb-44 pt-28`.

### 2.10 Meta / infra
Same title/description/OG (1200×630) on every route, 512 + 180 icons, `sitemap.xml` (7 URLs), `robots.txt`, no canonical, no JSON-LD, no manifest. HSTS + nosniff only (no CSP).

---

## 3. Input-method matrix (what each device can do)

| Capability | Mouse + keyboard (desktop) | Touch (iPad, ≥768) | Phone (<768) |
|---|---|---|---|
| Drag widgets / folders | yes, clamped, springy | yes, finger drag | **no** (board hidden) |
| Scroll starting on a widget | wheel works | **blocked** (`touch-action:none`) | n/a |
| Click folder | navigates; drag never navigates | tap navigates | tap navigates |
| Dock magnification | yes (hover) | none | none |
| Hover lifts / tooltips | yes | none | none |
| Playground teaser | opens on hover | auto-toggles every 2.5 s | auto-toggles |
| Cursor-following video | yes | n/a | inline in expander |
| Terminal | click icon, typed | tap icon, input auto-focus | fixed window |
| Booking window | draggable, resizable | draggable | viewport-sized |
| Playground pan | drag only | drag only | drag only |
| Keyboard | Tab order = 5 folders → music buttons → app grid → "Arrive" link → 6 dock tiles → achievement links → press cards → …; focus rings are browser default (1 px auto, 3 px on press cards); **no shortcuts, no Esc anywhere, no arrow keys**; calendar widget is a `div onClick` (not focusable); terminal loses focus after an API answer | — | — |

---

## 4. Defects in the original — decide per item: copy or fix

| # | Defect (verified) | Proposed |
|---|---|---|
| 1 | App grid overlaps folders at ≤1280×720 and iPad landscape | Fix: anchor folders/app grid by a shared layout (CSS grid / container-relative offsets) |
| 2 | z-raise on drag is off by one (first touched item isn't raised) | Fix: always raise to top |
| 3 | Terminal loses input focus after an API response | Fix |
| 4 | No Esc / no focus trap on windows; calendar widget not keyboard-reachable | Fix (Esc closes, widgets as `button`) |
| 5 | Widgets block touch scrolling | Keep drag, but add a grab-handle zone or allow vertical scroll on the outer ~20 px |
| 6 | Terminal + calendar trigger rendered twice (desktop + mobile trees) | Fix: one instance, responsive variants |
| 7 | Windows draggable fully off-screen | Fix: clamp so the title bar stays reachable |
| 8 | Sticky note overlaps intro text on mobile `/playground` | Fix |
| 9 | Server HTML invisible until hydration (SEO/no-JS) | Fix: render visible, animate with `@starting-style`/motion `initial` only after mount |
| 10 | Playground teaser auto-toggles forever on touch | Keep, but pause when off-screen |

---

## 5. Proposed build

### 5.1 Decisions I need from you (shaping everything below)
1. **Scope of "replicate"**: build the same *interaction design* with **your** content (projects, photo, stats, audio, awards), or a pixel-faithful clone as a template? (Her photo, press logos, award badges, stats, album art, `baby-me.mp4`, "Clepto" font and brand icons are hers/third-party and must not ship.)
2. **Stack**: this repo is static HTML/CSS/JS on a custom domain (`CNAME awsdang.com`, no build step). The reference is Next.js + Tailwind + motion. Options: **(A) Next.js 16 + Tailwind v4 + motion in a new app** (best fidelity, `/api/ask` on Vercel/Netlify/Cloudflare); **(B) keep static** and port to vanilla JS + Web Animations (more work for drag/dock springs, no build, GitHub Pages friendly). I recommend **A** in a `site/` folder or new branch, deploy elsewhere, keep the current site untouched until cut-over.
3. **Chat backend**: do you want the terminal and case-study "ask anything" live (needs an LLM key + a small serverless function + rate limiting), or scripted-only for v1 (503 path → opens a prefilled `claude.ai` link, exactly like the original's fallback)?
4. **Mapping of your content** (proposal): your 7 projects (Cardyiq, Qi/Tasdid, Asheerty, NotifyX, Sadeek, HAWSR, Maaahr) → folders on the desktop and chat-style case studies; "superpowers" panels → 3–4 pillars of your choice; terminal answers from your CV. Folders go from 5 to 7, so the right column needs two columns or a smaller step.

### 5.2 Architecture (option A)
```
app/
  layout.tsx            fonts, CalendlyProvider (window state), <main>
  page.tsx              composes Hero + sections
  playground/page.tsx   <PanBoard/> + <Terminal/>
  work/[slug]/page.tsx  <ChatWindow {...caseStudies[slug]}/>   (static params)
  not-found.tsx         Finder 404
  api/ask/route.ts      LLM proxy
components/
  desktop/  Board, DraggableItem, MenuBar, ClockWidget, CalendarWidget, MusicWidget,
            WeatherWidget, PhotoWidget, FolderIcon, AppGrid
  dock/     SectionNav (magnifying), DateTile
  windows/  MacWindow (traffic lights, drag, resize), BookingWindow, Terminal
  sections/ Achievements, PressMarquee, PillarStack, VentureList, PlaygroundTeaser, AboutWindow, Footer
  chat/     ChatWindow, Composer, TurnView, cards/* (≈20)
  hooks/    useReveal (IO), useNow, useCursorFollow
data/       profile.ts, widgets.ts, pillars.ts, press.ts, ventures.ts, caseStudies/*.ts  (typed turns[])
```
Rules: **one DOM tree** per feature (responsive variants, not duplicated trees); content only in `data/`; every constant in §2 lives in a `tokens.ts` so tests can assert them.

### 5.3 Phases (relative size S/M/L)
| Phase | Deliverable | Size | Done when |
|---|---|---|---|
| 0 | Decisions above, repo/branch, Tailwind v4 tokens, fonts, OG/icons | S | tokens match §2.1 |
| 1 | `Board` + `DraggableItem` (framer drag, bounds, elastic .12, scale 1.04, 3 px threshold, click suppression, z-raise **fixed**) | M | golden drag numbers pass (§6) |
| 2 | Hero: menu bar, 5 widgets, folders, app grid, hero copy, entrance stagger | M | 1440×900 positions match §2.2 |
| 3 | `SectionNav` dock (sticky, magnification spring, tooltips, date tile + badge), hash navigation | M | hover widths ≈ 60/48 |
| 4 | `MacWindow` + `BookingWindow` (3 states, resize, drag, iframe) + `CalendlyProvider` | M | all four triggers open one window; survives route change |
| 5 | `Terminal` (local commands, history, `/api/ask` client, focus + Esc fixed) | M | commands match §2.4 |
| 6 | Scroll sections: achievements, **pillar stack**, press marquee, ventures, playground teaser, about window + cursor video, footer | L | stack/marquee/reveal numbers match §2.5 |
| 7 | Mobile + tablet variants, touch rules, reduced motion | M | matrix in §3 passes on iPhone/iPad emulation + one real iPad/iPhone |
| 8 | `/playground` pan board + auto-open terminal | S | pan 1:1, dots move with pan |
| 9 | `ChatWindow`, modes, timings, ≈20 card components, next-chain; author your case-study data | L | step & full modes match §2.9; one study end to end |
| 10 | `/api/ask` (grounded on site data, rate limit, 503 fallback), 404, SEO, a11y pass (Esc, focus trap, labels), perf, deploy + cut-over | M | Lighthouse a11y ≥ 95, Playwright suite green |

Suggested order: 0 → 1 → 2 → 3 → 6 (static sections) → 4 → 5 → 7 → 8 → 9 → 10. Phases 1–3 give a convincing first demo.

---

## 6. Test plan (reuse the audit scripts as an e2e suite)
Playwright (Chrome + WebKit) with these golden assertions taken from the reference:
- **Viewport matrix:** 1920×1080, 1440×900, 1280×720, 1024×768, 834×1194, 1194×834, 810×1080, 767×900, 393×852. No overlaps between folders/app grid/widgets; hero heights = `100dvh`.
- **Drag:** clock to (−200,−200) → box (0,0); to (3000,3000) → within 2 px of the bottom-right; no `localStorage` writes; a drag on a folder never navigates, a click does; CDP-touch drag moves the clock by the same delta; vertical swipe on a widget scrolls (our improvement) or is documented.
- **Keyboard:** Tab sequence, Enter/Space on every widget, Esc closes terminal and booking window, focus returns to trigger, input stays focused after a terminal answer.
- **Scroll:** panel `position: sticky; top: 96px`; marquee speed ≈33 px/s and 0 on hover; reveal triggers at 12 % from the bottom; page height ≈7 200 at 1440×900.
- **Chat:** timestamps 950 / 1750 / 3150 ms (±150 ms), "Read full" renders all turns instantly, pill chain ends with "Start over".
- **Windows:** booking window 640×(0.8·vh), minimise shows badge, resize clamps.
- Reduced-motion run; no-JS render check.

---

## 7. Audit coverage and gaps
Covered: desktop mouse + keyboard (1920→1024), iPad portrait/landscape (Chrome emulation with real CDP touch events), iPhone 15 Pro (emulation, touch taps), all 7 routes, drag/drop, scroll effects, windows, terminal, music, marquee, hover/focus, bundle source read.
**Not covered / limits:**
- No real Safari / real iOS or iPadOS device (the Mac has Safari but it can't be automated here; Playwright's WebKit isn't installed). Safari-specific `backdrop-filter`, `100dvh`, audio autoplay and touch-scroll behaviour must be checked on real hardware in phase 7.
- `/api/ask` server side (system prompt, model, rate limits) is not visible; we only know the request/response contract and error branches.
- Audio was not listened to; the cursor-follow video didn't play in headless mode.
- The app's built-in browser pane blocked every sub-resource, so all visual testing used headless Chrome instead.
- Screenshots and the verbatim extracted case-study JSON (35 turns) are kept in the session scratchpad, not in this repo (it's served from `awsdang.com`, so anything under `docs/` would be public once pushed).
