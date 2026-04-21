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
- **Commit style:** Conventional Commits, lowercase subject (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`). Enforced by a husky `commit-msg` hook running commitlint (`@commitlint/config-conventional`) — a non-conforming subject is rejected locally. No `Co-Authored-By` trailers. Commit types drive versioning via Release Please — `feat:` bumps minor, `fix:` bumps patch, `feat!:` or `BREAKING CHANGE:` footer bumps major.
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
```

Spec bumps ship as their own PR.

## CLI commands are generated

The CLI's per-resource commands under `packages/cli/src/commands/generated/` are emitted by `packages/cli/scripts/generate-commands.mjs` from `openapi.json`. Do **not** hand-edit those files. The generator maps:

- `GET /x` -> `list`, `POST /x` -> `create`
- `GET /x/{id}` -> `get`, `PATCH` -> `update`, `PUT` -> `replace`, `DELETE` -> `delete`
- `GET /x:deleted` -> `list-deleted`
- `GET /x/{id}/sub` -> `list-sub`, `PUT /x/{id}/sub/{sid}` -> `add-<singular>`, etc.

Regenerate after a spec bump:

```bash
pnpm --filter timr-cli generate
```

The same command also regenerates `packages/cli/skills/timr/SCHEMA.md` - the flat field reference that the Claude Code skill consults instead of guessing field names. Any hand-written jq recipe with a specific field name is a liability; point agents and users at `SCHEMA.md` or the typed SDK.

Hand-written commands live next to the generated ones:

- `packages/cli/src/commands/auth.ts` - `login` / `logout` / `status` for stored OAuth credentials
- `packages/cli/src/commands/_shared.ts` - `globalArgs`, `resolveClient`, `printJson`, `readBody`, `numOrUndef`, `csv`

If you need to change how *every* command handles flags, bodies, or output, change `_shared.ts` or the generator - never patch generated files.

Output is always JSON via `printJson(data)`. Users pipe to `jq`. Don't pretty-print tables.

When you add or change a generated command's shape, update `packages/cli/skills/timr/SKILL.md` and `packages/cli/README.md` so agents and humans learn about it.

## Claude Code skill

`packages/cli/skills/timr/SKILL.md` is bundled into the published `timr-cli` tarball and copied to `~/.claude/skills/timr/` by `packages/cli/scripts/postinstall.js` on `npm install -g`.

- Keep the skill focused on *workflows* (questions to answer, recipes with `jq`), not an endpoint-by-endpoint dump.
- Update the skill whenever you add or rename a CLI command, change flag names, or add env vars.
- Bump the `version:` field in the frontmatter in lockstep with the CLI's `package.json` version.

## Extending the SDK

The SDK surface is intentionally tiny:

- `createTimrClient(options)` returns an `openapi-fetch` client with types from `paths`. Accepts one of: `{ token }` (static bearer), `{ clientId, clientSecret, tokenUrl?, scope? }` (OAuth2 `client_credentials`), or `{ tokenProvider }` (async `() => Promise<string>` for custom auth).
- `createOAuthTokenProvider(credentials)` is the reusable token provider. In-memory cached with a 60s pre-expiry refresh and inflight deduplication.
- `DEFAULT_TOKEN_URL`, `DEFAULT_SCOPE`, `TimrError` are re-exported.

**Do not add convenience methods that wrap generated endpoints.** They drift, double the maintenance burden, and hide the typed surface. Instead:

- Add middleware for cross-cutting concerns (retry, logging, rate limiting).
- Add pagination helpers that work generically across list endpoints.
- Add small utilities for common shapes (date formatting, duration parsing).

## Testing

- Use `vitest`. Tests live in `packages/<pkg>/test/`.
- Never hit the real timr API from tests. Inject a mock `fetch` into `createTimrClient`.
- Keep tests independent of generated types - assert on observable behavior (headers, URLs, thrown errors), not on generated type internals.

## Release

Releases are automated via [Release Please](https://github.com/googleapis/release-please) in linked-versions mode — both packages always share a version. Pushing conventional commits to `main` opens or updates a release PR with CHANGELOG diffs and version bumps. Merging that PR triggers the publish job, which ships both packages to npm via **OIDC trusted publishing** (no `NPM_TOKEN` — provenance attestation automatic).

An `NPM_TOKEN` repo secret is required for publishing. `NPM_CONFIG_PROVENANCE=true` is enabled so releases carry an attestation.

## Scope discipline

This repo ships **only** a generic SDK and CLI for the timr API. Workflows that combine timr data with other systems (Jira reconciliation, time-tracking audits, dashboards) belong in separate repos that depend on `timr-sdk` or shell out to `timr-cli`.

If a PR starts building business logic on top of the API (mapping timr tasks to Jira issues, computing billing rates, sending Slack reports), steer it toward a downstream repo instead.

## Things to avoid

- Re-exporting the entire `generated.ts` from `index.ts`. Only re-export `paths`, `components`, `operations` so tree-shaking stays effective.
- Adding runtime dependencies to the SDK. Target stays at `openapi-fetch` only.
- Heavy CLI frameworks (oclif, yargs). `citty` + `consola` is the line.
- Non-MIT-compatible dependencies.
- Breaking changes without a `feat!:` / `BREAKING CHANGE:` commit footer so Release Please bumps the right segment.

## When in doubt

Read [`docs/spec.md`](./docs/spec.md), [`README.md`](./README.md), and the existing `packages/sdk/src/client.ts`. Match the style that's already there rather than inventing new patterns.
