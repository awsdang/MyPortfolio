import { fakeAnswer } from "./fake-ai";

export type Msg = { role: "user" | "assistant"; content: string };

export class AskOffline extends Error {}

/**
 * The portfolio guide runs in the browser, using the same published facts as
 * the project pages. GitHub Pages serves static files and has no API server.
 */
export async function ask(
  question: string,
  _history: Msg[],
  page: string,
): Promise<{ answer: string; demo: boolean }> {
  return { answer: fakeAnswer(question.slice(0, 500), page), demo: true };
}
