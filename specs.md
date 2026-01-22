# ExplainaDoc - Project Specifications

## Overview

**ExplainaDoc** is an AI-powered document assistant that allows users to upload/paste documents and get intelligent explanations with inline highlights and citations. The application provides a Google Docs-style interface with a document viewer, AI chat sidebar, and comment rail.

**Tech Stack:**
- **Frontend:** Next.js 13.5 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Convex (real-time database, serverless functions, actions)
- **AI:** OpenAI GPT-3.5 Turbo
- **UI Components:** Custom components + Shadcn/ui

---

## Current State

### What's Working

1. **Document Viewer (`components/document-viewer.tsx`)**
   - Text input/paste functionality
   - Edit mode toggle (Edit/Done button)
   - Highlight rendering with color support (yellow, blue, green, pink)
   - Active highlight selection
   - Focused range dimming (non-focused text fades)
   - Scroll-to-range functionality

2. **Chat Sidebar (`components/chat-sidebar.tsx`)**
   - Message display (user/assistant)
   - Loading indicator animation
   - Clear chat functionality
   - Citation buttons that scroll to document sections
   - Enter to send

3. **Comment Rail (`components/comment-rail.tsx`)**
   - Display comments linked to highlights
   - Resolve/delete comment actions
   - Active comment highlighting
   - Scroll to highlight on click
   - Sorted by document position

4. **Convex Integration (`components/convex-chat-provider.tsx`)**
   - Direct Convex action calls (no API routes)
   - Real-time message sync via `useQuery`
   - Optimistic updates for messages
   - Chat archival functionality
   - Chat ID persistence in localStorage

5. **Document Context (`lib/document-context.tsx`)**
   - Centralized state management with useReducer
   - Document state: content, highlights, comments, activeHighlightId, focusedRange
   - Chat state: messages, isLoading
   - Actions for highlights, comments, chat

6. **Convex Backend**
   - `messages.ts`: Create and list messages
   - `chat.ts`: Archive chat functionality
   - `multiModelAI.ts`: OpenAI integration (action)
   - `directMessages.ts`: Save AI responses
   - `schema.ts`: Database schema for messages, modelPreferences, chat_history

---

## Features To Implement

### Priority 1: Core AI Document Analysis

#### 1.1 Real AI Document Analysis (CRITICAL)
**Current State:** The `sendMessage` in `document-context.tsx` uses mock logic (simple keyword matching) instead of actual AI.

**Required Changes:**
- [ ] Connect `ChatSidebar` to use vercel AI SDK currently uses mock `sendMessage` from DocumentContext)
- [ ] Update system prompt in `multiModelAI.ts` to be document-focused (currently weather-themed)
- [ ] Pass document content to AI for context-aware responses
- [ ] Parse AI response to extract citations/text ranges
- [ ] AI should return structured response with:
  - Answer text
  - Citations (start/end positions in document)
  - Confidence score (optional)

**New System Prompt Suggestion:**
```
You are an intelligent document assistant. You help users understand documents by:
1. Answering questions about the content
2. Highlighting relevant sections with precise character positions
3. Explaining complex concepts in simple terms
4. Providing citations to support your answers

When referencing text, provide exact character positions in format: [start:end]
```

#### 1.2 Unified Chat System
**Current State:** Two separate chat systems exist:
- `convex-chat-provider.tsx` - Convex-backed chat (used by `chat.tsx`)
- `document-context.tsx` - Local mock chat (used by `chat-sidebar.tsx`)

**Required Changes:**
- [ ] Decide which chat system to use (recommend: Convex for persistence)
- [ ] Update `ChatSidebar` to use Convex chat provider OR
- [ ] Update DocumentContext to use Convex actions instead of mock logic
- [ ] Remove unused chat component (`components/chat.tsx` vs `components/chat-sidebar.tsx`)

### Priority 2: Document Features

#### 2.1 File Upload Support
**Current State:** Only paste/type text supported

