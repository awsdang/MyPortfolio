import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BananaArt } from "./Banana";
import { PROFILE } from "@/data/profile";

/**
 * App icons in the macOS 26 (Tahoe) language: continuous-corner squircle, a soft
 * vertical gradient, a lit glass rim and a top specular, with the glyph floating
 * on a small shadow. All artwork here is drawn from scratch — no Apple assets.
 */

/** iOS-style continuous squircle (superellipse n≈5) on a 100×100 grid. */
const SQUIRCLE = (() => {
  const n = 5;
  const pts: string[] = [];
  const steps = 120;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 50 + 50 * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = 50 + 50 * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join("") + "Z";
})();

type Tone = "white" | "graphite" | "blue" | "paper" | "slate" | "cream" | "black" | "linkedin" | "amber" | "clay" | "indigo" | "fog" | "green" | "instagram";
/** linear backgrounds; "instagram" is a radial gradient defined in MacIconDefs */
const TONES: Record<Exclude<Tone, "instagram">, [string, string]> = {
  white: ["#ffffff", "#dfe3ea"],
  paper: ["#fbfaf7", "#e6e3dc"],
  graphite: ["#4d5361", "#15171d"],
  slate: ["#8e98ad", "#515b72"],
  blue: ["#86b6f2", "#3e78d4"],
  cream: ["#f8f4ec", "#ebe3d4"],
  black: ["#2c2c2f", "#0b0b0c"],
  linkedin: ["#2f8ae6", "#0a5bb5"],
  amber: ["#ffd25e", "#f29a16"],
  clay: ["#e38a64", "#c45f3d"],
  indigo: ["#7577f0", "#3c3db2"],
  fog: ["#c7ced9", "#8a95a8"],
  green: ["#6ee07c", "#20b33c"],
};

export type MacIconName =
  | "home"
  | "finder"
  | "lab"
  | "notes"
  | "ask"
  | "mail"
  | "phone"
  | "terminal"
  | "github"
  | "linkedin"
  | "docs"
  | "code"
  | "tile"
  | "trophy"
  | "cap"
  | "cert"
  | "calendar"
  | "photos"
  | "claude"
  | "openai"
  | "instagram"
  | "x"
  | "about"
  | "bin"
  | "binFull"
  | "blank";

const BIN_BODY = "M15.5 22H84.5L78.6 85.8C78.1 91.5 74 95 68.2 95H31.8C26 95 21.9 91.5 21.4 85.8Z";

/** A soft frosted bin standing on its own (no tile). When full, paper pokes out of the top. */
function BinArt({ full }: { full: boolean }) {
  return (
    <g>
      {full && (
        <g>
          <path d="M19 17C17 9 21 1 29 -1C37 -3 45 1 46 8C47 13 44 17 40 18Z" fill="#eceef1" />
          <path d="M23 7C27 9 31 7 35 10M26 3C30 5 34 4 38 7" stroke="#b3b8c1" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M41 20L44 6L55 2L63 9L60 20Z" fill="#f6cf3a" />
          <path d="M44 6L51 12L55 2M51 12L63 9" stroke="#d3a417" strokeWidth=".9" fill="none" />
          <path d="M55 21C54 12 59 4 68 2L80 6C76 11 76 16 78 21Z" fill="url(#mi-bin-sheet)" />
          <path d="M74 21C75 14 79 9 85 8C86 12 85 17 83 21Z" fill="#4fa3ef" />
        </g>
      )}
      <ellipse cx="50" cy="96" rx="31" ry="3" fill="#1d2430" opacity=".22" filter="url(#mi-bin-blur2)" />
      <path d={BIN_BODY} fill="url(#mi-bin-v)" />
      <path d={BIN_BODY} fill="url(#mi-bin-h)" />
      <g clipPath="url(#mi-bin-clip)">
        {full && (
          <g opacity=".3" filter="url(#mi-bin-blur4)">
            <ellipse cx="36" cy="44" rx="9" ry="7" fill="#9aa3b1" />
            <ellipse cx="63" cy="48" rx="10" ry="8" fill="url(#mi-bin-sheet)" />
          </g>
        )}
        <rect x="10" y="21" width="80" height="10" fill="#8e939b" opacity=".35" filter="url(#mi-bin-blur2)" />
        <path d={BIN_BODY} fill="none" stroke="#ffffff" strokeWidth="3" opacity=".8" filter="url(#mi-bin-blur1)" />
      </g>
      <rect x="14" y="14.5" width="72" height="11" rx="5.5" fill="url(#mi-bin-rim)" />
      <rect x="14" y="14.5" width="72" height="11" rx="5.5" fill="none" stroke="#cfd2d7" strokeWidth=".6" />
      <rect x="17.5" y="16.8" width="65" height="6.4" rx="3.2" fill="url(#mi-bin-inside)" />
      <rect x="17.5" y="16.8" width="65" height="2.6" rx="1.3" fill="#a9aeb6" opacity=".45" filter="url(#mi-bin-blur1)" />
    </g>
  );
}

