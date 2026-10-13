# Contributing

Thanks for helping improve Job Researcher. Keep contributions focused on finding and presenting relevant job listings across countries.

## Setup

Use Node.js and pnpm:

```sh
pnpm install
pnpm dev
```

Before opening a pull request, run:

```sh
pnpm format:check
pnpm lint
pnpm build
```

## Project boundaries

- `apps/frontend` owns the interface, URL-backed filters, and API result display.
- `apps/backend` owns HTTP routes, provider adapters, normalization, and persistence.
- Add code to `packages/*` only when it is genuinely shared across applications. Keep provider-specific and database code in the backend unless another consumer needs it.

## Job sources and data

- Prefer documented public APIs or integrations you are authorized to use. Check provider terms, country coverage, credentials, and rate limits before adding a source.
- Keep API keys in local environment variables; never commit secrets.
- Preserve the provider, provider ID, original listing URL, and dates. Map unknown fields to `unknown` instead of guessing.
- Render descriptions as plain text and link to the original listing. Do not expose unpublished listings or bypass access controls.

## Pull requests

Describe the change, affected sources or filters, and the checks you ran. Keep unrelated cleanup out of the change.

Never push to `main` or rewrite Git history. Do not amend, rebase, reset, force-push, or move/delete refs.
