"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useDocument } from "./DocumentContext";

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder message for empty state
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_MESSAGES: UIMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Ask me about any section and I’ll point to the exact passage and explain it clearly.",
      },
    ],
  },
];

type TextRange = { start: number; end: number };

const CITATION_REGEX = /\[(\d+):(\d+)\]/g;

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function extractCitations(text: string): TextRange[] {
  const ranges: TextRange[] = [];
  for (const match of text.matchAll(CITATION_REGEX)) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
      ranges.push({ start, end });
    }
  }
  return ranges;
}

function stripCitations(text: string): string {
  return text.replace(CITATION_REGEX, "").replace(/\s{2,}/g, " ").trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ChatSidebar() {
  const { state, addHighlight, scrollToHighlight, setFocusedHighlight } =
    useDocument();
  const { content, highlights } = state;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages: outgoingMessages }) => ({
        body: {
          id,
          messages: outgoingMessages,
          document: content,
        },
      }),
    }),
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  // Use placeholder messages if empty
  const displayMessages =
    messages.length > 0 ? messages : PLACEHOLDER_MESSAGES;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  // Auto-resize textarea
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    },
    []
  );

  // Handle send
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    await sendMessage({ text: trimmed });
  }, [input, isLoading, sendMessage]);

  // Handle Enter key (Shift+Enter for new line)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Jump to cited highlight
  const handleJumpToSource = useCallback(
    (range: TextRange) => {
      const existing = highlights.find(
        (highlight) =>
          highlight.start === range.start && highlight.end === range.end
      );

      const highlightId =
        existing?.id ??
        `hl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      if (!existing) {
        addHighlight({
          id: highlightId,
          start: range.start,
          end: range.end,
          color: "blue",
        });
      }

      scrollToHighlight(highlightId);
      setFocusedHighlight(highlightId);
    },
    [addHighlight, highlights, scrollToHighlight, setFocusedHighlight]
  );

  return (
    <div className="flex h-full flex-col p-5 gap-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {displayMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onJumpToSource={handleJumpToSource}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-none">
        <div className="glass flex items-end gap-2 rounded-[var(--radius-xl)] p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows={1}
            className="
              flex-1 resize-none bg-transparent px-2 py-1.5
              text-[15px] text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)]
              focus:outline-none
            "
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="
              flex h-9 w-9 flex-none items-center justify-center
              rounded-full bg-[var(--accent)] text-white
              transition-all duration-150
              hover:opacity-90
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--text-tertiary)]">
          Enter to send • Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: UIMessage;
  onJumpToSource: (range: TextRange) => void;
}

function MessageBubble({ message, onJumpToSource }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const rawText = getMessageText(message);
  const content = stripCitations(rawText);
  const citations = extractCitations(rawText);
  const hasCitations = citations.length > 0;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[90%] rounded-[var(--radius-lg)] px-4 py-2.5
          ${
            isUser
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "glass-subtle border border-[var(--border-light)]"
          }
        `}
      >
        <p
          className={`
            text-[15px] leading-relaxed whitespace-pre-wrap
            ${isUser ? "" : "text-[var(--text-primary)]"}
          `}
        >
          {content}
        </p>

        {/* Citation buttons */}
        {hasCitations && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {citations.map((citation, index) => (
              <button
                key={`${citation.start}-${citation.end}-${index}`}
                onClick={() => onJumpToSource(citation)}
                className="
                  inline-flex items-center gap-1 rounded-full
                  bg-[var(--accent-soft)] px-2.5 py-1
                  text-xs font-medium text-[var(--accent)]
                  transition-all hover:bg-[var(--accent)] hover:text-white
                "
              >
                <JumpIcon />
                Source {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function JumpIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
