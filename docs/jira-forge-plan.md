# jira-forge — Implementation Plan

Jira Cloud Forge app that syncs developer time from Jira issues to timr. Ships as a 4th package in the `timr-client` monorepo: `packages/jira-forge`.

## Goal

Devs hit **Start** on a Jira issue → running timr project-time entry. Hit **Stop** → entry closed with duration, correct Customer/Aufgabe/Subaufgabe, billable flag, and attributed to the right timr user. Leads configure mappings upfront.

## Verified assumptions (probe run 2026-04-24)

- `POST /project-times` with a shared OAuth2 client_credentials token accepts arbitrary `user_id` → per-user attribution works without per-user OAuth.
- `task_id` on timr represents the Customer/Aufgabe/Subaufgabe hierarchy (flat UUID, tree via `parent_task`).
- `billable: boolean` and `metadata: object` are first-class fields; `metadata` will store `{ jiraIssueKey, jiraAccountId }` for reconciliation.
- `status` enum: use `changeable` for completed entries, `running` for live timers.

## Locked decisions

| Topic | Decision |
|---|---|
| Distribution | Private install (netcero Jira Cloud), not Marketplace |
| Logging UX | Start/Stop timer on issue panel (Clockify/Everhour pattern). No Jira worklog mirroring in MVP. |
| Mapping scope | Project-level defaults + per-issue override |
| Mapping permissions | Jira project admins only (Forge `PROJECT_ADMIN` condition) |
| Billable | Mapping default + per-entry override at Stop |
| timr auth | Shared OAuth2 client_credentials in Forge env vars |
| Attribution | Jira accountId → timr userId link table, `user_id` set on POST |
| Monorepo location | `packages/jira-forge` in `~/tech/timr-client/` |

## Architecture

### Stack
- **Forge** (Atlassian-hosted). Node 20 runtime, ESM-friendly → `timr-sdk` works unchanged.
- **UI Kit 2** (React) for all UI surfaces. No Custom UI iframe.
- `@forge/api` — for product fetch (Jira user lookups).
- `@forge/kvs` — typed key-value storage for mappings, timer state, user links.
- `@forge/resolver` — backend handlers for UI actions.

### Forge modules (`manifest.yml`)

| Module | ID | Purpose |
|---|---|---|
| `jira:issuePanel` | `timr-issue-panel` | Per-issue panel: mapping view, Start/Stop button, today's elapsed, edit mapping (admin-gated) |
| `jira:projectPage` | `timr-project-admin` | Admin: project-level defaults (default task, default billable), issue-key override rules |
| `jira:globalPage` | `timr-global` | "My timr" — today's entries list with edit/delete, link my Jira account → timr user |
| `trigger` (scheduled) | `timr-orphan-cleanup` | Daily: detect timers running > N hours, auto-stop + notify |

Conditions:
- `PROJECT_ADMIN` on the admin page + edit-mapping action
- `CAN_WORK_ON_ISSUES` on the Start/Stop action

### Data model (Forge Storage, `@forge/kvs`)

```ts
// Project-level default mapping (admin sets)
`mapping:project:${projectKey}` -> {
  timrTaskId: string,
  billable: boolean,
  updatedBy: string,   // Jira accountId
  updatedAt: string,   // ISO
}

// Per-issue override (admin sets)
`mapping:issue:${issueKey}` -> {
  timrTaskId: string,
  billable: boolean,
  source: "override",
  updatedBy: string,
  updatedAt: string,
}

// One active timer per Jira user
`timer:user:${jiraAccountId}` -> {
  issueKey: string,
  startedAt: string,         // ISO
  timrEntryId: string,       // id of the running project-time in timr
  snapshotTaskId: string,    // captured at Start — mapping changes won't affect running timer
  snapshotBillable: boolean,
}

// Jira ↔ timr user link (one-time self-service + admin override)
`user:link:${jiraAccountId}` -> {
  timrUserId: string,
  linkedAt: string,
  linkedBy: "self" | "admin",
}

// Cache for task tree (reduce timr round-trips, TTL 10 min)
`cache:timr-tasks` -> { data: TaskPartial[], cachedAt: string }
```

Mapping resolution on Start:
1. Issue override exists? Use it.
2. Project default exists? Use it.
3. Neither? Show "No mapping configured — ask a lead to set one."

### Environment variables (Forge `forge variables set --encrypt`)

```
TIMR_CLIENT_ID
TIMR_CLIENT_SECRET
TIMR_BASE_URL         # optional override
TIMR_TOKEN_URL        # optional override
```

Passed to `createTimrClient` in every resolver. No Forge external-auth flow needed.

### Package structure

