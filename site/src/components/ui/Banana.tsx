import { PROFILE } from "@/data/profile";
import { BANANA_PATH, BANANA_VIEWBOX } from "./banana-path";

/**
 * The house logo: a half-peeled banana with a bite out of it, Aws's own artwork
 * (public/brand/banana.png) reduced to a single-colour glyph the Apple way: one
 * solid silhouette with the inner lines knocked out, so it takes whatever colour
 * it sits in (ink on light, white on dark) and reads at 16 px. The same glyph is
 * the favicon (app/icon.svg) and the Apple touch icon. banana-mono.svg in
 * public/brand/ is the standalone copy. PROFILE.icons.logo still swaps in a PNG.
 */
export const LOGO = PROFILE.icons.logo;

/** Small logo for the menu bar, footer and notifications; inherits currentColor. */
export function BananaMark({ size = 16, className }: { size?: number; className?: string }) {
  if (LOGO) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={LOGO} alt="" aria-hidden width={size} height={size} draggable={false} className={className} style={{ width: size, height: size }} />
    );
  }
  return (
    <svg
      viewBox={BANANA_VIEWBOX}
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      className={className}
      style={{ width: size, height: size, display: "block", flexShrink: 0 }}
    >
      <path d={BANANA_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/**
 * The logo inside a 100×100 SVG (the Home tile): ink glyph on the white tile,
 * sized like the other glyphs (~62% of the tile) and floating on the shared shadow.
 */
export function BananaArt() {
  if (LOGO) {
    return <image href={LOGO} x="15" y="15" width="70" height="70" preserveAspectRatio="xMidYMid meet" />;
  }
  // 512-space glyph, ink box centred at ≈255.6: scale to ~62 units and centre on (50, 50)
  const s = 0.132;
  const t = 50 - 255.65 * s;
  return (
    <g filter="url(#mi-glyph)">
      <path d={BANANA_PATH} fill="#1d1d1f" fillRule="evenodd" transform={`translate(${t.toFixed(3)} ${t.toFixed(3)}) scale(${s})`} />
    </g>
  );
}
