# timr-cli

Command-line interface for the [timr](https://timr.com) time-tracking API.

Unofficial. Built on top of [`timr-sdk`](../sdk).

## Install

```bash
pnpm add -g timr-cli
# or one-shot:
pnpm dlx timr-cli --help
```

## Auth

```bash
export TIMR_TOKEN=your-bearer-token
# optional:
export TIMR_BASE_URL=https://api.timr.com/v0.2/
```

Or pass `--token` on every command.

## Commands

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30
timr project-times list --users alice,bob --limit 500
timr tasks list --name "NetCero" --bookable
timr users list --name michael
```

All commands print JSON to stdout — pipe through `jq` for filtering.

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '.items[] | {task: .task.name, start, end, duration}'
```

## License

MIT © Michael Jauk