```
packages/jira-forge/
  manifest.yml
  package.json
  tsconfig.json
  src/
    index.ts                    # resolver entry, re-exports handlers
    resolvers/
      mapping.ts                # get/set project + issue mappings
      timer.ts                  # start, stop, get-current
      entries.ts                # list today's entries, delete
      user-link.ts              # self-link, admin-link
      admin.ts                  # list tasks for picker, validate task
    lib/
      timr.ts                   # SDK factory (reads env vars)
      permissions.ts            # role check helpers (double-gate)
      mapping.ts                # resolution chain
      timer-state.ts            # KVS helpers for running-timer
    ui/
      issue-panel/              # UI Kit 2 issue panel
      project-admin/            # UI Kit 2 project page
      global/                   # UI Kit 2 global page ("My timr")
      shared/                   # cascading task picker, etc.
  tests/
    resolvers/*.test.ts         # vitest, SDK mocked via msw-node
    lib/mapping.test.ts
  README.md
```

### SDK version coupling

`packages/jira-forge/package.json` uses `"timr-sdk": "workspace:*"` — release-please already understands the monorepo, so SDK changes flow through. No separate `timr-sdk` pin.

## Phased delivery

### M1 — walking skeleton (~1 day)
- Scaffold `packages/jira-forge` with manifest, empty resolver, one `jira:issuePanel` that renders "Hello {user} from {issueKey}".
- Wire `timr-sdk` into a single resolver that calls `GET /tasks` and prints the first 5 in the panel.
- Set up Forge dev tunnel, deploy to a dev site, verify install on netcero test project.
- CI: add `jira-forge` to root turbo pipeline (build + typecheck). Skip `forge lint` in CI for now — requires Atlassian auth.

**Exit criteria:** panel renders on a Jira issue, shows live timr tasks.

### M2 — mapping (~2 days)
- Project admin page: list + set project default (task picker with breadcrumb search, billable toggle).
- Issue panel: show resolved mapping read-only for all users; admins see "Edit override" button.
- Edit-override modal: same picker, writes to `mapping:issue:{key}`.
- Permission double-gate: UI condition + server-side re-check in resolver (don't trust client).
- Cascading task picker UI: fetches task tree from `cache:timr-tasks` with 10-min TTL.

**Exit criteria:** lead can configure a project default + an issue override; non-admin devs see the mapping but can't edit.

### M3 — timer (~2 days)
- "Start" button on issue panel:
  - Reject if user not yet linked → prompt "Link your timr user" → picker populated from `GET /users`.
  - Reject if no mapping resolved.
  - Reject if another timer running (show "You have a timer running on ISSUE-X — stop first?").
  - Resolve mapping, snapshot it, POST `/project-times` with `status: running`, `user_id: linkedTimrUserId`, `start: now`, `end: null`, `billable: snapshotBillable`, `metadata: { jiraIssueKey, jiraAccountId }`.
  - Store `timer:user:{accountId}`.
- "Stop" button:
  - PATCH the timr entry with `end: now`, `status: changeable`, optional per-entry `billable` override.
  - Delete `timer:user:{accountId}` state.
- Global "My timr" page: list today's project-times (filter by `metadata.jiraAccountId` → your entries), show duration, task, billable; edit billable or delete.
- Issue panel shows live "Running — 0:12:34" when a timer is active for this issue/user.

**Exit criteria:** dev can Start/Stop on a Jira issue; entry appears in timr with correct user attribution.

### M4 — polish & safety
- Scheduled trigger: daily orphan-timer sweep. For any `timer:user:*` older than 12 hours, stop it with a note "Auto-stopped after 12h — edit in timr" and notify user via Jira notification + Forge `product:jira:dashboardUpdate`.
- Error surfaces: timr 401 (creds invalid) → admin notification; timr 403 on user_id → fallback to service user + warning banner on global page; mapping missing → inline hint.
- Audit log: every mapping change + timer action appended to `log:YYYY-MM-DD` key, purged after 30 days.
- README + install guide for the private Forge app.

**Exit criteria:** runs unattended for a week without manual intervention.

## Open questions before M1

None — spec verified, decisions locked, scope bounded.

## Explicitly out of scope (for now)

- Jira worklog mirroring (bidirectional)
- Marketplace distribution, privacy policy, DPA
- Per-user OAuth to timr (stays on shared client_credentials)
- Idle detection, cross-device timer sync beyond Forge Storage
- Bulk time entry, week view, approvals workflow
- Non-Jira-Cloud (Jira Server / Data Center)
- i18n (UI in English; entry notes stay user-provided)

## Risks

| Risk | Mitigation |
|---|---|
| Forge Node runtime quirks break `openapi-fetch` | Probe in M1 with a live GET call; worst case, swap in a plain `fetch` wrapper |
| `GET /tasks` returns huge tree, slow picker | Cache 10 min, lazy-load children, add text filter on breadcrumbs |
| User forgets to link timr identity → entries under wrong user | Hard block on Start until linked; lead can bulk-link via admin page |
| Shared client_credentials token leaks via Forge logs | Never log request bodies; mask secret in debug output |
| Running timer survives deploy / code change | Snapshot mapping on Start; treat resume after deploy as normal Stop with current time |
