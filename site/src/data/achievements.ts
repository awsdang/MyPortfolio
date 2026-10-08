import type { MacIconName } from "@/components/ui/MacIcon";

/**
 * Drafted from the CV PDFs — we'll add the rest together.
 * kind controls the icon; href is optional (makes the card a link).
 */
export type Achievement = { title: string; detail: string; meta?: string; icon: MacIconName; href?: string };

export const ACHIEVEMENTS: Achievement[] = [
  { title: "1st Prize — Incubator Program", detail: "The Station Foundation", meta: "2022", icon: "trophy" },
  { title: "Most Innovative Startup Founder in Baghdad", detail: "CS50x Baghdad", meta: "2022", icon: "trophy" },
  { title: "AI Engineering", detail: "Turing College · capstone: Maaahr", meta: "2026", icon: "cert" },
  { title: "Machine Learning for Inverse Graphics & AI", detail: "MIT", meta: "2024", icon: "cert" },
  { title: "B.Sc. Architectural Engineering", detail: "University of Technology, Baghdad", meta: "2012 – 2017", icon: "cap" },
  { title: "Erasmus exchange, MSc Information Management", detail: "University of Ljubljana · thesis became HAWSR", meta: "2020 – 2021", icon: "cap" },
];

/** Numbers that already appear on the site (vetted). */
export const PROOF = [
  { value: "1M+", label: "people use products I built" },
  { value: "150+", label: "venues across 6 cities" },
  { value: "99.9%", label: "uptime over 8 months" },
  { value: "10K+", label: "users on my AI products" },
  { value: "~150/s", label: "messages per NotifyX worker" },
];
