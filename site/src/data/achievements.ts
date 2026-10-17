import type { MacIconName } from "@/components/ui/MacIcon";

/**
 * Awards, degrees and certificates. Awards and degrees come from the CVs;
 * the certificates are the user's own scans and PDFs, cropped into
 * public/certs/ (the PM certificate has the issuer's email and phone blurred).
 *
 * kind picks the group in the Achievements window; About only shows "study".
 * highlight puts an item on the short home-page section.
 * at / until place the item on the year scale (fractional years: a month
 * is known for most certificates, mid-year otherwise).
 */
export type AchievementKind = "award" | "study" | "course";

export type Certificate = { src: string; thumb: string; width: number; height: number };

export type Achievement = {
  id: string;
  kind: AchievementKind;
  title: string;
  /** Who gave it. */
  detail: string;
  /** One line of context. */
  note?: string;
  /** The date as shown. */
  meta: string;
  at: number;
  until?: number;
  icon: MacIconName;
  hours?: number;
  cert?: Certificate;
  href?: string;
  highlight?: boolean;
};

const cert = (name: string, width: number, height: number): Certificate => ({
  src: `/certs/${name}.webp`,
  thumb: `/certs/${name}-thumb.webp`,
  width,
  height,
});

export const ACHIEVEMENTS: Achievement[] = [
  // Awards and recognition
  {
    id: "station-foundation",
    highlight: true,
    kind: "award",
    title: "1st prize, Incubator Program",
    detail: "The Station Foundation",
    note: "Won with HAWSR, the company my master's thesis became.",
    meta: "2022",
    at: 2022.5,
    icon: "trophy",
  },
  {
    id: "cs50x-baghdad",
    highlight: true,
    kind: "award",
    title: "Most Innovative Startup Founder in Baghdad",
    detail: "CS50x Baghdad",
    meta: "2022",
    at: 2022.5,
    icon: "trophy",
  },
  {
    id: "business-ready",
    highlight: true,
    kind: "award",
    title: "Expert contributor, Business Ready 2024",
    detail: "World Bank Group",
    meta: "2024",
    at: 2024.5,
    icon: "cert",
    cert: cert("business-ready", 1800, 1391),
  },
  {
    id: "orange-corners",
    highlight: true,
    kind: "award",
    title: "Orange Corners incubation, sixth cohort",
    detail: "Orange Corners Baghdad, an initiative of the Kingdom of the Netherlands",
    note: "I completed the six month incubation program in June 2023.",
    meta: "June 2023",
    at: 2023.43,
    icon: "cert",
    cert: cert("orange-corners", 1800, 1291),
  },

  // Degrees and programs
  {
    id: "turing-college",
    highlight: true,
    kind: "study",
    title: "AI Engineering",
    detail: "Turing College",
    meta: "2026",
    at: 2026.5,
    icon: "cert",
  },
  {
    id: "mit-inverse-graphics",
    kind: "study",
    title: "Machine Learning for Inverse Graphics & AI",
    detail: "MIT",
    meta: "2024",
    at: 2024.5,
    icon: "cert",
  },
  {
    id: "ljubljana",
    kind: "study",
    title: "Erasmus exchange, MSc Information Management",
    detail: "University of Ljubljana",
    note: "HAWSR grew out of my thesis work there.",
    meta: "2020 to 2021",
    at: 2020.5,
    until: 2021.5,
    icon: "cap",
  },
  {
    id: "uot-bsc",
    kind: "study",
    title: "B.Sc. Architectural Engineering",
    detail: "University of Technology, Baghdad",
    meta: "2012 to 2017",
    at: 2012.5,
    until: 2017.5,
    icon: "cap",
  },

  // Certificates
  {
    id: "threejs-journey",
    kind: "course",
    title: "Three.js Journey",
    detail: "Bruno Simon",
    note: "I completed all lessons and passed the required tests.",
    meta: "Jan 2024",
    at: 2024.01,
    icon: "cert",
    cert: cert("threejs-journey", 1024, 599),
  },
  {
    id: "front-end",
    kind: "course",
    title: "Front End Web Development with JavaScript, HTML, CSS and Bootstrap",
    detail: "Udemy, Oak Academy",
    meta: "Oct 2023",
    at: 2023.76,
    icon: "cert",
    hours: 15,
    cert: cert("front-end", 980, 721),
  },
  {
    id: "react",
    kind: "course",
    title: "React JS: Complete Guide for Frontend Web Development",
    detail: "Udemy, EdYoda Digital University",
    meta: "Aug 2023",
    at: 2023.64,
    icon: "cert",
    hours: 22,
    cert: cert("react", 980, 721),
  },
  {
    id: "web-bootcamp",
    kind: "course",
    title: "The Complete 2023 Web Development Bootcamp",
    detail: "Udemy, Dr. Angela Yu",
    meta: "June 2023",
    at: 2023.42,
    icon: "cert",
    hours: 66,
    cert: cert("web-bootcamp", 979, 720),
  },
  {
    id: "bsafe",
    kind: "course",
    title: "BSAFE security awareness",
    detail: "United Nations Department of Safety and Security",
    meta: "Jan 2023",
    at: 2023.05,
    icon: "cert",
    cert: cert("bsafe", 1800, 1464),
  },
  {
    id: "jhu-web",
    kind: "course",
    title: "HTML, CSS, and JavaScript for Web Developers",
    detail: "Johns Hopkins University, on Coursera",
    meta: "Jan 2022",
    at: 2022.04,
    icon: "cert",
    cert: cert("jhu-web", 1024, 791),
  },
  {
    id: "johari-window",
    kind: "course",
    title: "Johari Window",
    detail: "Al-Riyad Group",
    note: "I took this team training while working on showrooms at Al-Riyad.",
    meta: "June 2018",
    at: 2018.49,
    icon: "cert",
    cert: cert("johari-window", 1800, 1291),
  },
  {
    id: "project-management",
    kind: "course",
    title: "Project Management, 48 contact hours",
    detail: "Dar Al-Takamul for Engineering and Consultancy",
    note: "The course covered PMBOK 6th edition, an oil pipeline EPCC case and practical Agile projects.",
    meta: "2018",
    at: 2018.3,
    icon: "cert",
    hours: 48,
    cert: cert("project-management", 1800, 1309),
  },
];

export const KIND_LABEL: Record<AchievementKind, string> = {
  award: "Awards and recognition",
  study: "Degrees and programs",
  course: "Certificates",
};

/** Hours stated on the certificates themselves (not every one says). */
export const TOTAL_HOURS = ACHIEVEMENTS.reduce((n, a) => n + (a.hours ?? 0), 0);
