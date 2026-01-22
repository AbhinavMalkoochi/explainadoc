'use client';

import { useState, useRef, useEffect } from 'react';
import { useDocument } from '@/lib/document-context';
import { cn } from '@/lib/utils';

export function ChatSidebar() {
  const { state, sendMessage, clearChat, scrollToRange } = useDocument();
  const { messages, isLoading } = state.chat;

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCitationClick = (citation: { start: number; end: number }) => {
    scrollToRange(citation);
  };

  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl border-l border-neutral-200/60">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200/60">
        <div>
          <h2 className="text-sm font-semibold text-neutral-800">Assistant</h2>
          <p className="text-xs text-neutral-500">Ask about your document</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-2 text-neutral-400 hover:text-neutral-600 
                       hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Clear chat"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 
                            flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-sm text-neutral-600 font-medium mb-1">
              How can I help?
            </p>
            <p className="text-xs text-neutral-400 max-w-[200px]">
              Ask questions about your document and I&apos;ll find relevant sections.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5',
                  message.role === 'user'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-100 text-neutral-800'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Citation buttons */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-200/50">
                    <p className="text-xs text-neutral-500 mb-1.5">
                      Referenced sections:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {message.citations.map((citation, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCitationClick(citation)}
                          className="inline-flex items-center gap-1 px-2 py-1 
                                     text-xs font-medium text-blue-600 
                                     bg-blue-50 hover:bg-blue-100 
                                     rounded-md transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                          Jump to text
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <span
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200/60">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your document..."
            rows={1}
            className="w-full px-4 py-3 pr-12 text-sm text-neutral-800 
                       bg-neutral-100/80 border-0 rounded-xl resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20
                       placeholder:text-neutral-400"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 
                       p-2 text-white bg-neutral-800 rounded-lg
                       hover:bg-neutral-700 disabled:opacity-40 
                       disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-400 text-center">
          Press Enter to send
        </p>
      </form>
    </div>
  );
}
