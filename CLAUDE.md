# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Initial setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server (Turbopack) at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all Vitest tests
npm run db:reset     # Reset SQLite database (destructive)
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Environment Variables

- `ANTHROPIC_API_KEY` — Optional. Without it, the app uses `MockLanguageModel` which returns demo components.
- `JWT_SECRET` — Defaults to `"development-secret-key"` in dev.

## Architecture

**UIGen** is an AI-powered React component generator. Users chat with Claude, which generates/edits files in a virtual file system, then the browser previews the output in an iframe.

### Key Architectural Decisions

**Virtual File System** (`src/lib/file-system.ts`) — All generated files live in-memory (`VirtualFileSystem` class). No disk writes happen. The serialized state is saved as JSON in the `Project.data` column in SQLite.

**AI Integration** (`src/app/api/chat/route.ts`) — The chat API uses Vercel AI SDK with Anthropic Claude Haiku. The model receives two tools:
- `str_replace` (`src/lib/tools/str-replace.ts`) — creates/edits file content via string replacement
- `file_manager` (`src/lib/tools/file-manager.ts`) — creates/deletes directories and files

Tool calls are streamed to the client and processed by `file-system-context.tsx`, which updates the VFS state. Prompt caching (Anthropic `ephemeral`) is used for cost efficiency.

**Mock Provider** (`src/lib/provider.ts`) — When no API key is set, `MockLanguageModel` simulates multi-step tool calls and returns static demo components (counter, form, card).

**Auth** — JWT sessions via `jose` stored in HTTP-only cookies (7-day expiration). Server actions in `src/actions/` handle sign-up/sign-in with bcrypt. Middleware in `src/middleware.ts` protects routes.

**Data Persistence** — SQLite via Prisma. See `prisma/schema.prisma` for the authoritative schema. Anonymous users can work without signing in; projects are associated with their account on sign-up.

### Data Flow

1. User sends message → `ChatInterface` → `POST /api/chat`
2. API streams response with tool calls back to client
3. `chat-context.tsx` intercepts tool calls, delegates to `file-system-context.tsx`
4. VFS state updates → `PreviewFrame` re-renders the iframe preview
5. On stream completion, the API saves the project state to SQLite

### Directory Map

```
src/
  app/
    api/chat/route.ts       # Main AI chat endpoint
    [projectId]/page.tsx    # Project workspace page
    page.tsx                # Home: redirects or creates first project
  actions/                  # Server actions (auth, project CRUD)
  components/
    auth/                   # Auth modal and forms
    chat/                   # ChatInterface, MessageList, MessageInput
    editor/                 # Monaco CodeEditor, FileTree
    preview/PreviewFrame.tsx # iframe-based live preview
    ui/                     # Radix UI primitives
  lib/
    file-system.ts          # VirtualFileSystem class
    provider.ts             # Claude / Mock model selector
    auth.ts                 # JWT session helpers
    tools/                  # AI tool definitions
    transform/              # JSX transformer for preview
    contexts/               # chat-context, file-system-context
  middleware.ts             # Route protection
prisma/
  schema.prisma             # User + Project models (SQLite)
```

### Testing

Tests use Vitest + jsdom + React Testing Library. Test files live next to source in `__tests__/` subdirectories. The VFS and JSX transformer have pure unit tests; components use RTL.
