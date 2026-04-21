# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, Aider, etc.) working on this repository.

## What this repo is

A pnpm + Turborepo monorepo publishing two npm packages:

- **`timr-sdk`** (`packages/sdk/`) - TypeScript SDK for the [timr](https://timr.com) time-tracking API. Types are **generated** from [`openapi.json`](./openapi.json) using `openapi-typescript`, runtime uses `openapi-fetch`.
- **`timr-cli`** (`packages/cli/`) - Command-line interface built on `citty`, consumes the SDK as a workspace dependency.

Unofficial, MIT, under [github.com/michaeljauk/timr-client](https://github.com/michaeljauk/timr-client).

## Setup

```bash
pnpm install
pnpm generate      # (re)generate src/generated.ts from openapi.json
pnpm build
pnpm test
pnpm typecheck
```

Requires Node 20+ and pnpm 10+. The repo is ESM-only.

## Core conventions

- **No hand-edits to `packages/sdk/src/generated.ts`.** It is regenerated from `openapi.json`. If you need to change something, change the spec or the hand-written `client.ts` wrapper.
- **Commit style:** Conventional Commits, lowercase subject (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`). No `Co-Authored-By` trailers.
- **Changesets:** every user-visible change needs a changeset. Run `pnpm changeset` before opening a PR.
- **No horizontal rules (`---`) or em dashes in code comments.** Regular hyphens only.
- **Keep comments minimal.** Names and types should carry the meaning. Only add a comment when the *why* is non-obvious.
- **No emojis** unless explicitly asked.
- **ESM everywhere.** Use `.js` extensions in relative imports (TypeScript `Bundler` resolution).

## Spec workflow

The canonical timr API reference is <https://app.swaggerhub.com/apis-docs/troii/timr/0.2.13?view=elementsDocs>. The current pinned version in this repo is in [`openapi.json`](./openapi.json).

See [`docs/spec.md`](./docs/spec.md) for the full update procedure. Short version:

```bash
curl -s "https://api.swaggerhub.com/apis/troii/timr/<version>" -o openapi.json
pnpm generate
pnpm typecheck && pnpm build && pnpm test
pnpm changeset
```

Spec bumps ship as their own PR.

## Adding a command to the CLI

1. Create `packages/cli/src/commands/<resource>.ts` exporting a `citty` sub-command tree.
2. Register it in `packages/cli/src/index.ts` under `subCommands`.
3. Pull the client via `resolveClient(args)` from `context.ts`.
4. Output JSON via `printJson(data)`. Do not pretty-print tables - users pipe to `jq`.
5. Add a recipe to `packages/cli/README.md`.
6. Mirror the new command in `packages/cli/skills/timr/SKILL.md` so Claude Code agents know about it.

The SDK auto-generates every endpoint already. If `timr.GET("/new/path", ...)` works in a smoke test, you're good.

## Claude Code skill

`packages/cli/skills/timr/SKILL.md` is bundled into the published `timr-cli` tarball and copied to `~/.claude/skills/timr/` by `packages/cli/scripts/postinstall.js` on `npm install -g`.

- Keep the skill focused on *workflows* (questions to answer, recipes with `jq`), not an endpoint-by-endpoint dump.
- Update the skill whenever you add or rename a CLI command, change flag names, or add env vars.
- Bump the `version:` field in the frontmatter in lockstep with the CLI's `package.json` version.

## Extending the SDK

The SDK surface is intentionally tiny:

- `createTimrClient(options)` returns an `openapi-fetch` client with types from `paths`.
- `TimrError` wraps non-2xx responses.

**Do not add convenience methods that wrap generated endpoints.** They drift, double the maintenance burden, and hide the typed surface. Instead:

- Add middleware for cross-cutting concerns (retry, logging, rate limiting).
- Add pagination helpers that work generically across list endpoints.
- Add small utilities for common shapes (date formatting, duration parsing).

## Testing

- Use `vitest`. Tests live in `packages/<pkg>/test/`.
- Never hit the real timr API from tests. Inject a mock `fetch` into `createTimrClient`.
- Keep tests independent of generated types - assert on observable behavior (headers, URLs, thrown errors), not on generated type internals.

## Release

Releases are automated via the [Changesets GitHub Action](https://github.com/changesets/action). Merging a PR with changesets to `main` opens a "Version Packages" PR. Merging that PR publishes both packages to npm and tags the release.

An `NPM_TOKEN` repo secret is required for publishing. `NPM_CONFIG_PROVENANCE=true` is enabled so releases carry an attestation.

## Scope discipline

This repo ships **only** a generic SDK and CLI for the timr API. Workflows that combine timr data with other systems (Jira reconciliation, time-tracking audits, dashboards) belong in separate repos that depend on `timr-sdk` or shell out to `timr-cli`.

If a PR starts building business logic on top of the API (mapping timr tasks to Jira issues, computing billing rates, sending Slack reports), steer it toward a downstream repo instead.

## Things to avoid

- Re-exporting the entire `generated.ts` from `index.ts`. Only re-export `paths`, `components`, `operations` so tree-shaking stays effective.
- Adding runtime dependencies to the SDK. Target stays at `openapi-fetch` only.
- Heavy CLI frameworks (oclif, yargs). `citty` + `consola` is the line.
- Non-MIT-compatible dependencies.
- Breaking changes without a major (`0.x` minor) bump and a migration note in the changeset.

## When in doubt

Read [`docs/spec.md`](./docs/spec.md), [`README.md`](./README.md), and the existing `packages/sdk/src/client.ts`. Match the style that's already there rather than inventing new patterns.
