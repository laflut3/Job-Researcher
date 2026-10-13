# Job Researcher

Monorepo for searching jobs, internships, and apprenticeships around the world.

## Development

```sh
pnpm install
pnpm dev
```

The frontend runs on Vite and proxies `/api` requests to the Fastify backend on port 3000.

```sh
pnpm build
pnpm lint
pnpm format
```

## Workspace

- `apps/frontend`: React, Vite, TanStack Router, and Tailwind CSS
- `apps/backend`: Fastify API
- `packages/shared`: types shared between the frontend and backend
