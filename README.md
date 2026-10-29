# timr-client

A typed TypeScript SDK, CLI, and MCP server for the [timr](https://timr.com) time-tracking API. Unofficial, community-maintained.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/michaeljauk)

[![CI](https://github.com/michaeljauk/timr-client/actions/workflows/ci.yml/badge.svg)](https://github.com/michaeljauk/timr-client/actions/workflows/ci.yml)
[![CodeQL](https://github.com/michaeljauk/timr-client/actions/workflows/codeql.yml/badge.svg)](https://github.com/michaeljauk/timr-client/actions/workflows/codeql.yml)
[![timr-sdk](https://img.shields.io/npm/v/timr-sdk.svg?label=timr-sdk)](https://www.npmjs.com/package/timr-sdk)
[![timr-sdk downloads](https://img.shields.io/npm/dm/timr-sdk.svg?label=sdk%20downloads)](https://www.npmjs.com/package/timr-sdk)
[![timr-cli](https://img.shields.io/npm/v/timr-cli.svg?label=timr-cli)](https://www.npmjs.com/package/timr-cli)
[![timr-cli downloads](https://img.shields.io/npm/dm/timr-cli.svg?label=cli%20downloads)](https://www.npmjs.com/package/timr-cli)
[![timr-mcp](https://img.shields.io/npm/v/timr-mcp.svg?label=timr-mcp)](https://www.npmjs.com/package/timr-mcp)
[![timr-mcp downloads](https://img.shields.io/npm/dm/timr-mcp.svg?label=mcp%20downloads)](https://www.npmjs.com/package/timr-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Why

The [timr API](https://developer.timr.com/) has an OpenAPI spec, but timr ships no TypeScript client. This repo adds three packages:

- **`timr-sdk`**: a typed client, generated from the spec. It has one runtime dependency ([`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/)). It is tree-shakeable ESM and runs in Node and edge runtimes.
- **`timr-cli`**: a command-line wrapper for scripts. It prints JSON, so you can pipe the output through `jq`.
- **`timr-mcp`**: a Model Context Protocol (stdio) server for AI agents. It uses Cloudflare-style [Code Mode](https://blog.cloudflare.com/dynamic-workers/): the agent writes JavaScript against the spec instead of calling one tool per endpoint.

Typical use cases:

- Compare tracked hours with an issue tracker (Jira, Linear, GitHub Issues)
- Export project times at month end for invoices or controlling
- Find team members who booked no time in a period
- Send live data to a dashboard or BI tool

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`timr-sdk`](./packages/sdk) | [![npm](https://img.shields.io/npm/v/timr-sdk.svg)](https://www.npmjs.com/package/timr-sdk) | Typed SDK with built-in OAuth (client_credentials) or static bearer token |
| [`timr-cli`](./packages/cli) | [![npm](https://img.shields.io/npm/v/timr-cli.svg)](https://www.npmjs.com/package/timr-cli) | Command-line interface built on the SDK |
| [`timr-mcp`](./packages/mcp) | [![npm](https://img.shields.io/npm/v/timr-mcp.svg)](https://www.npmjs.com/package/timr-mcp) | MCP (stdio) server with Cloudflare-style Code Mode: two tools (`search`, `execute`) instead of one tool for each of the 82 endpoints |

All published packages use timr REST API version **1.0.0**, pinned in [`openapi.json`](./openapi.json).

## API reference

troii documents the timr API in the timr Developer Portal. It is the reference for endpoints, field semantics, and error codes:

- **Interactive docs:** <https://developer.timr.com/>
- **Raw OpenAPI spec (YAML):** <https://developer.timr.com/openapi.yaml>

The SwaggerHub entry `troii/timr` stops at the old `0.2.x` API. Do not use it.

[`docs/spec.md`](./docs/spec.md) tells where the spec comes from and how this repo pins and updates it.

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
  // every field is typed: hover in your editor to see the shape
  console.log(pt.id, pt.duration);
}
```

The SDK types every request, response, and query parameter. Hover a field in your editor to see what the API returns.

The [SDK README](./packages/sdk/README.md) covers auth options, custom fetch, and error handling.

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
timr tasks list --name "Website" --bookable
```

Every list endpoint returns `{ data: T[], next_page_token: string | null }`. The generated [`packages/cli/skills/timr/SCHEMA.md`](./packages/cli/skills/timr/SCHEMA.md) lists the fields of `T`. To see them on live data, pipe the output through `jq '.data[0] | keys'`.

The [CLI README](./packages/cli/README.md) lists the commands.

### AI agent integration

Use the option that your agent supports:

- **Claude Code skill.** `timr-cli` contains a skill. A global install (`npm install -g timr-cli`) copies it to `~/.claude/skills/timr/`. In Claude Code, run `/timr` or ask in plain words. Other agents that read the same `SKILL.md` format can use it too.
- **MCP server.** `timr-mcp` gives access to the full API through two Code Mode tools (`search`, `execute`) over stdio. Add it with `claude mcp add --scope user timr npx -- -y timr-mcp`, or point any MCP client at `npx -y timr-mcp`. The [MCP README](./packages/mcp/README.md) covers auth and examples.

---

## Comparing hours with an issue tracker

The CLI was built for this workflow:

```bash
# 1. pull all tracked hours for a period
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 > timr.json

# 2. pull issues from your tracker (Jira, Linear, ...)
acli jira workitem search --jql "updated >= 2026-04-01" --output json > issues.json

# 3. compare them with your own rules
jq -s 'your rules here' timr.json issues.json
```

This repo has no comparison tool, so the SDK stays independent of any tracker. Build your own rules on top of the JSON output.

## Development

```bash
pnpm install
pnpm generate      # regenerate SDK types + CLI commands from openapi.json
pnpm build
pnpm test
pnpm typecheck
```

You need Node 20 or later and pnpm 10 or later. Turborepo runs the workspace tasks.

## Testing the CLI locally

You can run the CLI from the workspace, without a release to npm.

```bash
# 1. install and build the workspace
pnpm install
pnpm build

# 2. run the CLI directly (no global install needed)
node packages/cli/dist/index.js --help
```

To keep the commands short, set an alias for the session:

```bash
alias timr-dev="node $(pwd)/packages/cli/dist/index.js"
timr-dev --help
timr-dev auth login         # stores ~/.config/timr-cli/credentials.json
timr-dev auth status
timr-dev users list --limit 5
timr-dev project-times list --start-from 2026-04-01 --start-to 2026-04-30 | jq '.data | length'
```

Or link it globally:

```bash
cd packages/cli && pnpm link --global     # exposes `timr` on your PATH
timr --help
pnpm unlink --global timr-cli             # remove the link when you are done
```

To rebuild on every file change:

```bash
pnpm --filter timr-cli dev
# in another shell
node packages/cli/dist/index.js --help
```

If you edit `openapi.json`, generate the CLI commands again:

```bash
pnpm --filter timr-cli generate && pnpm build
```

### Authentication for local runs

Local runs use the same auth flow as the published CLI:

1. Create an OAuth client in timr (`Settings > API Access`, grant `client_credentials`, scope `timrclient openid`).
2. Run `timr-dev auth login` and paste the `client_id` and `client_secret`. The CLI requests a token before it saves them, so a wrong secret fails at once.
3. Later commands use the stored credentials and keep the access token in memory.

If you do not want to store credentials:

```bash
# static bearer token for one command
timr-dev --token "eyJ..." users list

# OAuth from environment variables for one command
TIMR_CLIENT_ID=... TIMR_CLIENT_SECRET=... timr-dev users list

# send requests to a different API host (default: https://api.timr.com/v1/)
timr-dev --base-url https://<host>/v1/ users list
```

### Smoke test checklist

```bash
timr-dev auth status                                    # exits 2 until login
timr-dev auth login && timr-dev auth status             # succeeds
timr-dev --help                                         # 12 resources plus auth
timr-dev users list --limit 1 | jq '.data[0] | keys'   # makes a real API call
timr-dev cars list --help                               # shows the generated flags
```

If one of these fails, run `pnpm build` again, then `pnpm -r typecheck`.

### Updating the spec

```bash
curl -s https://developer.timr.com/openapi.yaml -o openapi.yaml
npx -y js-yaml@4.1.1 openapi.yaml > openapi.json && rm openapi.yaml
pnpm generate
pnpm build
```

Commit messages drive the release. `feat(sdk): bump spec to 1.1.0` is enough: Release Please picks it up on the next merge to `main`.

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
│   ├── cli/                  # timr-cli
│   │   ├── scripts/
│   │   │   └── generate-commands.mjs   # emits commands/generated/* from spec
│   │   └── src/
│   │       ├── index.ts      # citty entry
│   │       ├── lib/credentials.ts      # ~/.config/timr-cli/credentials.json
│   │       └── commands/
│   │           ├── _shared.ts          # globalArgs, resolveClient, helpers
│   │           ├── auth.ts             # login / logout / status
│   │           └── generated/          # one file per resource (do not edit)
│   └── mcp/                  # timr-mcp
│       ├── scripts/
│       │   └── copy-spec.mjs           # bundles openapi.json for runtime search
│       └── src/
│           ├── index.ts      # stdio MCP server (openApiMcpServer)
│           ├── executor.ts   # AsyncFunction-based Code Mode executor
│           └── lib/request.ts          # bridges codemode.request → timr-sdk
└── release-please-config.json          # release automation
```

## Contributing

Issues and pull requests are welcome. The rules:

- **Conventional Commits drive releases.** Release Please makes `feat:` a minor release, `fix:` a patch, and `feat!:` a major. A husky `commit-msg` hook runs commitlint locally.
- **Do not edit generated code by hand**, for example `packages/sdk/src/generated.ts`. Change the spec or the generator instead.
- **A spec update gets its own PR.** Bump `openapi.json`, generate again, and ship only that, so consumers see the spec diff on its own.
- Write commit subjects in lowercase.

## Disclaimer

Unofficial and not affiliated with [troii Software GmbH](https://www.troii.com), the maintainers of timr. "timr" is their trademark.

## Support

Built by [Michael Jauk](https://github.com/michaeljauk). If this saves you time, consider
[buying me a coffee](https://buymeacoffee.com/michaeljauk).

## License

[MIT](./LICENSE) © Michael Jauk
