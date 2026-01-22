'use client';

import { useState } from 'react';
import { useDocument } from '@/lib/document-context';
import { cn } from '@/lib/utils';
import type { Comment, Highlight } from '@/lib/types';

interface CommentCardProps {
  comment: Comment;
  highlight: Highlight | undefined;
  isActive: boolean;
  onActivate: () => void;
  onResolve: () => void;
  onDelete: () => void;
}

function CommentCard({
  comment,
  highlight,
  isActive,
  onActivate,
  onResolve,
  onDelete,
}: CommentCardProps) {
  const { state, scrollToRange } = useDocument();
  const [showActions, setShowActions] = useState(false);

  // Get the highlighted text excerpt
  const excerpt = highlight
    ? state.document.content.slice(highlight.range.start, highlight.range.end)
    : '';
  const truncatedExcerpt =
    excerpt.length > 50 ? excerpt.slice(0, 50) + '...' : excerpt;

  const handleClick = () => {
    onActivate();
    if (highlight) {
      scrollToRange(highlight.range);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'relative p-4 bg-white rounded-xl border cursor-pointer',
        'transition-all duration-200 hover:shadow-md',
        isActive
          ? 'border-blue-300 shadow-md ring-1 ring-blue-100'
          : 'border-neutral-200 hover:border-neutral-300',
        comment.resolved && 'opacity-60'
      )}
    >
      {/* Excerpt badge */}
      {truncatedExcerpt && (
        <div className="mb-2">
          <span
            className={cn(
              'inline-block px-2 py-1 text-xs rounded-md',
              highlight?.color === 'yellow' && 'bg-yellow-100 text-yellow-800',
              highlight?.color === 'blue' && 'bg-blue-100 text-blue-800',
              highlight?.color === 'green' && 'bg-green-100 text-green-800',
              highlight?.color === 'pink' && 'bg-pink-100 text-pink-800',
              !highlight?.color && 'bg-neutral-100 text-neutral-600'
            )}
          >
            &ldquo;{truncatedExcerpt}&rdquo;
          </span>
        </div>
      )}

      {/* Comment content */}
      <p
        className={cn(
          'text-sm text-neutral-700 leading-relaxed',
          comment.resolved && 'line-through'
        )}
      >
        {comment.content}
      </p>

      {/* Timestamp */}
      <p className="mt-2 text-xs text-neutral-400">
        {new Date(comment.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      {/* Action buttons */}
      <div
        className={cn(
          'absolute top-2 right-2 flex items-center gap-1 transition-opacity',
          showActions ? 'opacity-100' : 'opacity-0'
        )}
      >
        {!comment.resolved && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResolve();
            }}
            className="p-1.5 text-neutral-400 hover:text-green-600 
                       hover:bg-green-50 rounded-md transition-colors"
            title="Resolve"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-neutral-400 hover:text-red-600 
                     hover:bg-red-50 rounded-md transition-colors"
          title="Delete"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Resolved badge */}
      {comment.resolved && (
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 
                           text-xs font-medium text-green-700 bg-green-100 rounded">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Resolved
          </span>
        </div>
      )}
    </div>
  );
}

export function CommentRail() {
  const { state, setActiveHighlight, resolveComment, removeComment } =
    useDocument();
  const { comments, highlights, activeHighlightId } = state.document;

  // Sort comments by position in document
  const sortedComments = [...comments].sort((a, b) => {
    const hlA = highlights.find((h) => h.id === a.highlightId);
    const hlB = highlights.find((h) => h.id === b.highlightId);
    return (hlA?.range.start ?? 0) - (hlB?.range.start ?? 0);
  });

  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="w-72 shrink-0 h-full overflow-hidden flex flex-col 
                    bg-neutral-50/50 border-l border-neutral-200/60">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200/60 bg-white/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">Comments</h3>
          <span className="px-2 py-0.5 text-xs font-medium text-neutral-600 
                           bg-neutral-100 rounded-full">
            {unresolvedCount}
          </span>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sortedComments.map((comment) => {
          const highlight = highlights.find((h) => h.id === comment.highlightId);
          return (
            <CommentCard
              key={comment.id}
              comment={comment}
              highlight={highlight}
              isActive={highlight?.id === activeHighlightId}
              onActivate={() => setActiveHighlight(highlight?.id ?? null)}
              onResolve={() => resolveComment(comment.id)}
              onDelete={() => removeComment(comment.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
