---
name: timr
version: 0.1.0
description: "timr time-tracking CLI: list project times, tasks, users, and reconcile tracked hours against issue trackers. Use when the user asks about timr, time-tracking, tracked hours, project times, task bookings, or wants to audit who booked time in a period."
---

# timr - Time Tracking CLI

Community CLI for the [timr](https://timr.com) time-tracking API. Powered by `timr-cli` and `timr-sdk`.

## Setup check

```bash
timr --help          # verify CLI is installed
echo $TIMR_TOKEN     # verify token is exported
```

If `TIMR_TOKEN` is missing, tell the user to:

1. Open timr, go to `Settings > API Access`, generate a bearer token.
2. Export it: `export TIMR_TOKEN=<token>` (or add to `~/.zshrc` / `~/.config/fish/config.fish`).
3. Optionally `export TIMR_BASE_URL=...` for staging or self-hosted.

Pass `--token <token>` on any command to override.

## Output

Every command prints JSON to stdout. Always pipe through `jq` to extract what the user asked for - never present raw JSON unless they ask for it.

## Commands

### Project times (the main use case)

```bash
# Everything tracked in April 2026
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30

# Only one user, larger page
timr project-times list --users alice_user_id --start-from 2026-04-01 --limit 500

# Only one task
timr project-times list --task task_xyz --start-from 2026-04-01

# Multiple users (comma-separated)
timr project-times list --users alice,bob,carol --start-from 2026-04-01
```

Response shape: `{ items: ProjectTime[], next_page_token?: string }`. A `ProjectTime` has `start`, `end`, `duration` (seconds), `task.name`, `user.name`, `notes`, `billable`, `status`.

### Tasks

```bash
timr tasks list --name "NetCero"            # substring match
timr tasks list --bookable                  # only bookable
timr tasks list --parent-task-id task_root  # children of a specific task
```

### Users

```bash
timr users list --limit 500
timr users list --resigned   # include resigned users
timr users list --name michael
```

## Common questions and the queries that answer them

### "How many hours did I track in April?"

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '[.items[].duration] | add / 3600'
```

### "Break down my hours by task this month"

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '
    [.items[] | {task: .task.name, hours: (.duration / 3600)}]
    | group_by(.task)
    | map({task: .[0].task, hours: (map(.hours) | add | . * 100 | round / 100)})
    | sort_by(-.hours)
  '
```

### "Who in the team didn't book any time last week?"

```bash
# tracked users
timr project-times list --start-from 2026-04-14 --start-to 2026-04-20 \
  | jq '[.items[].user.id] | unique' > /tmp/tracked.json

# all active users
timr users list --limit 500 \
  | jq '[.items[] | select(.resigned == false) | {id, name}]' > /tmp/active.json

# diff
jq -n --slurpfile active /tmp/active.json --slurpfile tracked /tmp/tracked.json '
  $active[0] | map(select(.id as $i | ($tracked[0] | index($i)) | not))
'
```

### "Export last month as CSV for invoicing"

```bash
timr project-times list --start-from 2026-03-01 --start-to 2026-03-31 --limit 1000 \
  | jq -r '
    (["date","user","task","hours","billable","notes"]),
    (.items[] | [.start[:10], .user.name, .task.name, (.duration / 3600), .billable, (.notes // "")])
    | @csv
  ' > march.csv
```

## Reconciling against Jira / Linear / GitHub

The CLI stays tracker-agnostic. For a reconciliation:

1. Pull tracked hours: `timr project-times list --start-from ... > timr.json`
2. Pull issues from the tracker: e.g. `acli jira workitem search --jql "..." --output json > issues.json`
3. Match via `jq`. The `notes` field in a project-time often contains the issue key.

Example: surface project-times whose notes don't mention a Jira key:

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '.items[] | select((.notes // "") | test("[A-Z]+-[0-9]+") | not) | {start, task: .task.name, notes}'
```

## Pagination

The API uses opaque page tokens. For queries that need everything, ask the user if they want to paginate, then loop using `next_page_token`. For quick look-ups, `--limit 500` (the max per call) is usually enough.

## Errors

| Exit | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error - printed to stderr (bad args, network, 4xx/5xx) |

On 401, the token is wrong or expired. On 403, the token lacks scope for that resource. Tell the user which it is and how to fix it rather than retrying.

## Things to avoid

- Do not hit the timr API in a loop without pagination. Respect rate limits.
- Do not log the token. Never include `$TIMR_TOKEN` in output the user will paste elsewhere.
- Do not edit or delete project times without explicit user confirmation - those are usually invoice-relevant.
- Do not invent endpoints. If something is not covered by `timr project-times|tasks|users`, fall back to the SDK or direct `curl` with `Authorization: Bearer $TIMR_TOKEN` against `https://api.timr.com/v0.2/...`.

## Reference

- API docs: <https://app.swaggerhub.com/apis-docs/troii/timr/0.2.13?view=elementsDocs>
- CLI repo: <https://github.com/michaeljauk/timr-client>
