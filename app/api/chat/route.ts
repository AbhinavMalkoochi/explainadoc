import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are an intelligent document assistant. You help users understand documents by:
1. Answering questions about the content
2. Highlighting relevant sections with precise character positions
3. Explaining complex concepts in simple terms
4. Providing citations to support your answers

When referencing text, provide exact character positions in format: [start:end].
If the question has multiple parts, include multiple citations in the order you address them.
Only cite ranges that exist in the provided document.

Use tools to locate exact citation ranges. Prefer tool-assisted ranges over guessing.
If you need to verify a range, call the excerpt tool and compare it to your intended quote.

Critical rule: Every answer about the document MUST include at least one citation in the [start:end] format.
If you cannot find a relevant passage in the document, reply only with: "I can’t find that in the document."`;

type CitationRange = {
  start: number;
  end: number;
  text: string;
};

function findCitationRanges(
  document: string,
  query: string,
  maxResults: number
): CitationRange[] {
  if (!document) return [];
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const ranges: CitationRange[] = [];
  const lowerDoc = document.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();
  let cursor = 0;

  while (cursor < lowerDoc.length && ranges.length < maxResults) {
    const index = lowerDoc.indexOf(lowerQuery, cursor);
    if (index === -1) break;
    const end = index + trimmedQuery.length;
    ranges.push({
      start: index,
      end,
      text: document.slice(index, end),
    });
    cursor = end;
  }

  return ranges;
}

export async function POST(req: Request) {
  const { messages, document }: { messages: UIMessage[]; document?: string } =
    await req.json();
  const safeDocument = document ?? "";

  const system = safeDocument
    ? `${SYSTEM_PROMPT}\n\nDocument:\n${safeDocument}`
    : `${SYSTEM_PROMPT}\n\nDocument: (none)`;

  const tools = {
    findCitationRanges: tool({
      description:
        "Find exact [start:end] positions for a quoted snippet in the document.",
      inputSchema: z.object({
        query: z
          .string()
          .describe("Exact text snippet to locate in the document"),
        maxResults: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe("Maximum number of matches to return"),
      }),
      execute: async ({ query, maxResults }) =>
        findCitationRanges(safeDocument, query, maxResults ?? 5),
    }),
    getDocumentExcerpt: tool({
      description:
        "Return the exact text for a given range to validate citation positions.",
      inputSchema: z.object({
        start: z.number().int().min(0),
        end: z.number().int().min(0),
        padding: z
          .number()
          .int()
          .min(0)
          .max(200)
          .optional()
          .describe("Extra characters to include before and after the range"),
      }),
      execute: async ({ start, end, padding }) => {
        if (!safeDocument) return { start: 0, end: 0, text: "" };
        const pad = padding ?? 0;
        const safeStart = Math.max(0, Math.min(start, safeDocument.length));
        const safeEnd = Math.max(safeStart, Math.min(end, safeDocument.length));
        const excerptStart = Math.max(0, safeStart - pad);
        const excerptEnd = Math.min(safeDocument.length, safeEnd + pad);
        return {
          start: safeStart,
          end: safeEnd,
          text: safeDocument.slice(excerptStart, excerptEnd),
        };
      },
    }),
  };

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  });

  return result.toUIMessageStreamResponse();
}
