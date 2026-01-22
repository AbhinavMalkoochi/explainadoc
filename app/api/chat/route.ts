import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are an intelligent document assistant. You help users understand documents by:
1. Answering questions about the content
2. Highlighting relevant sections with precise character positions
3. Explaining complex concepts in simple terms
4. Providing citations to support your answers

When referencing text, provide exact character positions in format: [start:end].
If the question has multiple parts, include multiple citations in the order you address them.
Only cite ranges that exist in the provided document.`;

export async function POST(req: Request) {
  const { messages, document }: { messages: UIMessage[]; document?: string } =
    await req.json();

  const system = document
    ? `${SYSTEM_PROMPT}\n\nDocument:\n${document}`
    : `${SYSTEM_PROMPT}\n\nDocument: (none)`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
