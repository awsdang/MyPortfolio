import type { Metadata } from "next";
import { CV_URL } from "@/data/fs";
import { PROFILE } from "@/data/profile";

export const SITE_URL = "https://awsdang.com";
export const SITE_NAME = PROFILE.name;

/** Share cards in public/og/, 1200x630. Remake them with scripts/og/render.mjs when the CV or role changes. */
export const OG_IMAGES = {
  home: { url: "/og/home.jpg", width: 1200, height: 630, alt: "Aws Abdulfattah, Software Engineer at Qi and Founding Engineer at Cardy, beside his portfolio desktop" },
  cv: { url: "/og/cv.jpg", width: 1200, height: 630, alt: "Aws Abdulfattah, Curriculum vitae, beside the first page of his CV" },
};

/**
 * Open Graph for one page. Next replaces the layout's openGraph object rather
 * than merging it, so every page sends the full set or it inherits the home title.
 */
export function shareMeta(o: { title: string; description?: string; path: string; image?: keyof typeof OG_IMAGES; type?: "website" | "profile" }): Metadata {
  const image = OG_IMAGES[o.image ?? "home"];
  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: o.path },
    openGraph: {
      title: o.title,
      description: o.description,
      url: o.path,
      siteName: SITE_NAME,
      locale: "en_US",
      type: o.type ?? "website",
      images: [image],
      ...(o.type === "profile" ? { firstName: "Aws", lastName: "Abdulfattah", username: "awsdang" } : {}),
    },
  };
}

/** Facts here come from the CV in public/cv/; keep them in step when it changes. */
export const PERSON = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: PROFILE.name,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}${PROFILE.photo.src}`,
  email: `mailto:${PROFILE.email}`,
  jobTitle: "Senior Software Engineer",
  description: "Senior full-stack software engineer and technical lead: web and mobile apps in React, Next.js, Svelte, Angular, Flutter and React Native, and the Node.js, Bun and PostgreSQL services behind them.",
  worksFor: [
    { "@type": "Organization", name: "Qi Card" },
    { "@type": "Organization", name: "Cardy" },
  ],
  address: { "@type": "PostalAddress", addressLocality: "Baghdad", addressCountry: "IQ" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Technology, Iraq" },
  knowsAbout: ["React", "Next.js", "Svelte", "Angular", "TypeScript", "Flutter", "React Native", "Node.js", "Bun", "PostgreSQL", "Payments", "Applied AI"],
  knowsLanguage: ["ar", "en", "nl"],
  sameAs: [PROFILE.links.github, PROFILE.links.linkedin, PROFILE.links.x],
};

export const CV_PDF = {
  "@type": "DigitalDocument",
  name: `${PROFILE.name}, CV (PDF)`,
  url: `${SITE_URL}${CV_URL}`,
  encodingFormat: "application/pdf",
  inLanguage: "en",
};

/** A JSON-LD block; `<` is escaped so no string in the data can close the script tag. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") };
}
