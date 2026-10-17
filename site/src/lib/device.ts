/** What a bug report carries about the visitor's device. Shown in the Report a bug window before it is sent. */

const errors: string[] = [];
let tracking = false;

/** Keeps the last few uncaught errors so a bug report can carry them. Call once on mount. */
export function trackErrors() {
  if (tracking || typeof window === "undefined") return;
  tracking = true;
  const keep = (m: unknown) => {
    errors.push(String(m).slice(0, 200));
    if (errors.length > 5) errors.shift();
  };
  window.addEventListener("error", (e) => keep(e.message || e.error));
  window.addEventListener("unhandledrejection", (e) => keep((e.reason as Error)?.message ?? e.reason));
}

export const DEVICE_LABELS = {
  page: "Page",
  browser: "Browser",
  os: "System",
  screen: "Screen",
  viewport: "Window",
  pixelRatio: "Pixel ratio",
  theme: "Appearance",
  language: "Language",
  timeZone: "Time zone",
  touch: "Touch",
  windows: "Open windows",
  errors: "Recent errors",
} as const;

export type DeviceInfo = Record<keyof typeof DEVICE_LABELS, string>;

export function deviceInfo(openWindows: string[]): DeviceInfo {
  const ua = navigator.userAgent;
  const touch = navigator.maxTouchPoints;
  return {
    page: location.pathname,
    browser: browserName(ua),
    os: osName(ua, touch),
    screen: `${screen.width} x ${screen.height}`,
    viewport: `${innerWidth} x ${innerHeight}`,
    pixelRatio: String(Math.round(devicePixelRatio * 100) / 100),
    theme: document.documentElement.dataset.theme === "dark" ? "Dark" : "Light",
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    touch: touch > 0 ? `Yes, ${touch} points` : "No",
    windows: openWindows.join(", ") || "None",
    errors: errors.join("\n") || "None",
  };
}

const BROWSERS: [RegExp, string][] = [
  [/Edg(?:A|iOS)?\/(\d+)/, "Edge"],
  [/OPR\/(\d+)/, "Opera"],
  [/SamsungBrowser\/(\d+)/, "Samsung Internet"],
  [/(?:Firefox|FxiOS)\/(\d+)/, "Firefox"],
  [/(?:Chrome|CriOS)\/(\d+)/, "Chrome"],
  [/Version\/([\d.]+).*Safari/, "Safari"],
];

function browserName(ua: string) {
  for (const [re, name] of BROWSERS) {
    const m = ua.match(re);
    if (m) return `${name} ${m[1]}`;
  }
  return "Unknown";
}

// macOS and Windows freeze the version in the user agent, so only phones get one
function osName(ua: string, touch: number) {
  const v = (re: RegExp) => ua.match(re)?.[1].replace(/_/g, ".") ?? "";
  if (/iPhone/.test(ua)) return `iOS ${v(/OS (\d+(?:_\d+)?)/)}`.trim();
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touch > 1)) return "iPadOS";
  if (/Android/.test(ua)) return `Android ${v(/Android ([\d.]+)/)}`.trim();
  if (/Macintosh/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}
