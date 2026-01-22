"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useDocument, type Highlight } from "./DocumentContext";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TextSegment {
  text: string;
  highlight: Highlight | null;
  start: number;
  end: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits document content into segments, marking highlighted regions.
 * Handles overlapping highlights by taking the first match.
 */
function segmentText(content: string, highlights: Highlight[]): TextSegment[] {
  if (!content) return [];
  if (highlights.length === 0) {
    return [{ text: content, highlight: null, start: 0, end: content.length }];
  }

  // Sort highlights by start position
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const hl of sorted) {
    // Skip invalid or past highlights
    if (hl.start >= content.length || hl.end <= cursor) continue;

    const start = Math.max(hl.start, cursor);
    const end = Math.min(hl.end, content.length);

    // Add plain text before this highlight
    if (start > cursor) {
      segments.push({
        text: content.slice(cursor, start),
        highlight: null,
        start: cursor,
        end: start,
      });
    }

    // Add highlighted segment
    segments.push({
      text: content.slice(start, end),
      highlight: hl,
      start,
      end,
    });

    cursor = end;
  }

  // Add remaining plain text
  if (cursor < content.length) {
    segments.push({
      text: content.slice(cursor),
      highlight: null,
      start: cursor,
      end: content.length,
    });
  }

  return segments;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DocumentViewer() {
  const { state, scrollToHighlight, setFocusedHighlight, setContent } =
    useDocument();
  const {
    content,
    highlights,
    comments,
    scrollToHighlightId,
    focusedHighlightId,
  } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  // Memoize segmented text
  const segments = useMemo(
    () => segmentText(content, highlights),
    [content, highlights]
  );

  // Map comments by highlight id
  const commentsByHighlight = useMemo(() => {
    const map = new Map<string, typeof comments>();
    for (const comment of comments) {
      const existing = map.get(comment.highlightId) || [];
      map.set(comment.highlightId, [...existing, comment]);
    }
    return map;
  }, [comments]);

  // Scroll to highlight when scrollToHighlightId changes
  useEffect(() => {
    if (!scrollToHighlightId) return;

    const el = highlightRefs.current.get(scrollToHighlightId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFocusedHighlight(scrollToHighlightId);

      // Clear scroll target after animation
      const timeout = setTimeout(() => scrollToHighlight(null), 500);
      return () => clearTimeout(timeout);
    }
  }, [scrollToHighlightId, scrollToHighlight, setFocusedHighlight]);

  // Store ref for highlight spans
  const setHighlightRef = useCallback(
    (id: string) => (el: HTMLSpanElement | null) => {
      if (el) {
        highlightRefs.current.set(id, el);
      } else {
        highlightRefs.current.delete(id);
      }
    },
    []
  );

  // Handle highlight click
  const handleHighlightClick = useCallback(
    (highlightId: string) => {
      setFocusedHighlight(
        focusedHighlightId === highlightId ? null : highlightId
      );
    },
    [focusedHighlightId, setFocusedHighlight]
  );

  // Clear focus when clicking outside highlights
  const handleContainerPointerDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-highlight-id]")) return;
      setFocusedHighlight(null);
    },
    [setFocusedHighlight]
  );

  const handleEditableKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        setFocusedHighlight(null);
      }
    },
    [setFocusedHighlight]
  );

  // Handle editable content updates
  const handleContentInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const clone = e.currentTarget.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".comment-popover").forEach((node) => node.remove());
      const text = clone.innerText;
      setContent(text);
    },
    [setContent]
  );

  const isFocusMode = focusedHighlightId !== null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerPointerDown}
      className={`
        relative h-full overflow-y-auto p-8
        ${isFocusMode ? "focus-mode" : ""}
      `}
    >
      {content ? (
        <article className="mx-auto max-w-3xl">
          <div
            className="doc-editable doc-lane whitespace-pre-wrap text-base leading-relaxed text-[var(--text-primary)]"
            contentEditable
            suppressContentEditableWarning
            spellCheck
            onInput={handleContentInput}
            onKeyDown={handleEditableKeyDown}
          >
            {segments.map((segment, index) => {
              if (segment.highlight) {
                const hl = segment.highlight;
                const isFocused = focusedHighlightId === hl.id;
                const segmentComments = commentsByHighlight.get(hl.id) || [];
                const showComment = isFocused && segmentComments.length > 0;

                return (
                  <span
                    key={`${hl.id}-${index}`}
                    className="relative inline-block"
                  >
                    <span
                      ref={setHighlightRef(hl.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHighlightClick(hl.id);
                      }}
                      data-highlight-id={hl.id}
                      className={`
                        doc-segment cursor-pointer transition-all
                        highlight
                        ${hl.color === "blue" ? "highlight--blue" : ""}
                        ${hl.color === "green" ? "highlight--green" : ""}
                        ${isFocused ? "highlight--focused doc-segment--focused" : ""}
                      `}
                    >
                      {segment.text}
                    </span>

                    {showComment && (
                      <span className="comment-popover" contentEditable={false}>
                        {segmentComments.slice(0, 2).map((comment) => (
                          <span key={comment.id} className="comment-popover__item">
                            {comment.text}
                          </span>
                        ))}
                        {segmentComments.length > 2 && (
                          <span className="comment-popover__meta">
                            +{segmentComments.length - 2} more
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                );
              }

              return (
                <span
                  key={`plain-${index}`}
                  className="doc-segment"
                >
                  {segment.text}
                </span>
              );
            })}
          </div>
        </article>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-6xl opacity-20">📄</div>
        <h2 className="mb-2 text-xl font-medium text-[var(--text-primary)]">
          No document loaded
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Paste or upload text to get started
        </p>
      </div>
    </div>
  );
}
