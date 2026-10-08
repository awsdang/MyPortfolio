export const PROFILE = {
  name: "Aws Abdulfattah",
  short: "Aws",
  email: "awsdang@gmail.com",
  headline: "Engineer. Builder.",
  menuSubtitle: "Engineer · Builder",
  location: "Based in Iraq · thinking everywhere",
  timezone: "Asia/Baghdad",
  zoneLabel: "BAGHDAD",
  availability: "Open to remote work & relocation",
  links: {
    github: "https://github.com/awsdang",
    linkedin: "https://www.linkedin.com/in/awsdang",
    notifyx: "https://github.com/awsdang/notifyx",
    x: "https://x.com/awsdang",
    instagram: "https://www.instagram.com/awsdang",
    /** Calendly (or similar) booking URL — leave empty until it exists; the Book window shows a fallback. */
    booking: "",
  },
  /** Prefilled prompt for the Claude / ChatGPT tiles. */
  aiPrompt:
    "Tell me about Aws Abdulfattah, Software Engineer at Qi Card in Iraq and Founding Engineer & Technical Lead at Cardyiq. He builds products used by over a million people, manages engineers, and turns messy problems into products. Summarize his background, strengths and what makes him a standout engineering hire: https://awsdang.com/",
  photo: { src: "/me.jpg", alt: "Aws Abdulfattah" },
  /**
   * Icon slots. Empty logo = /brand/banana.png (Aws's own banana art); set a path
   * to a square PNG in public/brand/ to swap the logo, or the drawn bin (dock).
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
    sub: "I build things that work, manage engineers, and fix messy problems and turn them into products people actually use.",
  },
  now: [
    { role: "Software Engineer", org: "Qi Card" },
    { role: "Founding Engineer & Technical Lead", org: "Cardyiq" },
  ],
  principles: ["Understand it before you fix it.", "Real users beat perfect demos.", "Leave the team stronger."],
  then: "For nine years, I worked in architecture and construction. With UNOPS in Anbar, I managed a reconstruction program covering around 1,500 homes. I started writing Python to automate the repetitive parts of Revit. Then the scripts got more interesting than the drawings.",
  between: "A thesis became HAWSR. HAWSR became a company. And somewhere between my first customer and my first broken deployment, software became the work.",
  nowText: "Today I'm a Software Engineer at Qi Card and a Founding Engineer & Technical Lead at Cardyiq. I still sketch first. I still ask too many questions. And I still like getting my hands dirty.",
};

export const CHAPTERS = [
  {
    id: "engineering",
    tab: "Engineering",
    kicker: "Chapter nº1",
    title: "Engineer inside a super-app.",
    body: "Products, dashboards, Alipay mini-apps and native DSL work at Qi Card: Tasdid, Jabi, oil stations, AML, Qi Hawala, KRG billing and Basmayah loans.",
    open: { label: "Open Qi", node: "qi-card" },
    notes: [
      { title: "Tasdid & Jabi", text: "Mini-apps inside SuperQi" },
      { title: "Oil stations, AML, Qi Hawala", text: "Money-moving products" },
      { title: "Native mini-app work", text: "Alipay mini-apps and native DSL" },
    ],
  },
  {
    id: "founding",
    tab: "Founding",
    kicker: "Chapter nº2",
    title: "Founding engineer. Rebuilt it, then led it.",
    body: "A live product, a backend rebuild, a new business model, and a team of ten. Engineering goes beyond the code.",
    open: { label: "Open Cardy", node: "cardyiq" },
    notes: [
      { title: "150+ venues", text: "across 6 cities" },
      { title: "99.9% uptime", text: "on the rebuilt backend" },
      { title: "A team of ten", text: "hiring, reviews, delivery" },
    ],
  },
  {
    id: "builder",
    tab: "Builder",
    kicker: "Chapter nº3",
    title: "Builds the things behind the screen.",
    body: "I kept rebuilding notifications, so I made one system for it. I put an interface inside Telegram. I taught a voice to interview.",
    open: { label: "Open NotifyX", node: "notifyx" },
    notes: [
      { title: "NotifyX", text: "5 companies · ~150 messages/sec/worker" },
      { title: "Sadeek", text: "10K+ users · 150K+ AI requests" },
      { title: "Maaahr", text: "Realtime voice · structured evaluations" },
    ],
  },
  {
    id: "infrastructure",
    tab: "Infrastructure",
    kicker: "Chapter nº4",
    title: "Self-hosted, and shipping all the time.",
    body: "I built delivery from nothing: Docker images, GitHub Actions and Dokploy on Linux VPS. Releases stopped being events. Backups, a read replica and a tested recovery path come before features — that's why a data-loss incident ended with zero records lost.",
    open: { label: "See it in Cardy", node: "cardyiq" },
    notes: [
      { title: "Docker · GitHub Actions · Dokploy", text: "CI/CD from scratch · 30 releases in 6 months" },
      { title: "99.9% uptime", text: "over 8 months · read replica + off-site backups" },
      { title: "4× cheaper hosting", text: "$200 → $50 a month after reworking infra and deploys" },
    ],
  },
];
