# elenagonci.com - sub-pages + design system (reverse-engineering notes)

Source: only the already-downloaded files in `scratchpad/ref/` (SSR HTML, 1 CSS, 13 JS chunks, headers.txt). Nothing was fetched live.
Beautified copies: `analysis/js/*.js`, `analysis/style.css`, `analysis/compact.css` / `compact2.css` (one rule per line; compact2 drops the color-mix `@supports` duplicates), `analysis/pages/*.html`.
Companion outputs: `analysis/case-study-data.json`, `analysis/assets-manifest.txt`.
"(inferred)" = not directly visible in the downloaded files.

---------------------------------------------------------------------------------------------------
## 0. Headline findings (read this first)

**UPDATE - the six route chunks are now in `ref/chunks/` and have been extracted.** Everything about /playground and the five /work/* pages is now recovered verbatim: `case-study-data.json` (35 scripted turns, 5 routes, ~420 KB) holds every message, card, number and link; `tools/extract.js` + `tools/build.js` regenerate it (they evaluate each chunk with a mock JSX runtime).

1. **Rendering model:** every sub-page is a `"use client"` page (`ClientPageRoot`). HTML is a static prerender (~19.8 KB shell: `<head>` 2.9 KB + `<main>` 8.0 KB incl. ~5.2 KB dock SVG + 8.7 KB RSC flight scripts). The content is **not** in the HTML: it is JSX literals inside the per-route chunk (`const turns = [{q, thought, a, card, cardLabel, after, more}, ...]`) passed to a shared `<ChatWindow title subtitle intro turns>` (module 92612, duplicated byte-for-byte, only minifier renames, in all five chunks). `/playground` is a separate pan-board component (module 59796).
2. **Routes are 5 literal static folders, not `[slug]`:** RSC tree `work -> qa-agent-loop -> __PAGE__` etc. (inferred `app/work/<slug>/page.tsx`); no `work` layout.
3. **Chrome:** only the fixed top dock (+ Calendly window). No back button, breadcrumb, header, footer or prev/next. In chat view there is also a fixed top fade, a fixed bottom composer and inline "Next case study ->" / "<- All case studies" chips at the end of the last answer. The Terminal exists only on /playground (and "/").
4. **Case studies = scripted AI chat:** landing (SSR) -> "Chat through it" (step-by-step, user clicks the next question pill, staged reveal 950 / 1750 / 3150 ms) or "Read the full case study" (all turns at once, no animation). Free-form questions go to `POST /api/ask` with `page` = slug. No typewriter/streaming. Details in A.2b.
5. **/playground = single sticky note on a draggable dot-grid board:** pointer-event pan, unbounded, no inertia/wheel/keyboard; the elena-5 terminal auto-opens on desktop (>=768px). There are no gallery items. Details in A.1.
6. **Metadata identical on all 7 pages** (see C). Stack: Next.js 16.1.6 (App Router, Turbopack), React 19.3.0-canary-f93b9fd4-20251217, Tailwind v4, framer-motion, lucide-react, Netlify.

---------------------------------------------------------------------------------------------------

## A. SUB-PAGE SPEC

### A.0 Shared layout (root `app/layout.tsx`, applies to every route)

```html
<html lang="en" class="{bricolage.variable} {clepto.variable}">   <!-- next/font css-var classes -->
  <body class="{bricolage.className} antialiased">
    <CalendlyProvider>                 <!-- client ctx: state "closed" | "open" | "min" -->
      <main> {children} </main>        <!-- NO header/footer in layout -->
    </CalendlyProvider>
  </body>
</html>
```
- class names (Next-hashed): `bricolage_grotesque_320791d7-module__h-5WAW__variable` / `...__className`, `clepto_838d6b45-module__my6eIq__variable`.
- `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<meta name="next-size-adjust" content="">`.
- Root `not-found.tsx` = macOS "Finder" alert (see A.5).
- Each page root sets its own cursor override via an inline `<style>` (see B.7).

#### CalendlyProvider (chunk 7a4ba18437171885.js, module 21219)
- `CALENDLY_URL = "https://calendly.com/elenagonci"`; iframe src = `${URL}?hide_gdpr_banner=1&hide_landing_page_details=1&background_color=ffffff&text_color=1e1e1e&primary_color=000000`; iframe `title="Book a meeting with Elena Gonci"`.
- Rendered once, below the app, as a macOS-style window: `fixed left-1/2 top-1/2 z-[70] flex-col rounded-xl border border-black/15 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.35)]`, `overflow:hidden`, `display:none` while minimized (iframe stays mounted so state persists).
- Size state `{dx,dy,w:640,h:560}`; on mount `w=min(w, 0.94*innerWidth)`, `h=round(0.8*innerHeight)`. Position = `translate(calc(-50% + dx), calc(-50% + dy))`.
- Title bar (`cursor-grab active:cursor-grabbing`, `bg-[#f5f5f5] border-b border-black/10 px-4 py-2.5`, pointer-capture drag): 3 traffic-light buttons 12px: red `#ff5f57` "Close" -> state `closed`; yellow `#febc2e` "Minimize to dock" -> state `min` (dock tile gets red badge "1"); green `#28c840` "Zoom window"/"Restore window size" -> toggles `w=clamp(1.2*w)`, `h=clamp(1.18*h)`; title text "Book a meeting — Elena Gonci" (`ml-3 text-xs font-medium text-black/55`).
- 8 invisible resize handles (n/s/e/w 1.5-unit thick, corners 3x3 units; cursors ns/ew/nwse/nesw-resize; `z-20`). Width clamp `max(min(420,0.94vw), min(w,0.96vw))`, height clamp `max(380, min(h,0.94vh))`.

#### Dock (chunk 6a200556ad5fa9bf.js module 93173) + auto-appear wrapper (module 53501)
- Wrapper used on sub-pages: `<div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 transition-opacity duration-300" style="opacity:0|1">` + inner `div` toggling `pointer-events`. Looks for `#hero-fold-sentinel`; if absent (all sub-pages) -> `visible=true` right after mount (so SSR HTML has `opacity:0`, then fades in 300 ms). On pages with a sentinel it shows once the sentinel's `boundingClientRect.top < 0`.
- Dock "bar" variant container: `pointer-events-auto flex items-start gap-2.5 rounded-2xl border border-white/45 bg-white/30 px-3 pb-2 pt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl backdrop-saturate-150`. "hero" variant (homepage only): same but `items-end gap-3`, icons 48px->76px peak, range 120.
- Magnification: icon width = `useSpring(useTransform(distanceToMouseX,[-range,0,range],[rest,peak,rest]), {mass:0.1, stiffness:180, damping:13})`; `bar: rest 40, peak 60, range 100`; `hero: rest 48, peak 76, range 120`. Mouse tracked on the dock container (`onMouseMove -> mouseX.set(clientX)`, leave -> `Infinity`).
- Tile: `relative aspect-square`; link: `flex h-full w-full items-center justify-center rounded-[24%] shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-[filter,background-color] hover:brightness-105`; glyph svg `h-1/2 w-1/2` viewBox 24, stroke 1.8, round caps/joins. Tooltip on hover: `pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-md` placed `-bottom-9` (below) if tile is in the top half of the viewport else `-top-9`.
- Items, in order (all `aria-label` = label):

  | # | label | href | tile |
  |---|---|---|---|
  | 0 | Home | `/` | light: `border border-black/10 bg-white text-black hover:bg-[#f3f3f3]`; glyph = SVG `<text x=12.5 y=19 font-size=21 font-weight=700 font-family=var(--font-clepto)>E</text>`; followed by 1px divider `w-px bg-black/15 mt-0.5 h-8 self-start` |
  | 1 | Work | `/#pillar-stack` | `from-[#5FB0FF] to-[#2E7CF6]` (bg-gradient-to-b), folder glyph |
  | 2 | Achievements | `/#achievements` | `from-[#C489FB] to-[#8231E8]`, sparkles glyph |
  | 3 | About | `/#about` | `from-[#FF7A93] to-[#F92D50]`, heart glyph |
  | - | Book a meeting | button -> Calendly `setState("open")` | white tile (`rounded-[24%] border border-black/10 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]`) showing live weekday (`text-[9px] font-bold uppercase`, color `#ff3b30`) + day number (`text-[20px] font-semibold`); empty in SSR, filled after mount; red badge "1" (`-right-1 -top-1 h-[16px] min-w-[16px] rounded-full bg-[#ff3b30] text-[9px] font-bold text-white`) when Calendly is minimized; inserted after item 3 |
  | 4 | Contact | `/#contact` | `from-[#4FDE73] to-[#1FB84A]`, contact-card glyph |

  Exact SVG path data: `analysis/js/6a200556ad5fa9bf.js` lines 540-628. Homepage-only `extraItems` slot exists (unused on sub-pages).

