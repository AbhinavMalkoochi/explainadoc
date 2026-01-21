"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDocument, type ChatMessage } from "./DocumentContext";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data for placeholder UI
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content:
      "Ask me about any section and I’ll point to the exact passage and explain it clearly.",
    createdAt: Date.now() - 60000,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ChatSidebar() {
  const { state, addMessage, scrollToHighlight, setFocusedHighlight } =
    useDocument();
  const { messages, highlights, isLoading } = state;

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Handle send (placeholder: echo back with mock response)
  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    addMessage(userMessage);
    setInput("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Simulate assistant response (placeholder)
    setTimeout(() => {
      const citedIds =
        highlights.length > 0 ? [highlights[0].id] : [];

      const assistantMessage: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        role: "assistant",
        content: `I found relevant information in the document. ${
          citedIds.length > 0
            ? 'Click "Jump to source" to see the highlighted section.'
            : "Try adding some highlights to the document first."
        }`,
        citedHighlightIds: citedIds,
        createdAt: Date.now(),
      };
      addMessage(assistantMessage);
    }, 800);
  }, [input, isLoading, addMessage, highlights]);

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
    (highlightId: string) => {
      scrollToHighlight(highlightId);
      setFocusedHighlight(highlightId);
    },
    [scrollToHighlight, setFocusedHighlight]
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
              text-sm text-[var(--text-primary)]
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
  message: ChatMessage;
  onJumpToSource: (highlightId: string) => void;
}

function MessageBubble({ message, onJumpToSource }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasCitations =
    message.citedHighlightIds && message.citedHighlightIds.length > 0;

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
            text-sm leading-relaxed whitespace-pre-wrap
            ${isUser ? "" : "text-[var(--text-primary)]"}
          `}
        >
          {message.content}
        </p>

        {/* Citation buttons */}
        {hasCitations && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.citedHighlightIds!.map((highlightId, index) => (
              <button
                key={highlightId}
                onClick={() => onJumpToSource(highlightId)}
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
