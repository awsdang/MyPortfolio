import { CHAPTERS, PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { allNodes } from "@/data/fs";

/**
 * Stand-in for the LLM. Keyword matching over the site's own facts.
 * Replace the body of app/api/ask/route.ts with a real model call later.
 */
export function fakeAnswer(question: string, page?: string): string {
  const q = question.toLowerCase();

  if (/^(hi|hello|hey|yo|salam|marhaba)\b/.test(q)) {
    return "Hi, I can help you find your way around Aws's portfolio. Ask about his work at Qi or Cardy, a product he built himself, or his move from architecture to software.";
  }
  if (/(contact|email|reach|hire|available|availability|relocat|remote|talk|meet)/.test(q)) {
    return `Write to Aws at ${PROFILE.email}. ${PROFILE.availability}. You can also open Write to Aws from the dock or find him on LinkedIn at ${PROFILE.links.linkedin}.`;
  }
  if (/(architect|unops|anbar|revit|building|before code|thesis)/.test(q)) {
    return `Here's how Aws describes his move from architecture to software.\n\n${PROFILE.then}\n\n${PROFILE.between}`;
  }
  if (/(who|about|background|story|yourself|aws)\b/.test(q) && !/project|cardyiq|qi|notifyx/.test(q)) {
    return `Here's how Aws introduces his work today.\n\n${PROFILE.nowText}\n\n${PROFILE.hero.sub}`;
  }
  if (/(cv|resume|résumé)/.test(q)) {
    return "Open the software engineering CV on the desktop to read about Aws's experience, projects and education.";
  }

  // a project the visitor named, or the one they're looking at
  const named =
    allNodes().find((n) => n.kind === "project" && (q.includes(n.name.toLowerCase()) || q.includes(n.id.replace(/-/g, " ")))) ??
    (page && page !== "terminal" ? allNodes().find((n) => n.id === page) : undefined);
  if (named) {
    const c = PROJECTS[named.id];
    if (c) {
      if (/(stack|tech|built with|language|framework)/.test(q) && c.stack?.length) return `${c.name}'s project page lists these technologies.\n\n${c.stack.join(", ")}.`;
      if (/(result|impact|number|metric|stat|users|scale)/.test(q) && c.stats?.length) {
        return `${c.name}: ${c.stats.map((s) => `${s.value} ${s.label}`).join(", ")}.`;
      }
      return `Here's Aws's introduction to ${c.name}.\n\n${[c.tagline, c.summary].filter(Boolean).join("\n\n") || named.summary || "Open the project page to explore the work."}`;
    }
    return `${named.name} is listed in the portfolio. ${named.summary ?? "There isn't a full project story here yet."} Write to Aws if you'd like to know more about his contribution.`;
  }

  const chapter = CHAPTERS.find((c) => q.includes(c.id) || q.includes(c.tab.toLowerCase()));
  if (chapter) return `Here's how Aws describes this part of his work.\n\n${chapter.title}\n\n${chapter.body}`;

  return `I use the information published in this portfolio, and I couldn't find an answer to that question. Try asking about a named project or Aws's background. For anything the portfolio doesn't cover, write to him at ${PROFILE.email}.`;
}
