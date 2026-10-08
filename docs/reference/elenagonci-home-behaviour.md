# elenagonci.com homepage: behavioural spec (from minified bundles)

Source: `ref/index.html`, `ref/chunks/*`, `ref/pages/*`. Beautified JS lives in `analysis/js/<chunk>.js`; all line numbers below refer to those beautified files.
"(inferred)" = deduced from CSS/box model/library defaults, not read as an explicit string/number in app code.

## 0. Corrections to the brief (what the code actually contains)

- There is NO bottom macOS dock with magnification on the homepage. Two different things exist:
  1. A draggable glass "apps" widget (5x2 icon grid): no magnification, no bounce, only a 2px hover lift and native `title` tooltips.
  2. A pill-shaped section nav (Home / Work / Achievements / About / Book a meeting / Contact) that has magnification and custom tooltips.
- The menu bar is a static strip: "EG | Elena Gonci | Head of Product ........ <date time>". No menu items, no dropdowns, no click handlers.
- "MIAMI" is the label on an analog SVG clock widget (America/New_York). The menu-bar clock is the visitor's local time.
- The weather widget is hardcoded (Madrid, 7 days, We Th Fr Sa Su Mo Tu). There is no API call, no cache, no Mo-Su ordering.
- No typewriter. The hero uses 3 staggered CSS fade-up animations.
- Music player: native `<audio>`, play/pause and +-10s only. No scrub, no volume, no progress ring, no album-art animation, no Howler.
- No keyboard shortcuts (no Cmd+K, no Esc handling, no arrow keys), no localStorage/sessionStorage/cookies, no preloader, no analytics, no custom cursor, no dark mode, no console logging in app code.
- Draggable on the homepage: 5 folder icons, clock, calendar, music, selfie photo, weather, apps grid (11 items). The sticky-note / album / selfie "cards" are NOT draggable on the homepage; they are static art inside the "The [folder] Playground" link. The pills "QA Agent Loop / Eleyyva / Engineering / Product Mgmt / Customer Success" are the 5 draggable folder icons.
- `/playground` and `/work/*` page JS (chunks `0da5e964...`, `628f80e9...`, `6efb08970...`, `f9fe2794...`, `35d4887c...`, `c603ef36...`) was NOT in the supplied files. Only their SSR HTML can be described (section 12).

## 1. Chunk map (vendor vs app)

| Chunk | Module ids | Contents |
|---|---|---|
| `11a318896e6c3fce.js` | 52683 | APP: the entire homepage client component (desktop, widgets, music, about-me, sections, footer). Also inlines 4 lucide icons (GraduationCap, Trophy, BookOpenCheck, Microscope) via a local createLucideIcon (L1006-1139) |
| `6a200556ad5fa9bf.js` | 22016, 93173, 53501, 70475 + Next helpers | 22016 = next/link (L348-528). APP 93173 = section-nav "dock" (L529-766). APP 53501 = fixed-bar wrapper using `#hero-fold-sentinel` (L768-798; imported by home but never rendered there). APP 70475 = `elena-5` Terminal (L799-1027) |
| `7a4ba18437171885.js` | 21219 | APP (root layout): `CalendlyProvider` + draggable/resizable Calendly window |
| `46f874086d6eb552.js` | 46932 (`motion`), 35382 `useMotionValue`, 95420 `useTransform`, 91994 `useSpring`, +20 | VENDOR: Framer Motion / Motion (React) |
| `f2f58a7e93290fbb.js` | 74575... | VENDOR: react-dom (createRoot/hydrateRoot, scheduler), Next.js client runtime (`window.next = {version:"16.1.6"}` L137), flight client |
| `38eb66a58ed5ffd7.js`, `806bdb8e4a6a9b95.js`, `d2be314c3ece3fbe.js` | 55682..., 12718..., 91915... | VENDOR: Next App Router client (router reducer, layout-router, boundaries, scroll/focus handling L3-22, 249) |
| `b9a0fabf54a78ef2.js` | 71645 (react), 43476 (jsx-runtime), 35451 (process polyfill) | VENDOR: React 19.3.0-canary-f93b9fd4-20251217 (L643) |
| `7c92e96509cd355e.js`, `ff1a16fafef87110.js` | 22016 + helpers; 33525 | VENDOR: layout-level duplicates of next/link and helpers (7c92e), and `warnOnce` only (ff1a1) |
| `a6dad97d9634a72d.js` | nomodule | VENDOR: core-js 3.38.1 polyfills for legacy browsers |
| `turbopack-ae52d2e04b811745.js` | runtime | Turbopack chunk loader |
| `84b4903bf0647530.css` | n/a | Tailwind v4 output + ~25 lines of custom CSS (section 10) |

