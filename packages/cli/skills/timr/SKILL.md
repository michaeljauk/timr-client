---
name: timr
version: 0.1.0
description: "timr time-tracking CLI: list project times, tasks, users, and reconcile tracked hours against issue trackers. Use when the user asks about timr, time-tracking, tracked hours, project times, task bookings, or wants to audit who booked time in a period."
---

# timr - Time Tracking CLI

Community CLI for the [timr](https://timr.com) time-tracking API. Powered by `timr-cli` and `timr-sdk`.

## Setup check

```bash
timr --help             # verify CLI is installed
timr auth status        # verify credentials are present and valid
```

If `timr auth status` reports "Not authenticated", tell the user to:

1. Open timr, go to `Settings > API Access` and create an **OAuth client** (client_credentials grant). Copy the `client_id` and `client_secret`.
2. Run `timr auth login` and paste them when prompted. The CLI verifies the credentials and stores them at `~/.config/timr-cli/credentials.json` with mode 600.
3. Optionally pass `--base-url <url>` for staging/self-hosted or `--scope "timrclient openid"` to override the default scope.

Alternative auth sources (checked in this order on every command):

1. `--token <bearer>` / `$TIMR_TOKEN` - static bearer token (skips OAuth entirely)
2. `--client-id` + `--client-secret` / `$TIMR_CLIENT_ID` + `$TIMR_CLIENT_SECRET` - OAuth from env/flags
3. Stored credentials from `timr auth login`

To reset: `timr auth logout`.

## Output

Every command prints JSON to stdout. Always pipe through `jq` to extract what the user asked for - never present raw JSON unless they ask for it.

## Commands

The CLI mirrors the OpenAPI spec. Run `timr --help` to see every resource, and `timr <resource> --help` for its verbs.

Conventions:

- `list` / `get` / `create` / `update` / `delete` map to `GET /x`, `GET /x/{id}`, `POST /x`, `PATCH /x/{id}`, `DELETE /x/{id}`.
- Sub-resources use `list-<sub>`, `create-<sub>`, `add-<singular>`, `remove-<singular>`, etc.
- Mutating commands take the body via `--data '<json>'`, `--data @file.json`, `--data -` (stdin), or piped JSON.

### Project times (the main use case)

```bash
# Everything tracked in April 2026
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30

# Only one user, larger page
timr project-times list --users alice_user_id --start-from 2026-04-01 --limit 500

# Only one task
timr project-times list --task task_xyz --start-from 2026-04-01
```

Response shape: `{ data: ProjectTime[], next_page_token?: string }`. A `ProjectTime` has `start`, `end`, `duration` (seconds), `task.name`, `user.name`, `notes`, `billable`, `status`.

### Tasks and users

```bash
timr tasks list --name "NetCero"
timr tasks list --bookable
timr users list --limit 500
```

### Other resources

`cars`, `drive-logs`, `drive-log-categories`, `holiday-calendars`, `teams`, `work-schedule-models`, `working-times`, `working-time-requests`, `working-time-types`, `working-time-date-spans`. Each follows the same list/get/create/update/delete pattern.

## Common questions and the queries that answer them

### "How many hours did I track in April?"

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '[.data[].duration] | add / 3600'
```

### "Break down my hours by task this month"

```bash
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '
    [.data[] | {task: .task.name, hours: (.duration / 3600)}]
    | group_by(.task)
    | map({task: .[0].task, hours: (map(.hours) | add | . * 100 | round / 100)})
    | sort_by(-.hours)
  '
```

### "Who in the team didn't book any time last week?"

```bash
timr project-times list --start-from 2026-04-14 --start-to 2026-04-20 \
  | jq '[.data[].user.id] | unique' > /tmp/tracked.json

timr users list --limit 500 \
  | jq '[.data[] | select(.resigned == false) | {id, name}]' > /tmp/active.json

jq -n --slurpfile active /tmp/active.json --slurpfile tracked /tmp/tracked.json '
  $active[0] | map(select(.id as $i | ($tracked[0] | index($i)) | not))
'
```

### "Export last month as CSV for invoicing"

```bash
timr project-times list --start-from 2026-03-01 --start-to 2026-03-31 --limit 1000 \
  | jq -r '
    (["date","user","task","hours","billable","notes"]),
    (.data[] | [.start[:10], .user.name, .task.name, (.duration / 3600), .billable, (.notes // "")])
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
  | jq '.data[] | select((.notes // "") | test("[A-Z]+-[0-9]+") | not) | {start, task: .task.name, notes}'
```

## Pagination

The API uses opaque page tokens. For queries that need everything, ask the user if they want to paginate, then loop using `next_page_token`. For quick look-ups, `--limit 500` (the max per call) is usually enough.

## Errors

| Exit | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error - printed to stderr (bad args, network, 4xx/5xx, token exchange failure) |
| `2` | Not authenticated - run `timr auth login` |

On 401, the OAuth token was rejected - credentials may have been rotated; re-run `timr auth login`. On 403, the client lacks scope for that resource. Tell the user which it is and how to fix it rather than retrying.

## Things to avoid

- Do not hit the timr API in a loop without pagination. Respect rate limits.
- Do not log the `client_secret` or access token. Never include them in output the user will paste elsewhere.
- Do not edit or delete project times without explicit user confirmation - those are usually invoice-relevant.
- Do not invent endpoints. If something is not covered by a subcommand, fall back to the SDK.

## Reference

- API docs: <https://app.swaggerhub.com/apis-docs/troii/timr/0.2.13?view=elementsDocs>
- CLI repo: <https://github.com/michaeljauk/timr-client>
