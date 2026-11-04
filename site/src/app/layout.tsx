import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { OSProvider } from "@/components/os/OSProvider";
import { Shell } from "@/components/os/Shell";
import { Wallpaper } from "@/components/os/Wallpaper";
import { OG_IMAGES, SITE_NAME, SITE_URL } from "@/lib/seo";

const bricolage = localFont({ src: "./fonts/bricolage-grotesque.ttf", variable: "--font-bricolage", weight: "200 800", display: "swap" });
const caveat = localFont({ src: "./fonts/caveat.ttf", variable: "--font-caveat", weight: "400 700", display: "swap" });
const geistMono = localFont({ src: "./fonts/geist-mono.ttf", variable: "--font-geist-mono", weight: "100 900", display: "swap" });

/** Defaults for pages without their own; /, /cv and /work pages set theirs with shareMeta() in lib/seo.ts. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Aws Abdulfattah, Software Engineer",
  description:
    "I'm Aws, a Software Engineer at Qi and Founding Engineer and Technical Lead at Cardy. Read how I build products, lead a technical team and put my background in architecture to work.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: `${SITE_URL}/` }],
  creator: SITE_NAME,
  openGraph: {
    title: "Aws Abdulfattah, Software Engineer",
    description: "I'm Aws. I build things that work, manage engineers and turn messy problems into products people actually use.",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [OG_IMAGES.home],
  },
  // title, description and image fall back to each page's Open Graph tags
  twitter: { card: "summary_large_image", creator: "@awsdang" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efe3cc" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1020" },
  ],
};

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${caveat.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <OSProvider>
          <Wallpaper />
          {children}
          <Shell />
        </OSProvider>
      </body>
    </html>
  );
}
