"use client";

import { useMemo, useCallback } from "react";
import { useDocument, type Comment, type Highlight } from "./DocumentContext";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CommentRail() {
  const { state, scrollToHighlight, setFocusedHighlight } = useDocument();
  const { comments, highlights, focusedHighlightId } = state;

  // Create a map of highlightId -> comment for quick lookup
  const commentsByHighlight = useMemo(() => {
    const map = new Map<string, Comment[]>();
    for (const comment of comments) {
      const existing = map.get(comment.highlightId) || [];
      map.set(comment.highlightId, [...existing, comment]);
    }
    return map;
  }, [comments]);

  // Get highlights that have comments, sorted by position
  const highlightsWithComments = useMemo(() => {
    return highlights
      .filter((h) => commentsByHighlight.has(h.id))
      .sort((a, b) => a.start - b.start);
  }, [highlights, commentsByHighlight]);

  // Handle comment click
  const handleCommentClick = useCallback(
    (highlightId: string) => {
      scrollToHighlight(highlightId);
      setFocusedHighlight(highlightId);
    },
    [scrollToHighlight, setFocusedHighlight]
  );

  if (highlightsWithComments.length === 0) {
    return <EmptyCommentRail />;
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className="mb-2 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Comments
        </h3>
      </div>

      {highlightsWithComments.map((highlight) => {
        const hlComments = commentsByHighlight.get(highlight.id) || [];
        const isFocused = focusedHighlightId === highlight.id;

        return (
          <CommentCard
            key={highlight.id}
            highlight={highlight}
            comments={hlComments}
            isFocused={isFocused}
            onClick={() => handleCommentClick(highlight.id)}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Comment Card
// ─────────────────────────────────────────────────────────────────────────────

interface CommentCardProps {
  highlight: Highlight;
  comments: Comment[];
  isFocused: boolean;
  onClick: () => void;
}

function CommentCard({
  comments,
  isFocused,
  onClick,
}: CommentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-[var(--radius-md)] p-3
        transition-all duration-150
        ${
          isFocused
            ? "glass border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
            : "glass-subtle border border-[var(--border-light)] hover:border-[var(--border-medium)]"
        }
      `}
    >
      {comments.map((comment, index) => (
        <div
          key={comment.id}
          className={index > 0 ? "mt-2 pt-2 border-t border-[var(--border-light)]" : ""}
        >
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {comment.text}
          </p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            {formatTime(comment.createdAt)}
          </p>
        </div>
      ))}

      {/* Visual indicator */}
      <div className="mt-2 flex items-center gap-1 text-xs text-[var(--accent)]">
        <TargetIcon />
        <span>Click to view in document</span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyCommentRail() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-center">
        <p className="text-xs text-[var(--text-secondary)]">
          No comments yet
        </p>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          Ask the AI to add comments
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function TargetIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