/** icons drawn as objects, without the squircle tile */
const FREESTANDING = new Set<MacIconName>(["bin", "binFull"]);

const ART: Record<MacIconName, { tone: Tone; art: ReactNode }> = {
  blank: { tone: "white", art: null },
  tile: { tone: "slate", art: null },
  home: {
    tone: "white",
    art: <BananaArt />,
  },
  finder: {
    tone: "blue",
    art: (
      <g filter="url(#mi-glyph)">
        <path d="M21 32a7 7 0 0 1 7-7h13.5a7 7 0 0 1 5.4 2.6l3 3.7a4 4 0 0 0 3 1.5H73a7 7 0 0 1 7 7v7H21V32Z" fill="#dbe9fc" />
        <path d="M18 43a7 7 0 0 1 7-7h50a7 7 0 0 1 7 7v28a7 7 0 0 1-7 7H25a7 7 0 0 1-7-7V43Z" fill="url(#mi-folder)" />
        <path d="M25.5 36.5h49" stroke="#fff" strokeOpacity=".9" strokeWidth="1" />
      </g>
    ),
  },
  lab: {
    tone: "indigo",
    art: (
      <g filter="url(#mi-glyph)">
        <path d="M41.5 21h17v4h-2.6v19.5l15.3 25.6A6.4 6.4 0 0 1 65.7 80H34.3a6.4 6.4 0 0 1-5.5-9.9l15.3-25.6V25h-2.6v-4Z" fill="#fff" fillOpacity=".95" />
        <path d="M36.6 62h26.8l7.1 11.9a2.6 2.6 0 0 1-2.2 3.9H31.7a2.6 2.6 0 0 1-2.2-3.9L36.6 62Z" fill="url(#mi-liquid)" />
        <circle cx="45" cy="69" r="2.6" fill="#fff" fillOpacity=".9" />
        <circle cx="54.5" cy="72.5" r="1.8" fill="#fff" fillOpacity=".85" />
        <circle cx="51" cy="65.5" r="1.3" fill="#fff" fillOpacity=".8" />
      </g>
    ),
  },
  notes: {
    tone: "paper",
    art: (
      <g>
        <path d="M0 0h100v27H0z" fill="url(#mi-yellow)" />
        <g fill="#fff" fillOpacity=".55">
          {Array.from({ length: 11 }).map((_, i) => (
            <circle key={i} cx={11 + i * 7.8} cy="27" r="1.5" />
          ))}
        </g>
        <g stroke="#d3d2d8" strokeWidth="1.6" strokeLinecap="round">
          <path d="M16 46h68" />
          <path d="M16 60h68" />
          <path d="M16 74h46" />
        </g>
        <g filter="url(#mi-glyph)">
          <path d="M70 80l16-30 6 3.2-16 30-7.4 2.6 1.4-5.8Z" fill="#35384a" />
          <path d="M86 50l6 3.2" stroke="#e7b02c" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
    ),
  },
  ask: {
    tone: "graphite",
    art: (
      <g filter="url(#mi-glyph)">
        <path d="M48 20c1.8 14 8.2 24.2 24 28-15.8 3.8-22.2 14-24 28-1.8-14-8.2-24.2-24-28 15.8-3.8 22.2-14 24-28Z" fill="url(#mi-spark)" />
        <path d="M74 18c.7 5.6 3.1 9.2 8.6 10.6-5.5 1.4-7.9 5-8.6 10.6-.7-5.6-3.1-9.2-8.6-10.6 5.5-1.4 7.9-5 8.6-10.6Z" fill="#fff" fillOpacity=".9" />
        <path d="M28 66c.5 4.2 2.3 6.9 6.4 8-4.1 1.1-5.9 3.800-6.400 8-.5-4.200-2.300-6.900-6.400-8 4.100-1.100 5.900-3.800 6.400-8Z" fill="#fff" fillOpacity=".7" />
      </g>
    ),
  },
  mail: {
    tone: "blue",
    art: (
      <g filter="url(#mi-glyph)">
        <rect x="19" y="29" width="62" height="44" rx="7" fill="url(#mi-env)" />
        <path d="M21.5 33.5 50 54.5l28.500-21" fill="none" stroke="#b8c4d9" strokeWidth="2.600" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 71l21-17M79 71 58 54" stroke="#cdd6e6" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  phone: {
    tone: "green",
    art: (
      <g transform="translate(24 24) scale(2.17)" fill="#fff" filter="url(#mi-glyph)">
        <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
      </g>
    ),
  },
  terminal: {
    tone: "graphite",
    art: (
      <g>
        <rect x="9" y="9" width="82" height="82" rx="20" fill="#0d0e11" stroke="#9aa2b3" strokeOpacity=".5" strokeWidth="1.4" />
        <g stroke="#fff" strokeWidth="6.4" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#mi-glyph)">
          <path d="M28 38l15 12-15 12" />
          <path d="M50 66h22" />
        </g>
      </g>
    ),
  },
  github: {
    tone: "graphite",
    art: (
      <g transform="translate(24 24) scale(2.17)" fill="#fff" filter="url(#mi-glyph)">
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
      </g>
    ),
  },
  linkedin: {
    tone: "linkedin",
    art: (
      <g fill="#fff" filter="url(#mi-glyph)">
        <rect x="24.5" y="41" width="10.6" height="34" rx="1.4" />
        <circle cx="29.8" cy="29.2" r="6.3" />
        <path d="M43 41h10.2v4.7c2-3.4 5.8-5.6 10.8-5.6 8.6 0 12.8 5.4 12.8 14.7V75H66.2V56.8c0-4.7-1.8-7.4-5.8-7.4-4.3 0-6.9 3-6.9 7.9V75H43V41Z" />
      </g>
    ),
  },
  trophy: {
    tone: "amber",
    art: (
      <g filter="url(#mi-glyph)">
        <path d="M30 23h40v13.5C70 49 61 58 50 58S30 49 30 36.5V23Z" fill="#fff" />
        <path d="M30 28H21.5a2.5 2.5 0 0 0-2.5 2.6C19.5 39.5 25 45 32.5 45.5M70 28h8.5a2.5 2.5 0 0 1 2.5 2.6c-.5 8.9-6 14.4-13.5 14.9" fill="none" stroke="#fff" strokeWidth="4.6" strokeLinecap="round" />
        <path d="M45.5 57h9v11h-9z" fill="#fff" />
        <rect x="34" y="67" width="32" height="10" rx="3.5" fill="#fff" />
        <path d="m50 29.5 2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.75-5.2 2.75 1-5.8-4.2-4.1 5.8-.85Z" fill="#f4a51c" />
      </g>
    ),
  },
  cap: {
    tone: "white",
    art: (
      <g filter="url(#mi-glyph)">
        <path d="M50 26 16 41l34 15 34-15-34-15Z" fill="#2c2f3a" />
        <path d="M30 48v13c0 5 9 10 20 10s20-5 20-10V48L50 57 30 48Z" fill="#454a5a" />
        <path d="M78 43v18" stroke="#c99a2e" strokeWidth="3" strokeLinecap="round" />
        <circle cx="78" cy="63" r="3.4" fill="#c99a2e" />
      </g>
    ),
  },
  cert: {
    tone: "paper",
    art: (
      <g filter="url(#mi-glyph)">
        <rect x="18" y="24" width="64" height="44" rx="5" fill="#fff" stroke="#cfd2da" strokeWidth="1.6" />
        <path d="M27 36h30M27 44h22M27 52h26" stroke="#cfd2da" strokeWidth="3" strokeLinecap="round" />
        <path d="M62 60l-5 16 8-4 8 4-5-16" fill="#5a7fc0" />
        <circle cx="65" cy="54" r="10" fill="url(#mi-gold)" stroke="#c99a2e" strokeWidth="1.5" />
      </g>
    ),
  },
  calendar: { tone: "white", art: null },
  photos: {
    tone: "white",
    art: (
      <g filter="url(#mi-glyph)">
        <rect x="20" y="26" width="60" height="48" rx="8" fill="#9cc8f7" />
        <circle cx="65" cy="39" r="6" fill="#ffc93c" />
        <path d="M20 62 37 45l12 12 9-9 22 18a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8Z" fill="#3fb46a" />
        <path d="M49 57l9-9 22 18a8 8 0 0 1-8 8H38Z" fill="#2e8f53" opacity=".55" />
      </g>
    ),
  },
  bin: { tone: "fog", art: <BinArt full={false} /> },
  binFull: { tone: "fog", art: <BinArt full /> },
  about: {
    tone: "fog",
    art: (
      <g filter="url(#mi-glyph)">
        <circle cx="50" cy="50" r="31" fill="#fff" />
        <g clipPath="url(#mi-about-clip)" fill="#9aa4b6">
          <circle cx="50" cy="42" r="11.5" />
          <path d="M24 84c0-15 11.6-25 26-25s26 10 26 25Z" />
        </g>
      </g>
    ),
  },
  /* brand glyphs below (Claude, Instagram, X) use Simple Icons paths, CC0 */
  claude: {
    tone: "clay",
    art: (
      <g transform="translate(22 22) scale(2.333)" fill="#fff8f1" filter="url(#mi-glyph)">
        <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fillRule="evenodd" />
      </g>
    ),
  },
  openai: {
    tone: "white",
    art: (
      <g transform="translate(21 21) scale(2.417)" fill="#0d0d0d">
        <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" fillRule="evenodd" />
      </g>
    ),
  },
  instagram: {
    tone: "instagram",
    art: (
      <g transform="translate(23.5 23.5) scale(2.208)" fill="#fff" filter="url(#mi-glyph)">
        <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
      </g>
    ),
  },
  x: {
    tone: "black",
    art: (
      <g transform="translate(25 25) scale(2.083)" fill="#fff">
        <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
      </g>
    ),
  },
  docs: {
    tone: "paper",
    art: (
      <g filter="url(#mi-glyph)">
        <path d="M29 20h28l16 16v38a6 6 0 0 1-6 6H29a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6Z" fill="#fff" stroke="#c9ccd6" strokeWidth="1.600" />
        <path d="M57 20l16 16H63a6 6 0 0 1-6-6V20Z" fill="#dfe2ea" />
        <rect x="31" y="56" width="30" height="14" rx="4" fill="#b8664a" />
        <text x="46" y="66.500" textAnchor="middle" fontSize="9.500" fontWeight="800" fill="#fff" fontFamily="system-ui,sans-serif">CV</text>
        <path d="M31 40h16M31 47h22" stroke="#cfd2da" strokeWidth="2.600" strokeLinecap="round" />
      </g>
    ),
  },
  code: {
    tone: "graphite",
    art: (
      <g stroke="#fff" strokeWidth="6.400" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#mi-glyph)">
        <path d="M37 36 22 50l15 14" />
        <path d="M63 36l15 14-15 14" />
        <path d="M55 30 45 70" strokeOpacity=".85" />
      </g>
    ),
  },
};

export function MacIcon({
  name,
  size = "100%",
  logo,
  image,
  className,
  children,
  date,
}: {
  name: MacIconName;
  size?: number | string;
  logo?: string;
  /** a full-bleed square app icon, clipped to the squircle (under the gloss and rim) */
  image?: string;
  className?: string;
  children?: ReactNode;
  /** calendar only: the day to show (pass from client state to avoid hydration drift) */
  date?: Date | null;
}) {
  const { tone } = ART[name];
  const art =
    name === "calendar" ? (
      <g fontFamily="-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif">
        <text x="50" y="30" textAnchor="middle" fontSize="15.5" fontWeight="600" letterSpacing=".4" fill="#f2453d">
          {date ? date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase() : ""}
        </text>
        <text x="50" y="80" textAnchor="middle" fontSize="54" fontWeight="300" letterSpacing="-2" fill="#1d1d1f">
          {date ? date.getDate() : ""}
        </text>
      </g>
    ) : (
      ART[name].art
    );
  if (FREESTANDING.has(name)) {
    const img = name === "binFull" ? PROFILE.icons.binFull : PROFILE.icons.bin;
    return (
      <span className={cn("relative inline-block shrink-0 align-middle", className)} style={{ width: size, height: size }} aria-hidden>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" draggable={false} className="h-full w-full object-contain" />
        ) : (
          <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
            {art}
          </svg>
        )}
      </span>
    );
  }
  return (
    <span
      className={cn("relative inline-block shrink-0 align-middle", className)}
      style={{ width: size, height: size, filter: "drop-shadow(0 1px 1.5px rgba(10,16,34,.28)) drop-shadow(0 6px 10px rgba(10,16,34,.16))" }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
        <g clipPath="url(#mi-clip)">
          <rect width="100" height="100" fill={`url(#mi-bg-${tone})`} />
          {image ? <image href={image} width="100" height="100" preserveAspectRatio="xMidYMid slice" /> : art}
          <rect width="100" height="100" fill="url(#mi-gloss)" />
        </g>
        <path d={SQUIRCLE} fill="none" stroke="url(#mi-rim)" strokeWidth="1.5" />
      </svg>
      {logo && (
        // multiply: a logo's own white backdrop melts into the tile instead of showing as a box
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" draggable={false} className="absolute inset-0 m-auto h-[64%] w-[64%] object-contain mix-blend-multiply" />
      )}
      {children && <span className="absolute inset-0 grid place-items-center text-white">{children}</span>}
    </span>
  );
}


