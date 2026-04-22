# timr-mcp

Model Context Protocol (stdio) server for the [timr](https://timr.com) time-tracking API. Built on [`timr-sdk`](../sdk).

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/michaeljauk)

[![npm version](https://img.shields.io/npm/v/timr-mcp.svg)](https://www.npmjs.com/package/timr-mcp)
[![npm downloads](https://img.shields.io/npm/dm/timr-mcp.svg)](https://www.npmjs.com/package/timr-mcp)
[![install size](https://packagephobia.com/badge?p=timr-mcp)](https://packagephobia.com/result?p=timr-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

---

Unofficial, community-maintained. Not affiliated with [troii Software GmbH](https://www.troii.com).

## What it exposes

Two tools, using Cloudflare's [Code Mode](https://blog.cloudflare.com/dynamic-workers/) pattern instead of one-tool-per-endpoint:

- **`search`** — run a JavaScript function against the OpenAPI spec (pre-resolved, no `$ref`s) to find endpoints.
- **`execute`** — run a JavaScript function that calls `codemode.request({ method, path, query, body })` against the live API. Auth is injected on the host; credentials never enter the agent's code.

This keeps the tool list around **1k tokens** instead of the ~15k+ it would take to describe all 80+ endpoints up front, at the cost of requiring the agent to write and run JavaScript.

## Install

```bash
pnpm add -g timr-mcp
npm install -g timr-mcp
```

Requires Node 20+.

## Authentication

Reuses [`timr-cli`](../cli) credentials — if you've already run `timr auth login`, the MCP server picks them up from `~/.config/timr-cli/credentials.json`.

Without the CLI, set one of:

- `TIMR_TOKEN` — static bearer token
- `TIMR_CLIENT_ID` + `TIMR_CLIENT_SECRET` (+ optional `TIMR_TOKEN_URL`, `TIMR_SCOPE`, `TIMR_BASE_URL`) — OAuth client credentials

## Use with Claude Code

```bash
claude mcp add --scope user timr npx -- -y timr-mcp
```

Or add manually to `~/.claude.json`:

```json
{
  "mcpServers": {
    "timr": {
      "command": "npx",
      "args": ["-y", "timr-mcp"]
    }
  }
}
```

## Use with other MCP clients

Any client that speaks stdio MCP works:

```json
{
  "command": "npx",
  "args": ["-y", "timr-mcp"]
}
```

## Example agent session

After `search` finds `GET /users`, the agent calls `execute` with:

```js
async () => {
  const res = await codemode.request({
    method: "GET",
    path: "/users",
    query: { limit: 50 }
  });
  return res.data.map(u => ({ id: u.id, name: u.fullname }));
}
```

The function runs in the MCP process, `codemode.request` dispatches through `timr-sdk` with the user's OAuth token, and the mapped result returns to the agent as a text content block.

## Security boundary

Agent code runs in the host Node process via `AsyncFunction` with namespaced Proxies — **not** a hard sandbox. This matches the trust model of other local MCP servers: the process already holds your credentials; letting an agent (that you chose to run) author code against them is equivalent to letting it call individual tools in sequence.

If you want real isolation, the [`@cloudflare/codemode`](https://www.npmjs.com/package/@cloudflare/codemode) `DynamicWorkerExecutor` provides V8-isolate sandboxing on Cloudflare Workers — the `src/executor.ts` here can be swapped for that at deploy time.

## License

MIT
