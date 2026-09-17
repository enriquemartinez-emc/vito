## What this is

Vito is an internal tool for a window shop business (not customer-facing). It has two roles: **Admin** and **Staff**.

Core workflow being built:

1. **Quote generation** — a quote is priced from window type, glass type, height, width, quantity, and a preset per-window-type labor cost.
2. **Order management** — once a customer approves a quote, it becomes an order with an agreed installation date. A declined quote is kept, never deleted (quotes are historic records).
3. Once installed, the order is marked complete.
4. **Customers** and **products** (window types, glass types, pricing) are peripheral CRUD management features.
5. **Inventory** (tracking supplier shipments of glass/window stock and matching quotes against what's on hand to minimize offcut waste). The material-matching logic (best-fit remaining stock for a requested size) is a deterministic cutting-stock/bin-packing problem — a functional core concern.

## Architecture: Functional Core, Imperative Shell + type-driven domain modeling

- `core/` — pure domain types and functions only. No Supabase imports, no `fetch`, no I/O. Model workflow states as closed sum types (e.g. a quote's `draft | pending | approved | declined` states as a discriminated union, not a status enum + optional fields) so invalid transitions don't type-check. Use the **emc-pragmatic-type-driven-domain-modeling** skill when designing or changing these types.
- `src/app/**/actions.ts` (Next.js Server Actions) — the imperative shell. Validates input (Zod), loads/persists via Supabase, delegates all business logic to `core/`. Use the **emc-fcis-nextjs-feature-slice** skill when implementing a feature slice this way.
- `lib/` — cross-cutting utilities and client factories (e.g. Supabase client setup once added).
- Quotes are append-only for history: transitions (approve/decline) must not destructively overwrite a prior quote state.

## Tech stack

- Next.js 16.3 (App Router), React 19, TypeScript (strict mode).
- Shadcn UI (`style: base-nova`, `iconLibrary: lucide`, neutral base color) — components live in `components/ui/`. Add new components with `npx shadcn@latest add <component>`; use the **shadcn** skill for anything involving the registry, theming, or composing UI.
- Tailwind CSS v4 (config lives in `app/globals.css`, no `tailwind.config`).
- Supabase Postgres 18 — Use the **supabase** skill for client/auth/RLS work and the **supabase-postgres-best-practices** skill before writing any schema, migration, or query.
- Path alias: `@/*` resolves to the repo root (see `tsconfig.json`), matching the shadcn `aliases` in `components.json` (`@/components`, `@/lib`, `@/hooks`, `@/components/ui`).
- **vercel-react-best-practices** skill applies to React/Next.js code generally (data fetching, rendering, bundle size).
- **ai-sdk** skill only becomes relevant if/when an AI-assisted feature is added (e.g. a natural-language query tool over inventory/orders) — the core pricing, state-transition, and inventory-matching logic must stay deterministic, not LLM-driven.
- **playwright-cli** skill for exercising the app in a browser — there is no test framework configured in this repo yet (no test script, no Jest/Vitest/Playwright dependency).

## Current state of the codebase

Everything under `app/`, `components/`, `hooks/`, `lib/` right now is unmodified shadcn starter-template boilerplate (a placeholder `app/page.tsx` and an example `app/dashboard` block) — none of it reflects the domain above yet and should be replaced as real features land.

## Commands

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm run start` — run a production build.
- `npm run lint` — ESLint (`eslint-config-next` core-web-vitals + typescript configs).
- `npm run format` — Prettier, writing in place (`**/*.{ts,tsx}`).
- `npm run typecheck` — `tsc --noEmit`.

Formatting is enforced by `.prettierrc`: no semicolons, double quotes, and Tailwind class sorting via `prettier-plugin-tailwindcss` — run `npm run format` rather than hand-formatting.