#### Terminal ("elena-5") window (module 70475)
- Trigger: only /playground (auto-opens on desktop, `>_` launcher otherwise; `page="playground"`) and the Terminal app icon on `/`; case-study pages have no terminal. On `/` it is the `Terminal` app icon. Props: `onClose`, `initialOffset{x,y}`, `compact` (380px high, `w-[min(92vw,470px)]`), `embedded` (absolute instead of fixed), `page` (default `"home"`; sent to the API).
- Window: `left-1/2 top-1/2 z-[70] flex flex-col overflow-hidden rounded-xl border border-black/40 bg-[#1d1e26]/95 font-mono text-[13px] leading-relaxed shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-md`, default `h-[440px] w-[min(92vw,640px)]`. Title bar `bg-[#2a2b33] border-b border-white/10 px-4 py-2.5 cursor-grab active:cursor-grabbing` (pointer-capture drag), traffic lights red(close)/yellow/green (only red wired), centered title `visitor@elenagonci — zsh — 80×24` (`text-xs font-medium text-white/50`).
- Content: prompt `visitor@elenagonci` in `#4FDE73`, ` ~ % ` in `text-white/45`, output `text-white/80`, system lines `text-white/35`; caret color `#4FDE73`; input auto-focused; auto-scroll to bottom; "elena-5 is thinking…" uses `animate-pulse`.
- Boot text: `Last login: just now on ttys001` / `elena-5 shell. Ask anything about Elena, or type \`help\`.`
- Commands: `help` (lists: help, ls, cat contact.txt, whoami, clear, exit; "anything else is a question for elena-5."), `ls`/`ls -la` -> `case-studies/   playground/   press/   contact.txt   baby-me.mp4`, `cat contact.txt`/`contact` -> email elenagdb.01@gmail.com, calendly calendly.com/elenagonci, linkedin linkedin.com/in/elena-gonci, x x.com/elenagonci; `whoami` -> "visitor. I'm elena-5, Elena's terminal. Ask me about her."; `sudo hire elena`/`hire elena` -> "Permission granted. Booking: calendly.com/elenagonci"; other `sudo...` -> "visitor is not in the sudoers file. This incident will be reported."; `clear`, `exit`/`logout` close.
- Anything else: `POST /api/ask` `{question, history: last 6 msgs, page}` -> `{answer}`; 503 -> "elena-5 is offline right now. Try \`cat contact.txt\` to reach the human."; other errors -> "network error. Try again, or \`cat contact.txt\`."; empty answer -> "…lost that thought. Try again?".

### A.1 /playground  (client page, module 59796, chunk `0da5e964a989532f.js`; `app/playground/page.tsx` inferred)

**Fully recovered.** The component (state: `pan {x,y}={0,0}`, `dragRef`, `dragging`, `terminalOpen`, `termOffset`):

```jsx
useEffect(() => { const m = window.innerWidth < 768; setTermOffset(m ? {x:0,y:0} : {x:385,y:30}); if (!m) setTerminalOpen(true); }, []);
const end = () => { dragRef.current = null; setDragging(false); };
<div className="fixed inset-0 touch-none select-none overflow-hidden bg-white text-black"
     style={{ cursor: dragging ? "grabbing" : "grab" }}
     onPointerDown={e => { if (e.target.closest("a, button")) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { px: e.clientX, py: e.clientY, ox: pan.x, oy: pan.y }; setDragging(true); }}
     onPointerMove={e => { const d = dragRef.current; d && setPan({ x: d.ox + e.clientX - d.px, y: d.oy + e.clientY - d.py }); }}
     onPointerUp={end} onPointerCancel={end}>
  <style>{`body{cursor:auto!important} a,button,[role="button"]{cursor:pointer!important}`}</style>
  <div className="pointer-events-none absolute inset-0"
       style={{ backgroundImage:"radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)", backgroundSize:"22px 22px", backgroundPosition:`${pan.x}px ${pan.y}px` }} />
  <div className="absolute left-1/2 top-1/2" style={{ transform:`translate(${pan.x}px, ${pan.y}px)` }}>
    <div className="w-[280px] -translate-x-1/2 -translate-y-1/2 -rotate-2 bg-[#FFE066] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.18)]"> ...note... </div>
  </div>
  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto max-w-[1060px] px-6 pt-32 text-center"> ...eyebrow/h1/intro... </div>
  <DockAppear />                                   {/* module 53501 */}
  {terminalOpen && termOffset && <Terminal onClose={()=>setTerminalOpen(false)} initialOffset={termOffset} compact page="playground" />}
  {!terminalOpen && <button onClick={()=>setTerminalOpen(true)} aria-label="Open the elena-5 terminal" className="absolute bottom-6 right-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d1e26] font-mono text-[15px] font-bold text-[#4FDE73] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5">&gt;_</button>}
  <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-medium text-black/55">Drag to pan. More coming to this board soon.</p>
</div>
```
- **Pan logic:** pointer events only; 1:1 delta (`ox + clientX - px`); pointer capture on the root; presses on `a, button` are ignored; **no bounds, no inertia/momentum, no easing, no zoom, no wheel/trackpad handler, no keyboard handler, no resize handler, no reset**. The dot grid scrolls via `background-position = pan`; the heading/hint are fixed siblings.
- **Cursor/touch:** inline `cursor: grab | grabbing`; Tailwind `touch-none` + `select-none`; Pointer Events cover mouse/touch/pen.
- **Dock fade-in:** `DockAppear` looks for `#hero-fold-sentinel` (absent) -> `visible=true` on mount; `opacity 0 -> 1`, `transition-opacity duration-300`; SSR HTML has `opacity:0`.
- **Terminal wiring:** desktop (>=768px) opens the compact terminal automatically after hydration at offset `{x:385,y:30}` (to the right of the note, `h-[380px] w-[min(92vw,470px)]`), `page="playground"`; mobile starts closed with the `>_` launcher (SSR shows the launcher because state starts false). Closing (red light) re-shows the launcher. The terminal root `stopPropagation`s pointerdown so it never pans the board and has its own drag.
- **Board items:** exactly one - the sticky note (text "I love whiteboarding. It's the closest thing to how my brain operates. If whiteboarding is your jam too, we are already friends." / "Elena"). No images, no data array, no filters/lightbox/copy. **Assets referenced: none.** Copy: eyebrow "Playground", h1 "Old work, side projects & earlier gigs.", intro "My personal gallery. Dropping random stuff I've done and things I like. My little corner of the internet.", hint "Drag to pan. More coming to this board soon."

### A.2 /work/* common shell (all 5 case studies identical except 2 strings)

