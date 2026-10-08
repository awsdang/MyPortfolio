import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OSProvider } from "@/components/os/OSProvider";
import { Shell } from "@/components/os/Shell";
import { Wallpaper } from "@/components/os/Wallpaper";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["600", "700"], display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Aws Abdulfattah — Engineer. Builder.",
  description:
    "Software Engineer at Qi. I build things that work, manage engineers, and turn messy problems into products people actually use.",
  openGraph: {
    title: "Aws Abdulfattah — Engineer. Builder.",
    description: "Software Engineer at Qi. I build things that work.",
    type: "website",
  },
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
