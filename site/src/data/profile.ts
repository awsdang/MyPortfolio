export const PROFILE = {
  name: "Aws Abdulfattah",
  short: "Aws",
  email: "awsdang@gmail.com",
  /** Shown in the footer contact card as typed; the tel: link keeps only + and digits. Empty hides the row. */
  phone: "+964 770 253 1435",
  headline: "Software engineer and team lead",
  menuSubtitle: "Software engineer",
  location: "Based in Baghdad, Iraq",
  timezone: "Asia/Baghdad",
  zoneLabel: "BAGHDAD",
  availability: "Open to remote work and relocation",
  links: {
    github: "https://github.com/awsdang",
    linkedin: "https://www.linkedin.com/in/awsdang",
    notifyx: "https://github.com/awsdang/notifyx",
    x: "https://x.com/awsdang",
    instagram: "https://www.instagram.com/awsdang",
    /** Calendly page shown in the Book an interview window; empty shows an email fallback there. */
    booking: "https://calendly.com/awsdang/30min",
  },
  /** Prefilled prompt for the Claude / ChatGPT tiles. */
  aiPrompt:
    "Read Aws Abdulfattah's portfolio at https://awsdang.com/ and summarize his background, contributions and approach to work for someone considering hiring him. He is a Software Engineer at Qi and Founding Engineer and Technical Lead at Cardy. Distinguish work he led with a team from products he built himself, and use only the information in the portfolio.",
  photo: { src: "/me.jpg", alt: "Aws Abdulfattah" },
  /**
   * Icon slots. Empty logo = the inline one-colour banana glyph (Aws's own art,
   * see ui/Banana.tsx); set a path to a square PNG in public/brand/ to swap the
   * logo, or the drawn bin (dock).
   * Empty bin / binFull fall back to the SVG bin in MacIcon.
   */
  icons: { logo: "" as string, bin: "/brand/bin.png" as string, binFull: "/brand/bin-full.png" as string },
  music: {
    title: "Fix You",
    artist: "Coldplay",
    album: "X&Y",
    // Apple's official 30-second preview + artwork (iTunes Search API); streamed, not rehosted.
    preview:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e5/42/e3/e542e340-a45c-695e-e0b8-6155e222ebc0/mzaf_14955746616030397665.plus.aac.p.m4a",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/0c/82/48/0c8248a8-4a5b-d30d-8056-f32d650d2fc9/190295978068.jpg/300x300bb.jpg",
    link: "https://music.apple.com/us/album/fix-you/1123076757?i=1123076826",
    /** Card that slides out under the player while the preview plays. */
    note: "I'll fix all your code problems, just like Coldplay is fixing our souls.",
  },
  hero: {
    line1: "I'm Aws.",
    line2Before: "I'm a Software Engineer at ",
    line2Org: "Qi",
    line2After: ".",
    sub: "I build things that work, manage engineers, and turn messy problems into products people actually use.",
  },
  now: [
    { role: "Software Engineer", org: "Qi Card" },
    { role: "Founding Engineer & Technical Lead", org: "Cardyiq" },
  ],
  principles: ["Understand it before I fix it.", "Real users beat perfect demos.", "Leave the team stronger."],
  then: "I moved toward software by following code beyond the immediate fix. I wanted to understand how a system behaves, why it fails and what would make the next change safer. Writing automation was my starting point. The questions it raised about reliability, reuse and maintainability are what kept me coding.",
  between: "My master's thesis became HAWSR, a browser-based property-tour product I built with a team of six and took to paying customers. Building a product with a team taught me to think beyond a feature: the code has to work for people, the system has to stay maintainable, and the team needs enough shared understanding to keep making decisions as the product changes.",
  nowText: "At Qi, I contribute to mini-apps inside SuperQi. At Cardy, I joined just after launch to give technical advice, then built the engineering team and led changes across the dashboard, app rewrite and backend migration while the service stayed live. That work strengthened what I believe about technical leadership: direction only helps when people understand why, can question assumptions and have room to own what they build. I stay hands-on so I can meet decisions in the code and take responsibility for reliability after release. I build products of my own, too. I like work where technical depth, product judgment and helping people grow are part of the same responsibility.",
};

export const CHAPTERS = [
  {
    id: "engineering",
    tab: "Engineering",
    kicker: "Qi, since 2024",
    title: "Building everyday services inside SuperQi.",
    body: "I work across billing and merchant acquiring, building mini-apps inside SuperQi and tools for Qi staff. My projects include bill payment, merchant services and a housing-loan application. I shape requirements with business teams, then work with design, backend, DevOps and security to deliver each service.",
    open: { label: "See my work at Qi", node: "qi-card" },
    notes: [
      { title: "Tasdid+", text: "I built a mini-app for paying bills and invoices and requesting money." },
      { title: "Jabi+", text: "I developed Jabi+ features for merchant sales, statements and payroll." },
      { title: "Staff tools", text: "I also contributed to staff dashboards and shared interface components." },
    ],
  },
  {
    id: "management",
    tab: "Team leadership",
    kicker: "Cardy, since 2025",
    title: "From technical advice to leading the rebuild.",
    body: "I joined Cardy just after launch to give technical advice. The role grew into business, product and engineering work: I built the technical team and dashboard, then helped introduce visits and monthly memberships in the existing app before leading the Flutter rewrite. I moved the backend from PHP and MySQL to Bun and PostgreSQL while the service stayed in use, and rebuilt the website along the way.",
    open: { label: "Read the Cardy story", node: "cardyiq" },
    notes: [
      { title: "200 sports venues", text: "The network serves 200 venues, with 2,000 subscribers and 20K downloads." },
      { title: "Visits and monthly memberships", text: "Members use prepaid points for individual visits or choose a monthly membership at one venue." },
      { title: "A product already in use", text: "I moved the live backend from PHP and MySQL to Bun and PostgreSQL." },
    ],
  },
  {
    id: "builder",
    tab: "My own products",
    kicker: "Ideas I wanted to build",
    title: "From first idea to a product people can use.",
    body: "I build my own products from the first idea through the app and the service around it. Asheerty is an Arabic family tree app for iOS and Android, with its backend, website, dashboard and poster editor built by me. I built Sadeek for sellers and Maaahr for interview practice, learning what it takes to make each idea work end to end.",
    open: { label: "Explore Asheerty", node: "asheerty" },
    notes: [
      { title: "Asheerty", text: "An Arabic family tree app, with the backend, website and poster editor I built." },
      { title: "Sadeek", text: "A Telegram seller bot that reached 10K+ users and handled 150K+ AI requests." },
      { title: "Maaahr", text: "Four connected apps for interview practice and hiring, in Arabic and English by text or voice." },
    ],
  },
  {
    id: "infrastructure",
    tab: "Infrastructure",
    kicker: "The work behind the apps",
    title: "A notification system I can reuse across my products.",
    body: "I built NotifyX to stop rebuilding notification infrastructure in every app. One API brings together providers, workers, scheduling and delivery history, with a dashboard and SDKs for integrating products. I use it across my own projects and made it open source so other teams can adapt it.",
    open: { label: "Read the NotifyX story", node: "notifyx" },
    notes: [
      { title: "NotifyX", text: "Four providers behind one system: FCM, APNS, HMS and Web Push." },
      { title: "Early in the product", text: "Client SDKs for web, Flutter and React Native make it practical to add notifications early." },
      { title: "Running what I build", text: "I built the API, dashboard, workers and scheduler, and started the project in 2024." },
    ],
  },
];
