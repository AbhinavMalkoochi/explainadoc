"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Highlight {
  id: string;
  start: number;
  end: number;
  color?: string;
}

export interface Comment {
  id: string;
  highlightId: string;
  text: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citedHighlightIds?: string[];
  createdAt: number;
}

export interface DocumentState {
  /** Plain text content of the document */
  content: string;
  /** Highlighted spans in the document */
  highlights: Highlight[];
  /** Comments attached to highlights */
  comments: Comment[];
  /** Chat message history */
  messages: ChatMessage[];
  /** ID of highlight to scroll into view */
  scrollToHighlightId: string | null;
  /** ID of highlight currently in focus (others dimmed) */
  focusedHighlightId: string | null;
  /** Loading state for async operations */
  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

type DocumentAction =
  | { type: "SET_CONTENT"; payload: string }
  | { type: "ADD_HIGHLIGHT"; payload: Highlight }
  | { type: "REMOVE_HIGHLIGHT"; payload: string }
  | { type: "CLEAR_HIGHLIGHTS" }
  | { type: "ADD_COMMENT"; payload: Comment }
  | { type: "REMOVE_COMMENT"; payload: string }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_MESSAGES" }
  | { type: "SCROLL_TO_HIGHLIGHT"; payload: string | null }
  | { type: "SET_FOCUSED_HIGHLIGHT"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

const initialState: DocumentState = {
  content: "",
  highlights: [],
  comments: [],
  messages: [],
  scrollToHighlightId: null,
  focusedHighlightId: null,
  isLoading: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

function documentReducer(
  state: DocumentState,
  action: DocumentAction
): DocumentState {
  switch (action.type) {
    case "SET_CONTENT":
      return { ...state, content: action.payload };

    case "ADD_HIGHLIGHT":
      return {
        ...state,
        highlights: [...state.highlights, action.payload],
      };

    case "REMOVE_HIGHLIGHT":
      return {
        ...state,
        highlights: state.highlights.filter((h) => h.id !== action.payload),
        comments: state.comments.filter(
          (c) => c.highlightId !== action.payload
        ),
      };

    case "CLEAR_HIGHLIGHTS":
      return { ...state, highlights: [], comments: [] };

    case "ADD_COMMENT":
      return { ...state, comments: [...state.comments, action.payload] };

    case "REMOVE_COMMENT":
      return {
        ...state,
        comments: state.comments.filter((c) => c.id !== action.payload),
      };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };

    case "SCROLL_TO_HIGHLIGHT":
      return { ...state, scrollToHighlightId: action.payload };

    case "SET_FOCUSED_HIGHLIGHT":
      return { ...state, focusedHighlightId: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface DocumentContextValue {
  state: DocumentState;
  dispatch: Dispatch<DocumentAction>;
  /** Convenience helpers */
  setContent: (content: string) => void;
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  addComment: (comment: Comment) => void;
  addMessage: (message: ChatMessage) => void;
  scrollToHighlight: (id: string | null) => void;
  setFocusedHighlight: (id: string | null) => void;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface DocumentProviderProps {
  children: ReactNode;
  initialContent?: string;
}

export function DocumentProvider({
  children,
  initialContent = "",
}: DocumentProviderProps) {
  const [state, dispatch] = useReducer(documentReducer, {
    ...initialState,
    content: initialContent,
  });

  const setContent = useCallback(
    (content: string) => dispatch({ type: "SET_CONTENT", payload: content }),
    []
  );

  const addHighlight = useCallback(
    (highlight: Highlight) =>
      dispatch({ type: "ADD_HIGHLIGHT", payload: highlight }),
    []
  );

  const removeHighlight = useCallback(
    (id: string) => dispatch({ type: "REMOVE_HIGHLIGHT", payload: id }),
    []
  );

  const addComment = useCallback(
    (comment: Comment) => dispatch({ type: "ADD_COMMENT", payload: comment }),
    []
  );

  const addMessage = useCallback(
    (message: ChatMessage) =>
      dispatch({ type: "ADD_MESSAGE", payload: message }),
    []
  );

  const scrollToHighlight = useCallback(
    (id: string | null) =>
      dispatch({ type: "SCROLL_TO_HIGHLIGHT", payload: id }),
    []
  );

  const setFocusedHighlight = useCallback(
    (id: string | null) =>
      dispatch({ type: "SET_FOCUSED_HIGHLIGHT", payload: id }),
    []
  );

  const value: DocumentContextValue = {
    state,
    dispatch,
    setContent,
    addHighlight,
    removeHighlight,
    addComment,
    addMessage,
    scrollToHighlight,
    setFocusedHighlight,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useDocument(): DocumentContextValue {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
}