## 2. Libraries / versions

- Next.js 16.1.6 (App Router, Turbopack, prerendered static; Netlify host per headers), React 19.3.0-canary-f93b9fd4-20251217.
- Framer Motion / Motion v12.x (inferred: no version string; code has `JSAnimation`, `distanceThreshold`, `skipAnimationsConfig`). Used for: `motion.div` drag + variants (home), `useMotionValue/useTransform/useSpring` (nav dock magnification).
- Tailwind CSS v4 (inferred: `@property --tw-*`, `@layer base`, `@media not all and (min-width:48rem)` for `max-md:`; hover variants wrapped in `@media (hover:hover)`).
- next/font: Bricolage Grotesque (Google, variable, `--font-bricolage`, body font) and local `clepto.otf` (weight 700, `--font-clepto`, used only for the "E" logo).
- lucide-react style icons (4 inline).
- Absent (grepped, zero hits): gsap, ScrollTrigger, lenis, react-draggable, dnd-kit, howler, react-spring, useScroll, localStorage, sessionStorage, document.cookie, gtag/GA, Vercel analytics, PostHog, Plausible, Sentry, sendBeacon, WebSocket, service worker.

## 3. Layout, breakpoints, z-index ledger

- There is no `useIsMobile`/JS breakpoint hook. Responsive switching is pure Tailwind CSS: `md` = 48rem = 768px (`@media (min-width:48rem)`). Others in CSS: sm 40rem, lg 64rem, xl 80rem, 2xl 96rem.
- Both trees are always in the DOM: desktop tree `hidden h-full md:block` (L329-787) and mobile tree `flex min-h-full flex-col ... md:hidden` (L788-945). This is why the hero text appears twice in the HTML (desktop h1 with animated `.hero-line` spans; mobile h1 as plain text inside a glass card). It avoids hydration mismatch and JS device sniffing.
- Only JS media query in app code: `window.matchMedia("(hover: hover)")` in the Playground link (L1670). No `(pointer: coarse)`, no resize listeners.
- Hero wrapper (L1766-1773): `relative` > `z-0 min-h-[100svh] md:sticky md:top-0 md:h-[100dvh] md:min-h-0 md:overflow-hidden`. The wrapper has only that child, so the sticky is effectively inert (inferred from box model); the hero just scrolls away and the white sections (z-50) follow.
- Z-index ledger: menu bar z-10 | draggables z = 20 + rank (20..30) | pillars `zIndex: 10+i` (10-13) | content sections `relative z-50` | about-me cursor video z-[65] | section-nav bar z-[60] | Terminal and Calendly window z-[70].
- Page chrome: `html{scroll-behavior:smooth}`, `body{overflow-x:hidden; background:#fff; color:#1e1e1e; -webkit-font-smoothing:antialiased}`, selection colour `#ff3700`, 4px custom webkit scrollbar (thumb `#ddd`, hover `#bbb`).

## 4. Desktop board (md+): menu bar and widgets

Board = `relative h-full w-full overflow-hidden bg-[#fafafa]` (the `boardRef` that constrains drags). Entrance: parent `motion.div initial="hidden" animate="show"` with `variants.show.transition = {staggerChildren: .05, delayChildren: .08}` (L329-338). Each draggable has variants `hidden {opacity:0,y:8}` -> `show {opacity:1,y:0}`; no explicit transition, so Motion defaults apply: `y` = spring stiffness 500 / damping 25 / restSpeed 10; `opacity` = keyframes, ease [.25,.1,.35,1], 0.3s (46f87 L3552-3554; (inferred) that these defaults are what runs). Stagger order = DOM order: 5 folders, clock, calendar, music, photo, weather, apps.

Menu bar (L45-76): `absolute inset-x-0 top-0 h-7 z-10 bg-white/70 backdrop-blur-md text-[11px]`. Left: "EG" (always), "Elena Gonci" (>= sm), "Head of Product" (>= sm). Right (min-w 124px, tabular-nums): `toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})` + 2x NBSP + `toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})`, i.e. 12-hour, visitor's LOCAL timezone, e.g. "Wed, Oct 7  9:41 AM". Empty until mount (state `now` starts null; set in `useEffect`). Ticks via `setInterval(…, 1000)` (L309-313); the whole Desktop component re-renders every second.

Widgets (initial position; Motion drag applies x/y transform on top):

