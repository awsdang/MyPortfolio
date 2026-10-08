import { NextResponse } from "next/server";
import { fakeAnswer } from "@/lib/fake-ai";

/**
 * Placeholder for the assistant. Same contract the UI already uses:
 *   POST { question, history, page }  →  { answer, demo }
 * To go live: replace the fakeAnswer() call with a real LLM request
 * (return 503 when the model is unavailable — the UI handles it).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { question?: unknown; page?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.slice(0, 500) : "";
  if (!question.trim()) return NextResponse.json({ answer: "" }, { status: 400 });

  await new Promise((r) => setTimeout(r, 650 + Math.random() * 650));
  return NextResponse.json({ answer: fakeAnswer(question, typeof body?.page === "string" ? body.page : undefined), demo: true });
}