**Required Features:**
- [ ] Drag and drop file upload
- [ ] Support formats: PDF, DOCX, TXT, MD
- [ ] File parsing and text extraction
- [ ] Display file name/metadata
- [ ] Consider using a library like `pdf-parse` or `mammoth` for extraction

#### 2.2 Document Persistence
**Current State:** Document content is only in React state (lost on refresh)

**Required Changes:**
- [ ] Add Convex table for documents
- [ ] Save document content, highlights, comments to Convex
- [ ] Load document on page refresh
- [ ] Document list/history view (optional)

#### 2.3 AI-Generated Highlights
**Current State:** AI mentions it will highlight but uses mock logic

**Required Changes:**
- [ ] AI should return structured citation data
- [ ] Parse AI response for text ranges
- [ ] Automatically create blue highlights for AI citations
- [ ] Link citations to chat messages

### Priority 3: UI/UX Improvements

#### 3.1 Responsive Design
- [ ] Mobile-friendly layout
- [ ] Collapsible sidebar on small screens
- [ ] Touch-friendly interactions

#### 3.2 Keyboard Shortcuts
- [ ] `Cmd/Ctrl + Enter` to send message
- [ ] `Escape` to clear active highlight
- [ ] `Cmd/Ctrl + E` to toggle edit mode

#### 3.3 Loading States
- [ ] Document loading skeleton
- [ ] Better error handling UI
- [ ] Toast notifications for actions

#### 3.4 Dark Mode
- [ ] Theme toggle in header
- [ ] Dark color scheme for all components
- [ ] Persist theme preference

### Priority 4: Advanced Features

#### 4.1 Multi-Document Support
- [ ] Document tabs or list
- [ ] Switch between documents
- [ ] Cross-document search

#### 4.2 Export Features
- [ ] Export highlighted document
- [ ] Export chat history
- [ ] Share document link

#### 4.3 Collaboration (Future)
- [ ] User authentication
- [ ] Share documents with others
- [ ] Real-time collaborative editing

---

## Technical Debt & Cleanup

### Code Quality Issues

1. **Unused Files/Components**
   - [ ] `components/chat.tsx` - May be unused if using `chat-sidebar.tsx`
   - [ ] `convex/openai.ts` and `convex/useOpenAI.ts` - Check if needed
   - [ ] `convex/init.ts` - Review if initialization is required
   - [ ] `app/api/chat/route.ts` - Deprecated, returns 410

2. **Type Safety**
   - [ ] Fix `as any` casts in `convex-chat-provider.tsx`
   - [ ] Properly type message objects
   - [ ] Create shared types for AI responses

3. **Build Issues**
   - [ ] Fix `convex/auth.config.ts` - `AuthConfig` import error
   - [ ] Update or remove auth configuration

4. **Console Logs**
   - [ ] Remove excessive logging in `multiModelAI.ts`
   - [ ] Add proper logging/monitoring solution

### Configuration

1. **Environment Variables**
   - `NEXT_PUBLIC_CONVEX_URL` - Required (set in `.env.local`)
   - `OPENAI_API_KEY` - Required (set in Convex dashboard)
   - `ANTHROPIC_API_KEY` - Optional (for Claude support)
   - `GROK_API_KEY` - Optional (for Grok support)

2. **Convex Setup**
   - [ ] Document proper Convex setup process
   - [ ] Fix auth.config.ts issue
   - [ ] Review and update schema if needed

---

## Database Schema

### Current Tables

```typescript
// messages - Chat messages
{
  content?: string,
  text?: string,
  role: string,
  createdAt?: number,
  userId?: string,
  createdBy?: string,
  chatId?: string,
  complete?: boolean,
  parentId?: string,
  modelPreference?: string,
}

// modelPreferences - AI model preferences per chat
{
  chatId: string,
  model: string,
  lastUpdated: number,
}

// chat_history - Archived messages
{
  originalMessageId: Id<"messages">,
  content?: string,
  text?: string,
  role: string,
  originalCreatedAt?: number,
  userId?: string,
  createdBy?: string,
  chatId?: string,
  parentId?: string,
  modelPreference?: string,
  archiveSessionId: string,
  archivedAt: number,
}
```

