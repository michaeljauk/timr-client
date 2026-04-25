#!/usr/bin/env bash
# gstack smoke test for the deployed jira-forge app.
# Pre-req: run `$B handoff ...` once, log in via SSO, then `$B state save netcero-dev-forge`.
set -euo pipefail

ISSUE_URL="${JIRA_ISSUE_URL:-https://netcero-dev.atlassian.net/browse/NC-FORGE-TEST-1}"
OUT_DIR="${OUT_DIR:-/tmp/jira-forge-qa}"
mkdir -p "$OUT_DIR"

$B state load netcero-dev-forge
$B goto "$ISSUE_URL"
$B wait --networkidle
$B frame --url "*forge*"
$B wait "text=timr"
$B snapshot -i -a -o "$OUT_DIR/panel.png"
$B console --errors > "$OUT_DIR/console.txt" || true

echo "QA artifacts: $OUT_DIR"
