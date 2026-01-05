# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (Next.js 16)
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode (Vitest)
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
```

To run a single test file:
```bash
npx vitest run src/lib/utils.test.ts
```

## Architecture

**DezApp** is a knowledge management platform for medical device teams, built with:

- **Next.js 16** with App Router (`src/app/`)
- **Clerk** for authentication (organizations + users)
- **Supabase** for database and storage
- **Sentry** for error monitoring

### Authentication Flow

1. Clerk handles all auth (sign-in/sign-up at `/sign-in`, `/sign-up`)
2. Middleware (`src/middleware.ts`) protects routes using `clerkMiddleware`
3. Clerk webhooks (`src/app/api/webhooks/clerk/route.ts`) sync users and organizations to Supabase
4. Supabase uses `clerk_user_id` and `clerk_org_id` to link records

### Database Schema

Core tables in Supabase (types in `src/types/database.ts`):
- `users` - synced from Clerk via webhooks
- `organizations` - synced from Clerk via webhooks
- `org_members` - organization membership with roles (admin/member/viewer)
- `files` - file metadata with folder organization
- `folders` - hierarchical folder structure
- `notes` - rich content with embeddings for AI search
- `emails` / `email_templates` - email composition

### Supabase Clients

- `createClient()` in `src/lib/supabase/server.ts` - standard server client with cookie-based auth
- `createAdminClient()` - bypasses RLS, used only for webhook operations

### Key Directories

- `src/app/(auth)/` - Auth pages using Clerk components
- `src/app/dashboard/` - Protected dashboard with sidebar layout
- `src/components/ui/` - shadcn/ui components (Radix-based)
- `src/components/shared/` - App-specific shared components

### Path Alias

Use `@/` to import from `src/` (e.g., `@/components/ui/button`)

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only, for admin operations)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `SENTRY_ORG`, `SENTRY_PROJECT` (for error tracking)
