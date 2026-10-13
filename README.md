<div align="center">
  <h1>🌍 Job Researcher</h1>
  <p><strong>Find early-career opportunities around the world.</strong></p>
  <p>
    <img alt="MIT license" src="https://img.shields.io/badge/license-MIT-blue.svg">
    <img alt="pnpm workspace" src="https://img.shields.io/badge/pnpm-workspace-orange.svg">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ready-blue.svg">
  </p>
</div>

> **Status:** Project scaffold. Job search, source connectors, and database storage are not implemented yet.

Search across configured job sources and filter by keywords, country or location, work arrangement, and job type. Results are intended to appear as cards with a title, short description, and a link to the original listing.

## Design

`Source adapters → normalized PostgreSQL index → Fastify search API → React cards`

- Keep filters in the URL so searches can be bookmarked and shared.
- Normalize listings from multiple providers and retain their original source links.
- Support internships/stages, apprenticeships/alternance, fixed-term (CDD), permanent (CDI), and unknown job types across countries.
- Show remote location restrictions when a source provides them; “remote” does not necessarily mean “work from anywhere.”
- Keep unknown classifications in broad results so missing source metadata does not hide opportunities.
- Index sources on a schedule and search the local database; keep provider credentials and rate limits out of browser requests.
- Start with PostgreSQL filters and language-aware full-text search. Consider `pg_trgm` for typo tolerance before adding a separate search service.
- Coverage depends on source availability, country support, provider credentials, and usage terms. There is no single complete worldwide feed.

## Sources to evaluate

- [Adzuna](https://developer.adzuna.com/overview) for broader country-based search; it requires an app ID and key.
- [Greenhouse](https://docs.greenhouse.io/job-board.html) and [Lever](https://github.com/lever/postings-api) for published employer listings. These are board feeds, so coverage requires a registry of company board IDs; Lever does not provide global full-text search.
- [Ashby](https://developers.ashbyhq.com/reference/jobpostinglist) only with the required `jobsRead` access, and with `listedOnly=true` for public listings.

These are candidates, not working integrations. Check each provider’s terms and regional availability before publishing a connector.

## Stack

**In place:** React, Vite, Tailwind CSS, TanStack Router, Fastify, TypeScript, pnpm, Oxc.

**Planned:** TanStack Query, PostgreSQL, and Drizzle ORM. Consider TypeBox only if Fastify route schemas need shared type inference.

## Development

Requires Node.js and pnpm.

```sh
pnpm install
pnpm dev
```

The frontend runs on Vite and proxies `/api` to the Fastify backend on port `3000`.

```sh
pnpm build
pnpm lint
pnpm format:check
```

## Workspace

- `apps/frontend` — React user interface
- `apps/backend` — Fastify API and, as added, source adapters and persistence
- `packages/shared` — types shared by the applications

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change.
