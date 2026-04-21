# timr OpenAPI spec

The timr API is published by [troii Software GmbH](https://www.troii.com) on SwaggerHub. This repo pins a specific version of that spec in [`openapi.json`](../openapi.json) and generates TypeScript types from it.

## Canonical sources

| What | Where |
|------|-------|
| Interactive API docs | <https://app.swaggerhub.com/apis-docs/troii/timr/0.2.13?view=elementsDocs> |
| Current pinned spec (raw JSON) | <https://api.swaggerhub.com/apis/troii/timr/0.2.14> |
| All published versions | <https://app.swaggerhub.com/apis/troii/timr> |
| SwaggerHub API metadata | <https://api.swaggerhub.com/apis/troii/timr> |

## Currently pinned

- **Version:** `0.2.14`
- **OpenAPI:** `3.0.0`
- **Base URL:** `https://api.timr.com/v0.2/`
- **Auth:** Bearer token (`Authorization: Bearer <token>`)
- **Paths:** 48 across 14 resource groups

### Resource groups covered by the spec

`cars`, `drive-log-categories`, `drive-logs`, `holiday-calendars`, `project-times`, `tasks`, `teams`, `users`, `work-schedule-models`, `working-time-date-spans`, `working-time-requests`, `working-time-types`, `working-times`, plus the soft-deleted variants (`...:deleted`).

### CLI coverage

The CLI currently exposes a subset that matches the most common audit workflows:

- `project-times list`
- `tasks list`
- `users list`

Every other resource is still fully typed and reachable through the SDK via `timr.GET("/path", ...)` - the CLI just doesn't wrap it yet. PRs welcome.

## Updating the spec

When troii publishes a new version:

```bash
# 1. Check the latest version number
curl -s https://api.swaggerhub.com/apis/troii/timr | jq '.apis[-1].properties[] | select(.type=="X-Version").value'

# 2. Download it
NEW_VERSION=0.2.15
curl -s "https://api.swaggerhub.com/apis/troii/timr/$NEW_VERSION" -o openapi.json

# 3. Regenerate types
pnpm generate

# 4. Build + typecheck + test to surface breaking changes
pnpm typecheck && pnpm build && pnpm test

# 5. Update the pinned version everywhere
#    - packages/sdk/README.md  (Compatibility table + API reference)
#    - packages/cli/README.md  (if command flags changed)
#    - README.md               (pinned version line, API reference URL)
#    - docs/spec.md            (this file)

# 6. Record a changeset
pnpm changeset
```

Ship the spec bump as its own PR so downstream consumers can diff it cleanly. Mix unrelated changes into separate PRs.

## Disclaimer

The spec is © troii Software GmbH. It is included here under fair use for the purpose of generating a community TypeScript client. "timr" is a trademark of troii Software GmbH. This project is not endorsed by or affiliated with them.
