# Aws — desktop portfolio

A macOS-26-style desktop for the portfolio: liquid-glass windows, a draggable
desktop, a magnifying dock, Finder windows for projects, a terminal that talks to
an (as yet fake) assistant, and a scroll story underneath.

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build    # complete static export in out/, including legacy redirects
npm run check:export # verify exported routes, assets and downloads
npm start        # serve out/ at http://localhost:3000 using Python 3
```

Node.js 22. Next.js 16, React 19, Tailwind v4, motion, lucide and pdf.js. Production hosting needs only a static file server.

## Where things live

| You want to change… | Edit |
| --- | --- |
| The desktop folders and the **tree** inside them | `src/data/fs.ts` |
| A project's page (text, stats, screens, links) | `src/data/projects.generated.json` (seeded from the old site; edit freely) |
| Name, hero copy, "Now", principles, chapters, marquee | `src/data/profile.ts` |
| Screenshots | drop files in `public/shots/<project>/` and add them to that project's `shots` array |
| The portfolio guide | `src/lib/ask.ts` and `src/lib/fake-ai.ts` |
| GitHub Pages export and old URL redirects | `next.config.ts`, `scripts/prepare-pages.mjs` |
| Deployment | `../.github/workflows/pages.yml`, publishes only `out/` |
| Colours, glass recipe, wallpaper | `src/app/globals.css` (tokens at the top) |
| App icons | `src/components/ui/MacIcon.tsx` (drawn in SVG; the dock bin is `public/brand/bin*.png`, set in `PROFILE.icons`) |

## Static hosting and the portfolio guide

`next.config.ts` uses `output: "export"` and trailing slashes so nested project URLs have their own `index.html` files on GitHub Pages. The postbuild step adds the custom domain, `.nojekyll`, old download paths and static redirects from the previous site's URLs. Fonts are bundled locally, so the build does not fetch Google Fonts.

The portfolio guide uses `fakeAnswer()` in the browser and identifies its answers as information published in the portfolio. There is no `/api/ask` route or server requirement. A future LLM integration would need an external backend; credentials must never be placed in the static export.

GitHub Pages uses the **GitHub Actions** publishing source. The workflow builds pull requests for validation and deploys pushes to `main` to **awsdang.com**. The repository-root HTML is legacy source and is not published.

## Messages and bug reports

Write to Aws and Report a bug post straight from the browser to two Google Forms
("awsdang.com: Write to Aws" and "awsdang.com: Bug reports"); read them in each form's
Responses tab. Form and field ids live in `src/lib/forms.ts`. A bug report's Device answer
carries what the window lists under "Sent with it", plus the user agent.

## Behaviours worth knowing

- Windows: drag by toolbar, 8 resize handles, green = fit to screen (also double-click
  the toolbar), yellow = minimize into the dock tray, drag to the left/right edge to tile,
  to the top to fit. `Esc` closes a window (not the terminal — use `exit`).
- `⌘K` / `Ctrl+K` opens Spotlight. Terminal: `help`, `ls`, `open <project>`, `theme dark`.
- Desktop widgets drag inside the hero and clamp to it; nothing persists.
- Below 768px windows become full-height sheets and the dock moves to the bottom.
- Light/dark follows the system until you flip it in the menu bar.
