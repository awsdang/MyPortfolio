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
    return "Hi! I'm aws-ai — a small stand-in for Aws while the real model is being wired up. Ask me about a project, his background in architecture, or how to reach him.";
  }
  if (/(contact|email|reach|hire|available|availability|relocat|remote|talk|meet)/.test(q)) {
    return `The quickest way is email: ${PROFILE.email}. ${PROFILE.availability}. You can also open the Contact window from the dock, or find him on LinkedIn (${PROFILE.links.linkedin}).`;
  }
  if (/(architect|unops|anbar|revit|building|before code|thesis)/.test(q)) {
    return `${PROFILE.then}\n\n${PROFILE.between}`;
  }
  if (/(who|about|background|story|yourself|aws)\b/.test(q) && !/project|cardyiq|qi|notifyx/.test(q)) {
    return `${PROFILE.nowText}\n\n${PROFILE.hero.sub}`;
  }
  if (/(cv|resume|résumé)/.test(q)) {
    return "His CV is on the desktop — the Software Engineer CV. It opens as a PDF.";
  }

  // a project the visitor named, or the one they're looking at
  const named =
    allNodes().find((n) => n.kind === "project" && (q.includes(n.name.toLowerCase()) || q.includes(n.id.replace(/-/g, " ")))) ??
    (page && page !== "terminal" ? allNodes().find((n) => n.id === page) : undefined);
  if (named) {
    const c = PROJECTS[named.id];
    if (c) {
      if (/(stack|tech|built with|language|framework)/.test(q) && c.stack?.length) return `${c.name} is built with ${c.stack.join(", ")}.`;
      if (/(result|impact|number|metric|stat|users|scale)/.test(q) && c.stats?.length) {
        return `${c.name}: ${c.stats.map((s) => `${s.value} ${s.label}`).join(" · ")}.`;
      }
      return [c.tagline, c.summary].filter(Boolean).join("\n\n") || `${c.name} — ${named.summary ?? "one of Aws's projects"}.`;
    }
    return `${named.name} — ${named.summary ?? "one of Aws's projects"}. Its page is still being filled in, so I don't have details to share yet.`;
  }

  const chapter = CHAPTERS.find((c) => q.includes(c.id) || q.includes(c.tab.toLowerCase()));
  if (chapter) return `${chapter.title} ${chapter.body}`;

  return "I'm running in demo mode, so I only know a handful of things: what Aws is working on right now, how to reach him, his years in architecture, and each project on the desktop. Try “tell me about NotifyX” or “how do I contact Aws?”";
}