| id | pos | size | content / click |
|---|---|---|---|
| f-qa, f-ayyva, f-eng, f-pm, f-cs | `right:2.5%`, top 90/198/306/414/522 (108px pitch) | w-20 | folder icon 56px + label; Next `<Link>` to `/work/qa-agent-loop`, `/work/eleyyva`, `/work/engineering`, `/work/product-management`, `/work/customer-success`. Single click navigates (no double-click anywhere). Hover: icon `scale-105`, label bg `#0069d9` + white text |
| w-clock | top 90, left 24 | 150x150 glass | analog SVG clock, label "MIAMI" (see 4a). Not clickable |
| w-cal | top 90, left 194 | 150x150 | `title="Book a meeting"`, `onClick -> calendly.open` (see 4b). Div with onClick, no role/tabIndex |
| w-music | top 90, left 364 | 320x150 | music player (section 7) |
| w-photo | top 404, left 24 | 150x150 | `/selfie.jpg` alt "Me and my dog", pure decoration |
| w-weather | top 264, left 24 | 320 wide | Madrid forecast (4c) |
| w-apps | bottom 120, right 48 | grid-cols-5 gap-1 | app icons (4d) |

Glass card style `u` (L98-104): `rounded-2xl border border-white/45 bg-white/30 p-4 backdrop-blur-2xl backdrop-saturate-150 shadow [inset 0 1px 0 rgba(255,255,255,.6), 0 8px 32px rgba(0,0,0,.12)]`.

### 4a. Clock (MIAMI) (L376-500)
- Source time: `new Date(now.toLocaleString("en-US",{timeZone:"America/New_York"}))`, so DST-aware Miami time computed client-side; tick interval 1000ms (the shared `now` state).
- SVG viewBox 100: face circle r48 (fill rgba(255,255,255,.45)); 12 tick marks from r42 to r46 (stroke-width 2.5 at 12/3/6/9, else 1.2); text "MIAMI" at (50,26), 8px, weight 600.
- Hands: hour = ((h%12)+m/60)*30deg, length 22, width 3.5; minute = 6*m deg, length 34, width 2.2 (no seconds contribution); second = 6*s deg, length 38, width 1, stroke `#FF3700` (the accent). Hub r2.4 black. Hands render only after mount (hydration safe). 12-hour dial; no 24h option.

### 4b. Calendar widget (L506-575)
- Weekday uppercase (`en-US` long) in `#FF3700`, day-of-month 22px, mini month grid (7 cols, S M T W T F S header, leading blanks from `new Date(y,m,1).getDay()`, today = black 11px circle). Visitor local date, rendered after mount.
- Click -> `setState("open")` on Calendly context (section 5).

### 4c. Weather (L601-681): HARDCODED, no network
Madrid; days/temps/icons exactly: We 31 sun, Th 33 sun, Fr 29 cloud, Sa 28 cloud, Su 30 sun, Mo 32 sun, Tu 27 cloud. Sun = yellow `#FFB800` SVG (circle r4 + 8 rays), cloud = grey `#A8B0B9` path. No fetch, no date logic: it will show the same data (starting "We") forever.

### 4d. Apps grid (L248-299, 691-741): hover = `-translate-y-0.5` (2px) transition-transform; tooltips = native `title`/`alt`; no magnification, no bounce.
Icon size: `raw:true` -> 38px with 3px margin, rounded 22%, shadow; else 44px object-contain.
| Icon | Behaviour |
|---|---|
| Notion | `<a target=_blank>` https://app.notion.com/p/Elena-Gonci-190be660baed8064b79ee16e7d3783be (this is "the CV") |
| cmux | inert `<span>` (no link) |
| Granola | inert `<span>` (no link) |
| Terminal | `<button>` -> opens Terminal window (section 6) |
| "Ask Claude about me" | `<a _blank>` `https://claude.ai/new?q=` + encodeURIComponent(prompt) |
| "Ask ChatGPT about me" | `<a _blank>` `https://chatgpt.com/?q=` + same prompt |
| LinkedIn | https://www.linkedin.com/in/elena-gonci/ (_blank) |
| Gmail | `mailto:elenagdb.01@gmail.com` (no target; opens the OS default mail client, not a Gmail compose URL) |
| Calendar | `<button>` -> Calendly open |
| X | https://x.com/elenagonci (_blank) |
Prompt (L15): "Tell me about Elena Gonci, Head of Product at Arrive. She leads an 18 person cross functional team, ships production code herself, and built an autonomous agent fleet with 418 PRs merged to production at 87% acceptance. Summarize her background, her superpowers, and what makes her a standout product hire: https://elenagonci.com/". (`fof.png` is not in this grid; it is the Friends of Figma achievement icon.)

## 5. Drag and drop (the only DnD on the homepage)

