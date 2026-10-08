# Portfolio imagery

All images used by the new portfolio are stored locally. Credit links are also
available in the homepage's Image credits dialog.

| File in `assets/images/` | Origin                                                                                                                    | Use                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `architecture.jpg`       | [Chris Johnson / Unsplash](https://unsplash.com/photos/a-concrete-brutalist-building-with-repeating-patterns-37zoajcSupg) | Architectural reference in the hero and about collage |
| `circuit.jpg`            | [Unsplash](https://unsplash.com/photos/close-up-view-of-a-complex-electronic-circuit-board-eEDqcntu5vw)                   | Engineering reference in the about collage            |
| `cardy-celebrate.webp`   | [Cardyiq](https://cardyiq.com)                                                                                            | Hero mascot                                           |
| `cardy-scan.webp`        | [Cardyiq](https://cardyiq.com)                                                                                            | Project artwork and case study                        |
| `cardy-app.jpg`          | [Public App Store listing](https://apps.apple.com/app/id6753315130)                                                       | Real app screenshot                                   |
| `asheerty-app.webp`      | [Asheerty](https://asheerty.sadeek.app/assets/app-diagram.webp)                                                           | Real app screenshot                                   |
| `asheerty-tree.webp`     | [Asheerty](https://asheerty.sadeek.app/assets/poster-tree.webp)                                                           | Product artwork in the case study                     |
| `asheerty-wall.webp`     | [Asheerty](https://asheerty.sadeek.app/assets/wall-poster.webp)                                                           | Framed product artwork                                |

The existing files under `assets/districts/` supply the Qi mark, Cardyiq logo,
Telegram mark and Sadeek mascot. The previous illustrative project compositions have been replaced by authentic screen galleries.

## Adding personal imagery

Replace reference photos with your own architecture, notebook, workstation or
construction photographs. Keep the source captions accurate when replacing them.
For project images, prefer a real exported screen or a photograph of the product.
Use synthetic demo data or already-public marketing images. Avoid customer names,
phone numbers, account details, balances, internal URLs and provider contracts.
Use WebP or an optimized JPEG, include descriptive alt text, and set intrinsic
width and height where possible. Lazy-load imagery below the first screen.

For a homepage image that should enlarge, use an `.image-open` button with
`data-image`, `data-caption` and `data-source`; the dialog is wired automatically.
Project previews and case studies use `[data-gallery]` containers with
`a[data-shot]` links. Links work without JavaScript; `js/project-gallery.js`
enhances them with an accessible viewer. `css/project-media.css` styles both.

## Original project screen collections

All 94 screens are optimized WebP files under `assets/shots/`.

| Project     | Screens | Origin and capture context                                                                                                                      |
| ----------- | ------: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Cardyiq     |      19 | 12 original iOS captures, 2 actual Astro landing views, and 5 actual React dashboard views with fictional fixtures           |
| Qi / Tasdid |      12 | Tasdid mini-app's existing demo recordings; fictional names, phones, accounts, and amounts. These are Tasdid screens, not Jabi or e-Psule.      |
| Asheerty    |      15 | 11 original app / marketing / onboarding views with a sample family; 4 actual React admin views with fictional fixtures                                        |
| NotifyX     |      12 | Actual portal run locally against fictional API fixtures; no live recipients or working provider secrets                                        |
| Sadeek      |      11 | Actual storefront run in a disposable local copy with fictional listings/seller details and third-party ads/analytics disabled                  |
| HAWSR       |      15 | 12 archived viewer/model images and 3 actual landing-source export views; archived case remains closed                                                                   |
| Maaahr      |      10 | Actual interview-prep demo from the owner's repository, run locally; tutorial placeholders, simulated responses, and sample report are explicit |

The homepage displays two selected views per project. Each case gallery includes
all its distinct views with captions. No reconstructed tutorial video frame was
counted as an Asheerty app capture. Duplicated resize variants were not counted.

Sadeek's fictional inventory uses headphones photographed by C D-X and Kiran CK
via Unsplash: `photo-1505740420928-5e560c06d30e`,
`photo-1579065560489-989b0cc394ce`, and `photo-1583305727488-61f82c7eae4b`.
These photos illustrate demo listings; they are not evidence of actual sellers.
The source product layouts were retained. Capture fixtures only selected UI
states, supplied fictional data, and froze entry animations where needed.
No sibling source project was edited.

The HAWSR `team/aws.png` portrait belongs to Aws Al-Saigh, not Aws Abdulfattah.
It is not used in the portfolio. A real talking video has not been supplied.
`assets/media/intro.json` has `src: null` and `poster: null`; typography fills the
intro until the actual recording is available.

The new landing and dashboard views were captured in October 2026. Cardy and
Asheerty dashboards were run in disposable copies with fictional API fixtures
and notification integrations disabled. Original layouts and forms were retained.
HAWSR’s landing is a capture of the supplied source export, not evidence that
the archived business reopened. Marketing metrics visible in source screenshots
are not used to revise the portfolio’s vetted outcome numbers.

Sadeek’s 11 store captures are now a collapsed secondary archive. Its main
case presents the Telegram workflow, an actual Arabic acknowledgement excerpt,
and implementation notes. No simulated Telegram conversation is represented as
a real screenshot. Original Telegram media and Maaahr’s landing source are pending.

## NotifyX remote push

The homepage queue demonstration is entirely local. The dedicated NotifyX case
study retains the existing optional web-push integration. To enable hosted push,
configure `window.NOTIFYX_CONFIG` in `work/notifyx.html` with the appropriate
public client settings. Never put server secrets in the static site.
