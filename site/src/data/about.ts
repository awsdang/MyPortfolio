/**
 * The About window (dock / menu "About Aws") and the short About card on the scroll page.
 * Every claim here also appears on a project page or in the CV; `node` links to the
 * project in fs.ts and opens it in Finder.
 */
export type AboutLink = { node: string; text: string; since?: string };
export type PathStep = { when: string; title: string; text: string; node?: string };

export const ABOUT = {
  role: "Software Engineer at Qi. Founding Engineer and Technical Lead at Cardy.",
  headline: "I lead through the code and make room for others.",
  intro:
    "I'm Aws, a software engineer in Baghdad. I'm drawn to the part of software you don't see on screen: how a request moves through an app, how data changes, and what happens when a dependency fails. I like tracing that path until the cause makes sense, then shaping a fix the team can trust. I first got into coding to remove repetitive work, but I stayed because building software opened up harder and more interesting problems. That curiosity took me from automations to HAWSR, a property tour product I built with a team of six and brought to paying customers. It also changed how I think about leadership. I joined Cardy just after launch as a consultant. As the product grew, I built the engineering team and led a sequence of changes across the dashboard, app and backend while the service stayed live. I still work in the implementation, and I make time to explain the tradeoffs and give the team ownership of the systems we ship. At Qi and in my own products, I keep learning the same lesson: the strongest engineering comes from understanding the whole problem, not just finishing the ticket.",
  /** the short card on the scroll page; its button opens the full About window */
  short:
    "I like getting past the feature to understand the system and the people relying on it. At Cardy, I built the engineering team and led changes to a live product while staying close to the code. That experience shaped how I lead: make the goal and tradeoffs clear, listen to the people closest to the work, then give them room to own the solution. I take responsibility for what we ship and want to leave the team better able to make its next decision.",
  facts: [
    ["At Qi", "Software Engineer, since 2024"],
    ["At Cardy", "Founding Engineer and Technical Lead, since 2025"],
    ["My own", "Building Asheerty on my own, launched in 2026"],
    ["Before", "Nine years in architecture and construction"],
    ["Home", "Baghdad, Iraq"],
    ["Languages", "Arabic, English and a little Dutch"],
  ] as [string, string][],

  now: {
    title: "The work I'm doing now",
    lede: "I contribute to one team, lead another and build my own products.",
    items: [
      {
        node: "qi-card",
        since: "Since 2024",
        text: "At Qi, I build interfaces for mini-apps inside SuperQi, including Tasdid+ for bill payments and Jabi+ for merchants. I'm part of the team behind these everyday services.",
      },
      {
        node: "cardyiq",
        since: "Since 2025",
        text: "Cardy brings together my interests in sports and technology. I joined a few days after launch to give technical advice, and my role grew into business, product and engineering. I built the technical team and rebuilt the dashboard around how venue operators work in Arabic. We changed the business model in the familiar app first. Then I led a Flutter rewrite that kept its features, before moving the backend from PHP and MySQL to Bun and PostgreSQL. Because the service stayed live, I planned the data model and migration, compared old and new API responses with a parity tool I built, and reconciled row counts, points and balances before cutover. We broke the work into steps members could follow and the team could verify. Today Cardy serves 200 venues and 2,000 subscribers.",
      },
      {
        node: "asheerty",
        since: "Launched in 2026",
        text: "I'm building Asheerty on my own, an Arabic family tree app that can become a framed poster. My work covers the iOS and Android app, backend, website and editor where I lay out the artwork for printing.",
      },
    ] as AboutLink[],
    sideLabel: "Other ideas I've followed through",
    side: [
      { node: "notifyx", text: "I built NotifyX so I could stop rebuilding notifications for every app. It's open source, and I now use it across my own projects." },
      { node: "sadeek", text: "I built Sadeek to turn a merchant's phone photo into a store listing through Telegram. It reached more than 10,000 users and is now dormant." },
      { node: "maaahr", text: "I built Maaahr to turn interview advice into practice, with text or voice interviews and feedback in Arabic and English." },
    ] as AboutLink[],
  },

  path: {
    title: "How the work changed",
    lede: "A way to save a team time grew into a thesis, a product and the work I wanted to do every day.",
    eras: [
      {
        name: "Architecture",
        steps: [
          { when: "2012 to 2017", title: "University of Technology, Baghdad", text: "I studied Architectural Engineering at the University of Technology in Baghdad.", node: "school" },
          { when: "2017 to 2019", title: "Al-Riyad Group", text: "I designed and supervised four showrooms, developing a modular system that could be reused. It was eventually used in nine locations.", node: "alriyad" },
          { when: "2019 to 2021", title: "Mutaa Al-Hashimi", text: "I managed schedules for more than 65 projects and became a Senior Architect. My scripts for schedules and legends saved more than a working day per project, which made me want to keep building tools.", node: "mutaa" },
        ],
      },
      {
        name: "Architecture and software together",
        steps: [
          { when: "2021 to 2023", title: "HAWSR", text: "My master's thesis became HAWSR, taking Revit models into browser-based property tours. I built the product, sold about $60,000 of tours and led a team of six. The company closed in 2023.", node: "hawsr" },
          { when: "2022 to 2023", title: "UNOPS in Anbar", text: "I managed reconstruction work covering around 1,500 homes for displaced families. I wrote code at night and on weekends, and joined my first software role before the contract ended.", node: "unops" },
        ],
      },
      {
        name: "",
        steps: [
          { when: "", title: "Sifrtas", text: "In my first software job, at a meal-ordering startup, I took over the backend and frontend, set up deployments and cut hosting costs to a quarter of the original bill." },
          { when: "2025", title: "Cardy", text: "I joined as a consultant just after launch. Over the next year, the role grew into business, product and engineering work as the founding engineer and technical lead.", node: "cardyiq" },
          { when: "2026", title: "Asheerty", text: "I launched the family tree app and kept building the poster tools, bringing my experience with software and visual work together.", node: "asheerty" },
        ],
      },
    ] as { name: string; steps: PathStep[] }[],
  },

  work: {
    title: "Build a team that can carry the work forward",
    lede: "Leadership has taught me that taking responsibility does not mean becoming the person who does everything. If every decision, review and difficult fix has to come through me, the work might move, but the team cannot grow past my capacity. I want people to understand the problem, the constraints and the reasoning behind a direction well enough to question it and own what comes next. That asks me to listen closely, make a call when uncertainty is slowing the team, and stay accountable when that call meets production. At Cardy, we changed the business model in the app members already knew, then rewrote the app and migrated the backend in stages while the service stayed live. The order mattered, and so did explaining it. I stayed hands-on to see where the plan met the code, while the engineers owned the pieces they were best placed to solve. This is the kind of leadership I believe in: creating clarity without pretending the answer is obvious, and building enough trust and technical understanding that the team can keep making good decisions without waiting for me. The result I care about is both a system that can evolve and people who have grown through building it.",
    items: [] as { title?: string; then?: string; now: string }[],
  },

  lead: {
    title: "Building with other people",
    lede: "I lead from the work: making the direction clear, helping people take ownership and staying accountable for what we deliver together.",
    items: [
      { value: "7", label: "people I led at Startup Weekend Baghdad", when: "2017" },
      { value: "3", label: "architects I led at Mutaa Al-Hashimi", when: "2021" },
      { value: "6", label: "people on the HAWSR team I built and led", when: "2021 to 2023" },
      { value: "10", label: "architects and engineers I led in Anbar", when: "2022 to 2023" },
      { value: "5+", label: "people I've hired and led at Cardy", when: "Today" },
      { value: "Qi", label: "where I mentor junior engineers and AUIB students", when: "Today" },
    ],
    body: "I learned to lead in settings where the plan had to reach other people's work. At UNOPS, I led four architects and six engineers on a reconstruction program where contractors, budgets and site conditions all shaped the work. At Cardy, I built the engineering team and work across product, design, QA and engineering as we change a live service. In both places, the team works better when people understand why a decision was made and what they own. I try to keep that context visible, make tradeoffs clear and give people room to own the solution. I stay close to the code because technical decisions have to meet reality, and I want to understand what the team is carrying. I also mentor junior engineers and AUIB students. I enjoy seeing an explanation or tool give someone else more independence. What matters to me is not only what ships, but whether the team understands it well enough to keep improving it.",
  },

  learning: {
    title: "My studies",
    lede: "Architecture gave me my formal training. I learned software by writing tools, building products and continuing to study along the way.",
  },

  life: {
    title: "A little more about me",
    items: [
      { title: "Getting comfortable on stage", text: "Toastmasters helped me learn to speak to a room. Later I pitched HAWSR to more than 1,000 people." },
      { title: "Volunteering", text: "I've taught BIM workshops for ministry engineers and designed house plans for four families through a UAE program." },
      { title: "Languages", text: "Arabic and English are part of my everyday life. I also speak a little Dutch and keep learning along the way." },
    ],
    signoff: "I like understanding how things work, and building something useful with what I learn.",
  },

  contact: {
    title: "Let's talk about working together",
    text: "I'm open to remote work and relocation. I enjoy talking with people who care about making useful software and building teams that can keep improving it. If that's the kind of work you're doing, say hello.",
  },
};
