# timr OpenAPI spec

The timr REST API is published by [troii Software GmbH](https://www.troii.com) in the timr Developer Portal. This repo pins a specific version of that spec in [`openapi.json`](../openapi.json) and generates TypeScript types from it.

## Canonical sources

| What | Where |
|------|-------|
| Interactive API docs | <https://developer.timr.com/> |
| Current spec (raw YAML) | <https://developer.timr.com/openapi.yaml> |
| Announcement of REST API 1.0 | <https://support.timr.com/hc/en-us/articles/5933193738012-timr-API-Schnittstelle> |

The portal serves only the current version. Older `0.2.x` specs remain on SwaggerHub (`troii/timr`), but the `/v0.2/` API returns 404 since October 2026.

## Currently pinned

- **Version:** `1.0.0`
- **OpenAPI:** `3.0.0`
- **Base URL:** `https://api.timr.com/v1/`
- **Auth:** Bearer token (`Authorization: Bearer <token>`)
- **Paths:** 46 across 12 resource groups (plus their `...:deleted` read-only variants)

### Resource groups covered by the spec

`cars`, `drive-log-categories`, `drive-logs`, `holiday-calendars`, `project-times`, `tasks`, `teams`, `users`, `work-schedule-models`, `working-time-date-spans`, `working-time-types`, `working-times`, plus the soft-deleted variants (`...:deleted`).

`working-time-requests` existed in `0.2.x` and is not part of `1.0.0`.

### CLI coverage

Every resource in the spec gets a generated subcommand — `packages/cli/scripts/generate-commands.mjs` walks `openapi.json` and emits one file per resource under `packages/cli/src/commands/generated/`. Run `timr --help` to see the full surface. The SDK additionally exposes every path via `timr.GET("/path", ...)` with full type coverage.

## Updating the spec

When troii publishes a new version in the Developer Portal:

```bash
# 1. Download the current spec and check its version
curl -s https://developer.timr.com/openapi.yaml -o openapi.yaml
grep -m1 "^  version:" openapi.yaml

# 2. Convert it to JSON (the CLI generator and the MCP server read JSON)
npx -y js-yaml@4.1.1 openapi.yaml > openapi.json && rm openapi.yaml

# 3. Regenerate types
pnpm generate

# 4. Build + typecheck + test to surface breaking changes
pnpm typecheck && pnpm build && pnpm test

# 5. Update the pinned version everywhere
#    - packages/sdk/README.md  (Compatibility table + API reference)
#    - packages/cli/README.md  (if command flags changed)
#    - README.md               (pinned version line, API reference URL)
#    - docs/spec.md            (this file)

# 6. Commit with a conventional-commit subject so Release Please picks it up
#    e.g. feat(sdk): bump spec to 1.1.0
```

Ship the spec bump as its own PR so downstream consumers can diff it cleanly. Mix unrelated changes into separate PRs.

## Disclaimer

The spec is © troii Software GmbH. It is included here under fair use for the purpose of generating a community TypeScript client. "timr" is a trademark of troii Software GmbH. This project is not endorsed by or affiliated with them.
