# Repository instructions

## Project shape and stack

- This repository is a Node.js monorepo managed with pnpm. Keep the frontend, backend, and shared packages in their existing workspace locations and use pnpm workspace commands.
- The frontend uses React, TanStack Router, and Tailwind CSS. Prefer Tailwind utility classes for component styling and keep custom CSS limited to global styles or cases utilities do not cover. Use TanStack Query only when server-state caching, refetching, or synchronization is actually needed; do not add it by default.
- The backend uses Fastify. Preserve Fastify's developer experience: use its plugin and route model, rely on its TypeScript support and schema-based validation/serialization, and keep route handlers straightforward. Avoid wrapping Fastify or rebuilding its request lifecycle with custom abstractions.
- Use Oxc formatting and linting (`oxfmt` and `oxlint`) through the repository's package scripts when available. If scripts are not defined, use the installed tools through pnpm (for example, `pnpm exec oxfmt` and `pnpm exec oxlint`). Do not introduce another formatter or linter without a concrete need.

## Implementation principles

- Keep changes small, direct, and limited to the requested behavior.
- Prefer the simplest implementation that fully solves the task. Do not add layers, wrappers, generic frameworks, configuration, dependencies, or future-proofing without a current use case.
- Use existing platform, framework, and repository capabilities before writing custom helpers.
- Avoid redundant validation, checks, conditionals, null guards, conversions, and fallback paths. Keep checks that protect trust boundaries, enforce real invariants, or prevent data loss and security issues.
- Keep data in its existing shape where practical. Do not create abstractions that only rename or forward calls.
- Add comments only to explain a non-obvious reason that the code itself cannot express.
- Keep frontend state and server state distinct. Use React state for local UI state, TanStack Router for URL/navigation concerns, and TanStack Query for server state only when its behavior is useful.
- In Fastify, define validation and serialization schemas at the route boundary where appropriate; avoid duplicate manual checks for the same schema.
- Shared packages should contain code that is genuinely shared by frontend or backend consumers, not code moved there speculatively.
- Follow the existing workspace conventions and package boundaries. Do not reorganize unrelated code.

## Required skills

- Apply the `ponytail` skill to coding tasks: read the affected code first, identify the complete scope, and make the smallest complete change.
- Apply the `graphify` skill when a Graphify project graph exists or when the task is to create, update, query, or troubleshoot that graph. For architecture or dependency questions, consult the graph first when it is available, then inspect source files for exact implementation details. Do not build a graph solely for a small code change.

## Validation

- Run the narrowest relevant checks for the change, using the package scripts and pnpm workspace filters already defined by the repository.
- Use `oxfmt` and `oxlint` for formatting and linting. Do not add redundant defensive checks or run unrelated validation commands.
- Do not claim that behavior was verified at runtime when only static checks were run. Report checks that could not be run and why.

## Git safety

- Never push to `main`, directly or through a tool, script, or automation. Do not change branch protection or configure automation to push to `main`.
- Never rewrite or otherwise alter Git history. Do not use commands or tools that amend, rebase, reset, filter, replace, or force-update commits or refs (including `--force` and `--force-with-lease`).
- Do not delete or move branches, tags, or commits as a substitute for history editing.
- If a requested operation would require pushing to `main` or changing Git history, stop before that operation and explain the restriction. Ordinary read-only Git inspection and non-history-changing working-tree edits are allowed.
