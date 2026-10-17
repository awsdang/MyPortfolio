# awsdang.com

Aws Abdulfattah's portfolio. The current website is the desktop and phone portfolio in [`site/`](site/), built with Next.js, React and Tailwind. It includes the approved project stories, About copy, screenshot galleries, CV viewer and downloadable AI skills.

## Run locally

Use Node.js 22 and Python 3 for the static preview.

```sh
cd site
npm ci
npm run dev
```

## Build and preview the site that ships

```sh
cd site
npm run build
npm run check:export
npm start
```

Open http://localhost:3000. The production build is a complete static website in `site/out/`, including project pages, fonts, images, downloads, a 404 page and redirects for earlier portfolio URLs. It requires no Node.js server after deployment. The portfolio guide answers from published facts in the browser. Contact and bug-report forms submit directly to Google Forms.

## GitHub Pages

The repository's Pages publishing source is **GitHub Actions**. [`.github/workflows/pages.yml`](.github/workflows/pages.yml) installs dependencies, builds and checks the new portfolio, then uploads **only `site/out/`** and deploys it to GitHub Pages. Pushes to `main` deploy; pull requests build and validate without deploying. The workflow can also be run manually from Actions.

The custom domain remains **awsdang.com**. The build copies the root `CNAME` into the output and adds `.nojekyll` so the `_next` assets are served. Existing project `.html` links, flat sub-project links, `cv.html`, `recruiter.html`, AI skills and old downloads continue to resolve.

The earlier `index.html`, `work/`, `css/` and `js/` at the repository root are retained as legacy source. They are excluded from the Pages deployment artifact. To publish the current portfolio, use the workflow or deploy `site/out/`, never the repository root.

See [`site/README.md`](site/README.md) for the content and component map, and [`site/THIRD_PARTY_NOTICES.md`](site/THIRD_PARTY_NOTICES.md) for asset notices.
