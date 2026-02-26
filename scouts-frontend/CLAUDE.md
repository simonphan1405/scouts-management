# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server at http://localhost:3000
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Architecture

This is a **Next.js 16 App Router** project using TypeScript and Tailwind CSS v4.

**Key conventions:**
- All source code lives under `src/`
- Path alias `@/*` maps to `./src/*` — use this for all internal imports
- Pages and layouts follow Next.js App Router file conventions inside `src/app/`
- `src/app/layout.tsx` is the root layout — it loads Geist/Geist Mono fonts and `globals.css`
- `src/app/globals.css` uses Tailwind v4's `@import "tailwindcss"` syntax (not `@tailwind` directives) and defines CSS custom properties for theming

**Styling:**
- Tailwind CSS v4 via `@tailwindcss/postcss` — config is in `postcss.config.mjs`, no separate `tailwind.config.*` file
- Theme tokens are defined in `globals.css` using `@theme inline` and CSS variables (`--background`, `--foreground`, `--font-sans`, `--font-mono`)
- Dark mode uses `@media (prefers-color-scheme: dark)`

**TypeScript:**
- Strict mode enabled
- `moduleResolution: "bundler"` — use extensionless imports

## Supabase

Uses `@supabase/supabase-js` + `@supabase/ssr` for SSR-safe auth with Next.js App Router.

**Client utilities:**
- `src/lib/supabase/client.ts` — browser client for Client Components (`"use client"`)
- `src/lib/supabase/server.ts` — server client for Server Components, Route Handlers, Server Actions
- `src/middleware.ts` — refreshes auth sessions on every request; must not be removed

**Usage:**
```ts
// Server Component / Route Handler / Server Action
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Client Component
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

**Environment variables** (in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