Implementation: `motion.div` with Motion's built-in drag (`x` component, L77-97). Not HTML5 DnD (`draggable={false}` is set on wrappers, links, imgs to suppress native drag ghosting).
- Props: `drag` (both axes), `dragConstraints={boardRef}` (the board div), `dragElastic: 0.12`, `dragMomentum: false`, `whileDrag: {scale: 1.04}`.
- Drag start: Motion pointer session, 3px distance threshold (46f87 L3911 `distanceThreshold = 3`). Pointer-down on any child incl. `<a>`, `<button>`, `<img>` can start a drag; only INPUT/SELECT/TEXTAREA/contenteditable are excluded (46f87 L3780, 4463).
- Elasticity/release: with `dragMomentum:false` release velocity = 0; inside constraints the element stays exactly where dropped (no inertia). Outside bounds it can overshoot by 12% of the pull distance while dragging and on release springs back to the edge with `bounceStiffness 200, bounceDamping 40, timeConstant 750, restDelta 1, restSpeed 10` (46f87 L4366-4376). `scale` uses Motion's default spring (stiffness 550, damping 30).
- Window resize: Motion re-scales position proportionally within constraints (`scalePositionWithinConstraints`, L4415, 4490).
- Raise on focus: `onPointerDown -> onFront(id)`; state `order` array: `order = [...order.filter(x=>x!==id), id]`; z-index = `20 + Math.max(order.indexOf(id), 0)` (L317-319). Untouched items all have z=20 (DOM order wins). Note the first-ever touched item also gets 20 (index 0), so it is not actually raised above untouched siblings (inferred from arithmetic). Max z = 30. State is React-only: NOT persisted (no storage), resets on reload.
- Click vs drag: `onDragStart` sets a ref flag; `onDragEnd` clears it in `setTimeout(0)`; `onClickCapture` calls `preventDefault()+stopPropagation()` while the flag is set, so dropping a folder/button never triggers navigation/play/open.
- No drop targets, no snapping, no collision, no drop callbacks.
- Cursor: `cursor-grab`, `active:cursor-grabbing`; wrapper has `touch-none select-none` (Motion also writes `touch-action:none; user-select:none; -webkit-touch-callout:none`), so touch drag uses pointer events; but the whole desktop tree is `display:none` below 768px, so phones cannot drag; tablets >= 768px can (touch).
- Terminal and Calendly windows are NOT Motion-draggable; they use custom pointer-capture drag (sections 5b, 6) with no constraints (can be dragged off-screen).

## 5b. Calendly window (module 21219, `7a4ba...js`)
- `CalendlyProvider` is in the root layout, so state (`"closed" | "open" | "min"`) and the iframe persist across client route changes. Triggers: Calendar widget, apps-grid Calendar icon, footer "Book a meeting", nav "Book a meeting" tile (all call `setState("open")`). Mobile calendar card and nav tile too.
- Window: `fixed left-1/2 top-1/2 z-[70]`, `translate(calc(-50% + dx), calc(-50% + dy))`; initial 640 wide, then on mount `w = min(640, round(.94*innerWidth))`, `h = round(.8*innerHeight)` (L18-24). No overlay/backdrop. No Esc, no focus trap, no resize listener.
- Traffic lights (buttons, `stopPropagation` on pointerdown): red = `closed` (unmounts iframe; state lost); yellow = `min` (hidden via `display:none`, iframe stays mounted; nav "Book a meeting" tile shows a red "1" badge while `min`; clicking any trigger restores); green = zoom toggle: saves rect, sets `w = clampW(1.2*w)`, `h = clampH(1.18*h)`, again to restore.
- Header drag: `onPointerDown` + `setPointerCapture`; pointermove updates dx/dy unbounded.
- Resize: 8 handles (n, s, e, w edges 6px; nw, ne, sw, se corners 12px); the opposite edge stays fixed (offset adjusted by half the delta). Clamps: width `max(min(420, .94*innerWidth), min(w, .96*innerWidth))`; height `max(380, min(h, .94*innerHeight))` (L25-30).
- iframe `https://calendly.com/elenagonci?hide_gdpr_banner=1&hide_landing_page_details=1&background_color=ffffff&text_color=1e1e1e&primary_color=000000`; title "Book a meeting — Elena Gonci".

