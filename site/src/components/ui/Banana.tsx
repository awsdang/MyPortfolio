import { PROFILE } from "@/data/profile";

/**
 * The house logo: a half-peeled banana with a bite out of it. The artwork is
 * Aws's own (public/brand/banana.svg); banana.png is the same art with the white
 * background cut out so it sits on glass, dark mode and the dock tile alike.
 */
export const LOGO = PROFILE.icons.logo || "/brand/banana.png";

/** Small logo for the menu bar, footer and notifications. */
export function BananaMark({ size = 16, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO} alt="" aria-hidden width={size} height={size} draggable={false} className={className} style={{ width: size, height: size }} />
  );
}

/** The logo inside a 100×100 SVG (the Home tile, About This Portfolio). */
export function BananaArt() {
  return <image href={LOGO} x="15" y="15" width="70" height="70" preserveAspectRatio="xMidYMid meet" />;
}