```html
<main>
 <div class="min-h-screen bg-white text-black">
  <style>
    body { cursor: auto !important; }
    a, button, [role="button"], input { cursor: auto; }
    a, button, [role="button"] { cursor: pointer !important; }
  </style>
  <!-- Dock (opacity 0 -> 1 after mount) -->
  <div class="mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center px-5 py-24 md:px-6">
    <p class="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-black/60">Case study</p>
    <h1 class="mb-8 flex items-center gap-2 text-center text-2xl font-bold tracking-tight md:text-3xl">
      {TITLE}<span class="rounded-full border border-black/10 bg-white px-2 py-1 text-[10px] font-semibold text-black/55 shadow-sm">elena-5</span>
    </h1>
    <p class="-mt-4 mb-8 max-w-md text-center text-[15px] leading-relaxed text-black/55">{SUBTITLE}</p>
    <div class="w-full"><div>
      <form class="mx-auto flex max-w-[720px] items-center gap-2 rounded-full border border-black/15 bg-white py-1.5 pl-5 pr-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
        <input placeholder="Ask anything about this project" class="min-w-0 flex-1 bg-transparent text-sm text-black/80 outline-none placeholder:text-black/35" value="">
        <button type="submit" aria-label="Send" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/80">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
      </form>
      <p class="mx-auto mt-1.5 max-w-[720px] text-center text-[10px] text-black/55">The scripted part of this conversation carries the verified numbers. Live answers only use facts from this site.</p>
    </div></div>
    <div class="mt-8 grid w-full gap-3 sm:grid-cols-2">
      <button class="rounded-2xl border border-[#57A4F0]/35 bg-gradient-to-b from-[#57A4F0]/[0.10] to-[#57A4F0]/[0.04] p-5 text-left transition-all hover:border-[#57A4F0]/60 hover:shadow-[0_10px_30px_rgba(87,164,240,0.15)]">
        <p class="text-[15px] font-bold text-black/85">Chat through it</p>
        <p class="mt-1 text-[13px] leading-relaxed text-black/60">The story unfolds message by message. You decide when to continue, and you can ask your own questions anytime.</p></button>
      <button class="rounded-2xl border border-black/10 bg-[#fafbfc] p-5 text-left transition-all hover:border-black/25 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <p class="text-[15px] font-bold text-black/85">Read the full case study</p>
        <p class="mt-1 text-[13px] leading-relaxed text-black/60">Load the whole conversation at once and scroll it like an article.</p></button>
    </div>
  </div>
 </div>
</main>
```
(The `elena-5` chip is the AI persona name; same name as the terminal.)

**Per-route variable strings (verbatim from SSR) + homepage teaser data (verbatim from chunk 11a318896e6c3fce.js - the homepage teaser only; the full case-study content is in A.2b / `case-study-data.json`):**

| route | H1 | subtitle | homepage pillar headline / narrative / evidence (title - desc) |
|---|---|---|---|
| /work/qa-agent-loop | QA Agent Loop | An autonomous agent fleet that finds bugs, fixes them, and ships to production, with a human merging every PR. | Pillar "AI Systems": "Agent loops and graphs that make everyone more efficient." / "Building and running an autonomous agent fleet: a hybrid workforce of humans and agents shipping into the same production codebase." Evidence: **QA agent loop** - 418 PRs merged to production at 87% acceptance, ~135 a month; **Eleyyva** - RAG assistant unifying the knowledgebase, financials, and team metrics; **Automated release notes** - weekly, zero manual effort. Links: "QA Agent Loop ->" /work/qa-agent-loop, "Internal LMS ->" /work/eleyyva |
| /work/eleyyva | Eleyyva | The RAG assistant that turned our scattered company knowledge into one brain the whole team can query. | (same "AI Systems" pillar as above; the homepage labels this link "Internal LMS") |
| /work/engineering | Engineering | The production code I ship myself as Head of Product: onboarding, OCR, advisory formulas. | Pillar "Engineering": "Writing specs and shipping code." / "Owning the onboarding and AI repos as an individual contributor, not just a coordinator." Evidence: **191 PRs authored, 162 merged** - 533 commits across the Arrive repos, as of Sep 15; **20 active personal repos** - onboarding tooling, advisory formulas sandbox, arrive lms chatbot, and more; **Advisory formulas engine** - verified at 45 of 45 golden tests |
| /work/product-management | Product Management | Two years of running product delivery at Arrive: the boards, the quarters, and lately, the agents. | Pillar "Product": "Managing OKRs for engineers and agents." / "Whatever the team, the stack, or the constraints, I find the way to ship. Right now that means running engineers and an agent fleet on one roadmap, one board, one process." Evidence: **1,404 tickets coordinated** - on the roadmap board, 710 of them bugs; **804 feature behaviors specified** - 763 passing baseline, a 95% pass rate; **20.4h median from filed to merged** - in production, 72% ship within 48 hours |
| /work/customer-success | Customer Success | I do our customer support myself, on purpose. The onboarding tooling and the feedback loop that came from it. | Pillar "Customer Success": "Handling customer success for a better product." / "After feeling the manual onboarding pain firsthand, built the tooling that automated it. And still running it." Evidence: **Onboarding tooling** - built it, own it, run it; **25+ firms onboarded** - 200+ power users across firms of 5 to 15 people; **Time to onboard** - from 60 to 90 days down to 14 to 30 |

Other facts in the homepage chunk: "leads an 18 person cross functional team"; "autonomous agent fleet with 418 PRs merged to production at 87% acceptance"; pillar card CTA style `rounded-full bg-[#57A4F0] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#3E8FE4]`.

**Page chrome:** dock only (see A.0); chat view adds a fixed top fade + fixed bottom composer (A.2b). No back button / breadcrumb / header / footer / next-prev. Entry point is the homepage: on desktop, 5 draggable macOS-style folders at the right edge of the desktop board (`/app-icons/folder.png`, label chip `bg-white/70 backdrop-blur-sm`, hover `bg-[#0069d9] text-white`; tops 90/198/306/414/522 px, `right:2.5%`): QA Agent Loop -> /work/qa-agent-loop, Eleyyva -> /work/eleyyva, Engineering -> /work/engineering, Product Mgmt -> /work/product-management, Customer Success -> /work/customer-success; plus pillar-stack "Full case study ->" pills.

**Interactive elements:** see A.2b (fully recovered). Render: client component pages, static prerender.

### A.2b Case-study chat engine (module 92612 in each case-study chunk) - constants

