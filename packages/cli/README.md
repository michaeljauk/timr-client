# timr-cli

Command-line interface for the [timr](https://timr.com) time-tracking API. Built on [`timr-sdk`](../sdk).

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/michaeljauk)

[![npm version](https://img.shields.io/npm/v/timr-cli.svg)](https://www.npmjs.com/package/timr-cli)
[![npm downloads](https://img.shields.io/npm/dm/timr-cli.svg)](https://www.npmjs.com/package/timr-cli)
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

## Authentication

```bash
export TIMR_TOKEN=your-bearer-token
# optional, defaults to https://api.timr.com/v0.2/
export TIMR_BASE_URL=https://api.timr.com/v0.2/
```

Or pass `--token <token>` on every command.

> Generate a token in timr under `Settings > API Access`. Treat it like a password.

## Commands

All commands print JSON to stdout. Errors go to stderr with a non-zero exit code.

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
  [--name "NetCero"] \
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

## Recipes

### Total hours tracked in a month

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '[.items[].duration] | add / 3600'
```

### Hours per task

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '
    [.items[] | {task: .task.name, hours: (.duration / 3600)}]
    | group_by(.task)
    | map({task: .[0].task, hours: (map(.hours) | add)})
    | sort_by(-.hours)
  '
```

### Who booked nothing last week?

```bash
# 1. everyone who tracked something
timr project-times list --start-from 2026-04-14 --start-to 2026-04-20 \
  | jq '[.items[].user.id] | unique' > tracked.json

# 2. all active users
timr users list --limit 500 \
  | jq '[.items[] | select(.resigned == false) | .id]' > all.json

# 3. the diff
jq -n --slurpfile a all.json --slurpfile b tracked.json '$a[0] - $b[0]'
```

### Export to CSV

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq -r '
    (["date","user","task","hours","notes"]),
    (.items[] | [.start[:10], .user.name, .task.name, (.duration / 3600), (.notes // "")])
    | @csv
  ' > april.csv
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `TIMR_TOKEN` | Bearer token (required unless passed via `--token`) |
| `TIMR_BASE_URL` | Override API base URL |
| `NO_COLOR` | Disable colored output in error messages |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (network, HTTP non-2xx, or bad arguments) |

## Support

If this CLI saves you time, consider [buying me a coffee](https://buymeacoffee.com/michaeljauk).

## License

MIT © [Michael Jauk](https://github.com/michaeljauk)