### Proposed New Tables

```typescript
// documents - Store uploaded documents
{
  title?: string,
  content: string,
  userId?: string,
  createdAt: number,
  updatedAt: number,
}

// highlights - Store highlights separately (for persistence)
{
  documentId: Id<"documents">,
  range: { start: number, end: number },
  color: string,
  createdAt: number,
  messageId?: Id<"messages">, // Link to AI message that created it
}

// comments - Store comments (for persistence)
{
  documentId: Id<"documents">,
  highlightId: Id<"highlights">,
  content: string,
  createdAt: number,
  resolved: boolean,
}
```

---

## File Structure

```
explainadoc/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main page (DocumentViewer + ChatSidebar + CommentRail)
│   ├── providers.tsx        # Convex provider setup
│   ├── globals.css          # Global styles
│   └── api/chat/route.ts    # [DEPRECATED] Old API route
├── components/
│   ├── chat.tsx             # [REVIEW] Standalone chat component
│   ├── chat-message.tsx     # Chat message rendering
│   ├── chat-sidebar.tsx     # Main chat interface
│   ├── comment-rail.tsx     # Comments panel
│   ├── convex-chat-provider.tsx # Convex chat context
│   ├── document-viewer.tsx  # Main document display
│   ├── navbar.tsx           # Navigation bar
│   ├── footer.tsx           # Footer component
│   └── ui/                  # Shadcn/ui components
├── convex/
│   ├── schema.ts            # Database schema
│   ├── messages.ts          # Message queries/mutations
│   ├── chat.ts              # Chat archival
│   ├── multiModelAI.ts      # AI action (OpenAI)
│   ├── directMessages.ts    # Save AI responses
│   ├── modelPreferences.ts  # Model preference logic
│   └── _generated/          # Auto-generated (DO NOT EDIT)
├── lib/
│   ├── document-context.tsx # Document state management
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
└── hooks/
    └── use-toast.ts         # Toast notification hook
```

---

## Implementation Roadmap

### Phase 1: Fix Core Functionality (1-2 days)
1. [ ] Connect ChatSidebar to Convex chat system
2. [ ] Update AI system prompt for document analysis
3. [ ] Pass document content to AI
4. [ ] Fix build error in auth.config.ts
5. [ ] Clean up unused components

### Phase 2: AI-Powered Analysis (2-3 days)
1. [ ] Implement proper AI response parsing
2. [ ] Extract citations from AI responses
3. [ ] Auto-create highlights from AI citations
4. [ ] Improve AI prompt for better document understanding

### Phase 3: Document Persistence (1-2 days)
1. [ ] Create documents table in Convex
2. [ ] Save/load document state
3. [ ] Persist highlights and comments

### Phase 4: File Upload (2-3 days)
1. [ ] Add file upload UI
2. [ ] Implement file parsing (PDF, DOCX, TXT)
3. [ ] Handle large documents

### Phase 5: Polish & Deploy (1-2 days)
1. [ ] Responsive design fixes
2. [ ] Dark mode
3. [ ] Error handling
4. [ ] Deploy to Vercel

---

## Notes & Decisions

### Design Decisions Made
1. **No user-initiated comments** - Removed manual commenting feature; AI handles all highlights
2. **Direct Convex calls** - Removed API routes in favor of direct Convex action/mutation calls
3. **Simplified state** - Removed localStorage persistence for document state (will use Convex)
4. **Single edit mode** - Toggle between view and edit mode (no inline editing)

### Open Questions
1. Should we keep both chat components or consolidate?
2. How should AI citations be formatted in responses?
3. Should document history be stored or just current document?
4. What file size limits for uploads?

---

## Getting Started

```bash
# Install dependencies
npm install

# Start Convex dev server (in one terminal)
npx convex dev

# Start Next.js dev server (in another terminal)
npm run dev

# Set environment variables
# .env.local: NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
# Convex Dashboard: OPENAI_API_KEY=<your-key>
```

---

*Last Updated: January 21, 2026*
