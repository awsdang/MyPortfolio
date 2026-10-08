import { MacIconDefs } from "@/components/ui/MacIcon";
import { FolderDefs } from "@/components/ui/Icons";

/** SVG filters. `#lg-lens` is the edge-refraction map used by `.lens` on Chromium. */
export function Defs() {
  return (
    <>
    <MacIconDefs />
    <FolderDefs />
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        <linearGradient id="lg-gx" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ff0000" />
          <stop offset="0.14" stopColor="#800000" />
          <stop offset="0.86" stopColor="#800000" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <linearGradient id="lg-gy" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00ff00" />
          <stop offset="0.22" stopColor="#008000" />
          <stop offset="0.78" stopColor="#008000" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <filter id="lg-lens" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage
            result="map"
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            href={`data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='120'><defs><linearGradient id='x' x1='0' x2='1'><stop offset='0' stop-color='#f00'/><stop offset='.14' stop-color='#800000'/><stop offset='.86' stop-color='#800000'/><stop offset='1' stop-color='#000'/></linearGradient><linearGradient id='y' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='#0f0'/><stop offset='.24' stop-color='#008000'/><stop offset='.76' stop-color='#008000'/><stop offset='1' stop-color='#000'/></linearGradient></defs><rect width='400' height='120' fill='url(#x)'/><rect width='400' height='120' fill='url(#y)' style='mix-blend-mode:screen'/></svg>`,
            )}`}
          />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
    </>
  );
}
