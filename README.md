# timr-client

A fully typed TypeScript SDK and CLI for the [timr](https://timr.com) time-tracking API. Unofficial, community-maintained.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/michaeljauk)

[![CI](https://github.com/michaeljauk/timr-client/actions/workflows/ci.yml/badge.svg)](https://github.com/michaeljauk/timr-client/actions/workflows/ci.yml)
[![CodeQL](https://github.com/michaeljauk/timr-client/actions/workflows/codeql.yml/badge.svg)](https://github.com/michaeljauk/timr-client/actions/workflows/codeql.yml)
[![timr-sdk](https://img.shields.io/npm/v/timr-sdk.svg?label=timr-sdk)](https://www.npmjs.com/package/timr-sdk)
[![timr-sdk downloads](https://img.shields.io/npm/dm/timr-sdk.svg?label=sdk%20downloads)](https://www.npmjs.com/package/timr-sdk)
[![timr-cli](https://img.shields.io/npm/v/timr-cli.svg?label=timr-cli)](https://www.npmjs.com/package/timr-cli)
[![timr-cli downloads](https://img.shields.io/npm/dm/timr-cli.svg?label=cli%20downloads)](https://www.npmjs.com/package/timr-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Why

The [timr API](https://app.swaggerhub.com/apis-docs/troii/timr) ships a clean OpenAPI spec but no first-party TypeScript client. This repo fills that gap:

- **`timr-sdk`** - fully typed client generated from the spec. One runtime dependency ([`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/)). Tree-shakeable, ESM, works in Node and edge runtimes.
- **`timr-cli`** - scriptable wrapper for common workflows. Prints JSON so you can pipe through `jq`.

Typical use cases:

- Reconcile tracked hours against an issue tracker (Jira, Linear, GitHub Issues)
- Export month-end project times for invoicing or controlling
- Audit which team members haven't booked time in a given period
- Feed a dashboard or BI tool with live data

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`timr-sdk`](./packages/sdk) | [![npm](https://img.shields.io/npm/v/timr-sdk.svg)](https://www.npmjs.com/package/timr-sdk) | Typed SDK with built-in OAuth (client_credentials) or static bearer token |
| [`timr-cli`](./packages/cli) | [![npm](https://img.shields.io/npm/v/timr-cli.svg)](https://www.npmjs.com/package/timr-cli) | Command-line interface built on the SDK |

Both packages track timr API version **0.2.14** (pinned in [`openapi.json`](./openapi.json)).

## API reference

The timr API is documented by troii on SwaggerHub. Use it as the authoritative reference for endpoints, field semantics, and error codes:

- **Interactive docs:** <https://app.swaggerhub.com/apis-docs/troii/timr/0.2.13?view=elementsDocs>
- **Raw OpenAPI spec (current pinned version):** <https://api.swaggerhub.com/apis/troii/timr/0.2.14>
- **All published versions:** <https://app.swaggerhub.com/apis/troii/timr>

See [`docs/spec.md`](./docs/spec.md) for how the spec is sourced, pinned, and bumped in this repo.

---

## SDK quickstart

```bash
pnpm add timr-sdk
```

```ts
import { createTimrClient } from "timr-sdk";

// OAuth2 client_credentials (recommended)
const timr = createTimrClient({
  clientId: process.env.TIMR_CLIENT_ID!,
  clientSecret: process.env.TIMR_CLIENT_SECRET!,
});

// ...or a static bearer token
// const timr = createTimrClient({ token: process.env.TIMR_TOKEN! });

const { data } = await timr.GET("/project-times", {
  params: {
    query: {
      start_from: "2026-04-01",
      start_to: "2026-04-30",
      limit: 500,
    },
  },
});

for (const pt of data?.data ?? []) {
  // every field is typed - hover in your editor to see the real shape
  console.log(pt.id, pt.duration);
}
```

Every request, response, and query parameter is typed - hover any field in your editor to see what the API returns.

See the [SDK README](./packages/sdk/README.md) for auth options, custom fetch, and error handling.

## CLI quickstart

```bash
pnpm dlx timr-cli --help
```

```bash
# One-time setup: store OAuth client_id + client_secret
timr auth login
timr auth status

# Every resource in the spec has a matching subcommand
timr --help
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30
timr tasks list --name "NetCero" --bookable
```

Every list endpoint returns `{ data: T[], next_page_token: string | null }`. Field names for `T` are documented in the auto-generated [`packages/cli/skills/timr/SCHEMA.md`](./packages/cli/skills/timr/SCHEMA.md) - or inspect live with `jq '.data[0] | keys'`.

See the [CLI README](./packages/cli/README.md) for commands and the [SDK README](./packages/sdk/README.md) for TypeScript usage.

### AI agent integration

A [Claude Code](https://claude.ai/code) skill ships inside the CLI package and auto-installs to `~/.claude/skills/timr/` on `npm install -g timr-cli`. No extra setup needed. Use `/timr` (or just ask naturally) in any Claude Code session and the agent will run commands against your tracked data, reconcile hours, answer "how many hours in April?", and similar.

The skill is also usable with other agent runners that honor the same `SKILL.md` format.

---

## Reconciling against an issue tracker

The typical workflow the CLI was built for:

```bash
# 1. pull all tracked hours for a period
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 > timr.json

# 2. pull issues from your tracker (Jira, Linear, ...)
acli jira workitem search --jql "updated >= 2026-04-01" --output json > issues.json

# 3. diff them with your favourite tool
jq -s 'your rules here' timr.json issues.json
```

A ready-made reconciliation tool is not part of this repo on purpose - this SDK stays tracker-agnostic. Build your own, or watch for a companion repo.

## Development

```bash
pnpm install
pnpm generate      # regenerate SDK types + CLI commands from openapi.json
pnpm build
pnpm test
pnpm typecheck
```

Requires Node 20+ and pnpm 10+. Turborepo orchestrates workspace tasks.

## Testing the CLI locally

Before publishing to npm you can run the CLI straight from the workspace.

```bash
# 1. install + build the workspace
pnpm install
pnpm build

# 2. run the CLI directly (no global install needed)
node packages/cli/dist/index.js --help
```

For convenience, alias it for the session:

```bash
alias timr-dev="node $(pwd)/packages/cli/dist/index.js"
timr-dev --help
timr-dev auth login         # stores ~/.config/timr-cli/credentials.json
timr-dev auth status
timr-dev users list --limit 5
timr-dev project-times list --start-from 2026-04-01 --start-to 2026-04-30 | jq '.data | length'
```

Or symlink it globally:

```bash
cd packages/cli && pnpm link --global     # exposes `timr` on your PATH
timr --help
pnpm unlink --global timr-cli             # undo when you're done
```

Hot-reload during development (rebuilds on every file change):

```bash
pnpm --filter timr-cli dev
# in another shell
node packages/cli/dist/index.js --help
```

Regenerate CLI commands after editing `openapi.json`:

```bash
pnpm --filter timr-cli generate && pnpm build
```

### Authentication for local runs

The CLI auth flow is identical to the published version:

1. Create an OAuth client in timr (`Settings > API Access`, grant `client_credentials`, scope `timrclient openid`).
2. `timr-dev auth login` and paste the `client_id` + `client_secret`. The CLI does a token exchange before saving, so a wrong secret fails fast.
3. Subsequent commands reuse the stored credentials and cache the access token in memory.

Shortcuts if you don't want to store credentials:

```bash
# one-shot static bearer
timr-dev --token "eyJ..." users list

# one-shot OAuth via env
TIMR_CLIENT_ID=... TIMR_CLIENT_SECRET=... timr-dev users list

# target staging or a self-hosted instance
timr-dev --base-url https://api.staging.timr.com/v0.2/ users list
```

### Smoke test checklist

```bash
timr-dev auth status                                    # exits 2 until login
timr-dev auth login && timr-dev auth status             # should succeed
timr-dev --help                                         # 13 resources + auth
timr-dev users list --limit 1 | jq '.data[0] | keys'   # proves a real API call
timr-dev cars list --help                               # proves generated flags
```

If any of those fail, re-run `pnpm build` and check `pnpm -r typecheck`.

### Updating the spec

```bash
curl -s "https://api.swaggerhub.com/apis/troii/timr/<version>" -o openapi.json
pnpm generate
pnpm build
```

The release is driven by the commit messages — `feat(sdk): bump spec to 0.2.15` is enough; Release Please picks it up on the next merge to `main`.

### Project layout

```
timr-client/
├── openapi.json              # pinned timr spec
├── packages/
│   ├── sdk/                  # timr-sdk
│   │   ├── src/
│   │   │   ├── client.ts     # openapi-fetch wrapper + auth middleware
│   │   │   ├── oauth.ts      # client_credentials token provider
│   │   │   ├── generated.ts  # types (generated, do not edit)
│   │   │   └── index.ts      # public surface
│   │   └── test/
│   └── cli/                  # timr-cli
│       ├── scripts/
│       │   └── generate-commands.mjs   # emits commands/generated/* from spec
│       └── src/
│           ├── index.ts      # citty entry
│           ├── lib/credentials.ts      # ~/.config/timr-cli/credentials.json
│           └── commands/
│               ├── _shared.ts          # globalArgs, resolveClient, helpers
│               ├── auth.ts             # login / logout / status
│               └── generated/          # one file per resource (do not edit)
└── release-please-config.json          # release automation
```

## Contributing

Issues and pull requests are welcome. A few ground rules:

- **Conventional Commits drive releases** - `feat:` bumps minor, `fix:` patches, `feat!:` majors (via Release Please). Enforced locally by a `commit-msg` husky hook running commitlint.
- **Generated code stays generated** - don't hand-edit `packages/sdk/src/generated.ts`.
- **Spec drift should be a PR on its own** - bump `openapi.json`, regenerate, and ship that alone so downstream consumers see the diff clearly.
- Lowercase commit subjects.

## Disclaimer

Unofficial and not affiliated with [troii Software GmbH](https://www.troii.com), the maintainers of timr. "timr" is their trademark.

## Support

Built by [Michael Jauk](https://github.com/michaeljauk). If this saves you time, consider [buying me a coffee](https://buymeacoffee.com/michaeljauk).

## License

[MIT](./LICENSE) © Michael Jauk
