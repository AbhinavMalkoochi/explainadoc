"use client";

import { useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import { DocumentProvider, useDocument } from "../components/DocumentContext";
import { DocumentViewer } from "../components/DocumentViewer";
import { ChatSidebar } from "../components/ChatSidebar";

// ─────────────────────────────────────────────────────────────────────────────
// Sample content for demo
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_CONTENT = `Introduction to Calculus

Calculus is the mathematical study of continuous change. It has two major branches: differential calculus and integral calculus.

Differential Calculus

Differential calculus concerns the study of rates of change and slopes of curves. The derivative of a function measures how a function's output changes as its input changes.

The derivative of f(x) at a point x = a is defined as:

f'(a) = lim(h→0) [f(a + h) - f(a)] / h

This limit, if it exists, gives us the instantaneous rate of change of f at the point a.

Basic Derivative Rules

1. Power Rule: If f(x) = x^n, then f'(x) = n·x^(n-1)
2. Constant Rule: If f(x) = c, then f'(x) = 0
3. Sum Rule: (f + g)' = f' + g'
4. Product Rule: (f·g)' = f'·g + f·g'
5. Quotient Rule: (f/g)' = (f'·g - f·g') / g²

Integral Calculus

Integral calculus is concerned with accumulation of quantities and the areas under curves. The integral is the inverse operation of the derivative.

The definite integral of f(x) from a to b is written as:

∫[a to b] f(x) dx

This represents the signed area between the curve y = f(x) and the x-axis, from x = a to x = b.

Fundamental Theorem of Calculus

The Fundamental Theorem of Calculus connects differentiation and integration:

If F is an antiderivative of f on [a, b], then:
∫[a to b] f(x) dx = F(b) - F(a)

This theorem is one of the most important results in mathematics, as it provides a practical way to evaluate definite integrals.

Practice Problems

1. Find the derivative of f(x) = 3x⁴ - 2x² + 5x - 1
2. Evaluate the integral ∫ (2x + 3) dx
3. Find the area under y = x² from x = 0 to x = 2`;

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <DocumentProvider initialContent={SAMPLE_CONTENT}>
      <AppShell />
    </DocumentProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App Shell
// ─────────────────────────────────────────────────────────────────────────────

function AppShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden bg-[var(--background)]">
          <DocumentViewer />
        </main>

        <aside className="flex w-[360px] flex-col border-l border-[var(--border-light)] glass-subtle">
          <ChatSidebar />
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

function Header() {
  const { state, setContent, addHighlight, addComment, dispatch } = useDocument();

  const handleLoadDocument = useCallback(() => {
    const text = prompt("Paste your document text:");
    if (text) {
      dispatch({ type: "RESET" });
      setContent(text);
    }
  }, [dispatch, setContent]);

  const handleAddSampleHighlight = useCallback(() => {
    const content = state.content;
    if (!content) return;

    const searchTerm = "derivative";
    const start = content.toLowerCase().indexOf(searchTerm);
    if (start === -1) return;

    const id = `hl-${Date.now()}`;
    addHighlight({
      id,
      start,
      end: start + searchTerm.length,
      color: "yellow",
    });

    addComment({
      id: `comment-${Date.now()}`,
      highlightId: id,
      text: "The derivative measures the instantaneous rate of change of a function.",
      createdAt: Date.now(),
    });
  }, [state.content, addHighlight, addComment]);

  return (
    <header className="glass sticky top-0 z-20 flex h-14 flex-none items-center justify-between border-b border-[var(--border-light)] px-5">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-[var(--text-primary)]">
            ExplainaDoc
          </h1>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Learning workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleLoadDocument}
          className="
            rounded-[var(--radius-md)] px-3 py-1.5
            text-xs font-medium text-[var(--text-secondary)]
            transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]
          "
        >
          Load Document
        </button>

        <button
          onClick={handleAddSampleHighlight}
          className="
            rounded-[var(--radius-md)] px-3 py-1.5
            text-xs font-medium text-[var(--text-secondary)]
            transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]
          "
        >
          + Demo Highlight
        </button>

        <div className="ml-2 h-6 w-px bg-[var(--border-light)]" />

        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
