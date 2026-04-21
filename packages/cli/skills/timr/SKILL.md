---
name: timr
version: 0.1.0
description: "timr time-tracking CLI: query project times, tasks, users, teams, working times, cars, drive logs, holidays, and more. Use when the user asks about timr, time-tracking, tracked hours, project times, task bookings, or wants to audit who booked time in a period."
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
2. Run `timr auth login` and paste them. The CLI verifies and stores them at `~/.config/timr-cli/credentials.json` (mode 600).

Alternative auth sources, checked in this order on every command:

1. `--token <bearer>` / `$TIMR_TOKEN` - static bearer token (skips OAuth)
2. `--client-id` + `--client-secret` (or `$TIMR_CLIENT_ID` + `$TIMR_CLIENT_SECRET`)
3. Stored credentials from `timr auth login`

To reset: `timr auth logout`.

## How to work with the CLI

Every command prints JSON to stdout. Errors go to stderr with a non-zero exit code. Pipe output through `jq`.

### Discover commands

```bash
timr --help                     # list every resource
timr <resource> --help          # list verbs (list, get, create, update, delete, ...)
timr <resource> <verb> --help   # see flags for that verb
```

Conventions (mechanical, derived from the OpenAPI spec):

- `list` / `get` / `create` / `update` / `delete` map to `GET /x`, `GET /x/{id}`, `POST /x`, `PATCH /x/{id}`, `DELETE /x/{id}`
- Sub-resources use `list-<sub>`, `create-<sub>`, `add-<singular>`, `remove-<singular>`
- Mutating commands read the body from `--data '<json>'`, `--data @file.json`, `--data -` (stdin), or piped JSON

### Discover response shapes

**Never guess field names.** Two ways to learn the real shape:

1. Read [`SCHEMA.md`](./SCHEMA.md) next to this file - auto-generated from the pinned OpenAPI spec, lists every resource's fields with types.
2. Ask the API. Example: *"what fields does a User have?"*
   ```bash
   timr users list --limit 1 | jq '.data[0] | keys'
   ```

### Stable invariants you can rely on

Every list endpoint returns `{ data: T[], next_page_token: string | null }`. That's it. Anything below `data[]` must be verified against `SCHEMA.md` or a real response before use.

`ProjectTime.duration` is always present (seconds). That's the one field safe to aggregate blind.

```bash
# Total hours tracked in April
timr project-times list --start-from 2026-04-01 --start-to 2026-04-30 \
  | jq '[.data[].duration] | add / 3600'
```

Anything more specific ("who booked nothing", "CSV export", "group by task") - read `SCHEMA.md` first, then build the `jq` query.

## Pagination

The API uses opaque page tokens. For queries that need everything, loop using `next_page_token`. For quick look-ups, `--limit 500` (the max) is usually enough.

```bash
# pagination pattern
token=""
while :; do
  resp=$(timr project-times list --limit 500 ${token:+--page-token "$token"})
  echo "$resp" | jq '.data[]'
  token=$(echo "$resp" | jq -r '.next_page_token // empty')
  [ -z "$token" ] && break
done
```

## Reconciling against Jira / Linear / GitHub

The CLI stays tracker-agnostic. Typical flow:

1. Pull tracked hours: `timr project-times list --start-from ... > timr.json`
2. Pull issues: e.g. `acli jira workitem search --jql "..." --output json > issues.json`
3. Match via `jq`. The `notes` field on a ProjectTime (see `SCHEMA.md`) often contains the issue key.

## Errors

| Exit | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error on stderr (bad args, network, 4xx/5xx, token exchange failure) |
| `2` | Not authenticated - run `timr auth login` |

On 401 the OAuth token was rejected (credentials may have been rotated) - re-run `timr auth login`. On 403 the client lacks scope for that resource. Tell the user which it is rather than retrying.

## Things to avoid

- **Do not hardcode field names from examples.** Read `SCHEMA.md` or inspect a real response first. Field names like `user.fullname` (not `user.name`) and `task.name` (not `task.title`) are easy to get wrong.
- Do not hit the API in a loop without pagination. Respect rate limits.
- Do not log the `client_secret` or access token.
- Do not edit or delete project times without explicit user confirmation - they are usually invoice-relevant.

## Reference

- Field reference: [`SCHEMA.md`](./SCHEMA.md) (auto-generated)
- API docs: <https://app.swaggerhub.com/apis-docs/troii/timr/0.2.13?view=elementsDocs>
- CLI repo: <https://github.com/michaeljauk/timr-client>
