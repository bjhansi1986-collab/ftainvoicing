# FTA Invoice Pro - Agent Instructions

These instructions help coding agents make safe, high-signal edits in this repository.

## Start Here

- Setup and environment: [SETUP.md](../SETUP.md)
- Product and feature overview: [README.md](../README.md)
- Data model source of truth: [prisma/schema.prisma](../prisma/schema.prisma)

## Stack and Core Paths

- Framework: Next.js 14 App Router with TypeScript
- UI: React + Tailwind
- Data model: Prisma + PostgreSQL schema is already defined
- Financial math: Decimal.js utilities in [lib/vat.ts](../lib/vat.ts), [lib/currency.ts](../lib/currency.ts), [lib/formatter.ts](../lib/formatter.ts)
- PDF rendering: [lib/pdf-generator.ts](../lib/pdf-generator.ts)

Key directories:

- API routes: [app/api](../app/api)
- Dashboard UI pages: [app/dashboard](../app/dashboard)
- Database schema: [prisma/schema.prisma](../prisma/schema.prisma)

## Build and Dev Commands

- Install: npm install
- Dev server: npm run dev
- Lint: npm run lint
- Build: npm run build
- Prisma client: npm run prisma:generate
- Prisma migrations: npm run prisma:migrate

## Current Architecture Reality

- Many API routes currently return mock data and comments indicate future Prisma integration.
- Several dashboard flows also include demo fallbacks and use window.location.href after create/save actions.
- The Prisma schema is production-grade, but most route handlers are not yet wired to the DB.

When implementing features, prefer incremental migration from mock handlers to Prisma-backed handlers instead of rewriting large surfaces at once.

## Editing Conventions

- Keep route handlers in App Router style using NextResponse JSON responses with consistent error status codes.
- Preserve existing route structure and URL contracts under [app/api](../app/api).
- For monetary logic, avoid float math in new code; use existing Decimal-based utilities or Prisma Decimal-compatible patterns.
- Keep UAE VAT defaults and wording aligned with utilities in [lib/vat.ts](../lib/vat.ts).
- Keep UI edits consistent with Tailwind utility patterns already used across [app/dashboard](../app/dashboard).

## Common Pitfalls to Avoid

- Do not assume Prisma client wiring already exists in API routes.
- Do not mix number arithmetic with Decimal results in financial totals.
- Do not change schema field meanings casually; invoice/payment state fields are referenced by UI filters and badges.
- Do not duplicate setup or architecture docs in new instruction files; link to existing docs instead.

## Preferred Work Pattern for Agents

1. Read [SETUP.md](../SETUP.md) and [README.md](../README.md) for task context.
2. Inspect the target route/page to verify whether it is mock-backed or DB-backed.
3. If touching financial calculations, validate types and formatting through existing lib helpers.
4. Run npm run lint after edits.
5. If DB schema changed, also run npm run prisma:generate and migration commands as needed.
