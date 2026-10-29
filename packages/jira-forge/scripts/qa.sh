#!/usr/bin/env bash
# gstack smoke test for the deployed jira-forge app.
# Pre-req: run `$B handoff ...` once, log in via SSO, then `$B state save jira-forge-dev`.
# Set JIRA_ISSUE_URL to a test issue on your Forge dev site.
set -euo pipefail

ISSUE_URL="${JIRA_ISSUE_URL:?set JIRA_ISSUE_URL to a Jira issue on your Forge dev site}"
STATE="${FORGE_QA_STATE:-jira-forge-dev}"
OUT_DIR="${OUT_DIR:-/tmp/jira-forge-qa}"
mkdir -p "$OUT_DIR"

$B state load "$STATE"
$B goto "$ISSUE_URL"
$B wait --networkidle
$B frame --url "*forge*"
$B wait "text=timr"
$B snapshot -i -a -o "$OUT_DIR/panel.png"
$B console --errors > "$OUT_DIR/console.txt" || true

echo "QA artifacts: $OUT_DIR"
