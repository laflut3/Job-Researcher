<div align="center">
  <h1>🌍 fleo-jobs</h1>
  <p><strong>Find early-career opportunities around the world.</strong></p>
  <p>
    <img alt="MIT license" src="https://img.shields.io/badge/license-MIT-blue.svg">
    <img alt="pnpm workspace" src="https://img.shields.io/badge/pnpm-workspace-orange.svg">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ready-blue.svg">
  </p>
</div>

> **Status:** Early MVP. Listings come from Arbeitnow (Europe) and Jobicy (remote, worldwide).

Search live listings by keyword, location, work arrangement, and job type. Each card links to the original posting.

## Design

`Public job API → Fastify adapter → React search and cards`

- Keep filters in the URL so searches can be bookmarked and shared.
- Keep provider-specific mapping in a backend source adapter and retain original links.
- Support internships/stages, apprenticeships/alternance, fixed-term (CDD), permanent (CDI), and unknown job types across countries.
- Show remote location restrictions when a source provides them; “remote” does not necessarily mean “work from anywhere.”
- Keep unknown classifications in broad results so missing source metadata does not hide opportunities.
- No database, paid API key, account, or external search service is required to run the MVP.
- Coverage depends on the public feeds: Jobicy provides remote jobs from the last 7 days; neither feed covers every country or role.

## Cost

Local use and the current public API integration have no service fee. Hosting a public, always-on instance requires a machine or hosting provider; free hosting plans can change and are not guaranteed by this project.

## Stack

React, Vite, Tailwind CSS, shadcn/ui components, TanStack Router and Query, Fastify, TypeScript, pnpm, Oxc.

## Development

Requires Node.js and pnpm.

```sh
pnpm install
pnpm dev
```

The frontend runs on Vite and proxies `/api` to Fastify on port `3000`. Job filters are stored in the URL. Results are cached in memory by TanStack Query and the backend for ten minutes.

### Self-host with Docker

Requires Docker Engine and the Compose plugin on a machine you control:

```sh
docker compose up --build -d
```

Open [http://localhost:8080](http://localhost:8080). This does not require a paid hosting account; a public instance still needs your own internet-connected machine and domain if desired.

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
