# timr-cli

Command-line interface for the [timr](https://timr.com) time-tracking API. Built on [`timr-sdk`](../sdk).

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/michaeljauk)

[![npm version](https://img.shields.io/npm/v/timr-cli.svg)](https://www.npmjs.com/package/timr-cli)
[![npm downloads](https://img.shields.io/npm/dm/timr-cli.svg)](https://www.npmjs.com/package/timr-cli)
[![install size](https://packagephobia.com/badge?p=timr-cli)](https://packagephobia.com/result?p=timr-cli)
[![provenance](https://img.shields.io/npm/v/timr-cli.svg?label=provenance&color=2da44e)](https://www.npmjs.com/package/timr-cli?activeTab=code)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

---

Unofficial, community-maintained. Not affiliated with [troii Software GmbH](https://www.troii.com).

## Install

```bash
# One-shot
pnpm dlx timr-cli --help

# Global install
pnpm add -g timr-cli
npm install -g timr-cli
bun add -g timr-cli
```

Requires Node 20+.

### Run from source (contributors)

```bash
git clone https://github.com/michaeljauk/timr-client.git
cd timr-client
pnpm install
pnpm build
node packages/cli/dist/index.js --help

# or symlink as `timr` on your PATH
cd packages/cli && pnpm link --global
timr --help
```

See the [root README](../../README.md#testing-the-cli-locally) for the full local-testing guide.

## Authentication

The timr API uses **OAuth2 `client_credentials`**. Create an OAuth client in timr under `Settings > API Access`, then run:

```bash
timr auth login       # prompts for client_id + client_secret, verifies, stores
timr auth status      # checks current credentials
timr auth logout      # removes stored credentials
```

Credentials are stored at `~/.config/timr-cli/credentials.json` with mode 600.

Alternative sources, checked in this order on every command:

1. `--token <bearer>` or `$TIMR_TOKEN` - static bearer token, skips OAuth
2. `--client-id` + `--client-secret` (or `$TIMR_CLIENT_ID` + `$TIMR_CLIENT_SECRET`)
3. Stored credentials from `timr auth login`

Optional overrides:

- `--token-url <url>` / `$TIMR_TOKEN_URL` - defaults to `https://system.timr.com/id/oauth2/token`
- `--scope <scope>` / `$TIMR_SCOPE` - defaults to `timrclient openid`
- `--base-url <url>` / `$TIMR_BASE_URL` - defaults to `https://api.timr.com/v0.2/`

## Commands

All commands print JSON to stdout. Errors go to stderr with a non-zero exit code.

Run `timr --help` for the full list - every resource in the OpenAPI spec has a matching subcommand (`cars`, `drive-logs`, `holiday-calendars`, `project-times`, `tasks`, `teams`, `users`, `work-schedule-models`, `working-times`, etc.).

Conventions:

- `list` / `get` / `create` / `update` / `delete` map to `GET /x`, `GET /x/{id}`, `POST /x`, `PATCH /x/{id}`, `DELETE /x/{id}`.
- Sub-resources use `list-<sub>`, `create-<sub>`, `add-<singular>`, `remove-<singular>`, etc.
- Mutating commands read the body from `--data '<json>'`, `--data @file.json`, `--data -` (stdin), or piped JSON.

### `timr project-times list`

```bash
timr project-times list \
  --start-from 2026-04-01 \
  --start-to 2026-04-30 \
  [--users alice,bob] \
  [--task task_xyz] \
  [--limit 500]
```

### `timr tasks list`

```bash
timr tasks list \
  [--name "Website"] \
  [--parent-task-id task_root] \
  [--bookable] \
  [--billable] \
  [--limit 500]
```

### `timr users list`

```bash
timr users list \
  [--name michael] \
  [--resigned] \
  [--limit 500]
```

## Response shape

Every list endpoint returns `{ data: T[], next_page_token: string | null }`. The element type `T` is documented in the auto-generated [`skills/timr/SCHEMA.md`](./skills/timr/SCHEMA.md) (shipped with the package). Regenerate it after a spec bump with `pnpm --filter timr-cli generate`.

To inspect a shape live:

```bash
timr users list --limit 1 | jq '.data[0] | keys'
```

## Building queries

The only fields you can assume without checking the schema are `data` (array) and `next_page_token` (string or null). Everything else - including `duration`, which is an object `{ type, minutes, minutes_rounded }` rather than a number - must be read from [`SCHEMA.md`](./skills/timr/SCHEMA.md) or the typed SDK first.

Workflow:

1. Read the resource's section of `SCHEMA.md`.
2. Build the `jq` query against real field paths.
3. Verify with `timr <cmd> --limit 1 | jq '.data[0]'` before running on a full month.

## Environment variables

| Variable | Description |
|----------|-------------|
| `TIMR_TOKEN` | Static bearer token. If set, skips OAuth |
| `TIMR_CLIENT_ID` | OAuth client id |
| `TIMR_CLIENT_SECRET` | OAuth client secret |
| `TIMR_TOKEN_URL` | Override OAuth token endpoint |
| `TIMR_SCOPE` | Override OAuth scope |
| `TIMR_BASE_URL` | Override API base URL |
| `NO_COLOR` | Disable colored output in error messages |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (network, HTTP non-2xx, token exchange failed, bad arguments) |
| `2` | Not authenticated - run `timr auth login` |

## Claude Code skill

A [Claude Code](https://claude.ai/code) skill is bundled and auto-installs to `~/.claude/skills/timr/SKILL.md` on `npm install -g timr-cli`. Once installed, you can ask Claude things like:

- "How many hours did I track last month?"
- "Break down my April hours by task"
- "Who in my team didn't book any time last week?"
- "Export March project times as CSV"

The agent will run the right `timr` commands, pipe the output through `jq`, and return the answer.

Skill source: [`skills/timr/SKILL.md`](./skills/timr/SKILL.md).

## Support

If this CLI saves you time, consider [buying me a coffee](https://buymeacoffee.com/michaeljauk).

## License

MIT © [Michael Jauk](https://github.com/michaeljauk)