Props `{title, subtitle, intro, turns}`; `turn = {q, thought?, a, card?, cardLabel?, after?, more?}`. State: `mode "landing"|"steps"|"full"`, `c` (turns shown), `k` (turns settled), `f` (free-form messages `{role,content}`), `b` (loading), `p` (input).
- **Landing (SSR shell):** see A.2. Submitting the composer from landing -> `mode="steps"` (c stays 0) + `/api/ask`.
- **"Chat through it":** `setMode("steps"); setC(0); setTimeout(()=>window.scrollTo({top:0}),0)`. Shows intro bubble, then one right-aligned **continue pill** = next scripted question + " ->" (`max-w-[85%] sm:max-w-[70%] rounded-full border border-[#57A4F0]/40 bg-[#57A4F0]/[0.08] px-4 py-2.5 text-[14px] font-medium text-[#2E7CF6] hover:bg-[#57A4F0]/[0.16]`). Pill shows only if `mode==="steps" && c<turns.length && k>=c && !loading`. Click -> `c+1` + smooth scroll. Turn `i` is animated only if `i===c-1 && k<c`; when it reaches stage 3 it calls `onSettled` -> `k=max(k,i+1)` + scroll.
- **"Read the full case study":** `setMode("full"); setK(turns.length); scrollTo top`. All turns rendered immediately at stage 3 (no shimmer/anim, no pill).
- **Reveal timeline per turn (steps mode):** stage 0 shimmer "Thinking..." (`shimmer-text pt-1.5 text-[13px] font-medium`); **950 ms** -> stage 1: "Thought for {2 + (turnIndex % 3)}s" toggle + answer (`animate-[fadeup_0.4s_ease-out]`); card turns: **1750 ms** stage 2 shimmer "Generating {cardLabel ?? 'artifact'}..." ; **3150 ms** stage 3 card + `after` (`animate-[cardin_0.45s_ease-out]`) + "Explain more"; no-card turns: **1500 ms** -> stage 3. No char-by-char typing/streaming.
- **Scroll:** `setTimeout(()=>anchor.scrollIntoView({behavior:"smooth",block:"end"}),60)` after submit, after answer, after pill click, on settle (steps). Bubbles use a one-shot IntersectionObserver reveal (`rootMargin "0px 0px -10% 0px"`, `transition-all duration-500 ease-out`, hidden `translate-y-4 opacity-0`, delay 0 for user / 120 ms for assistant). Chat view: container `mx-auto max-w-[720px] px-5 pb-44 pt-28 md:px-6`, messages `space-y-8`, fixed top fade `inset-x-0 top-0 z-40 h-16 bg-gradient-to-b from-white via-white/90 to-transparent`, fixed bottom composer `inset-x-0 bottom-0 z-40 bg-gradient-to-t from-white via-white/95 to-transparent px-5 pb-5 pt-10`.
- **`/api/ask`:** `POST`, `content-type: application/json`, body `{question: trimmed, history: freeformMessagesBeforeThisQuestion.slice(-6), page: slugFromTitle}` (`"QA Agent Loop":"qa-agent-loop"`, `Eleyyva:"eleyyva"`, `Engineering:"engineering"`, `"Product Management":"product-management"`, `"Customer Success":"customer-success"`). 200 -> `answer` (empty -> "Sorry, I lost that thought. Try asking again?"). **503** -> `window.open("https://claude.ai/new?q=" + encodeURIComponent("Tell me about Elena Gonci, Head of Product at Arrive. Context: https://elenagonci.com/ . My question: " + q), "_blank", "noopener,noreferrer")` + message "I opened Claude in a new tab to answer that one properly." Other error/network -> "Something went wrong on my side. Try again in a moment, or email me at elenagdb.01@gmail.com." Loading = avatar + shimmer "Thinking...". Live answers: plain text, `whitespace-pre-line`, no bold/thought/explain-more. Scripted turns are never sent as history.
- **Components:** user bubble `rounded-3xl rounded-br-lg bg-[#f0f1f3] px-4 py-2.5 text-[15px] text-black/80`; assistant = 32px Clepto-"E" avatar (`rounded-[24%] border border-black/10 bg-white shadow-sm`) + body `chat-strong space-y-4 pt-1 text-[15px] leading-relaxed text-black/75` (`.chat-strong strong{color:#000000e6;font-weight:700}`); `ChatCard` = `rounded-2xl border border-black/[0.08] bg-[#f8f9fa]`; `ChipLink` = next/link `rounded-full border border-[#57A4F0]/40 bg-[#57A4F0]/[0.08] px-4 py-2 text-[13px] font-semibold text-[#2E7CF6] hover:bg-[#57A4F0]/[0.16]`; thought toggle (collapsed by default, `border-l-2 border-black/10 pl-3 text-[13px] italic text-black/60`); "Explain more"/"Show less" pill (hidden on md+ until the assistant block is hovered unless open; panel `grid transition-[grid-template-rows] duration-500 ease-out` 0fr<->1fr; plus icon rotates 45deg 300 ms).
- **Only interactive card:** Engineering "the repos" heatmap with repo filter chips `all | arrive | arrive-ai | onboarding | eleyyva` (`useState("all")`). No lightbox, copy buttons, zoom or tabs elsewhere.
- **Card types used:** featureTriple, beforeAfter(+icons), statGrid (value `text-xl font-extrabold tabular-nums` + label `text-xs text-black/45`), uiMockEmptyState, chartWeeklyPRs (SVG `viewBox 0 0 640 220`, plot height 182, bar width `(624-8*(n-1))/n`, bars rx 3 `rgba(87,164,240,0.18)` opened / `#57A4F0` merged, polyline `#111111` 1.5, dots r 2.5, labels y 214 size 9), quote, flowDiagram (blue gradient pills `from-[#5FB0FF] to-[#2E7CF6]` + "->"), branching flow (purple `#C489FB->#8231E8`, green `#4FDE73->#1FB84A`), prCards (Merged `#8250df`, Closed `#cf222e`), numberedList, sourceGrid, screenshot+tiles, repo heatmap (cells 9px/3px gap, colours `rgba(0,0,0,0.05) #9be9a8 #40c463 #30a14e #216e39`, 24 weeks x 7), chipCloudMono, bigStat (`45/45` `#1FB84A`), titleDescList, statusPipeline chips, table (`min-w-[380px]`, th 10px uppercase), images+captions, funnel, barCompare.

**Scripted content catalogue (full text in `case-study-data.json` -> `routes[...].turns[]` / `messages[]`):**
**/work/qa-agent-loop** - QA Agent Loop - 10 scripted turns; intro: "Hi, this is my QA agent fleet: autonomous agents that find bugs, fix them, and open their own PRs into our production codebase, four times a day, seven days a week. It's my most alive project and it's still evolving. Ask away, or just scroll."
  1. Q: "So what exactly did you build?" | card: featureTriple (the pipeline) | +explain-more
  2. Q: "How did QA work before the fleet?" | card: beforeAfter (before vs after)
  3. Q: "Did it actually ship anything, or is this a demo?" | card: statGrid (the numbers)
  4. Q: "What kind of bugs does it actually catch?" | card: uiMockEmptyState (the bug) | +explain-more
  5. Q: "85% acceptance sounds high. Was it like that from day one?" | card: chartWeeklyPRs (acceptance chart) | +explain-more
  6. Q: "How did your engineers feel about agents reviewing their code?" | card: quote (the reframe) | +explain-more
  7. Q: "What does the architecture look like?" | card: flowDiagram (the loop) | +explain-more
  8. Q: "Where do the bugs come from in the first place?" | card: flowDiagramBranching (the intake flow)
  9. Q: "Can I see actual receipts?" | card: prCards (two real PRs)
  10. Q: "If you started over tomorrow, what would you do differently?" | card: numberedList (the evolution) | chips: Next case study: Eleyyva →, ← All case studies
**/work/eleyyva** - Eleyyva - 6 scripted turns; intro: "Hi, this is Eleyyva: the RAG assistant I built to turn our company's scattered knowledge into one queryable brain, for the team and for our customer firms. The name is Ayyva, our AI product, merged with Elena. Ask away, or just scroll."
  1. Q: "What is Eleyyva, in one breath?" | card: beforeAfterWithIcons (before vs after)
  2. Q: "What's under the hood?" | card: flowDiagram (the architecture)
  3. Q: "Where does the knowledge actually come from?" | card: sourceGridWithIcons (the sources)
  4. Q: "Who is it for?" | card: screenshotWithFeatureTiles (the real Eleyyva UI)
  5. Q: "Does this connect to the QA agent fleet?" | card: statGrid (the substrate) | +explain-more
  6. Q: "Can I see it in action?" | card: none | chips: Next case study: Engineering →, ← All case studies
**/work/product-management** - Product Management - 6 scripted turns; intro: "Hi, this one is about the PM craft: how I built and run Arrive's delivery system over two years, and how an agent fleet recently joined it without changing the rules. Ask away, or just scroll."
  1. Q: "How did you end up running product?" | card: none | +explain-more
  2. Q: "What does the delivery system look like?" | card: statGridWithStatusPipeline (the board)
  3. Q: "How fast does something actually ship?" | card: table (cycle times) | +explain-more
  4. Q: "What about the invisible PM work: planning, scoping, saying no?" | card: imagesWithCaptions (the real boards) | +explain-more
  5. Q: "And then the agents showed up. Did you build them a separate system?" | card: table (humans vs agents, same rules)
  6. Q: "What has managing agents taught you about managing humans?" | card: none | chips: Next case study: Customer Success →, ← All case studies
