# Repository Guidelines

## Project Structure & Module Organization
- `app/components/dashboard/AdminOverview.tsx`: Single source of truth for the home dashboard. It renders Header + Sidebar, quick actions, observability shortcuts, and activity feed; reuse it for both `/` and `/dashboard`.
- `app/admin/applications`: End-to-end memorial workflow (Zustand `memorialStore`, `ApplicationList`, `ApplicationDetail`). Keep moderation logic here.
- `app/api/applications/**/*`: Server routes that proxy every memorial CRUD request to `MEMORIAL_API_URL`; extend these rather than hitting upstream from the client.
- `middleware.ts`: Guards every `/admin/**` request by checking `auth_token`. Update matchers and redirects whenever you add new admin routes.
- `public/`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`: shared assets and configuration. Mirror any alias or experimental flag changes across these files.

## Build, Test, and Development Commands
- `npm install`: Sync dependencies before any work.
- `npm run dev` / `npm run dev:turbo`: Launch the Next.js dev server (Turbopack for faster refresh). Runs on `http://localhost:3000`.
- `npm run build` (or `build:turbo`): Compile the app for production; fails on type or lint errors.
- `npm run start`: Serve the optimized build locally; use to verify Docker parity.
- `npm run lint`: Executes `next/core-web-vitals` + TypeScript rules; required before pushing.

## Coding Style & Naming Conventions
- TypeScript-first: favor `.tsx` for UI and `.ts` for utilities; avoid default exports.
- Use two-space indentation and group imports (Node/React/local). Client components must include `'use client';` at the top.
- Zustand hooks follow `useThingStore` (e.g., `useMemorialStore`). All other dashboard state is local JSON data now.
- Follow ESLint guidance instead of hand-tuning formatting; Tailwind v4 utility classes belong in `className` strings, not CSS files.

## Testing Guidelines
- No formal suite yet—new features should ship with `*.test.ts` or `*.test.tsx` colocated under `__tests__/` or alongside the component.
- Use Playwright for e2e dashboard flows and Vitest/React Testing Library for units. Target ≥80% statement coverage on touched modules.
- Run `npm run test` (add script when tests exist) before raising a PR and document any skipped cases.

## Commit & Pull Request Guidelines
- Follow the existing convention: `type :: short summary` (e.g., `feat :: simplify admin overview`). Keep messages in present tense.
- One logical change per commit; reference issue IDs in the body when available.
- PRs must include: scope summary, testing evidence (`npm run build`, `npm run lint`, relevant tests), screenshots for UI updates, and rollback considerations.

## Security & Configuration Tips
- Secrets (JWT keys, memorial API tokens) belong in environment variables and should never be committed; sample keys live in deployment tooling, not this repo.
- When updating auth flows, ensure both `middleware.ts` and `/api/auth/verify` enforce the same checks before giving access to admin pages.
- Sidebar observability links now point directly to externally hosted Grafana/Kiali/Prometheus/Kafka UI. Keep those URLs in config constants if they ever need to be environment-specific.
