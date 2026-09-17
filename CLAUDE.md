## What this is

Vito is an internal tool for a window shop business (not customer-facing). It has two roles: **Admin** and **Staff**.

Core workflow being built:

1. **Quote generation** — a quote is priced from window type, glass type, height, width, quantity, and a preset per-window-type labor cost.
2. **Order management** — once a customer approves a quote, it becomes an order with an agreed installation date. A declined quote is kept, never deleted (quotes are historic records).
3. Once installed, the order is marked complete.
4. **Customers** and **products** (window types, glass types, pricing) are peripheral CRUD management features.
5. **Inventory** (tracking supplier shipments of glass/window stock and matching quotes against what's on hand to minimize offcut waste). The material-matching logic (best-fit remaining stock for a requested size) is a deterministic cutting-stock/bin-packing problem — a functional core concern.

## Architecture: Functional Core, Imperative Shell + type-driven domain modeling

Follows the **emc-fcis-nextjs-feature-slice** skill's layout, rooted at the repo root (no `src/` wrapper — `tsconfig.json` already maps `@/*` to the root):

```
core/{Feature}/{feature}.types.ts   pure domain types (Zod-inferred discriminated unions)
core/{Feature}/{feature}.rules.ts   pure functions: transitions, pricing, calculations
core/shared/                        cross-feature value types (e.g. Money)
features/{Feature}/repository.ts    database queries only, no business rules
features/{Feature}/actions.ts       'use server'; Zod-parses input, orchestrates repository + core
features/{Feature}/components/      feature-specific UI
lib/db/server.ts                    privileged client (SUPABASE_SECRET_KEY) — every repository.ts uses this
lib/db/client.ts                    browser client (publishable key) — client components only
app/**/page.tsx                     thin routing layer, renders features/* components, no business logic
```

- `core/` must never import from `app/`, `features/`, or `lib/db` — keeps it framework-free and unit-testable in isolation. Use the **emc-pragmatic-type-driven-domain-modeling** skill when designing or changing these types: model mutually exclusive states (e.g. a quote's `draft | pending | approved | declined`) as separate discriminated-union shapes, not a status enum + optional fields, so invalid transitions don't type-check.
- Transition functions in `core/` take the already-narrowed case as input (e.g. `approveQuote(quote: PendingQuote)`); narrowing and error-surfacing happen in `actions.ts`, not inside Core.
- `lib/db/session.ts` (request-scoped client, for "who is this") and `proxy.ts` (session-cookie refresh) are deferred until the Auth task — no reason to scaffold them before there's auth logic to use them.
- Quotes are append-only for history: transitions (approve/decline) must not destructively overwrite a prior quote state.

## Tech stack

- Next.js 16.3 (App Router), React 19, TypeScript (strict mode).
- Shadcn UI (`style: base-nova`, `iconLibrary: lucide`, neutral base color) — components live in `components/ui/`. Add new components with `npx shadcn@latest add <component>`; use the **shadcn** skill for anything involving the registry, theming, or composing UI.
- Tailwind CSS v4 (config lives in `app/globals.css`, no `tailwind.config`).
- Supabase Postgres. The stack was originally specced as Postgres 18, but Supabase's newest supported major version is currently 17 (confirmed against the CLI and changelog as of 2026-09) — `supabase/config.toml` is set to `major_version = 17`; bump it once Supabase adds 18 support. Use the **supabase** skill for client/auth/RLS work and the **supabase-postgres-best-practices** skill before writing any schema, migration, or query.
- Local dev: `npx supabase start` (Docker) runs the local stack; copy its printed values into `.env.local` (see `.env.example`). Prefer the `sb_publishable_*` / `sb_secret_*` keys it prints over the legacy JWT `ANON_KEY`/`SERVICE_ROLE_KEY` pair.
- Path alias: `@/*` resolves to the repo root (see `tsconfig.json`), matching the shadcn `aliases` in `components.json` (`@/components`, `@/lib`, `@/hooks`, `@/components/ui`).
- **vercel-react-best-practices** skill applies to React/Next.js code generally (data fetching, rendering, bundle size).
- **ai-sdk** skill only becomes relevant if/when an AI-assisted feature is added (e.g. a natural-language query tool over inventory/orders) — the core pricing, state-transition, and inventory-matching logic must stay deterministic, not LLM-driven.
- **playwright-cli** skill for a handful of full golden-path browser flows (e.g. create quote → approve → schedule order); not a substitute for the Vitest integration layer below.

## Testing strategy

- **Unit tests** for `core/*.rules.ts` — Vitest, pure functions, no mocks needed. Colocate as `*.test.ts` next to the file under test.
- **Integration tests** for `features/*/actions.ts` + `repository.ts` — also Vitest, but run against the local Supabase stack (`npx supabase start`) rather than a mocked client, so schema/RLS drift shows up in the suite instead of being hidden by a mock.
- **E2E** — Playwright, reserved for a small number of critical full-flow checks, not per-feature coverage.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, and `npm run test` on every PR and on push to `main`.

## Dev workflow

Feature branch → implement + test → PR. Name branches after the tracked issue (e.g. `12-customers-crud`) and reference `Closes #N` in the PR body so merging closes the issue and updates the project board automatically. See the [Vito project board](https://github.com/users/enriquemartinez-emc/projects/2) for the task breakdown and `v1: Core workflow` / `v2: Inventory` milestones.

## Current state of the codebase

`app/`, `components/`, `hooks/` still hold unmodified shadcn starter-template boilerplate (a placeholder `app/page.tsx` and an example `app/dashboard` block) — replace as real features land. `lib/db/{server,client}.ts` and local Supabase (`supabase/`) are set up; `core/`, `features/`, schema/migrations, and domain types don't exist yet.

## Commands

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm run start` — run a production build.
- `npm run lint` — ESLint (`eslint-config-next` core-web-vitals + typescript configs).
- `npm run format` — Prettier, writing in place (`**/*.{ts,tsx}`).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run test` / `npm run test:watch` — Vitest.
- `npx supabase start` / `npx supabase stop` — local Supabase stack (Docker).

Formatting is enforced by `.prettierrc`: no semicolons, double quotes, and Tailwind class sorting via `prettier-plugin-tailwindcss` — run `npm run format` rather than hand-formatting.