**/work/engineering** - Engineering - 5 scripted turns; intro: "Hi, this one is about the code. I run product at Arrive, and I also ship into the production codebase every week: onboarding, OCR, advisory formulas. Ask away, or just scroll."
  1. Q: "You're Head of Product. Why is there an engineering case study?" | card: repoHeatmapWithFilterChips (the repos)
  2. Q: "Numbers, or it didn't happen." | card: statGrid (the numbers)
  3. Q: "What's in the personal repos?" | card: chipCloudMono (the repos)
  4. Q: "How do I know the code is any good?" | card: bigStat (the test run)
  5. Q: "Any before/after impact numbers?" | card: titleDescList (the before and after) | +explain-more | chips: Next case study: Product Management →, ← All case studies
**/work/customer-success** - Customer Success - 8 scripted turns; intro: "Hi, this is the onboarding story: I was the one doing it manually, so I built the tooling that automated it. Ask away, or just scroll."
  1. Q: "Why is a Head of Product doing customer success?" | card: featureTriple (the arc)
  2. Q: "Isn't support below a Head of Product's pay grade?" | card: funnelDiagram (the funnel) | +explain-more
  3. Q: "What did onboarding a firm look like before the tooling?" | card: none
  4. Q: "How do you fix something that's essentially impossible?" | card: none | +explain-more
  5. Q: "And the data side? Tax returns are huge." | card: flowDiagramWithBigStat (the pipeline)
  6. Q: "How many customers are we talking about?" | card: statGrid (the customers)
  7. Q: "So what did all of it change?" | card: barCompare (the before and after)
  8. Q: "What's still human in onboarding, on purpose?" | card: none | chips: Start over: QA Agent Loop →, ← All case studies

Next-case-study chain: qa-agent-loop -> eleyyva -> engineering -> product-management -> customer-success -> ("Start over: QA Agent Loop ->"); every last answer also has "<- All case studies" -> `/#pillar-stack`.

### A.3 Per-route asset paths
`/work/qa-agent-loop`: none. `/work/eleyyva`: `/app-icons/notion.png`, `/app-icons/github.png`, `/app-icons/slack.png`, `/app-icons/folder.png`, `/work/eleyyva-ui.png`. `/work/engineering`: `/app-icons/github.png`. `/work/product-management`: `/work/figjam-roadmap.png`, `/work/figjam-board.png`. `/work/customer-success`: none. `/playground`: none. (`/app-icons/github.png`, `/app-icons/slack.png`, `/work/*.png` are new vs the homepage list.) Full list: `assets-manifest.txt`.

### A.4 The "data object"
It is not a JSON object: each route chunk defines `const turns = [...]` of JSX literals (strings + `<strong>`), plus small data arrays for the two charts (QA weekly `{week, opened, merged, rate}` x10; Engineering heatmap `{all, arrive, "arrive-ai", onboarding, eleyyva}` each `{label, repo, total, weeks[24][7]}`). Extracted verbatim into `case-study-data.json`; the extraction tooling is `analysis/tools/extract.js` and `build.js`.

### A.5 Root 404 (`not-found`, from RSC payload)
```
<div class="flex min-h-screen items-center justify-center bg-[#eef0f4] px-6 text-black">
 <div class="w-full max-w-sm overflow-hidden rounded-xl border border-black/15 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
  <div class="relative flex items-center gap-2 border-b border-black/10 bg-[#f5f5f5] px-4 py-2.5">
    <span class="h-3 w-3 rounded-full bg-[#ff5f57]"/><span class="... bg-[#febc2e]"/><span class="... bg-[#28c840]"/>
    <span class="absolute left-1/2 -translate-x-1/2 select-none text-xs font-medium text-black/55">Finder</span></div>
  <div class="flex flex-col items-center px-8 py-12 text-center">
    <span class="mb-5 text-5xl" role="img" aria-label="Empty folder">📁</span>
    <h1 class="text-lg font-bold">The item can't be found.</h1>
    <p class="mt-2 max-w-xs text-sm leading-relaxed text-black/55">It may have been moved, renamed, or it never shipped. Error code -404.</p>
    <Link href="/" class="mt-6 rounded-full bg-[#57A4F0] px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#3E8FE4]">Back to the desktop →</Link>
```

---------------------------------------------------------------------------------------------------
## B. DESIGN SYSTEM (from `84b4903bf0647530.css`, 89 KB, Tailwind v4 output)

Single global stylesheet for all routes. Layers: `@layer properties, theme, base, components, utilities` then un-layered custom CSS. Only ~786 distinct utility classes are emitted; 225 of them are not referenced by any downloaded file (they belong to the missing page chunks; Appendix 1). No `prefers-color-scheme`, no dark mode, no container queries, no scroll-snap, no `overscroll-*`, no `will-change`, no CSS `mask` rules (mask is inline in JSX), no `@import`.

### B.1 Colour tokens
`@theme` (`:root,:host`):
- `--color-black:#000`, `--color-white:#fff`
- `--color-accent:#ff3700` (used for `::selection` background, white text; homepage clock second-hand `#FF3700`; calendar weekday label)
- `--color-dark:#1e1e1e` (body text color), `--color-light:#f9f9f9`
- No oklch/lab custom properties. Tailwind's `@supports (color: color-mix(in lab, red, red))` upgrades alpha utilities to `color-mix(in oklab, <color> N%, transparent)`; hex-with-alpha fallbacks emit an extra `lab(...)` value (`@supports (color: lab(0% 0 0))`). Gradients use `to bottom in oklab`.
- Text opacity ramp (black): 25/30/35/40/45/50/55/60/65/70/75/80/85 %. Common roles: eyebrow 35-60%, body 55-60%, headings 85%.
- Brand/UI hex values used by arbitrary classes:
  - blue `#57A4F0` (hover `#3E8FE4`; tints /0.04 /0.05 /0.07 /0.08 /0.10 /0.12 /0.15 /0.18, borders /35 /40 /60); `#0069d9` (folder-label hover); app-tile gradients: blue `#5FB0FF -> #2E7CF6`, purple `#C489FB -> #8231E8`, pink-red `#FF7A93 -> #F92D50`, green `#4FDE73 -> #1FB84A`; `#2E7CF6` text (/70), `#1FB84A` text + /15 bg, `#F92D50` /04 bg /40 border /80 text, `#FF3700` /30 border.
  - yellows: sticky `#FFE066`; note header gradient `#F4DA71 -> #EACB4E (via) -> #DFBA35` + border `#d9b83a/40`; pill `#F7CE46`; pale `#FEF9E0`; sun `#FFB800`.
  - traffic lights `#ff5f57 / #febc2e / #28c840`; notification badge `#ff3b30`.
  - terminal `#1d1e26` (body, /95), `#2a2b33` (title bar), prompt/caret `#4FDE73`.
  - GitHub-like status: `#8250df` (merged purple), `#cf222e` (closed red).
  - neutrals: `#fafafa #fafbfc #f5f5f5 #f8f9fa #f6f7f9 #f0f1f3 #f2f2f0 #eef0f4(404 bg) #e5e7eb(pillar tab) #c8ccd3 #a9aeb8 #b6bac2 #A8B0B9(cloud)`; gradients `#f7f8fa -> #f0f2f5 -> #e7e9ed` (pillar panel), `#f2f3f5 -> #dfe1e6` (folder front), `#c8ccd3 -> #b6bac2` (folder back).