## 6. Terminal "elena-5" (module 70475)
- Opens from the apps-grid Terminal icon. Desktop tree renders it `embedded` (`absolute` inside the board, clipped by the board's overflow-hidden); mobile tree renders it `fixed`. Both `left-1/2 top-1/2 z-[70]`. Size 440px tall by `min(92vw,640px)` (compact variant 380 x min(92vw,470px) not used on home). Dark `#1d1e26/95`, mono 13px.
- Title bar "visitor@elenagonci — zsh — 80×24"; red dot closes; yellow/green decorative. Drag by title bar via pointer capture, unbounded (L916-931). `onPointerDown` on the window stops propagation.
- Boot lines: "Last login: just now on ttys001" / "elena-5 shell. Ask anything about Elena, or type `help`." Prompt `visitor@elenagonci ~ % `. Input auto-focused on mount; clicking anywhere refocuses; auto-scrolls to bottom on every change.
- Commands (trimmed, lowercased): `help`; `clear`; `exit`/`logout` (close); `ls`/`ls -la` -> "case-studies/   playground/   press/   contact.txt   baby-me.mp4"; `cat contact.txt`/`contact` -> email elenagdb.01@gmail.com, calendly.com/elenagonci, linkedin.com/in/elena-gonci, x.com/elenagonci; `whoami` -> "visitor. I'm elena-5, Elena's terminal. Ask me about her."; `sudo hire elena`/`hire elena` -> "Permission granted. Booking: calendly.com/elenagonci" (text only, does not open Calendly); any other `sudo...` -> "visitor is not in the sudoers file. This incident will be reported."; empty line just echoes.
- Anything else: the ONLY backend call in the homepage: `POST /api/ask` JSON `{question, history: last 6 turns, page: "home"}`; input is replaced by pulsing "elena-5 is thinking…" while pending. HTTP 503 -> "elena-5 is offline right now. Try `cat contact.txt` to reach the human."; other non-2xx/throw -> "network error. Try again, or `cat contact.txt`."; success reads `.answer` (fallback "…lost that thought. Try again?"). History kept = last 4 + new Q/A pair (max 6). Streaming: none. Response body shape is `{answer: string}`; server internals unknown (LLM persona, inferred).

## 7. Music widget (L111-247)
- `<audio preload="none" src="https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/77/3d/5c/773d5c07-9fc9-72aa-1a6d-54bd7d37fadb/mzaf_6074514444011910273.plus.aac.p.m4a">`, no autoplay, no loop. Play is only triggered by a user click, so there is no autoplay-policy handling (the `play()` promise is not caught).
- Cover `/album-psycho.jpg` 72px; title "Psycho Killer"; subtitle "Talking Heads — Talking Heads: 77".
- Buttons: `|<` "Back 10 seconds" (`currentTime = clamp(t-10, 0, duration||30)`), play/pause toggle (aria-label flips "Play"/"Pause"; icon swaps), `>|` "Forward 10 seconds" (+10, same clamp).
- State: `playing` (from onPlay/onPause/onEnded), `time` (onTimeUpdate, ~4 Hz browser default), `duration` (onLoadedMetadata, default 30).
- Progress: 3px track `bg-black/10`, fill `bg-black/55`, width = time/duration*100% (no CSS transition); labels `m:ss` elapsed and `-m:ss` remaining, 9px. The bar is display-only: no click/drag seeking. No volume, no mute, no ring, no album-art rotation/animation, no Media Session, no pause on unmount/drag.

## 8. Hero text (L743-783, CSS)
- Desktop: `h1` (text-4xl / md:text-5xl / 2xl:text-6xl, extrabold, tracking-tight, leading 1.05), `max-w-3xl` centred; `pointer-events-none` on container, `pointer-events-auto` on the "Arrive" link (https://www.arrive.accountants/, _blank; underline 3px, offset 6px, `decoration-black/20` -> `/60` on hover).
- Lines: `<span.hero-line.hero-line-1>I'm Elena.</span><br><span.hero-line.hero-line-2>I lead product at <a>Arrive</a>.</span>` then `<p.hero-line-3>` "Managing engineers, customers, and building agent loops and graphs to make every person in my team more efficient."
- Animation (CSS only): `@keyframes hero-line {0% {opacity:0; transform:translateY(18px)} 100% {opacity:1; transform:translateY(0)}}`; `.hero-line{animation: .7s cubic-bezier(.22,1,.36,1) both hero-line; display:inline-block}`; delays 50ms / 180ms / 340ms. `prefers-reduced-motion` -> `animation:none`. No split-text, no cursor, no gradient, no typewriter. Mobile h1 has no animation.
- It appears twice in the DOM because of the dual desktop/mobile trees (section 3).

## 9. Section nav ("dock", module 93173) and page scroll behaviour
- Rendered once on the homepage after the hero as `variant="bar"`, inside `pointer-events-none sticky top-4 z-[60] flex justify-center px-4 py-3 md:-mt-32 md:h-32 md:items-start md:py-0` (L1774-1778).
- Effect (CSS-only, inferred from classes): on md+ the pill starts about 128px above the bottom of the first viewport (negative margin, like a dock), then rides up and sticks 16px from the top as you scroll; on mobile it sits below the hero and sticks at top-4. No JS scroll listener. (The `#hero-fold-sentinel` fade-in variant, module 53501, is bundled but not rendered on the homepage; it is used on /work and /playground where it shows the bar fixed at top-4 with a 300ms opacity fade.)
- Items (L540-629): Home `/` (white tile, Clepto "E"), Work `/#pillar-stack` (blue gradient #5FB0FF->#2E7CF6), Achievements `/#achievements` (purple #C489FB->#8231E8), About `/#about` (pink #FF7A93->#F92D50), then the injected "Book a meeting" calendar tile (button; date tile with red weekday + day number; red "1" badge when Calendly minimised), Contact `/#contact` (green #4FDE73->#1FB84A). A 1px divider follows Home.
- Magnification (L630-691, 692-765): container `onMouseMove` -> `mouseX.set(clientX)`; `onMouseLeave` -> `Infinity`. Per item: `dist = mouseX - itemCenterX` (fresh `getBoundingClientRect()` per update); `width = useTransform(dist, [-range,0,range], [rest,peak,rest])` linear; then `useSpring(width, {mass:.1, stiffness:180, damping:13})`. Constants: `bar {rest 40, peak 60, range 100}`; `hero {rest 48, peak 76, range 120}` (hero variant unused on homepage). Bar variant is top-aligned (`items-start`, tiles grow downward), `gap-2.5`. Mouse-only (touch has no mousemove, so tiles stay at 40px).
- Tooltips: on `mouseenter` show a `bg-black/75` 11px label (`backdrop-blur`) below the tile (`-bottom-9`) when the tile's top < innerHeight/2, otherwise above (`-top-9`). No delay/animation. Each tile has `aria-label`.
- Hash nav: Next `<Link href="/#x">`. On `/` this is a hash-only navigation: Next calls `element.scrollIntoView()` (d2be3 L249; `onlyHashChange` skips Next's smooth-scroll disabling) and the CSS `html{scroll-behavior:smooth}` animates it (native duration). Each click pushes a history entry. Target offset: sections have `scroll-mt-24` (96px) for `#achievements #press #highlights #playground #about`; `#contact` footer and `#pillar-stack` have none. `data-scroll-behavior` is not set on `<html>`. From other pages, the link is a full route transition to `/` then the same scroll (inferred).
- Sections (all `relative z-50`): `#achievements`, `#press`, `#pillar-stack`, `#highlights`, `#playground`, `#about`, `#contact`.

## 10. Scroll effects (all CSS or IntersectionObserver; no scroll-linked JS)
- Reveal-on-scroll `v` (L948-975): IntersectionObserver `{rootMargin:"0px 0px -12% 0px", threshold:.05}`, fires once then `disconnect()`. Classes `transition-all duration-700 ease-out`, from `translate-y-5 opacity-0` to `translate-y-0 opacity-100`, inline `transitionDelay`. Used on: Achievements h2, each achievement card (delay 80ms * index: 0/80/160/240/320), "In the press" h2, "Venture studio & portfolio work" header and each of its 14 rows. SSR markup is invisible until hydration (no no-JS fallback).
- Press marquee (L1876-1938): 4 articles repeated 6x = 24 cards, each 250px wide, `gap-4`, `pl-4`; CSS `@keyframes marquee-scroll{from{translateX(0)}to{translateX(-50%)}}` `.marquee-track{animation: marquee-scroll 96s linear infinite}` -> shifts 3192px per 96s (~33 px/s), seamless because -50% = exactly 3 copies. `.marquee-track:hover{animation-play-state:paused}`. Mask: `linear-gradient(to right, transparent, black 8%, black 92%, transparent)`. Copies after index 3 get `aria-hidden=true` and `tabIndex=-1`. `prefers-reduced-motion` stops it. Card hover: lift -2px, bigger shadow; logo goes from grayscale/60% opacity to colour/100% (TechBullion logo is inverted). Cards link out (`_blank`): ibtimes.com, gritdaily.com, techtimes.com, techbullion.com articles.
- Stacking pillars (`#pillar-stack`, L1378-1505, 1941-1947): 4 pillars (AI Systems, Product, Engineering, Customer Success). On md+: each is `sticky top-24 h-[calc(100dvh-6rem)]` with `zIndex 10+i`, so each slides over the previous like stacked folder tabs (pure CSS sticky). On mobile: `static`, `mt-4`, `h-auto`, evidence descriptions hidden (`max-md:hidden`). Tab shape = 320x80 `clip-path: path(...)`. Panel scrolls internally (`md:overflow-y-auto`) if content is taller. Evidence card hover: `-translate-y-1.5` + deeper shadow, 300ms. Pill links `#57A4F0` -> `#3E8FE4`: "QA Agent Loop →" `/work/qa-agent-loop`, "Internal LMS →" `/work/eleyyva`, "Full case study →" `/work/product-management`, `/work/engineering`, `/work/customer-success`.
- No scroll-snap, no parallax, no progress bar/indicator, no Lenis/GSAP, no `useScroll`.
- Reduced motion: global `@media (prefers-reduced-motion:reduce){*{transition-duration:.01ms!important;animation-duration:.01ms!important}}` plus marquee/hero/shimmer overrides. Motion's JS animations (stagger-in, dock springs) are NOT reduced: no `MotionConfig`, default `reducedMotion:"never"` (46f87 L2075).

## 11. Remaining homepage pieces
- Achievements (L1213-1250, 1794-1857): 5 cards. Thesis -> diva-portal.org record (graduation-cap gradient icon, "1,600+ downloads, cited internationally"); Friends of Figma -> friends.figma.com/remote-designers (fof.png scaled 1.5x); Independent researcher (no link); Technical reviewer -> packtpub.com/en-gb/data; Hackathon judge (no link). Linked cards hover -2px.
- Venture studio list (14 rows: 5 + 9) is static text.
- Playground link (L1666-1681, 1992-2073): whole block is `<Link href="/playground">`. Illustration: folder back + two photo cards (`/selfie.jpg` rotates -12deg and rises 42%; `/album-psycho.jpg` +12deg, rises 52%) + yellow sticky "I love whiteboarding" (rises 68%) + front flap `perspective(700px) rotateX(-24deg)` + yellow "View" pill (`#F7CE46`, fades/scales in). All transitions 300ms ease-out. Open state = `group-hover` (only under `@media (hover:hover)`) OR `data-open=true`. If `matchMedia("(hover: hover)")` is false (touch), a `setInterval` toggles `data-open` every 2500ms forever so the folder animates open/closed by itself.
- About window "about-me.txt" (L1506-1665): decorative traffic lights; "Then"/"Now" columns. "The future" button toggles a `grid-template-rows 0fr -> 1fr` expander (500ms ease-out; plus icon rotates 45deg, 300ms) revealing "Return to my perfect form: ideal weight (18kg), glass skin, 12h of sleep, and not a single gray hair." Desktop (mouse) gimmick: while the pointer is inside the window and not over the "The future" button, the native cursor is hidden (`cursor:none`) and a muted looping autoplay `/baby-me.mp4` (150px wide, rounded, `fixed`, z-65, `pointer-events-none`) follows the pointer, positioned by direct style writes `translate(x,y) translate(-50%,-50%)` (no easing); hidden on mouseleave, on hovering the button, and on window `scroll` if the last pointer position is outside the window rect. Mobile: when expanded, an inline `<video src="/baby-me.mp4" autoplay loop muted playsinline>` (max-w 240px, `md:hidden`) appears instead.
- Footer `#contact` (L2080-2267): "E" logo (Clepto) + "Elena Gonci." / "A Supersaiyan version of a PM." Icon row (hover -4px, 150ms): LinkedIn, X, Gmail (mailto), Ask Claude, Ask ChatGPT, CV (Notion icon). Text links with arrow-swap hover (two → glyphs slide 300ms ease-out + underline `scale-x` 0->1 origin-left 300ms): Email `mailto:elenagdb.01@gmail.com`; LinkedIn `https://www.linkedin.com/in/elena-gonci/` (_blank); X `https://x.com/elenagonci` (_blank); "Book a meeting" = button -> Calendly; CV = Notion page above (_blank). No PDF CV.
- CSS Design Awards block: single `<a _blank>` https://www.cssdesignawards.com/sites/elena-gonci/50190/ (title "Awards won at CSS Design Awards, 2026") wrapping 4 SVG badges 44px each: `/cssda-special-kudos-yellow.svg` (Special Kudos), `/cssda-best-ui-purple.svg` (Best UI Design), `/cssda-best-ux-orange.svg` (Best UX Design), `/cssda-best-inn-green.svg` (Best Innovation); badges lift -2px on hover; caption "CSS Design Awards, 2026"; then "© 2026".
- Mobile tree (L788-945): glass card with h1 + paragraph; 2-col: calendar card ("Tap to book a meeting", opens Calendly) + selfie; 4-col folder grid linking to the 5 /work pages (labels truncated, 10px); glass card with the same 10-icon app grid (icons 40/44px, no hover lift). No menu bar, no clock, weather, music, or drag.

## 12. Keyboard, focus, aria
- App code registers NO keydown/keyup/keypress listeners (grep: only Motion/Next internals). No Cmd+K, no Esc (Calendly/terminal do not close on Esc), no arrow-key navigation, no Enter/Space handlers on cards (only native behaviour of `<a>`/`<button>`).
- Motion's `whileTap` Enter-key press support is not used (no `whileTap/onTap`), so draggable wrappers are not focusable (no tabIndex).
- Tab order = DOM order: (menu bar not focusable) -> 5 folder links -> [calendar widget is a clickable div: NOT keyboard reachable] -> music (back, play, forward) -> apps grid (Notion, Terminal button, Claude, ChatGPT, LinkedIn, Gmail, Calendar button, X; cmux/Granola are inert spans) -> "Arrive" hero link -> (mobile tree is display:none, skipped) -> section-nav (Home, Work, Achievements, About, Book a meeting, Contact) -> achievements links -> press cards (first 4 only) -> pillar pill links -> playground link -> about "The future" button -> footer icon links, text links, award link.
- Focus management: only the Terminal input (`focus()` on mount, on click, and after each command via `setTimeout 0`). No focus trap/restoration for Calendly. No skip links.
- aria: section-nav tiles have `aria-label`; footer icons `aria-label`+`title`; music buttons `aria-label`; decorative SVGs `aria-hidden`; press duplicates `aria-hidden`; Calendly traffic lights `aria-label` Close / Minimize to dock / Zoom window or Restore window size; terminal input `aria-label="Terminal input"`; clock/weather have no labels; the nav is a `div` (no `<nav>` / role).
- Pointer handlers in app code: Motion drag (pointer events), Calendly/Terminal custom `onPointerDown/Move/Up` with `setPointerCapture`, nav `onMouseMove/Leave/Enter`, about-window `onMouseEnter/Move/Leave`, `onClick`s. No `onTouch*` or `onDoubleClick`, `onContextMenu`, `onWheel` in app code (the `onTouchStart` in Next's Link is just prefetch intent).

## 13. Loading, theme, network, misc
- No preloader. Fonts are `<link rel=preload>`ed; first-paint images preloaded (folder, album, selfie, all app icons, press logos, CSSDA badges). Widgets fade up with the Motion stagger (section 4); hero lines with the CSS animation (section 8).
- No dark mode (no `prefers-color-scheme` CSS), no theme toggle. Accent colour `#ff3700`, dark text `#1e1e1e`.
- Custom cursor: global CSS sets `body,a,button{cursor:none}` but every route injects `<style>body{cursor:auto!important} a,button,[role=button]{cursor:pointer!important}</style>`, and no custom-cursor component exists in these chunks (leftover). The only "cursor" effect is the baby-me.mp4 follower (section 11).
- Network calls from the homepage: same-origin `/api/ask` (terminal only); `https://audio-ssl.itunes.apple.com/...m4a` (only after Play, `preload=none`); `/baby-me.mp4` (when the about-window hover/expander mounts the `<video>`); the Calendly iframe (only after opening); Next RSC prefetches for `/work/*`, `/playground`. No third-party scripts, no analytics, no console output from app code, no cookies/storage.
- Metadata: title "Elena Gonci, Head of Product"; og:image `https://elenagonci.com/og.png` (1200x630); icons `/icon.png`, `/apple-icon.png`.
- 404 page (in RSC payload): macOS "Finder" window, "The item can't be found... Error code -404.", button "Back to the desktop →" (`/`).
- Easter eggs: terminal `sudo`/`hire elena`/`whoami`/`ls` strings; the "future" baby video; "A Supersaiyan version of a PM." copy.

## 14. /playground and /work/* (SSR only; JS chunks not supplied)
- `/playground` SSR: `fixed inset-0 touch-none select-none overflow-hidden` canvas with `cursor:grab`; dotted grid `radial-gradient(rgba(0,0,0,.12) 1px, transparent 1px)` at 22px with `background-position` (pan offset updated by JS, inferred); a sticky note (#FFE066, 280px, -rotate-2) at canvas centre with the "whiteboarding" text; header "Playground / Old work, side projects & earlier gigs."; section-nav bar `fixed top-4` (opacity 0 in SSR, fades in on mount); bottom-right ">_" button (aria "Open the elena-5 terminal"); caption "Drag to pan. More coming to this board soon." Pan/drag logic and item data are in an unavailable chunk (module 59796 in `0da5e964a989532f.js`).
- `/work/*` SSR: chat-style case-study pages (title, "elena-5" badge, "Ask anything about this project" input, two buttons "Chat through it" / "Read the full case study"). CSS leftovers `shimmer-text`, `chat-strong`, `animate-[cardin_0.45s_ease-out]` (opacity 0->1, translateY 10px->0, scale .98->1), `animate-[fadeup_0.4s_ease-out]` (opacity 0->1, translateY 6px->0), `shimmer-text` (1.8s linear infinite background-position sweep) and `horizontal-scroll` belong to these pages. Logic not available.
