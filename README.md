# timr-client

A fully typed TypeScript SDK and CLI for the [timr](https://timr.com) time-tracking API. Unofficial, community-maintained.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/michaeljauk)

[![CI](https://github.com/michaeljauk/timr-client/actions/workflows/ci.yml/badge.svg)](https://github.com/michaeljauk/timr-client/actions/workflows/ci.yml)
[![timr-sdk](https://img.shields.io/npm/v/timr-sdk.svg?label=timr-sdk)](https://www.npmjs.com/package/timr-sdk)
[![timr-cli](https://img.shields.io/npm/v/timr-cli.svg?label=timr-cli)](https://www.npmjs.com/package/timr-cli)
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
| [`timr-sdk`](./packages/sdk) | [![npm](https://img.shields.io/npm/v/timr-sdk.svg)](https://www.npmjs.com/package/timr-sdk) | Typed SDK, zero config beyond a bearer token |
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

const timr = createTimrClient({ token: process.env.TIMR_TOKEN! });

const { data } = await timr.GET("/project-times", {
  params: {
    query: {
      start_from: "2026-04-01",
      start_to: "2026-04-30",
      limit: 500,
    },
  },
});

for (const pt of data?.items ?? []) {
  console.log(pt.start, pt.task?.name, pt.duration);
}
```

Every request, response, and query parameter is typed - hover any field in your editor to see what the API returns.

See the [SDK README](./packages/sdk/README.md) for auth options, custom fetch, and error handling.

## CLI quickstart

```bash
pnpm dlx timr-cli --help
```

```bash
export TIMR_TOKEN=your-bearer-token

# All project times for April
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30

# Only one team member, piped through jq for a compact summary
timr project-times list --users alice_user_id --start-from 2026-04-01 \
  | jq '.items[] | {date: .start[:10], task: .task.name, hours: (.duration / 3600)}'

# Find all bookable tasks that match a name
timr tasks list --name "NetCero" --bookable
```

See the [CLI README](./packages/cli/README.md) for the full command reference.

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
pnpm generate      # regenerate types from openapi.json
pnpm build
pnpm test
pnpm typecheck
```

Requires Node 20+ and pnpm 10+. Turborepo orchestrates workspace tasks.

### Updating the spec

```bash
curl -s "https://api.swaggerhub.com/apis/troii/timr/<version>" -o openapi.json
pnpm generate
pnpm build
pnpm changeset     # record the bump
```

### Project layout

```
timr-client/
├── openapi.json              # pinned timr spec
├── packages/
│   ├── sdk/                  # timr-sdk
│   │   ├── src/
│   │   │   ├── client.ts     # hand-written wrapper
│   │   │   ├── generated.ts  # types (generated, do not edit)
│   │   │   └── index.ts      # public surface
│   │   └── test/
│   └── cli/                  # timr-cli
│       └── src/
│           ├── index.ts      # citty entry
│           ├── context.ts    # auth + output helpers
│           └── commands/
└── .changeset/               # release notes in flight
```

## Contributing

Issues and pull requests are welcome. A few ground rules:

- **One changeset per PR** - run `pnpm changeset` before opening
- **Generated code stays generated** - don't hand-edit `packages/sdk/src/generated.ts`
- **Spec drift should be a PR on its own** - bump `openapi.json`, regenerate, and ship that alone so downstream consumers see the diff clearly
- Conventional commits, lowercase subject

## Disclaimer

Unofficial and not affiliated with [troii Software GmbH](https://www.troii.com), the maintainers of timr. "timr" is their trademark.

## Support

Built by [Michael Jauk](https://github.com/michaeljauk). If this saves you time, consider [buying me a coffee](https://buymeacoffee.com/michaeljauk).

## License

[MIT](./LICENSE) © Michael Jauk