- Scrollbar: 4px wide; thumb `#ddd` (hover `#bbb`), radius 2px; track transparent.

### B.2 Fonts
- **Bricolage Grotesque** (`next/font/google`): 21 `@font-face` = 7 weights (200,300,400,500,600,700,800) x 3 unicode-range subsets, all `font-style:normal; font-stretch:100%; font-display:swap`. Weight 900 not shipped (`font-black` would clamp to 800). **No width axis exposed** (font-stretch fixed at 100%) although the files are presumably the variable font (the same 3 woff2 files serve all 7 weights) (inferred). Files: latin `017d9bea37084d9b-s.p.a6d6de71.woff2` (U+00-FF, 2000-206F, 20AC, 2122 ... - the only one preloaded), latin-ext `26daee0352f50a5f-s.d9ee93eb.woff2`, vietnamese `033400d475fad6b1-s.a188d1ff.woff2`. Fallback face "Bricolage Grotesque Fallback": `local(Arial)`, ascent-override 88.21%, descent-override 25.61%, line-gap-override 0%, size-adjust 105.43%. Applied: `<body class="...className">` => `font-family:"Bricolage Grotesque","Bricolage Grotesque Fallback"; font-style:normal`; `--font-bricolage` var on `<html>`.
- **clepto** (local OTF, `next/font/local`): `clepto-s.p.9e24685f.otf`, `font-weight:700`, `font-display:swap`; fallback "clepto Fallback" (Arial, ascent 72.02%, descent 13.06%, size-adjust 141.05%). `--font-clepto:"clepto","clepto Fallback"`. **Used only for the single-letter "E" monogram**: dock Home tile (SVG `<text>` 21px bold, x 12.5 y 19) and homepage footer logo (`text-[22px] font-bold translate-x-[1px] [font-family:var(--font-clepto)]`). `.clepto...__className` class exists but is unused. (Not used for headings.)
- `--font-sans` ui-sans-serif stack, `--font-serif:"Georgia",serif` (utility `font-serif` emitted but unused in downloaded files), `--font-mono` ui-monospace/SFMono/Menlo/Monaco/Consolas stack (terminal, `>_`).

### B.3 Type scale
Tailwind v4 defaults: xs .75rem/1.333, sm .875/1.4286, base 1/1.5, lg 1.125/1.5556, xl 1.25/1.4, 2xl 1.5/1.3333, 3xl 1.875/1.2, 4xl 2.25/1.1111, 5xl 3/1, 6xl 3.75/1, 7xl 4.5/1. Arbitrary sizes in use: 7, 7.5, 8, 9, 10, 11, 12, 13, 14, 15, 17, 20, 22 px; `text-[clamp(3rem,8vw,6rem)]`, `text-[13vw]`, `md:text-[7.5vw]`, `text-[8rem]`, `text-[20rem]` (the last four unused in downloaded files - decorative/legacy). Weights: medium 500, semibold 600, bold 700, extrabold 800, black 900. Tracking: tight -0.025em, wide 0.025em, arbitrary .05/.06/.08/.1/.12/.15/.2em (eyebrows = .15em uppercase). Leading: tight 1.25, snug 1.375, relaxed 1.625, arbitrary .95/1/1.05/1.08/10px. Headings: homepage h1 `text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl 2xl:text-6xl`; section h2 `text-3xl font-extrabold tracking-tight`; case-study h1 `text-2xl md:text-3xl font-bold tracking-tight`; playground h1 `text-3xl md:text-4xl font-bold`.

### B.4 Spacing / sizing / radii / blur
- `--spacing:.25rem` (4 px grid). Containers: `--container-xs 20rem, sm 24rem, md 28rem, xl 36rem, 3xl 48rem`. Page widths in use: `max-w-[720px]` (case study), `[900px]`, `[1060px]` (homepage sections + playground heading), `[1100px]` (pillar), `[1120px]`.
- Radii: `--radius-md .375rem, lg .5rem, xl .75rem, 2xl 1rem, 3xl 1.5rem`, `rounded-full` (3.40282e38px); arbitrary `2px, 5px, 6px, 22% (app icon), 24% (dock tile), t-[28px], t-[30px]`.
- Blur: `--blur-sm 8px, md 12px, xl 24px, 2xl 40px` (+ `backdrop-blur-[2px]`).
- Default transition: `--default-transition-duration:.15s`, `--default-transition-timing-function:cubic-bezier(.4,0,.2,1)`; `--ease-out:cubic-bezier(0,0,.2,1)`. Durations used: 150, 200, 300, 500, 700 ms.

### B.5 Shadows (all arbitrary, exact)
`0 1px 0 rgba(0,0,0,.04)`; `0 2px 6px rgba(0,0,0,.2)` (calendar tile) / `.25` (dock tile) / `rgba(46,124,246,.35)`; `0 2px 12px rgba(0,0,0,.05)`; `0 4px 20px .06`; `0 8px 30px .08` / `.10` (composer); `0 8px 32px .12`; `0 10px 24px .12`; `0 10px 30px .3` (terminal button); `0 12px 28px .18`; `0 14px 30px .18` (sticky note, hover `0 22px 48px .24`); `0 16px 40px .3`; `0 18px 50px .10/.12` (windows, 404); `0 20px 60px .12`; `0 30px 80px .14`; `0 40px 120px .35` (Calendly) / `.45` (terminal); glass `inset 0 1px 0 rgba(255,255,255,.6), 0 8px 32px rgba(0,0,0,.12)`; folder front `inset 0 1px 0 rgba(255,255,255,.8), 0 -2px 8px rgba(0,0,0,.06)`; pillar panel `inset 0 2px 1px rgba(255,255,255,.35), 0 -4px 16px rgba(0,0,0,.03)`; app-icon `inset 0 1px 1px rgba(255,255,255,.4), 0 4px 12px rgba(0,0,0,.25)`; plus Tailwind `shadow`, `sm`, `md`, `lg`, `inner`, `ring`; `drop-shadow-[0_1px_1px_rgba(0,0,0,.25)]`.

### B.6 z-index scale
`z-0, z-10, z-20, z-40, z-50, z-[60], z-[65], z-[70], z-[80], z-[9998], z-[9999]`. Observed roles: 0 hero board; 10 menubar / playground heading / pillar tabs (`10 + index`); 20 resize handles / draggable widgets (`20 + stack rank`); 50 homepage content sections (cover the sticky hero); **60 dock**; **65 cursor-following "baby-me.mp4" video**; **70 Calendly + Terminal windows**; 40 = chat view fixed top fade + bottom composer; 80, 9998, 9999 are unreferenced by any downloaded file (dead/legacy CSS, probably the old custom cursor/overlays).

### B.7 Cursor / pointer / touch / selection rules
- **Global CSS:** `body{cursor:none}` and `a,button,[role=button]{cursor:none}` (a leftover custom-cursor system). **Every page neutralises it** via an inline `<style>` in its root: `body{cursor:auto!important} a,button,[role="button"]{cursor:pointer!important}` (case studies also `input{cursor:auto}`; playground also sets inline `cursor:grab` on the board). `mix-blend-difference` class exists (unused downloaded) - presumably the old custom cursor (inferred).
- `cursor-grab` + `active:cursor-grabbing` on draggable widgets/title bars; `cursor-ns-resize / ew-resize / nwse-resize / nesw-resize` on Calendly resize handles; `cursor-pointer` on calendar card; homepage "about-me.txt" window sets `cursor:none` while a 150px video follows the pointer.
- `touch-none` (`touch-action:none`) on draggable widgets and the playground board; `select-none` (`user-select:none`) on same + window titles; `-webkit-tap-highlight-color:transparent` (Preflight, on `html`); `::selection{background:#ff3700;color:#fff}`; `-webkit-text-size-adjust:100%`; `html{scroll-behavior:smooth}` (global CSS + inline on homepage); `.scroll-mt-24` on anchor sections (`#achievements, #press, #highlights, #playground, #about`); `body{overflow-x:hidden}`; `.horizontal-scroll{scrollbar-width:none;-ms-overflow-style:none;overflow:auto hidden}` (+`::-webkit-scrollbar{display:none}`) - unused by downloaded files (case-study carousel/table, inferred).
- `-webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale` (body + `.antialiased`).

