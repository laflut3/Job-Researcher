# Agent instructions

## Tech

- Node.js, TypeScript, pnpm workspaces; Oxfmt and Oxlint.
- Frontend: React, Vite, Tailwind CSS, TanStack Router for URL-backed filters; add TanStack Query for API search and result caching.
- Backend: Fastify with JSON Schema; add TypeBox when schema/type inference is needed.
- Planned data layer: PostgreSQL and Drizzle. Start with PostgreSQL search; add a separate search engine only when measured needs justify it.
- Job sources: provider adapters in the backend; prefer documented public or authorized APIs.

## Skills

- [Ponytail installation](https://github.com/DietrichGebert/ponytail/blob/main/INSTALL.md): use for coding tasks; keep the change minimal and complete.
- [Graphify installation](https://docs.graphify.com/installation): use for codebase mapping and relationship questions when useful. Install for Codex with `uv tool install graphifyy` then `graphify install --platform codex`.

## Rules

- Read affected code first. Make the smallest complete change; avoid speculative layers, dependencies, and duplicate checks.
- Keep UI in `apps/frontend`; keep API, source adapters, and database access in `apps/backend`. Give extracted packages a clear domain name; use `packages/*` only for contracts or domain logic shared by apps.
- Keep search filters shareable in the URL. Fetch and cache job results with TanStack Query; validate API query parameters with Fastify schemas.
- Normalize listings while preserving source ID, source name, original URL, and timestamps. Keep unknown employment or location data as unknown; do not guess. Distinguish remote availability from the countries where remote work is allowed.
- Keep job type separate from work schedule. Support international locations and types such as internship, apprenticeship, fixed-term, permanent, temporary, and unknown; never default results to France.
- Do not discard listings just because a source omits job type or location. Deduplicate by provider ID or canonical URL before using cautious fuzzy matching.
- Do not infer visa sponsorship or work authorization. Preserve unknown values and the source's original type/location text.
- Use source APIs only within their documented access, terms, and rate limits. Keep credentials out of Git; preserve source identity internally and link each card to the original listing. Treat descriptions as untrusted text.
- Run the relevant build, lint, and format checks. Report what was and was not verified.
- Never push to `main` or rewrite Git history. Do not amend, rebase, reset, force-push, or move/delete refs.