/** One shared <defs> block, rendered once in the Shell (never inside a display:none subtree). */
export function MacIconDefs() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
      <defs>
        <clipPath id="mi-about-clip">
          <circle cx="50" cy="50" r="31" />
        </clipPath>
        <clipPath id="mi-clip">
          <path d={SQUIRCLE} />
        </clipPath>
        {(Object.keys(TONES) as (keyof typeof TONES)[]).map((t) => (
          <linearGradient key={t} id={`mi-bg-${t}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={TONES[t][0]} />
            <stop offset="1" stopColor={TONES[t][1]} />
          </linearGradient>
        ))}
        <linearGradient id="mi-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".42" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mi-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".12" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".05" />
          <stop offset="1" stopColor="#fff" stopOpacity=".6" />
        </linearGradient>
        <linearGradient id="mi-yellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7cc58" />
          <stop offset="1" stopColor="#eab22e" />
        </linearGradient>
        <linearGradient id="mi-folder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d2e2f8" />
        </linearGradient>
        <linearGradient id="mi-env" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e3e9f4" />
        </linearGradient>
        <linearGradient id="mi-spark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfd8ee" />
        </linearGradient>
        <radialGradient id="mi-bg-instagram" cx="28%" cy="104%" r="130%" fx="28%" fy="104%">
          <stop offset="0" stopColor="#fdd56a" />
          <stop offset=".18" stopColor="#fd9a41" />
          <stop offset=".42" stopColor="#e9375a" />
          <stop offset=".66" stopColor="#c5288e" />
          <stop offset="1" stopColor="#5b51d8" />
        </radialGradient>
        <linearGradient id="mi-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8be9ff" />
          <stop offset="1" stopColor="#3fb6f0" />
        </linearGradient>
        <linearGradient id="mi-bin-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9eaec" />
          <stop offset=".45" stopColor="#e2e3e6" />
          <stop offset="1" stopColor="#d3d5d9" />
        </linearGradient>
        <linearGradient id="mi-bin-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9bdc4" stopOpacity=".6" />
          <stop offset=".12" stopColor="#ffffff" stopOpacity="0" />
          <stop offset=".45" stopColor="#ffffff" stopOpacity=".45" />
          <stop offset=".88" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#b9bdc4" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id="mi-bin-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#f7f7f8" />
          <stop offset="1" stopColor="#e6e8eb" />
        </linearGradient>
        <linearGradient id="mi-bin-inside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4c8ce" />
          <stop offset=".6" stopColor="#dcdee2" />
          <stop offset="1" stopColor="#e7e8eb" />
        </linearGradient>
        <linearGradient id="mi-bin-sheet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6b8a" />
          <stop offset=".35" stopColor="#ffd25e" />
          <stop offset=".7" stopColor="#5fd0ff" />
          <stop offset="1" stopColor="#7b6cff" />
        </linearGradient>
        <clipPath id="mi-bin-clip">
          <path d={BIN_BODY} />
        </clipPath>
        <filter id="mi-bin-blur1" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
        <filter id="mi-bin-blur2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id="mi-bin-blur4" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <linearGradient id="mi-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d27a" />
          <stop offset="1" stopColor="#d4a238" />
        </linearGradient>
        <linearGradient id="mi-insta" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#e3a052" />
          <stop offset=".5" stopColor="#c7456f" />
          <stop offset="1" stopColor="#6a57c8" />
        </linearGradient>
        <filter id="mi-glyph" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodColor="#0a1022" floodOpacity=".28" />
        </filter>
      </defs>
    </svg>
  );
}