### B.8 Keyframes (every one) and where used
| name | definition | used by |
|---|---|---|
| `pulse` | `50%{opacity:.5}`; `--animate-pulse: pulse 2s cubic-bezier(.4,0,.6,1) infinite` | `animate-pulse` on terminal "elena-5 is thinking…" |
| `fadeup` | 0% `opacity:0; translateY(6px)` -> 100% `opacity:1; translateY(0)` | `animate-[fadeup_0.4s_ease-out]` on the scripted answer body in each chat turn |
| `cardin` | 0% `opacity:0; translateY(10px) scale(.98)` -> 100% `opacity:1; translateY(0) scale(1)` | `animate-[cardin_0.45s_ease-out]` on the card + `after` block of each turn |
| `text-shimmer` | `background-position: 200% 0 -> -200% 0` | `.shimmer-text` ("Thinking..." and "Generating <label>..." in chat): `color:transparent; background:linear-gradient(90deg,#00000073 25%,#0000001f 50%,#00000073 75%) 0 0/200% 100%; background-clip:text; animation:1.8s linear infinite text-shimmer` |
| `hero-line` | `opacity:0; translateY(18px)` -> `opacity:1; translateY(0)` | `.hero-line{animation:.7s cubic-bezier(.22,1,.36,1) both hero-line; display:inline-block}`; delays `-1: 50ms`, `-2: .18s`, `-3: .34s` - homepage hero lines only |
| `marquee-scroll` | `translateX(0) -> translateX(-50%)` (**inline `<style>` on homepage, not in the CSS file**) | `.marquee-track{animation:marquee-scroll 96s linear infinite}`; `:hover{animation-play-state:paused}` - press carousel (6 copies of 4 cards) |
| (JS) | framer-motion: dock `useSpring{mass .1, stiffness 180, damping 13}`; draggable widgets `drag, dragElastic .12, dragMomentum false, whileDrag scale 1.04`, variants `hidden{opacity0,y8}->show`, container `staggerChildren .05, delayChildren .08` | homepage desktop board; dock |
| (JS+CSS) | scroll reveal: IntersectionObserver `rootMargin "0px 0px -12% 0px", threshold .05`; `transition-all duration-700 ease-out`, hidden `translate-y-5 opacity-0` -> `translate-y-0 opacity-100`, per-item `transitionDelay` | homepage sections |
| (CSS) | accordion "The future": `grid transition-[grid-template-rows] duration-500 ease-out` `0fr -> 1fr`, plus-icon `rotate-45` 300 ms | homepage |

Reduced motion: `@media (prefers-reduced-motion:reduce){ .marquee-track{animation:none!important} .shimmer-text{-webkit-text-fill-color:#00000080;color:#00000080!important;animation:none!important} *,:before,:after{transition-duration:.01ms!important;animation-duration:.01ms!important} }` and `.hero-line{animation:none!important}`.

### B.9 Breakpoints / media / supports
- Tailwind v4 defaults, min-width: `sm 40rem (640)`, `md 48rem (768)`, `lg 64rem (1024)`, `2xl 96rem (1536)` (`xl 80rem` only inside `.container`, which is unused). `max-md` = `@media not all and (min-width:48rem)`.
- sm: 2-col mode cards (`sm:grid-cols-2`), `sm:inline` for name/title in menu bar, row layouts `sm:flex-row sm:items-baseline sm:justify-between`, `sm:max-w-[70%]`, `sm:grid-cols-3/4`, `sm:w-56`.
- md: homepage switches from mobile stacked layout (`md:hidden`/`hidden md:block`) to the desktop macOS board with sticky 100dvh hero (`md:sticky md:top-0 md:h-[100dvh]`), pillar stack becomes `md:sticky md:top-24 md:h-[calc(100dvh-6rem)]` (below md: `max-md:static max-md:mt-4 max-md:rounded-b-[28px]`), desktop dock overlap `md:-mt-32 md:h-32`, `md:grid-cols-[0.9fr_1.1fr]`, `md:grid-cols-[1fr_auto_auto]` (footer), `md:grid-cols-[1.05fr_0.95fr]` (unused here), `md:text-3xl/4xl/5xl/6xl/7xl`, `md:px-6` (case-study container), playground h1 `md:text-4xl`.
- lg: `lg:grid-cols-5` (achievements). 2xl: `2xl:text-6xl` (homepage h1).
- `@media (hover:hover)` wraps all `hover:*` and `group-hover:*` utilities (touch devices never get hover styles); `md:group-hover:opacity-100`. JS fallback for touch: `matchMedia("(hover: hover)")` false -> toggles `data-open` every 2.5 s on the Playground folder teaser (`group-data-[open=true]:*` variants).
- `@supports`: `color-mix` and `lab()` progressive enhancement; `@supports ((-webkit-hyphens:none) and (not (margin-trim:inline))) or ...` Tailwind property-fallback block.
- `@property --tw-*` registrations (translate, scale, gradient colours/positions, shadow, ring, filter...).

### B.10 Positioning utilities in use
`fixed` (dock, Calendly, terminal, playground board `fixed inset-0`), `absolute` (widgets, tabs, overlays), `sticky` (homepage hero `md:sticky md:top-0`, dock bar `sticky top-4 z-[60]`, pillar stack `md:sticky md:top-24`), `inset-0`, `inset-x-0`, `top-4`, `left-1/2 top-1/2` + `-translate-x/y-1/2` centering, `-mt-32`.

### B.11 Recipes
- **Glass panel / widget** (also the dock): `rounded-2xl border border-white/45 bg-white/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl backdrop-saturate-150` (blur 40 px, saturate 150 %).
- **macOS menubar**: `absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-between border-b border-black/10 bg-white/70 px-4 text-[11px] font-medium text-black/55 backdrop-blur-md` ("EG", "Elena Gonci", "Head of Product", live `Wed, Oct 7 11:42 AM` `tabular-nums`, `min-w-[124px] text-right`).
- **macOS window chrome (light)**: container `overflow-hidden rounded-xl border border-black/15 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.10)]`; titlebar `relative flex items-center gap-2 border-b border-black/10 bg-[#f5f5f5] px-4 py-2.5`; traffic lights `h-3 w-3 rounded-full` `#ff5f57 #febc2e #28c840` (hover `opacity-70`); centered title `absolute left-1/2 -translate-x-1/2 select-none text-xs font-medium text-black/55`. **Dark variant** (terminal): bar `#2a2b33`, body `#1d1e26/95 + backdrop-blur-md`, title `text-white/50`.
- **Squircle app icon**: `rounded-[22%]` (raw icons) / `rounded-[24%]` (dock), gradient top->bottom, `shadow-[inset_0_1px_1px_rgba(255,255,255,.4),0_4px_12px_rgba(0,0,0,.25)]`, glyph `drop-shadow-[0_1px_1px_rgba(0,0,0,.25)]`.
- **Sticky note**: flat `#FFE066`, `-rotate-2`, `shadow-[0_14px_30px_rgba(0,0,0,.18)]`. **Homepage note card**: top strip `h-7 rounded-t-[6px] border border-b-0 border-[#d9b83a]/40 bg-gradient-to-b from-[#F4DA71] via-[#EACB4E] to-[#DFBA35]`, body `rounded-b-[6px] border border-t-0 border-white/60 bg-white/60 p-6 backdrop-blur-xl backdrop-saturate-150`, hover lift `hover:-translate-y-1.5` + stronger shadow.
- **Folder-tab (pillar)**: tab shape = `clip-path: path("M0 80 L0 32 Q0 2 30 2 L198 2 Q226 2 240 20 C254 36 264 40 300 40 L320 40 L320 80 Z")` on `h-20 w-[320px] bg-[#e5e7eb]`, panel `rounded-t-[28px] bg-gradient-to-b from-[#f7f8fa] via-[#f0f2f5] to-[#e7e9ed]`.
- **Marquee edge fade (inline JSX)**: `mask-image/-webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent)`.
- **Dot-grid board**: `radial-gradient(rgba(0,0,0,.12) 1px, transparent 1px)` @ `22px 22px`.
- **Dock tooltip, red badge, pill buttons (`rounded-full bg-[#57A4F0] ... hover:bg-[#3E8FE4]`), underline-slide arrow link** (`scale-x-0 -> scale-x-100`, 300 ms ease-out, arrow slides `translate-x-0 <-> 150%`).
- **Folder "Playground" teaser** (3D flap): front panel `[transform:perspective(700px)]` -> `rotateX(-24deg)` on hover/`data-open`; photos rotate `-12deg/+12deg` and rise `-42%/-52%/-68%`; "View" pill `bg-[#F7CE46]` fades/scales in.

