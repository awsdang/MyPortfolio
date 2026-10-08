# Aws — desktop portfolio

A macOS-26-style desktop for the portfolio: liquid-glass windows, a draggable
desktop, a magnifying dock, Finder windows for projects, a terminal that talks to
an (as yet fake) assistant, and a scroll story underneath.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (22 static pages + /api/ask)
```

Next.js 16 · React 19 · Tailwind v4 · motion · lucide. No other runtime deps.

## Where things live

| You want to change… | Edit |
| --- | --- |
| The desktop folders and the **tree** inside them | `src/data/fs.ts` |
| A project's page (text, stats, screens, links) | `src/data/projects.generated.json` (seeded from the old site; edit freely) |
| Name, hero copy, "Now", principles, chapters, marquee | `src/data/profile.ts` |
| Screenshots | drop files in `public/shots/<project>/` and add them to that project's `shots` array |
| The assistant | `src/app/api/ask/route.ts` (today: `src/lib/fake-ai.ts`) |
| Colours, glass recipe, wallpaper | `src/app/globals.css` (tokens at the top) |
| App icons | `src/components/ui/MacIcon.tsx` (drawn in SVG; the dock bin is `public/brand/bin*.png`, set in `PROFILE.icons`) |

## Making the assistant real

The UI already speaks the final contract — `POST /api/ask {question, history, page}`
→ `{answer, demo?}`; reply `503` when the model is down and the UI shows its offline
message. Replace the `fakeAnswer()` call in `route.ts` with your LLM request and drop
the `demo` flag.

## Behaviours worth knowing

- Windows: drag by toolbar, 8 resize handles, green = fit to screen (also double-click
  the toolbar), yellow = minimize into the dock tray, drag to the left/right edge to tile,
  to the top to fit. `Esc` closes a window (not the terminal — use `exit`).
- `⌘K` / `Ctrl+K` opens Spotlight. Terminal: `help`, `ls`, `open <project>`, `theme dark`.
- Desktop widgets drag inside the hero and clamp to it; nothing persists.
- Below 768px windows become full-height sheets and the dock moves to the bottom.
- Light/dark follows the system until you flip it in the menu bar.
