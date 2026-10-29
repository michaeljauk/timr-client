# jira-forge

Jira Cloud Forge app that syncs developer time from Jira issues to timr.

Private install only. Not published to npm, not listed on the Atlassian
Marketplace.

## Status

- **M1** — walking skeleton (this scaffold): issue panel that proves the Forge
  runtime can call the shared timr client via the capability-scoped proxy.
- M2 — mapping + flat picker.
- M3 — Start/Stop + email-matched user link.
- M4 — scheduled orphan sweep, optional global page, audit sink, install guide.

Plan: `docs/jira-forge-plan.md` and `~/.claude/plans/composed-noodling-harp.md`.

## Bootstrap (one-time)

You need the Atlassian Forge CLI, authenticated with your Jira developer site.

```bash
cd packages/jira-forge
pnpm install
pnpm exec forge login          # OAuth flow in your browser

# Creates the app on your Atlassian developer account and writes the new
# `ari:cloud:ecosystem::app/<uuid>` into manifest.yml. Commit the result.
pnpm forge:register

# Encrypted secrets — rotate by re-running + redeploying.
pnpm exec forge variables set --encrypt TIMR_CLIENT_ID <id>
pnpm exec forge variables set --encrypt TIMR_CLIENT_SECRET <secret>

# Optional: only set if you need to pin to a non-default REST host
# (must include the version path segment, e.g. https://api.timr.com/v1/).
# Leave unset to let timr-sdk apply its default.
# pnpm exec forge variables set TIMR_BASE_URL https://api.timr.com/v1/

# Deploy to the development environment and install on your Jira site.
pnpm forge:deploy
pnpm forge:install
```

After install, open any issue on the dev site — the **timr** panel appears in
the right sidebar.

## Local dev

```bash
pnpm forge:tunnel               # live function reload against the deployed UI
```

## QA

`scripts/qa.sh` is a gstack smoke that opens a Jira dev-site issue, enters the
Forge iframe, and screenshots the panel. It needs a saved browser session and
the URL of a test issue on your dev site:

```bash
# One-time: log in manually, save cookies.
$B handoff https://<your-site>.atlassian.net
# …log in with SSO in the visible browser, then:
$B state save jira-forge-dev

# Later runs reuse the saved state:
JIRA_ISSUE_URL=https://<your-site>.atlassian.net/browse/<KEY>-1 pnpm qa
```

CI-runnable E2E coverage lives in `e2e/` (Playwright with `storageState`) from
M3 onward.
