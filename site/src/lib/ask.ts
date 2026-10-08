export type Msg = { role: "user" | "assistant"; content: string };

export class AskOffline extends Error {}

/**
 * Client for the assistant. The server side lives in app/api/ask/route.ts —
 * today it returns canned replies (`demo: true`); swap its body for the real
 * LLM call later and nothing in the UI changes.
 */
export async function ask(
  question: string,
  history: Msg[],
  page: string,
): Promise<{ answer: string; demo: boolean }> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, history: history.slice(-6), page }),
  });
  if (res.status === 503) throw new AskOffline();
  if (!res.ok) throw new Error(`ask failed: ${res.status}`);
  const data = (await res.json()) as { answer?: string; demo?: boolean };
  return { answer: data.answer?.trim() || "Sorry, I lost that thought. Try asking again?", demo: !!data.demo };
}