---------------------------------------------------------------------------------------------------
## C. SEO / meta / infrastructure

**Metadata (identical on /, /playground, /work/*; from RSC + `<head>`):**
- `<title>Elena Gonci, Head of Product</title>`
- description: "I lead product at Arrive, managing engineers, customers, and building agent loops and graphs to make every person in my team more efficient."
- Open Graph: `og:title` = title, `og:description` = description, `og:url` = `https://elenagonci.com` (same on every route, no per-page URL), `og:image` = `https://elenagonci.com/og.png`, `og:image:width` 1200, `og:image:height` 630, `og:image:alt` "Elena Gonci, Head of Product", `og:type` website.
- Twitter: `twitter:card` summary_large_image, `twitter:title`, `twitter:description`, `twitter:image` = same og.png (no `twitter:site/creator`).
- Icons (Next file-convention metadata): `<link rel="icon" href="/icon.png?icon.4b588410.png" sizes="512x512" type="image/png">`, `<link rel="apple-touch-icon" href="/apple-icon.png?apple-icon.be915ace.png" sizes="180x180" type="image/png">`.
- Absent: canonical, robots meta, theme-color, manifest, JSON-LD, hreflang, `metadataBase`-relative URLs (all absolute). sitemap.xml / robots.txt: **not observable from the downloaded files** (nothing references them) - unknown.
- Preloads: head `<link rel=preload as=font>` for latin woff2 + clepto OTF (crossorigin, type set); homepage additionally preloads 24 images (`as=image`); sub-pages preload none. Scripts are `async` chunks; `<script nomodule src=a6dad97d9634a72d.js>` polyfills.

**Observed response headers (headers.txt = `/`, 112,758 B):** `HTTP/2 200`; `server: Netlify`; `x-powered-by: Next.js`; `cache-control: public,max-age=0,must-revalidate`; `cache-status: "Netlify Durable"; hit; ttl=30265033`, `"Next.js"; hit`, `"Netlify Edge"; fwd=miss; fwd-status=200; stored`; `age: 1270966`; `etag: "p7i952aad62eyu"`; `content-type: text/html; charset=utf-8`; `strict-transport-security: max-age=31536000`; `x-content-type-options: nosniff`; `x-nextjs-prerender: 1, 1`; `x-nextjs-stale-time: 300`; `x-nextjs-date: Wed, 30 Sep 2026 02:06:35 GMT`; `vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding`; `netlify-vary: query=__nextDataReq|_rsc,header=x-nextjs-data|x-next-debug-logging|next-router-prefetch|next-router-segment-prefetch|next-router-state-tree|next-url|rsc|accept-encoding,cookie=__prerender_bypass|__next_preview_data`; `x-nf-request-id`. Notably missing: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy. Headers for the sub-pages were not captured.
- Deployment: Netlify with its Next.js runtime (durable cache + `netlify-vary`) (inferred adapter), custom domain `elenagonci.com`. All 7 pages are static prerenders (`<!--7sXZkvPwx2TJNC6SUGcmv-->` build-id comment); one dynamic server endpoint exists: `POST /api/ask` (Netlify function / route handler; LLM-backed "elena-5"; returns 503 when offline).
- Third parties: Calendly iframe, claude.ai / chatgpt.com deep links (`?q=` seeded prompt), Apple iTunes preview audio, Notion CV, LinkedIn, X, Gmail `mailto:elenagdb.01@gmail.com`, CSS Design Awards 2026 badges (Special Kudos, Best UI, Best UX, Best Innovation) linking to `https://www.cssdesignawards.com/sites/elena-gonci/50190/`.
- Client libs seen: framer-motion/motion, lucide-react (graduation-cap, trophy, book-open-check, microscope), Calendly (iframe only), no analytics script found in downloaded chunks/HTML.

---------------------------------------------------------------------------------------------------
## Appendix 1 - CSS classes in the stylesheet still unreferenced by every downloaded file (119 of ~786)
After adding the six route chunks, the earlier "mystery" classes (chat bubbles, charts, PR badges, tables, callouts) are all accounted for. What remains is dead/legacy CSS (old accent/dark theme, giant decorative text, custom-cursor blend):

`-mt-32 -right-10 -top-10 aspect-[16/10] backdrop-blur-[2px] bg-[#F9F9F9]/60 bg-[#FEF9E0] bg-[#f2f2f0] bg-[#f6f7f9] bg-accent bg-black/30 bg-black/70 bg-dark bg-dark/[0.04] bg-light bg-white/10 bg-white/80 bg-white/85 bg-white/90 bg-white/95 border-[#FF3700]/30 border-black/[0.07] border-dark/5 bottom-16 bottom-4 collapse container font-black font-serif gap-12 gap-6 gap-[5px] gap-x-12 gap-x-8 gap-y-16 group-hover:bg-accent/[0.06] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:text-accent group-hover:text-accent/70 group-hover:w-full h-12 h-32 h-[1.5px] h-[1px] h-[2px] h-screen horizontal-scroll hover:bg-black hover:bg-black/10 hover:text-white leading-[0.95] leading-[1] left-14 left-4 max-w-[1120px] max-w-[900px] mb-12 mb-20 mb-6 md:flex md:flex-row md:grid-cols-[1.05fr_0.95fr] md:items-end md:justify-between md:py-14 md:text-6xl md:text-[7.5vw] mix-blend-difference ml-0.5 mt-auto opacity-50 opacity-[0.04] origin-center p-1.5 p-7 pb-12 pb-20 pt-16 pt-24 pt-7 py-10 py-14 right-4 ring shadow-[...] shrink space-y-6 text-[13vw] text-[20rem] text-[8rem] text-[clamp(3rem,8vw,6rem)] text-accent text-dark text-dark/35..80 text-white/30 text-white/[0.04] to-[#a9aeb8] tracking-[0.05em] tracking-[0.2em] tracking-wide translate-y-1 w-0 w-12 w-[2px] z-[80] z-[9998] z-[9999]`

## Appendix 2 - what is still NOT in the downloaded material
- `/api/ask` server behaviour (system prompt, model, rate limits), sitemap.xml, robots.txt, `og.png`/icon binaries, any `netlify.toml`/`_headers`, response headers for sub-pages, the binary assets themselves (`/work/*.png`, `/app-icons/*.png`).
- Whether the case-study heatmap's 7 rows are Sun-first or Mon-first (not stated in code; labelled "assumed").
